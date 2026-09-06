#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Builds the Linux AppImage inside the WSL build distro (invoked by push-linux.mjs).
#   bash scripts/deploy/build-in-wsl.sh
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
if ! command -v node >/dev/null 2>&1; then
  NODE_BIN="$(ls -d "$NVM_DIR"/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
  [ -n "${NODE_BIN:-}" ] && export PATH="$NODE_BIN:$PATH"
fi
command -v node >/dev/null 2>&1 || {
  echo "[build-in-wsl] Node not found. Run scripts/deploy/setup-wsl-builder.sh first." >&2
  exit 1
}
echo "[build-in-wsl] node $(node -v), npm $(npm -v)"

npm install
npm run build:linux
