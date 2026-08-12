<!-- @layer docs @kind doc -->
# Linux — controller setup (udev rules)

SDL3 is the only input layer this app uses, on every platform, including Linux. On
Linux, its raw-HID backend needs permission to the `hidraw` and `usb` device nodes to
talk to a controller directly. Without that permission, a controller from one of the
vendors below may fall back to SDL3's standard gamepad mode (buttons and axes only) or
may not be usable at all — see the per-controller notes in
[support-matrix.md](support-matrix.md#limitations). Xbox pads are the one exception:
they work through SDL3's standard mode without needing these rules at all.

## .deb (automatic)

The `.deb` package installs the rules for you (post-install) and reloads udev. Just
replug the controller after installing. Nothing else to do.

## AppImage / manual install

The AppImage can't run an installer step, so install the rules once by hand:

```sh
sudo cp 99-relic-controllers.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules
sudo udevadm trigger
```

The rules file ships in the repo at `scripts/build/linux/99-relic-controllers.rules`
(or copy it from the app resources). Then unplug/replug the controller (Bluetooth:
re-pair) so the new permissions apply.

## What the rules grant

`TAG+="uaccess"` gives the **logged-in desktop user** read/write access (via
systemd-logind) to controllers from these vendors, over both `hidraw` and `usb`:

| Vendor | VID | Examples |
|--------|-----|----------|
| Nintendo | `057e` | Switch Pro, Pro Controller 2, NSO GameCube, Joy-Con |
| Sony | `054c` | DualShock 4, DualSense |
| Microsoft | `045e` | Xbox (usually XInput; included for completeness) |
| 8BitDo | `2dc8` | 8BitDo pads |

If your controller has a different vendor ID, add a matching pair of lines and
reload (`udevadm control --reload-rules && udevadm trigger`).

Xbox controllers work without the rules through SDL3's standard gamepad mode; the rules
matter for the vendors SDL3 reads over raw `hidraw`/`usb` instead (Nintendo, Sony, 8BitDo).
