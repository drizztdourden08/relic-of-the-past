#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# One-time bootstrap for the WSL build engine: Node 24 + native-module build deps.
# WSL only *builds* the Linux AppImage — it never runs the app, so no GUI/Electron
# runtime libs here. Run once inside the Ubuntu-24.04 WSL distro:
#   bash scripts/deploy/setup-wsl-builder.sh
set -euo pipefail

echo "[setup-wsl-builder] Updating apt + installing build deps…"
sudo apt-get update
sudo apt-get install -y \
  build-essential pkg-config git rsync openssh-client \
  libudev-dev libusb-1.0-0-dev

if [ ! -d "$HOME/.nvm" ]; then
  echo "[setup-wsl-builder] Installing nvm…"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

echo "[setup-wsl-builder] Installing Node 24…"
nvm install 24
nvm alias default 24

echo "[setup-wsl-builder] Done. node $(node -v), npm $(npm -v)"
echo "Next (from Windows):  npm run push:linux -- --build-only   # verify the build"
