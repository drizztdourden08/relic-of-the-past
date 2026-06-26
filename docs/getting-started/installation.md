<!-- @layer docs @kind doc -->
# Installation

## System Requirements

- **OS:** Windows 10+, macOS 11+, or Linux (x64)
- **RAM:** 4 GB minimum
- **Disk:** ~200 MB for the application
- **ROM:** A legally obtained SNES ROM of A Link to the Past (`.sfc` or `.smc`). Gameplay needs the US (NTSC) ROM; EU and JP ROMs are used only to import their language.

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

- Needs no admin rights
- Creates no registry entries or shortcuts
- Runs from anywhere: a USB drive, your Downloads folder, wherever
- Stores settings and saves in `%APPDATA%/relic-of-the-past/`
- Does not auto-update, so you download new versions yourself

Best for trying the app, running from removable media, or any environment where you can't install software.

### Installer (`rotp-windows-setup.exe`)

A standard Windows installer (NSIS).

- Installs to `Program Files` by default, and you can change that
- Creates Start Menu and optional Desktop shortcuts
- Adds an uninstaller you'll find under Windows Settings → Apps
- Auto-updates: the app tells you when a new version is out and updates itself in place
- Needs admin rights to install

Best for regular use, since it keeps the app up to date automatically.

### Windows SmartScreen Warning

The app isn't code-signed, so Windows may show a "Windows protected your PC" warning the first time you launch it. Click "More info", then "Run anyway". You'll only see it once.

---

## macOS

### Disk Image (`rotp-macos.dmg`)

1. Open the `.dmg` file
2. Drag **Relic of the Past** into the Applications folder
3. On first launch, right-click the app and choose **Open**, then confirm in the dialog

The app is ad-hoc signed but not notarized by Apple, so macOS shows it as coming
from an unidentified developer. Right-click → **Open** clears this, and you only
see it once.

### "Relic of the Past is damaged and can't be opened"

If macOS says the app is **damaged** and offers only to move it to the Bin, the
file picked up a quarantine flag during download. The app isn't actually damaged.
Clear the flag in Terminal:

```bash
xattr -dr com.apple.quarantine "/Applications/Relic of the Past.app"
```

Then open the app normally. Alternatively, copying the `.dmg` onto the Mac from a
USB drive or another computer avoids the quarantine flag entirely.

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

See [Auto-Update](../user-guide/auto-update.md) for details on how the update system works.

---

## Data Storage

Regardless of installation method, user data is stored in:

| Platform | Location |
|----------|----------|
| Windows | `%APPDATA%/relic-of-the-past/` |
| macOS | `~/Library/Application Support/relic-of-the-past/` |
| Linux | `~/.config/relic-of-the-past/` |

This covers profiles, saves, settings, imported ROMs, and MSU packs. Uninstalling the app leaves this data in place.
