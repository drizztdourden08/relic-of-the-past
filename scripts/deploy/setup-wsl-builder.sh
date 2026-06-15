#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# One-time WSL build-engine setup: native build deps + Node 24 via nvm.
#   bash scripts/deploy/setup-wsl-builder.sh
set -euo pipefail

sudo apt-get update
sudo apt-get install -y \
  build-essential pkg-config git rsync openssh-client \
  libudev-dev libusb-1.0-0-dev

if [ ! -d "$HOME/.nvm" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install 24
nvm alias default 24

echo "[setup-wsl-builder] done. node $(node -v), npm $(npm -v)"
