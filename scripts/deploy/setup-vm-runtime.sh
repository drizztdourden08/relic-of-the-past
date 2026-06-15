#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# One-time VM runtime setup: OpenSSH, Electron runtime libs, HID udev rule.
#   bash setup-vm-runtime.sh
set -euo pipefail

sudo apt-get update
sudo apt-get install -y \
  openssh-server fuse \
  libnss3 libgbm1 libasound2t64 libgtk-3-0 libnotify4 \
  libxss1 libxtst6 libatk-bridge2.0-0 libdrm2 xdg-utils
sudo apt-get install -y libfuse2t64 2>/dev/null || sudo apt-get install -y libfuse2 2>/dev/null || true

# Enable sshd (socket-activated on recent Ubuntu).
if systemctl list-unit-files | grep -q '^ssh.socket'; then
  sudo systemctl disable --now ssh.service 2>/dev/null || true
  sudo systemctl enable --now ssh.socket
else
  sudo systemctl enable --now ssh
fi

# Let the plugdev group read HID controllers.
sudo tee /etc/udev/rules.d/99-rotp-controllers.rules >/dev/null <<'EOF'
KERNEL=="hidraw*", MODE="0660", GROUP="plugdev"
SUBSYSTEM=="usb", ENV{DEVTYPE}=="usb_device", MODE="0660", GROUP="plugdev"
EOF
sudo usermod -aG plugdev "$USER"
sudo udevadm control --reload-rules
sudo udevadm trigger

echo "[setup-vm-runtime] done"
