#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Make GDM default to an Xorg session (needed for VirtualBox clipboard/drag-and-drop).
#   sudo bash vm-xorg.sh   (then log out/in)
set -u

CONF=/etc/gdm3/custom.conf
[ -f "$CONF" ] || { echo "[xorg] $CONF not found" >&2; exit 1; }
if grep -q 'WaylandEnable' "$CONF"; then
  sed -i 's/^#*WaylandEnable=.*/WaylandEnable=false/' "$CONF"
else
  sed -i '/^\[daemon\]/a WaylandEnable=false' "$CONF"
fi
echo "[xorg] done — log out and back in"
