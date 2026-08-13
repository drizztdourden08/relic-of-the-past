// @layer installer @kind logic
#include "install.h"

#include <shlobj.h>
#include <shlwapi.h>
#include <stdlib.h>

#include "theme.h"

namespace install {
namespace {

std::wstring KnownFolder(int csidl) {
  wchar_t buffer[MAX_PATH] = {};
  if (FAILED(SHGetFolderPathW(nullptr, csidl, nullptr, SHGFP_TYPE_CURRENT, buffer))) {
    return std::wstring();
  }
  return std::wstring(buffer);
}

std::wstring Quote(const std::wstring& value) {
  if (value.find(L' ') == std::wstring::npos) return value;
  return L"\"" + value + L"\"";
}

std::wstring JoinArgs(const std::vector<std::wstring>& args) {
  std::wstring line;
  for (const std::wstring& arg : args) {
    if (!line.empty()) line.push_back(L' ');
    line += Quote(arg);
  }
  return line;
}

/**
 * `wait` is the difference between starting something and having run it. The setup
 * has to be waited for, because everything after it assumes the app is on disk; the
 * app itself must NOT be, because the installer's job ends the moment it starts.
 */
bool Launch(const std::wstring& exe, const std::wstring& args, const wchar_t* verb,
            bool wait = false) {
  SHELLEXECUTEINFOW info = {};
  info.cbSize = sizeof(info);
  info.fMask = SEE_MASK_NOASYNC | (wait ? SEE_MASK_NOCLOSEPROCESS : 0);
  info.lpVerb = verb;
  info.lpFile = exe.c_str();
  info.lpParameters = args.empty() ? nullptr : args.c_str();
  info.nShow = SW_SHOWNORMAL;
  if (ShellExecuteExW(&info) == FALSE) return false;
  if (!wait || info.hProcess == nullptr) return true;

  WaitForSingleObject(info.hProcess, INFINITE);
  DWORD code = 1;
  GetExitCodeProcess(info.hProcess, &code);
  CloseHandle(info.hProcess);
  return code == 0;
}

// Resolved from the system directory rather than the search path: the archive
// tool that understands these packages is the one shipped with the OS, and a
// bare name could pick up an unrelated build earlier on the path.
std::wstring SystemTar() {
  wchar_t buffer[MAX_PATH] = {};
  UINT length = GetSystemDirectoryW(buffer, MAX_PATH);
  if (length == 0) return std::wstring();
  return std::wstring(buffer, length) + L"\\tar.exe";
}

bool RunToCompletion(const std::wstring& commandLine) {
  std::vector<wchar_t> mutableLine(commandLine.begin(), commandLine.end());
  mutableLine.push_back(L'\0');
  STARTUPINFOW startup = {};
  startup.cb = sizeof(startup);
  PROCESS_INFORMATION process = {};
  if (!CreateProcessW(nullptr, mutableLine.data(), nullptr, nullptr, FALSE, CREATE_NO_WINDOW,
                      nullptr, nullptr, &startup, &process)) {
    return false;
  }
  WaitForSingleObject(process.hProcess, INFINITE);
  DWORD code = 1;
  GetExitCodeProcess(process.hProcess, &code);
  CloseHandle(process.hThread);
  CloseHandle(process.hProcess);
  return code == 0;
}

}  // namespace

std::wstring DefaultPath(ui::Mode mode) {
  switch (mode) {
    case ui::Mode::Global:
      return KnownFolder(CSIDL_PROGRAM_FILES) + L"\\" + theme::kProduct;
    case ui::Mode::Portable:
      return KnownFolder(CSIDL_PROFILE) + L"\\" + theme::kProduct;
    case ui::Mode::PerUser:
    default:
      return KnownFolder(CSIDL_LOCAL_APPDATA) + L"\\Programs\\" + theme::kProduct;
  }
}

std::wstring FreeSpaceLine(const std::wstring& path) {
  wchar_t root[MAX_PATH] = {};
  lstrcpynW(root, path.c_str(), MAX_PATH);
  if (!PathStripToRootW(root)) return std::wstring();
  ULARGE_INTEGER available = {};
  if (!GetDiskFreeSpaceExW(root, &available, nullptr, nullptr)) return std::wstring();
  double gb = static_cast<double>(available.QuadPart) / (1024.0 * 1024.0 * 1024.0);
  wchar_t line[128];
  swprintf_s(line, L"%.1f GB free on %s", gb, root);
  return std::wstring(line);
}

std::wstring TempFile(const wchar_t* suffix) {
  wchar_t folder[MAX_PATH] = {};
  GetTempPathW(MAX_PATH, folder);
  wchar_t name[MAX_PATH];
  swprintf_s(name, L"%srotp-stub-%08x%s", folder, GetTickCount(), suffix);
  return std::wstring(name);
}

bool BrowseForFolder(HWND owner, std::wstring* path) {
  IFileDialog* dialog = nullptr;
  if (FAILED(CoCreateInstance(CLSID_FileOpenDialog, nullptr, CLSCTX_INPROC_SERVER,
                              IID_PPV_ARGS(&dialog)))) {
    return false;
  }
  DWORD options = 0;
  dialog->GetOptions(&options);
  dialog->SetOptions(options | FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM | FOS_PATHMUSTEXIST);
  bool picked = false;
  if (SUCCEEDED(dialog->Show(owner))) {
    IShellItem* item = nullptr;
    if (SUCCEEDED(dialog->GetResult(&item))) {
      wchar_t* selected = nullptr;
      if (SUCCEEDED(item->GetDisplayName(SIGDN_FILESYSPATH, &selected))) {
        *path = selected;
        CoTaskMemFree(selected);
        picked = true;
      }
      item->Release();
    }
  }
  dialog->Release();
  return picked;
}

bool RunSetup(const std::wstring& exe, const std::vector<std::wstring>& args, bool elevated) {
  return Launch(exe, JoinArgs(args), elevated ? L"runas" : L"open", true);
}

std::wstring InstalledRoot(ui::Mode mode, const std::wstring& chosen) {
  // A per-user install goes where Velopack puts it, which is the pack id under
  // LocalAppData rather than the Programs folder a location screen would suggest.
  if (mode != ui::Mode::PerUser) return chosen;
  return KnownFolder(CSIDL_LOCAL_APPDATA) + L"\\" + theme::kPackId;
}

void LaunchInstalled(const std::wstring& directory) {
  std::wstring exe = directory;
  if (!exe.empty() && exe.back() != L'\\') exe.push_back(L'\\');
  exe += L"Relic of the Past.exe";
  // A missing executable is not worth an error dialog: the install itself reported
  // success, and the user can start the app from its shortcut.
  if (GetFileAttributesW(exe.c_str()) == INVALID_FILE_ATTRIBUTES) return;
  Launch(exe, std::wstring(), L"open");
}

bool Handoff(const std::wstring& exe) { return Launch(exe, L"--handoff", L"open"); }

bool Unpack(const std::wstring& archive, const std::wstring& directory) {
  if (SHCreateDirectoryExW(nullptr, directory.c_str(), nullptr) != ERROR_SUCCESS &&
      GetFileAttributesW(directory.c_str()) == INVALID_FILE_ATTRIBUTES) {
    return false;
  }
  std::wstring tar = SystemTar();
  if (tar.empty()) return false;
  std::wstring command = Quote(tar) + L" -xf " + Quote(archive) + L" -C " + Quote(directory);
  if (!RunToCompletion(command)) return false;

  // The package already carries its own portable marker, so the only thing
  // missing is the writable folder the app keeps its profile in, which sits
  // alongside the payload rather than inside it.
  std::wstring data = directory + L"\\data";
  CreateDirectoryW(data.c_str(), nullptr);
  return true;
}

}  // namespace install
