#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# Runs on the test VM (scp'd by push-linux). Installs a desktop entry for the pushed
# AppImage and pins it to the GNOME dash (dock) so the app is discoverable instead of
# only launchable over ssh. Idempotent — safe to run on every deploy. Expects the
# icon at ~/.local/share/icons/relic-of-the-past.png (push-linux scp's it).
set -u

APP="$HOME/rotp-linux.AppImage"
U=$(id -u)
APPS="$HOME/.local/share/applications"
ICON="$HOME/.local/share/icons/relic-of-the-past.png"
DESKTOP="$APPS/relic-of-the-past.desktop"
mkdir -p "$APPS" "$(dirname "$ICON")"
[ -f "$ICON" ] || ICON=application-x-executable

# Launch flags match vm-launch.sh, minus --muted so a manual click behaves normally.
cat > "$DESKTOP" <<EOF
[Desktop Entry]
Type=Application
Name=Relic of the Past
Comment=Relic of the Past (test build)
Exec=env APPIMAGE_EXTRACT_AND_RUN=1 "$APP" --no-sandbox --ozone-platform=wayland --enable-features=UseOzonePlatform
Icon=$ICON
Terminal=false
Categories=Game;
StartupWMClass=relic-of-the-past
EOF
chmod +x "$DESKTOP"
update-desktop-database "$APPS" 2>/dev/null || true

# Pin to the GNOME dash favorites (the dock), via the session bus.
export XDG_RUNTIME_DIR="/run/user/$U"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$U/bus"
CUR=$(gsettings get org.gnome.shell favorite-apps 2>/dev/null || echo "")
case "$CUR" in
  *relic-of-the-past.desktop*) : ;;  # already pinned
  "["*"]")
    NEW=$(printf '%s' "$CUR" | sed "s/]$/, 'relic-of-the-past.desktop']/")
    gsettings set org.gnome.shell favorite-apps "$NEW" 2>/dev/null || true ;;
  *)
    gsettings set org.gnome.shell favorite-apps "['relic-of-the-past.desktop']" 2>/dev/null || true ;;
esac

echo "[install-desktop] entry: $DESKTOP"
echo "[install-desktop] icon : $ICON"
echo "[install-desktop] dock : $(gsettings get org.gnome.shell favorite-apps 2>/dev/null || echo '?')"
