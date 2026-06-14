#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# One-time bootstrap for the full Linux test VM (Ubuntu 26.04 LTS Desktop): an SSH
# server (so push-linux can scp + remote-launch), the Electron runtime libs an
# AppImage needs, and a udev rule so node-hid can open a passed-through controller
# without root. Run once inside the VM:
#   bash setup-vm-runtime.sh
set -euo pipefail

echo "[setup-vm-runtime] Installing OpenSSH server + Electron runtime libs…"
sudo apt-get update
sudo apt-get install -y \
  openssh-server fuse \
  libnss3 libgbm1 libasound2t64 libgtk-3-0 libnotify4 \
  libxss1 libxtst6 libatk-bridge2.0-0 libdrm2 xdg-utils

# Type-2 AppImages want libfuse2 (Ubuntu 24.04+ ships FUSE3); push-linux also sets
# APPIMAGE_EXTRACT_AND_RUN=1 as a fallback, so this is best-effort, never fatal.
sudo apt-get install -y libfuse2t64 2>/dev/null || sudo apt-get install -y libfuse2 2>/dev/null || true

# Ubuntu 24.04+ activates OpenSSH via ssh.socket; older releases use ssh.service.
# Enabling the wrong one leaves nothing listening on :22, so prefer the socket.
if systemctl list-unit-files | grep -q '^ssh.socket'; then
  sudo systemctl disable --now ssh.service 2>/dev/null || true
  sudo systemctl enable --now ssh.socket
else
  sudo systemctl enable --now ssh
fi

echo "[setup-vm-runtime] Adding udev rule so the plugdev group can read HID controllers…"
sudo tee /etc/udev/rules.d/99-rotp-controllers.rules >/dev/null <<'EOF'
# Relic of the Past — let the plugdev group read/write HID devices (game controllers)
KERNEL=="hidraw*", MODE="0660", GROUP="plugdev"
SUBSYSTEM=="usb", ENV{DEVTYPE}=="usb_device", MODE="0660", GROUP="plugdev"
EOF
sudo usermod -aG plugdev "$USER"
sudo udevadm control --reload-rules
sudo udevadm trigger

IP="$(hostname -I | awk '{print $1}')"
echo "[setup-vm-runtime] Done. SSH is up; VM IP: ${IP}"
echo "On Windows, put this in scripts/deploy/vm.json:"
echo "  { \"vm\": { \"host\": \"${IP}\", \"user\": \"${USER}\" } }"
echo "Log out and back in once so the plugdev group membership takes effect."
