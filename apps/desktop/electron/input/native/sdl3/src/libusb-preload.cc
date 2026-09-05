/* @layer electron-main @kind native */
// Makes SDL able to find libusb at runtime.
//
// SDL loads libusb lazily by bare filename (SDL_LoadObject). On Windows that is
// LoadLibrary, which searches the EXECUTABLE's directory, not the directory a
// loaded module came from. Our library ships beside this addon, not beside
// electron.exe, so SDL never found it and silently ignored every device that
// needs libusb; those then look held by another application.
//
// Loading it once here by absolute path fixes it: the OS keys loaded modules by
// name, so SDL's later by-name request resolves. Must run before SDL initializes.
#include "sdl-thread.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <dlfcn.h>

#include <string>
#endif

namespace {

#ifndef _WIN32
// Directory this addon was loaded from, via a symbol inside us. The process
// path would name the host executable instead.
bool OwnModuleDirectoryPosix(std::string* out) {
  Dl_info info = {};
  if (dladdr(reinterpret_cast<const void*>(&OwnModuleDirectoryPosix), &info) == 0 || info.dli_fname == nullptr) {
    return false;
  }
  const std::string path(info.dli_fname);
  const size_t slash = path.find_last_of('/');
  if (slash == std::string::npos) {
    return false;
  }
  *out = path.substr(0, slash + 1);
  return true;
}
#endif

#ifdef _WIN32
// Directory this addon was loaded from, via an address inside our own module.
// The process path would point at the host executable instead.
bool OwnModuleDirectory(std::wstring* out) {
  HMODULE self = nullptr;
  if (!GetModuleHandleExW(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS |
                              GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
                          reinterpret_cast<LPCWSTR>(&OwnModuleDirectory), &self)) {
    return false;
  }

  wchar_t path[MAX_PATH] = {};
  DWORD length = GetModuleFileNameW(self, path, MAX_PATH);
  if (length == 0 || length == MAX_PATH) {
    return false;
  }

  std::wstring full(path, length);
  const size_t slash = full.find_last_of(L"\\/");
  if (slash == std::wstring::npos) {
    return false;
  }
  *out = full.substr(0, slash + 1);
  return true;
}
#endif

}  // namespace

// False when the library could not be loaded. Not fatal: plain HID controllers
// keep working, only bulk-endpoint devices are lost, so the caller reports it.
bool PreloadLibusb() {
#ifdef _WIN32
  std::wstring directory;
  if (!OwnModuleDirectory(&directory)) {
    return false;
  }
  const std::wstring candidate = directory + L"libusb-1.0.dll";
  return LoadLibraryW(candidate.c_str()) != nullptr;
#else
  // The addon's RPATH does not help: SDL calls dlopen, so the loader consults
  // SDL's search path, and SDL has no RPATH of its own. Loading by absolute path
  // first makes the later by-name request resolve, exactly as on Windows.
  std::string directory;
  if (!OwnModuleDirectoryPosix(&directory)) {
    return false;
  }
#ifdef __APPLE__
  const std::string candidate = directory + "libusb-1.0.0.dylib";
#else
  const std::string candidate = directory + "libusb-1.0.so.0";
#endif
  // RTLD_GLOBAL so SDL resolves symbols against this image instead of a second copy.
  return dlopen(candidate.c_str(), RTLD_LAZY | RTLD_GLOBAL) != nullptr;
#endif
}
