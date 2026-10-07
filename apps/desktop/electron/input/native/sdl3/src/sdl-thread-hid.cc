/* @layer electron-main @kind native */
// Raw HID device enumeration (SDL_hid_enumerate), independent of SDL's own
// gamepad backend. Runs inline on the calling thread. See the EnumerateHid
// doc comment in sdl-thread.h for why that is safe to run concurrently with
// the SDL thread's own hidapi use.
#include "sdl-thread.h"

#include <utility>

namespace {

const char* BusTypeToString(SDL_hid_bus_type busType) {
  switch (busType) {
    case SDL_HID_API_BUS_USB:
      return "usb";
    case SDL_HID_API_BUS_BLUETOOTH:
      return "bluetooth";
    default:
      return "unknown";
  }
}

// hidapi reports strings as wchar_t*, which is UTF-16 on Windows and UTF-32
// elsewhere; decode either width into UTF-8 instead of assuming one.
std::string WideToUtf8(const wchar_t* wide) {
  if (wide == nullptr) {
    return "";
  }

  std::string out;
  for (const wchar_t* p = wide; *p != 0; ++p) {
    uint32_t codepoint = static_cast<uint32_t>(*p);
    if (sizeof(wchar_t) == 2 && codepoint >= 0xD800 && codepoint <= 0xDBFF && *(p + 1) != 0) {
      uint32_t low = static_cast<uint32_t>(*(p + 1));
      if (low >= 0xDC00 && low <= 0xDFFF) {
        codepoint = ((codepoint - 0xD800) << 10) + (low - 0xDC00) + 0x10000;
        ++p;
      }
    }

    if (codepoint <= 0x7F) {
      out += static_cast<char>(codepoint);
    } else if (codepoint <= 0x7FF) {
      out += static_cast<char>(0xC0 | (codepoint >> 6));
      out += static_cast<char>(0x80 | (codepoint & 0x3F));
    } else if (codepoint <= 0xFFFF) {
      out += static_cast<char>(0xE0 | (codepoint >> 12));
      out += static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F));
      out += static_cast<char>(0x80 | (codepoint & 0x3F));
    } else {
      out += static_cast<char>(0xF0 | (codepoint >> 18));
      out += static_cast<char>(0x80 | ((codepoint >> 12) & 0x3F));
      out += static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F));
      out += static_cast<char>(0x80 | (codepoint & 0x3F));
    }
  }
  return out;
}

}  // namespace

std::vector<HidDeviceInfo> SdlThread::EnumerateHid() {
  std::vector<HidDeviceInfo> devices;

  SDL_hid_device_info* first = SDL_hid_enumerate(0, 0);
  for (SDL_hid_device_info* d = first; d != nullptr; d = d->next) {
    // Two shapes arrive here. Devices enumerated through the OS HID stack
    // carry a real usage page and usage, so keep only the ones the HID spec
    // marks as controllers: generic desktop page, usage 0x04 joystick,
    // 0x05 gamepad, or 0x08 multi-axis controller.
    //
    // Devices enumerated through libusb report 0/0 instead, because a raw USB
    // interface has no HID report descriptor to read a usage out of. Dropping
    // those on a usage check would discard exactly the devices that need
    // libusb in the first place, which is the bug this replaced. SDL only
    // surfaces whitelisted controllers on that path, so an absent usage is
    // itself the signal, and this still names no vendor or product id.
    const bool hasUsageInfo = d->usage_page != 0 || d->usage != 0;
    if (hasUsageInfo) {
      if (d->usage_page != 0x01) {
        continue;
      }
      if (d->usage != 0x04 && d->usage != 0x05 && d->usage != 0x08) {
        continue;
      }
    }

    HidDeviceInfo info;
    info.vendorId = d->vendor_id;
    info.productId = d->product_id;
    info.productString = WideToUtf8(d->product_string);
    info.manufacturerString = WideToUtf8(d->manufacturer_string);
    info.path = d->path != nullptr ? d->path : "";
    info.busType = BusTypeToString(d->bus_type);
    devices.push_back(std::move(info));
  }
  SDL_hid_free_enumeration(first);

  return devices;
}
