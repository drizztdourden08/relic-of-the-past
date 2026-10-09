#!/bin/sh
# @layer tooling-scripts @kind build
# Managed by brock sync: the .deb post-install hook, run as root by dpkg -i.
# Module udev rules come first, then the mime and desktop databases when the
# product opens links or files, then the app's own build/linux/after-install.sh.
set -e

RULES_PATH=/etc/udev/rules.d/99-relic-of-the-past.rules
cat > "$RULES_PATH" <<'RULES'
# Game controller access for SDL3. TAG+="uaccess" lets the logged-in user open the device without root.
# The .deb installs this file through its post-install hook; an AppImage user copies it to /etc/udev/rules.d/.

# Nintendo (Switch Pro, Pro 2, NSO GameCube, Joy-Con)
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="057e", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="057e", TAG+="uaccess"

# Sony (DualShock 4, DualSense)
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="054c", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="054c", TAG+="uaccess"

# Microsoft (Xbox, mostly XInput)
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="045e", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="045e", TAG+="uaccess"

# 8BitDo
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="2dc8", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="2dc8", TAG+="uaccess"
RULES

if command -v udevadm >/dev/null 2>&1; then
  udevadm control --reload-rules || true
  udevadm trigger || true
fi


if command -v update-mime-database >/dev/null 2>&1; then
  update-mime-database /usr/share/mime || true
fi

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database /usr/share/applications || true
fi


exit 0
