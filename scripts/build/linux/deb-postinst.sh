#!/bin/sh
# @layer tooling-scripts @kind build
# Relic of the Past — .deb post-install: install controller udev rules so the
# SDL3 controller transport can open game controllers without root, then reload
# udev. Runs as root during `dpkg -i`. Kept in sync with 99-relic-controllers.rules.
set -e

RULES_PATH=/etc/udev/rules.d/99-relic-controllers.rules

cat > "$RULES_PATH" <<'RULES'
# Relic of the Past — game controller access (auto-installed by the .deb)
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="057e", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="057e", TAG+="uaccess"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="054c", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="054c", TAG+="uaccess"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="045e", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="045e", TAG+="uaccess"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="2dc8", TAG+="uaccess"
SUBSYSTEM=="usb", ATTRS{idVendor}=="2dc8", TAG+="uaccess"
RULES

# Reload + apply without a reboot (best-effort).
if command -v udevadm >/dev/null 2>&1; then
  udevadm control --reload-rules || true
  udevadm trigger || true
fi

exit 0
