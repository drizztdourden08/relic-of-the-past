// @layer installer @kind logic
#include "manifest.h"

#include <windows.h>
#include <stdlib.h>

#include "net.h"

namespace manifest {

// A build can be pointed elsewhere at compile time, which is how the whole path gets
// exercised against a local server before anything is published. The shipped build
// reads the published recipe, and /releases/latest/download always resolves to the
// newest release, however old this stub is.
#ifdef ROTP_HAS_URL_OVERRIDE
#include "manifest-url.h"
#endif
#ifndef ROTP_MANIFEST_URL
#define ROTP_MANIFEST_URL   L"https://github.com/drizztdourden08/relic-of-the-past/releases/latest/download/install.json"
#endif

const wchar_t kManifestUrl[] = ROTP_MANIFEST_URL;

namespace {

// The document has a known, tiny shape, so rather than a general object model
// this walks the text directly: find a member, take the span of its value, and
// recurse into the two nesting levels the schema actually uses.
size_t SkipWs(const std::string& s, size_t i) {
  while (i < s.size() && (s[i] == ' ' || s[i] == '\t' || s[i] == '\r' || s[i] == '\n')) ++i;
  return i;
}

void AppendUtf8(std::string* out, unsigned int cp) {
  if (cp < 0x80) {
    out->push_back(static_cast<char>(cp));
  } else if (cp < 0x800) {
    out->push_back(static_cast<char>(0xC0 | (cp >> 6)));
    out->push_back(static_cast<char>(0x80 | (cp & 0x3F)));
  } else {
    out->push_back(static_cast<char>(0xE0 | (cp >> 12)));
    out->push_back(static_cast<char>(0x80 | ((cp >> 6) & 0x3F)));
    out->push_back(static_cast<char>(0x80 | (cp & 0x3F)));
  }
}

bool ParseString(const std::string& s, size_t i, std::string* out, size_t* end) {
  if (i >= s.size() || s[i] != '"') return false;
  out->clear();
  ++i;
  while (i < s.size()) {
    char c = s[i];
    if (c == '"') {
      *end = i + 1;
      return true;
    }
    if (c != '\\') {
      out->push_back(c);
      ++i;
      continue;
    }
    if (++i >= s.size()) return false;
    char esc = s[i++];
    switch (esc) {
      case 'n': out->push_back('\n'); break;
      case 't': out->push_back('\t'); break;
      case 'r': out->push_back('\r'); break;
      case 'b': out->push_back('\b'); break;
      case 'f': out->push_back('\f'); break;
      case 'u': {
        if (i + 4 > s.size()) return false;
        unsigned int cp = static_cast<unsigned int>(strtoul(s.substr(i, 4).c_str(), nullptr, 16));
        AppendUtf8(out, cp);
        i += 4;
        break;
      }
      default: out->push_back(esc); break;
    }
  }
  return false;
}

size_t ValueEnd(const std::string& s, size_t i) {
  if (i >= s.size()) return i;
  if (s[i] == '"') {
    std::string ignored;
    size_t end = i;
    return ParseString(s, i, &ignored, &end) ? end : s.size();
  }
  if (s[i] == '{' || s[i] == '[') {
    int depth = 0;
    while (i < s.size()) {
      char c = s[i];
      if (c == '"') {
        std::string ignored;
        size_t end = i;
        if (!ParseString(s, i, &ignored, &end)) return s.size();
        i = end;
        continue;
      }
      if (c == '{' || c == '[') ++depth;
      if (c == '}' || c == ']') {
        --depth;
        if (depth == 0) return i + 1;
      }
      ++i;
    }
    return s.size();
  }
  while (i < s.size() && s[i] != ',' && s[i] != '}' && s[i] != ']') ++i;
  return i;
}

bool Member(const std::string& s, size_t object, const char* key, size_t* value) {
  if (object >= s.size() || s[object] != '{') return false;
  size_t i = SkipWs(s, object + 1);
  while (i < s.size() && s[i] != '}') {
    std::string name;
    size_t end = i;
    if (!ParseString(s, i, &name, &end)) return false;
    i = SkipWs(s, end);
    if (i >= s.size() || s[i] != ':') return false;
    i = SkipWs(s, i + 1);
    if (name == key) {
      *value = i;
      return true;
    }
    i = SkipWs(s, ValueEnd(s, i));
    if (i < s.size() && s[i] == ',') i = SkipWs(s, i + 1);
  }
  return false;
}

std::wstring Widen(const std::string& s) {
  if (s.empty()) return std::wstring();
  int count = MultiByteToWideChar(CP_UTF8, 0, s.c_str(), static_cast<int>(s.size()), nullptr, 0);
  std::wstring out(static_cast<size_t>(count), L'\0');
  MultiByteToWideChar(CP_UTF8, 0, s.c_str(), static_cast<int>(s.size()), &out[0], count);
  return out;
}

bool StringMember(const std::string& s, size_t object, const char* key, std::wstring* out) {
  size_t value = 0;
  if (!Member(s, object, key, &value)) return false;
  std::string raw;
  size_t end = value;
  if (!ParseString(s, value, &raw, &end)) return false;
  *out = Widen(raw);
  return true;
}

void ReadArtifact(const std::string& s, size_t root, const char* key, Artifact* out) {
  size_t object = 0;
  if (!Member(s, root, key, &object) || object >= s.size() || s[object] != '{') return;
  StringMember(s, object, "url", &out->url);
  StringMember(s, object, "sha256", &out->sha256);
}

void ReadArgs(const std::string& s, size_t root, std::vector<std::wstring>* out) {
  size_t object = 0;
  if (!Member(s, root, "setup", &object) || object >= s.size() || s[object] != '{') return;
  size_t array = 0;
  if (!Member(s, object, "args", &array) || array >= s.size() || s[array] != '[') return;
  size_t i = SkipWs(s, array + 1);
  while (i < s.size() && s[i] != ']') {
    std::string raw;
    size_t end = i;
    if (!ParseString(s, i, &raw, &end)) break;
    out->push_back(Widen(raw));
    i = SkipWs(s, end);
    if (i < s.size() && s[i] == ',') i = SkipWs(s, i + 1);
  }
}

// A manifest normally states the version. Older ones did not, so the number is
// recovered from the release tag in the setup URL when it is absent, which is also
// what happens when a manifest is pointed at a local server for testing.
// The number shown on screen otherwise comes from
// the release path in the download link, which always names the tag.
std::wstring DeriveVersion(const std::wstring& url) {
  const wchar_t* marker = L"/download/";
  size_t at = url.find(marker);
  if (at == std::wstring::npos) return std::wstring();
  size_t start = at + lstrlenW(marker);
  size_t stop = url.find(L'/', start);
  if (stop == std::wstring::npos) return std::wstring();
  std::wstring tag = url.substr(start, stop - start);
  if (!tag.empty() && (tag[0] == L'v' || tag[0] == L'V')) tag.erase(0, 1);
  return tag;
}

}  // namespace

bool Parse(const std::string& json, Document* out) {
  size_t root = json.find('{');
  if (root == std::string::npos) return false;

  size_t value = 0;
  if (Member(json, root, "stubVersion", &value)) {
    out->stubVersion = atoi(json.c_str() + value);
  }
  ReadArtifact(json, root, "stub", &out->stub);
  ReadArtifact(json, root, "setup", &out->setup);
  ReadArtifact(json, root, "portable", &out->portable);
  ReadArgs(json, root, &out->setupArgs);
  if (!StringMember(json, root, "version", &out->version)) {
    out->version = DeriveVersion(out->setup.url);
  }
  return out->stubVersion > 0 && !out->setup.url.empty();
}

bool Fetch(Document* out, const std::wstring& url) {
  std::string body;
  if (!net::FetchText(url.empty() ? kManifestUrl : url.c_str(), &body)) return false;
  return Parse(body, out);
}

}  // namespace manifest
