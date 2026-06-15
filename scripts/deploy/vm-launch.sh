#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Runs on the test VM (scp'd by push-linux) to launch the pushed AppImage on the
# logged-in GNOME/Wayland desktop. `--test` runs 8s in the foreground and prints
# output so launch failures (display, GL, missing libs) are visible.
#   bash vm-launch.sh           detached launch
#   bash vm-launch.sh --test     8s foreground run, prints output
set -u

APP="$HOME/rotp-linux.AppImage"
INCOMING="$APP.incoming"
LOG=/tmp/rotp.log
U=$(id -u)

pkill -f rotp-linux.AppImage 2>/dev/null || true
sleep 1
[ -f "$INCOMING" ] && mv -f "$INCOMING" "$APP"
chmod +x "$APP" 2>/dev/null || true

# Launch into the logged-in GNOME session. This VM is Wayland (gnome-shell owns
# wayland-0); Electron needs the Ozone Wayland backend + the session runtime dir and
# bus, or it dies with "ui/aura: platform failed to initialize". No real GPU on the
# VM, so force software GL with --disable-gpu. No FUSE (extract-and-run).
export APPIMAGE_EXTRACT_AND_RUN=1
export XDG_RUNTIME_DIR="/run/user/$U"
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"
export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=/run/user/$U/bus}"
FLAGS="--no-sandbox --ozone-platform=wayland --enable-features=UseOzonePlatform --disable-gpu --muted"

if [ "${1:-}" = "--test" ]; then
  echo "[vm-launch] WAYLAND_DISPLAY=$WAYLAND_DISPLAY flags: $FLAGS"
  timeout 8 "$APP" $FLAGS >/tmp/rotp-test.log 2>&1
  echo "[vm-launch] exit=$? (124 = stayed alive = good)"
  grep -vE 'appimage_extracted|usb/prebuilds' /tmp/rotp-test.log | tail -40
  exit 0
fi

setsid "$APP" $FLAGS </dev/null >"$LOG" 2>&1 &
PID=$!
disown
sleep 4
if kill -0 "$PID" 2>/dev/null || pgrep -f rotp-linux.AppImage >/dev/null; then
  echo "[vm-launch] running (log: $LOG)"
else
  echo "[vm-launch] exited early — tail of log:" >&2
  grep -vE 'appimage_extracted|usb/prebuilds' "$LOG" | tail -20 >&2
  exit 1
fi
