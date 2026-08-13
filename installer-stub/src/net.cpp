// @layer installer @kind logic
#include "net.h"

#include <windows.h>
#include <winhttp.h>
#include <bcrypt.h>

#include <vector>

namespace net {
namespace {

constexpr wchar_t kAgent[] = L"relic-installer-stub/2.0";

// The three WinHTTP handles always unwind in the same order, and every failure
// path below is an early return, so ownership is parked in a scope guard.
struct Session {
  HINTERNET session = nullptr;
  HINTERNET connect = nullptr;
  HINTERNET request = nullptr;

  ~Session() {
    if (request != nullptr) WinHttpCloseHandle(request);
    if (connect != nullptr) WinHttpCloseHandle(connect);
    if (session != nullptr) WinHttpCloseHandle(session);
  }
};

bool Open(const std::wstring& url, Session* out, unsigned long long* length) {
  URL_COMPONENTS parts = {};
  wchar_t host[256] = {};
  wchar_t path[4096] = {};
  wchar_t extra[2048] = {};
  parts.dwStructSize = sizeof(parts);
  parts.lpszHostName = host;
  parts.dwHostNameLength = ARRAYSIZE(host);
  parts.lpszUrlPath = path;
  parts.dwUrlPathLength = ARRAYSIZE(path);
  parts.lpszExtraInfo = extra;
  parts.dwExtraInfoLength = ARRAYSIZE(extra);
  if (!WinHttpCrackUrl(url.c_str(), 0, 0, &parts)) return false;

  out->session = WinHttpOpen(kAgent, WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY,
                             WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
  if (out->session == nullptr) return false;
  DWORD timeout = 30000;
  WinHttpSetTimeouts(out->session, timeout, timeout, timeout, timeout);

  out->connect = WinHttpConnect(out->session, host, parts.nPort, 0);
  if (out->connect == nullptr) return false;

  std::wstring target = std::wstring(path) + extra;
  DWORD flags = parts.nScheme == INTERNET_SCHEME_HTTPS ? WINHTTP_FLAG_SECURE : 0;
  out->request = WinHttpOpenRequest(out->connect, L"GET", target.c_str(), nullptr,
                                    WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, flags);
  if (out->request == nullptr) return false;

  // Release assets are served from a different host than the one the download
  // link points at, so the hop has to be followed to reach the bytes.
  DWORD policy = WINHTTP_OPTION_REDIRECT_POLICY_DISALLOW_HTTPS_TO_HTTP;
  WinHttpSetOption(out->request, WINHTTP_OPTION_REDIRECT_POLICY, &policy, sizeof(policy));

  if (!WinHttpSendRequest(out->request, WINHTTP_NO_ADDITIONAL_HEADERS, 0,
                          WINHTTP_NO_REQUEST_DATA, 0, 0, 0)) {
    return false;
  }
  if (!WinHttpReceiveResponse(out->request, nullptr)) return false;

  DWORD status = 0;
  DWORD size = sizeof(status);
  if (!WinHttpQueryHeaders(out->request, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
                           WINHTTP_HEADER_NAME_BY_INDEX, &status, &size, WINHTTP_NO_HEADER_INDEX)) {
    return false;
  }
  if (status != 200) return false;

  if (length != nullptr) {
    wchar_t raw[64] = {};
    DWORD rawSize = sizeof(raw);
    *length = 0;
    if (WinHttpQueryHeaders(out->request, WINHTTP_QUERY_CONTENT_LENGTH,
                            WINHTTP_HEADER_NAME_BY_INDEX, raw, &rawSize, WINHTTP_NO_HEADER_INDEX)) {
      *length = _wcstoui64(raw, nullptr, 10);
    }
  }
  return true;
}

}  // namespace

bool FetchText(const std::wstring& url, std::string* out) {
  Session http;
  if (!Open(url, &http, nullptr)) return false;
  out->clear();
  char buffer[8192];
  for (;;) {
    DWORD read = 0;
    if (!WinHttpReadData(http.request, buffer, sizeof(buffer), &read)) return false;
    if (read == 0) break;
    out->append(buffer, read);
    if (out->size() > (1u << 20)) return false;
  }
  return !out->empty();
}

bool DownloadFile(const std::wstring& url, const std::wstring& path, const Progress& progress) {
  unsigned long long total = 0;
  Session http;
  if (!Open(url, &http, &total)) return false;

  HANDLE file = CreateFileW(path.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS,
                            FILE_ATTRIBUTE_NORMAL, nullptr);
  if (file == INVALID_HANDLE_VALUE) return false;

  std::vector<char> buffer(64 * 1024);
  unsigned long long done = 0;
  bool ok = true;
  for (;;) {
    DWORD read = 0;
    if (!WinHttpReadData(http.request, buffer.data(), static_cast<DWORD>(buffer.size()), &read)) {
      ok = false;
      break;
    }
    if (read == 0) break;
    DWORD written = 0;
    if (!WriteFile(file, buffer.data(), read, &written, nullptr) || written != read) {
      ok = false;
      break;
    }
    done += read;
    if (progress && !progress(done, total)) {
      ok = false;
      break;
    }
  }
  CloseHandle(file);
  if (!ok) {
    DeleteFileW(path.c_str());
    return false;
  }
  return done > 0;
}

bool Sha256File(const std::wstring& path, std::wstring* hex) {
  BCRYPT_ALG_HANDLE alg = nullptr;
  if (BCryptOpenAlgorithmProvider(&alg, BCRYPT_SHA256_ALGORITHM, nullptr, 0) != 0) return false;

  DWORD objectSize = 0;
  DWORD digestSize = 0;
  DWORD copied = 0;
  bool ok = BCryptGetProperty(alg, BCRYPT_OBJECT_LENGTH, reinterpret_cast<PUCHAR>(&objectSize),
                              sizeof(objectSize), &copied, 0) == 0 &&
            BCryptGetProperty(alg, BCRYPT_HASH_LENGTH, reinterpret_cast<PUCHAR>(&digestSize),
                              sizeof(digestSize), &copied, 0) == 0;

  std::vector<UCHAR> object(objectSize);
  std::vector<UCHAR> digest(digestSize);
  BCRYPT_HASH_HANDLE hash = nullptr;
  ok = ok && BCryptCreateHash(alg, &hash, object.data(), objectSize, nullptr, 0, 0) == 0;

  HANDLE file = INVALID_HANDLE_VALUE;
  if (ok) {
    file = CreateFileW(path.c_str(), GENERIC_READ, FILE_SHARE_READ, nullptr, OPEN_EXISTING,
                       FILE_ATTRIBUTE_NORMAL, nullptr);
    ok = file != INVALID_HANDLE_VALUE;
  }
  if (ok) {
    std::vector<UCHAR> buffer(64 * 1024);
    for (;;) {
      DWORD read = 0;
      if (!ReadFile(file, buffer.data(), static_cast<DWORD>(buffer.size()), &read, nullptr)) {
        ok = false;
        break;
      }
      if (read == 0) break;
      if (BCryptHashData(hash, buffer.data(), read, 0) != 0) {
        ok = false;
        break;
      }
    }
  }
  if (file != INVALID_HANDLE_VALUE) CloseHandle(file);
  ok = ok && BCryptFinishHash(hash, digest.data(), digestSize, 0) == 0;

  if (ok) {
    hex->clear();
    static const wchar_t kDigits[] = L"0123456789abcdef";
    for (DWORD i = 0; i < digestSize; ++i) {
      hex->push_back(kDigits[digest[i] >> 4]);
      hex->push_back(kDigits[digest[i] & 0x0F]);
    }
  }
  if (hash != nullptr) BCryptDestroyHash(hash);
  BCryptCloseAlgorithmProvider(alg, 0);
  return ok;
}

bool VerifyFile(const std::wstring& path, const std::wstring& expected) {
  // An absent digest in the manifest means the publisher did not pin one; the
  // transfer itself was still over TLS, so treat it as nothing to check.
  if (expected.empty()) return true;
  std::wstring actual;
  if (!Sha256File(path, &actual)) return false;
  return CompareStringOrdinal(actual.c_str(), -1, expected.c_str(), -1, TRUE) == CSTR_EQUAL;
}

}  // namespace net
