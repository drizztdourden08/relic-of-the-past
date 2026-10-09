<!-- @layer docs @kind doc -->
# Controller support

Which controllers work on each platform, over which connection, and where features are
limited. Input parsing, controller presets, calibration, and haptics are the same
everywhere; only how the device is reached differs per platform.

Legend: **Yes** means supported, **Setup** needs a one-time setup, **No** is not available.

## Connections per platform

| Connection | Windows | macOS | Linux | Android |
|------------|:--:|:--:|:--:|:--:|
| Raw HID (full feature access) | Yes | Yes | Setup (udev rules) | Yes (USB-OTG only) |
| Standard gamepad (buttons/axes/rumble) | Yes | Yes | Yes | Yes |

On Android, raw HID is available over a **wired USB-OTG** connection only. **Bluetooth**
controllers come through the standard gamepad layer (buttons, axes, basic rumble).

## Features per platform

| Feature | Windows | macOS | Linux | Android (USB-OTG) | Android (Bluetooth) |
|---|:--:|:--:|:--:|:--:|:--:|
| Standard input (buttons/axes) | Yes | Yes | Yes | Yes | Yes |
| Precise raw-HID input | Yes | Yes | Setup (udev) | Yes | No |
| Output writes (LEDs/config) | Yes | Yes | Setup (udev) | Yes | No |
| Basic rumble | Yes | Yes | Yes | Yes | Yes (device-dependent) |
| Advanced HID haptics | Yes | Yes | Setup (udev) | Yes | No |
| Switch / NSO controller init | Yes | Yes | Setup (udev) | Yes | No |
| Stick / trigger calibration | Yes | Yes | Yes | Yes | Yes |

On Linux, the features marked **Setup** need the controller udev rules from
[linux-setup.md](linux-setup.md). The `.deb` installs them automatically.

## By controller

| Controller | Windows / macOS | Linux | Android (USB-OTG) | Android (Bluetooth) |
|---|:--:|:--:|:--:|:--:|
| Xbox | Yes | Yes | Yes | Yes |
| PlayStation (DS4 / DualSense) | Yes | Yes | Yes | Yes (standard) |
| 8BitDo / generic pads | Yes | Yes | Yes | Yes (standard) |
| Switch Pro Controller | Yes | Yes | Yes | Yes (standard) |
| Switch Pro Controller 2 | Yes | Yes | Yes | No |
| NSO GameCube | Yes | Yes | Yes | No |
| Keyboard | Yes | Yes | Yes | Yes |

## Limitations

- **Linux** needs the controller udev rules for raw-HID controllers (Nintendo, Sony) and
  for the Switch/NSO init. Without them, only standard gamepad input works. The `.deb`
  installs the rules; AppImage users install them manually
  ([linux-setup.md](linux-setup.md)).
- **Android Bluetooth** delivers only standard gamepad input (buttons, axes, basic
  rumble). Raw HID, advanced haptics, output writes, and the Switch/NSO init are not
  available over Bluetooth, because Android gives apps no raw Bluetooth-HID access.
- **Switch Pro Controller 2** and **NSO GameCube** need a vendor init sequence over a raw
  connection before they send input. On desktop this works over USB and Bluetooth; on
  Android it works over **USB-OTG only**. Over Bluetooth they don't work, so use the
  on-screen touch controls instead.
- **iOS** is not a supported target yet.
