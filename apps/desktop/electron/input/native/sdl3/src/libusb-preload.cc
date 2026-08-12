/* @layer electron-main @kind native */
// Makes SDL able to find libusb at runtime.
//
// SDL loads libusb lazily, by bare filename, through SDL_LoadObject. On
// Windows that becomes a plain LoadLibrary, which searches the directory of
// the running EXECUTABLE plus the system paths. It does not search the
// directory a dynamically loaded module was itself loaded from. Our library
// ships next to this addon, not next to electron.exe, so SDL never found it.
//
// The consequence was silent and expensive: with no libusb, SDL takes its
// "libusb unavailable" branch and ignores every device that requires libusb
// to talk to. Those devices then appear nowhere at all, neither as gamepads
// nor in SDL_hid_enumerate, and the failure looks exactly like the device
// being held by another application.
//
// Loading it once here by absolute path fixes it: the OS keeps modules in a
// table keyed by name, so SDL's later by-name request resolves to the module
// we already loaded. This must run before SDL initializes anything.
#include "sdl-thread.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <dlfcn.h>

#include <string>
#endif

namespace {

#ifndef _WIN32
// Directory this addon binary was loaded from, found by asking the loader
// which file a symbol inside us came from. The process path would name the
// host executable instead, which is somewhere else entirely.
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
// Directory this addon binary was loaded from. Derived from an address inside
// our own module rather than from the process path, which would point at the
// host executable instead.
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

// Returns false when the library could not be loaded from beside the addon.
// That is not fatal: SDL still runs, and every controller that speaks plain
// HID keeps working. Only the devices needing a bulk-endpoint handshake are
// lost, so the caller reports it rather than refusing to start.
bool PreloadLibusb() {
#ifdef _WIN32
  std::wstring directory;
  if (!OwnModuleDirectory(&directory)) {
    return false;
  }
  const std::wstring candidate = directory + L"libusb-1.0.dll";
  return LoadLibraryW(candidate.c_str()) != nullptr;
#else
  // The addon's own RPATH does not help here: SDL is the one calling dlopen,
  // so the loader consults SDL's search path, not ours, and SDL sits in this
  // directory without an RPATH of its own. Loading the file by absolute path
  // first is what makes SDL's later by-name request resolve, exactly as on
  // Windows. Once loaded, the loader matches the request against the library
  // already in memory under that name.
  std::string directory;
  if (!OwnModuleDirectoryPosix(&directory)) {
    return false;
  }
#ifdef __APPLE__
  const std::string candidate = directory + "libusb-1.0.0.dylib";
#else
  const std::string candidate = directory + "libusb-1.0.so.0";
#endif
  // RTLD_GLOBAL so the symbols are available to SDL when it resolves them
  // against this image rather than loading a second copy.
  return dlopen(candidate.c_str(), RTLD_LAZY | RTLD_GLOBAL) != nullptr;
#endif
}
