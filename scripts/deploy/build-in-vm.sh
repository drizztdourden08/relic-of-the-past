#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Builds the Linux AppImage inside the VirtualBox test VM (invoked by push-linux.mjs).
# Run from ~/relic on the VM. After building, stages the AppImage at
# ~/rotp-linux.AppImage.incoming so vm-launch.sh can do an atomic swap.
#   bash scripts/deploy/build-in-vm.sh
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
if ! command -v node >/dev/null 2>&1; then
  NODE_BIN="$(ls -d "$NVM_DIR"/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
  [ -n "${NODE_BIN:-}" ] && export PATH="$NODE_BIN:$PATH"
fi
command -v node >/dev/null 2>&1 || {
  echo "[build-in-vm] Node not found — run scripts/deploy/setup-vm-builder.sh first." >&2
  exit 1
}
echo "[build-in-vm] node $(node -v), npm $(npm -v)"

npm install
npm run build:linux

APPIMAGE="$(ls release/*.AppImage 2>/dev/null | head -n1)"
[ -n "$APPIMAGE" ] || { echo "[build-in-vm] No AppImage produced." >&2; exit 1; }
cp "$APPIMAGE" "$HOME/rotp-linux.AppImage.incoming"
echo "[build-in-vm] staged: $HOME/rotp-linux.AppImage.incoming"
