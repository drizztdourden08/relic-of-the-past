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
#endif

namespace {

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
  // On Linux and macOS the addon is linked with an RPATH of $ORIGIN /
  // @loader_path, so the dynamic loader already searches beside the addon and
  // SDL's by-name request resolves without help.
  return true;
#endif
}
