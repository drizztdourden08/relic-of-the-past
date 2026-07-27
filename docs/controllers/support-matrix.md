<!-- @layer docs @kind doc -->
# Controller support

Which controllers work on each platform, over which connection, and where features are
limited. Input parsing, controller presets, calibration, and haptics are the same
everywhere; only how the device is reached differs per platform.

Legend: ✅ supported · ⚠️ needs one-time setup · ❌ not available.

## Connections per platform

| Connection | Windows | macOS | Linux | Android |
|------------|:--:|:--:|:--:|:--:|
| Raw HID (full feature access) | ✅ | ✅ | ⚠️ udev rules | ✅ USB-OTG only |
| Standard gamepad (buttons/axes/rumble) | ✅ | ✅ | ✅ | ✅ |

On Android, raw HID is available over a **wired USB-OTG** connection only. **Bluetooth**
controllers come through the standard gamepad layer (buttons, axes, basic rumble).

## Features per platform

| Feature | Windows | macOS | Linux | Android (USB-OTG) | Android (Bluetooth) |
|---|:--:|:--:|:--:|:--:|:--:|
| Standard input (buttons/axes) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Precise raw-HID input | ✅ | ✅ | ⚠️ udev | ✅ | ❌ |
| Output writes (LEDs/config) | ✅ | ✅ | ⚠️ udev | ✅ | ❌ |
| Basic rumble | ✅ | ✅ | ✅ | ✅ | ✅ (device-dependent) |
| Advanced HID haptics | ✅ | ✅ | ⚠️ udev | ✅ | ❌ |
| Switch / NSO controller init | ✅ | ✅ | ⚠️ udev | ✅ | ❌ |
| Stick / trigger calibration | ✅ | ✅ | ✅ | ✅ | ✅ |

On Linux, the ⚠️ features need the controller udev rules — see [linux-setup.md](linux-setup.md).
The `.deb` installs them automatically.

## By controller

| Controller | Windows / macOS | Linux | Android (USB-OTG) | Android (Bluetooth) |
|---|:--:|:--:|:--:|:--:|
| Xbox | ✅ | ✅ | ✅ | ✅ |
| PlayStation (DS4 / DualSense) | ✅ | ✅ | ✅ | ✅ standard |
| 8BitDo / generic pads | ✅ | ✅ | ✅ | ✅ standard |
| Switch Pro Controller | ✅ | ✅ | ✅ | ✅ standard |
| Switch Pro Controller 2 | ✅ | ✅ | ✅ | ❌ |
| NSO GameCube | ✅ | ✅ | ✅ | ❌ |
| Keyboard | ✅ | ✅ | ✅ | ✅ |

## Limitations

- **Linux** needs the controller udev rules for raw-HID controllers (Nintendo, Sony) and
  for the Switch/NSO init. Without them, only standard gamepad input works. The `.deb`
  installs the rules; AppImage users install them manually
  ([linux-setup.md](linux-setup.md)).
- **Android Bluetooth** delivers only standard gamepad input (buttons, axes, basic
  rumble). Raw HID, advanced haptics, output writes, and the Switch/NSO init are not
  available over Bluetooth — Android gives apps no raw Bluetooth-HID access.
- **Switch Pro Controller 2** and **NSO GameCube** need a vendor init sequence over a raw
  connection before they send input. On desktop this works over USB and Bluetooth; on
  Android it works over **USB-OTG only**. Over Bluetooth they don't work — use the
  on-screen touch controls instead.
- **iOS** is not a supported target yet.
