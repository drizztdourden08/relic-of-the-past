#!/usr/bin/env bash
# @layer tooling-scripts @kind script
# One-time VM setup: sshd, DNS, auto-mounted shared folders, Host-Only static IP.
#   sudo bash /media/sf_rotp-deploy/vm-harden.sh
set -u

USER_NAME="${SUDO_USER:-rotp}"
USER_UID="$(id -u "$USER_NAME")"
USER_GID="$(id -g "$USER_NAME")"

# sshd
install -d /etc/ssh/sshd_config.d
cat >/etc/ssh/sshd_config.d/99-fast.conf <<'EOF'
UseDNS no
GSSAPIAuthentication no
EOF
systemctl restart ssh 2>/dev/null || systemctl restart ssh.socket 2>/dev/null || true

# DNS
install -d /etc/systemd/resolved.conf.d
cat >/etc/systemd/resolved.conf.d/99-rotp.conf <<'EOF'
[Resolve]
DNS=1.1.1.1 8.8.8.8
FallbackDNS=1.0.0.1 8.8.4.4
EOF
systemctl restart systemd-resolved 2>/dev/null || true

# Shared folders: mount now + auto-mount on boot, owned by the user.
ensure_share() {
  local name="$1" mp="$2"
  install -d -o "$USER_UID" -g "$USER_GID" "$mp"
  grep -q " $mp vboxsf " /etc/fstab ||
    echo "$name $mp vboxsf uid=$USER_UID,gid=$USER_GID,nofail,x-systemd.automount 0 0" >>/etc/fstab
  mountpoint -q "$mp" || mount -t vboxsf -o "uid=$USER_UID,gid=$USER_GID" "$name" "$mp" 2>/dev/null || true
}
ensure_share test-roms "/home/$USER_NAME/test-roms"

# Host-Only NIC (Adapter 2) static IP.
HO_IF=enp0s8
HO_IP=192.168.56.50
if ip link show "$HO_IF" >/dev/null 2>&1; then
  nmcli -t -f NAME con show | grep -qx hostonly ||
    nmcli con add type ethernet con-name hostonly ifname "$HO_IF" \
      ipv4.method manual ipv4.addresses "$HO_IP/24" ipv6.method ignore
  nmcli con up hostonly || true
fi

usermod -aG plugdev,vboxsf "$USER_NAME" 2>/dev/null || true
systemctl daemon-reload 2>/dev/null || true
echo "[harden] done"
