#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Runs INSIDE the WSL build distro (invoked by push-linux.mjs). Activates the
# nvm-installed Node — interactive-only login shells skip nvm, and the Windows
# nvm on the interop PATH must not shadow it — then installs deps and builds the
# Linux AppImage. Kept as an on-disk file (not an inline command) so its quoting
# isn't mangled crossing the Windows -> WSL process boundary.
#
#   bash scripts/deploy/build-in-wsl.sh           full build
#   bash scripts/deploy/build-in-wsl.sh --check    activate Node + report, no build
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Fallback if sourcing nvm didn't put node on PATH: prepend the newest node bin.
if ! command -v node >/dev/null 2>&1; then
  NODE_BIN="$(ls -d "$NVM_DIR"/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
  [ -n "${NODE_BIN:-}" ] && export PATH="$NODE_BIN:$PATH"
fi

command -v node >/dev/null 2>&1 || {
  echo "[build-in-wsl] Node not found under ~/.nvm — run scripts/deploy/setup-wsl-builder.sh first." >&2
  exit 1
}
echo "[build-in-wsl] node $(node -v), npm $(npm -v)"

[ "${1:-}" = "--check" ] && exit 0

npm install
npm run build:linux
