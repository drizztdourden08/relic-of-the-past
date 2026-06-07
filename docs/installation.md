<!-- @layer docs @kind doc -->
# Installation

## System Requirements

- **OS:** Windows 10+, macOS 11+, or Linux (x64)
- **RAM:** 4 GB minimum
- **Disk:** ~200 MB for the application
- **ROM:** A legally obtained US, EU, or JP SNES ROM of A Link to the Past (`.sfc` or `.smc`)

---

## Download Options

Each release provides platform-specific builds:

| Platform | File | Type |
|----------|------|------|
| Windows | `rotp-windows-portable.exe` | Portable (single file) |
| Windows | `rotp-windows-setup.exe` | NSIS installer |
| macOS | `rotp-macos.dmg` | Disk image |
| Linux | `rotp-linux.AppImage` | Universal binary |
| Linux | `rotp-linux.deb` | Debian/Ubuntu package |

---

## Windows

### Portable (`rotp-windows-portable.exe`)

A single executable that runs without installation.

- **No admin rights required**
- **No registry entries or shortcuts created**
- Run from anywhere — USB drive, Downloads folder, etc.
- Settings and saves are stored in `%APPDATA%/relic-of-the-past/`
- **Does not support auto-update** — you must manually download new versions

Best for: trying the app, running from removable media, environments where you can't install software.

### Installer (`rotp-windows-setup.exe`)

A standard Windows installer (NSIS).

- Installs to `Program Files` by default (customizable)
- Creates Start Menu and optional Desktop shortcuts
- Adds an uninstaller accessible from Windows Settings → Apps
- **Supports auto-update** — the app will notify you when a new version is available and can update itself in-place
- Requires admin rights during installation

Best for: regular use, keeping the app up-to-date automatically.

### Windows SmartScreen Warning

Because the app is not code-signed, Windows may show a "Windows protected your PC" warning on first launch. Click **"More info"** → **"Run anyway"**. This only appears once.

---

## macOS

### Disk Image (`rotp-macos.dmg`)

1. Open the `.dmg` file
2. Drag **Relic of the Past** into the Applications folder
3. On first launch, right-click → **Open** (bypasses Gatekeeper for unsigned apps)

macOS may show "this app is from an unidentified developer." Use right-click → Open to bypass this.

Auto-update is supported on macOS via the `.zip` companion file included in each release.

---

## Linux

### AppImage (`rotp-linux.AppImage`)

1. Download the file
2. Make it executable: `chmod +x rotp-linux.AppImage`
3. Run it: `./rotp-linux.AppImage`

Works on most Linux distributions without installation. Auto-update is supported.

### Debian Package (`rotp-linux.deb`)

For Debian, Ubuntu, and derivatives:

```bash
sudo dpkg -i rotp-linux.deb
```

Installs to `/opt/` with a desktop entry. Auto-update is supported.

---

## Auto-Update Support Summary

| Platform | Build Type | Auto-Update |
|----------|-----------|-------------|
| Windows | Portable | ❌ No |
| Windows | Installer (NSIS) | ✅ Yes |
| macOS | DMG | ✅ Yes |
| Linux | AppImage | ✅ Yes |
| Linux | .deb | ✅ Yes |

See [Auto-Update](auto-update.md) for details on how the update system works.

---

## Data Storage

Regardless of installation method, user data is stored in:

| Platform | Location |
|----------|----------|
| Windows | `%APPDATA%/relic-of-the-past/` |
| macOS | `~/Library/Application Support/relic-of-the-past/` |
| Linux | `~/.config/relic-of-the-past/` |

This includes profiles, saves, settings, imported ROMs, and MSU packs. Uninstalling the app does **not** delete this data.
