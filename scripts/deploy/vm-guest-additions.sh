#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Install the full VirtualBox Guest Additions from the mounted ISO.
#   sudo bash vm-guest-additions.sh   (then reboot)
set -u

GA="$(find /media /mnt /run/media -maxdepth 4 -name VBoxLinuxAdditions.run 2>/dev/null | head -1)"
[ -n "$GA" ] || {
  echo "[ga] VBoxLinuxAdditions.run not found. Insert the Guest Additions CD image, then run this again." >&2
  exit 1
}

apt-get update
apt-get install -y build-essential dkms "linux-headers-$(uname -r)"
bash "$GA" --nox11 || true

echo "[ga] done, now reboot the VM"
