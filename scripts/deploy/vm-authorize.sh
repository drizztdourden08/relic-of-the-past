#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Run INSIDE the test VM (from the shared folder) to (1) authorize the WSL push
# key sitting next to this script and (2) make sure sshd is actually listening so
# push-linux can connect over the NAT port-forward. One-time; safe to re-run.
#   bash /media/sf_rotp-deploy/vm-authorize.sh
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
PUB="$DIR/rotp-push.pub"
[ -f "$PUB" ] || { echo "$PUB is missing. Re-export it from Windows." >&2; exit 1; }

mkdir -p ~/.ssh && chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
KEY="$(cat "$PUB")"
grep -qxF "$KEY" ~/.ssh/authorized_keys || echo "$KEY" >> ~/.ssh/authorized_keys
echo "[vm-authorize] push key authorized"

# Ubuntu 24.04+ activates OpenSSH via ssh.socket; older releases use ssh.service.
if systemctl list-unit-files | grep -q '^ssh.socket'; then
  sudo systemctl disable --now ssh.service 2>/dev/null || true
  sudo systemctl enable --now ssh.socket
else
  sudo systemctl enable --now ssh
fi

echo "[vm-authorize] listening on :22 ->"
sudo ss -tlnp | grep ':22' || echo "  (nothing on :22, try: systemctl status ssh.socket)"
