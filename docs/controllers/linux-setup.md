# Linux — controller setup (udev rules)

On Linux, raw controller access (node-hid for HID reports, libusb for the Switch/NSO
`usb-init`) requires permission to the device nodes. Without it, controllers either
don't show up or fall back to basic Gamepad-API input, and you'll see a
"Controller access denied" hint in the Input Tester.

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

Xbox controllers work without the rules (standard gamepad input); the rules matter for
raw-HID controllers (Nintendo, Sony) and the Switch/NSO init.
