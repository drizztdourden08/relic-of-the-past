#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# One-time VM build-engine setup: native build deps + Node 24 via nvm.
# Run on the VM once before using push-linux for the first time:
#   ssh rotp@192.168.56.50 'bash -s' < scripts/deploy/setup-vm-builder.sh
set -euo pipefail

sudo apt-get update
sudo apt-get install -y \
  build-essential pkg-config git rsync \
  libudev-dev libusb-1.0-0-dev \
  libfuse2t64 2>/dev/null || sudo apt-get install -y libfuse2 2>/dev/null || true

if [ ! -d "$HOME/.nvm" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install 24
nvm alias default 24

echo "[setup-vm-builder] done. node $(node -v), npm $(npm -v)"
