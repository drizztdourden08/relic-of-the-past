# Controller support matrix

How controllers are supported on each platform, by which transport, and where
functionality is limited. The parser, controller presets, calibration, and haptic
patterns are **shared**; only the device transport differs per platform (behind the
`ControllerHost` platform port).

Legend: ✅ works · ⚠️ conditional · 🔧 planned (native plugin, not yet shipped) · ❌ not possible.

## Transports per platform

| Transport | Windows | macOS | Linux | Android |
|-----------|:--:|:--:|:--:|:--:|
| node-hid (Electron main, raw HID) | ✅ | ✅ | ⚠️ needs udev rules | ❌ (no main process) |
| Web Gamepad API (standard pads) | ✅ | ✅ | ✅ | ✅ |
| WebUSB (`usb-init`) | ✅ | ✅ | ⚠️ udev | ❌ not in WebView |
| Native USB-HID plugin (`UsbManager`) | — | — | — | 🔧 planned (USB-OTG) |

## Functionality per platform

| Functionality | Windows | macOS | Linux | Android |
|---|:--:|:--:|:--:|:--:|
| Standard input (buttons/axes) | ✅ | ✅ | ✅ | ✅ |
| Precise raw-HID input | ✅ | ✅ | ⚠️ udev | 🔧 USB-OTG · ❌ BT |
| Output writes (LEDs/config) | ✅ | ✅ | ⚠️ udev | 🔧 USB-OTG · ❌ BT |
| Basic rumble (Gamepad `vibrationActuator`) | ✅ | ✅ | ✅ | ✅ (device-dependent) |
| Advanced HID haptics (patterns) | ✅ | ✅ | ⚠️ udev | 🔧 USB-OTG · ❌ BT |
| Switch/NSO `usb-init` | ✅ | ✅ | ⚠️ udev | 🔧 USB-OTG · ❌ BT |
| Stick/trigger calibration | ✅ | ✅ | ✅ | ✅ |
| Accurate enumeration (no button press) | ✅ | ✅ | ⚠️ udev | 🔧 USB-OTG · ❌ BT |

Linux ⚠️ → ✅ once the udev rules are installed (see [linux-setup.md](linux-setup.md);
the `.deb` does it automatically).

## By controller family

| Controller | Win/macOS | Linux (udev) | Android USB-OTG | Android Bluetooth |
|---|:--:|:--:|:--:|:--:|
| Xbox (XInput) | ✅ full | ✅ full | ✅ full (Gamepad API) | ✅ full (Gamepad API) |
| PlayStation (DS4/DualSense) | ✅ full | ✅ full | ✅ standard · 🔧 raw via plugin | ✅ standard mapping |
| 8BitDo / generic pads | ✅ | ✅ | ✅ standard | ✅ standard mapping |
| **Switch 1 Pro Controller** | ✅ full | ✅ full | ✅ standard · 🔧 raw via plugin | ✅ standard mapping |
| **Switch Pro Controller 2** (needs custom init) | ✅ full | ✅ full | 🔧 full via plugin | ❌ **not usable** |
| **NSO GameCube** (needs custom init) | ✅ full | ✅ full | 🔧 full via plugin | ❌ **not usable** |
| Keyboard | ✅ | ✅ | ✅ | ✅ |

## Key limitations

- **Linux** needs the controller **udev rules** for raw-HID controllers (Nintendo/Sony)
  and the `usb-init`; without them you get only basic Gamepad-API input. The `.deb`
  installs them; AppImage users install manually.
- **Android Bluetooth** can only deliver what Android maps through the **Gamepad API**
  (standard buttons/axes + basic rumble). There is **no app-level raw Bluetooth-HID**
  access (Android exposes no host-role HID API to non-root apps), so over BT you get
  **no** raw HID, advanced haptics, output writes, or vendor `usb-init`.
- **Switch Pro Controller 2 / NSO GameCube** stay silent until they receive a vendor
  `usb-init`, which needs raw HID/USB **write** access. On desktop this works over USB
  and Bluetooth (node-hid/libusb). On **Android these are wired-only**: full support over
  **USB-OTG** (via the native plugin), and **not usable over Bluetooth** — the only
  wireless fallback for them is the on-screen touch overlay.
- **Android advanced haptics/precise input** require the **USB-OTG native plugin**;
  Bluetooth controllers get basic Gamepad rumble only.
- **iOS** is not yet a target (the platform model is iOS-ready).

## Under the hood

Each platform supplies a `ControllerHost` (raw bytes in/out); everything downstream is
shared. Transports: node-hid on Windows/macOS/Linux (Electron), the native
`UsbManager` plugin on Android USB-OTG, and the Web Gamepad API for standard pads
everywhere. See `plans/controller-parity-linux-android.md` for the implementation plan.
