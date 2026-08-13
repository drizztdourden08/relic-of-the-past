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
| Windows | `rotp-windows-setup.exe` | Installer, small download, updates itself |
| macOS | `rotp-macos.dmg` | Disk image |
| Linux | `rotp-linux.AppImage` | Universal binary |
| Linux | `rotp-linux.deb` | Debian/Ubuntu package |

---

## Windows

### Installer (`rotp-windows-setup.exe`)

A small download, well under a megabyte. It fetches the app itself, so the file never
goes stale: the copy you downloaded months ago still installs the current version.

- Installs for your user account, so there is no admin prompt
- Shows a progress window and starts the app when it finishes
- Updates itself from then on, downloading only what changed

If you would rather install somewhere you choose, such as another drive, the installer
offers that on the first screen.

See [Portable Mode](portable.md) if you want your profiles, saves and imported files
kept beside the app instead of in your user profile, so the whole thing can be carried
on a USB key.

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

The app checks for updates and tells you when one is out, but it can't install it
for you: applying an update on macOS requires an Apple-notarized signature, which
this project doesn't have. The update dialog links straight to the release page.

---

## Linux

### AppImage (`rotp-linux.AppImage`)

1. Download the file
2. Make it executable: `chmod +x rotp-linux.AppImage`
3. Run it: `./rotp-linux.AppImage`

Works on most Linux distributions without installation, and updates itself in place.
If you keep it somewhere only root can write, it asks for your password when updating.

### Debian Package (`rotp-linux.deb`)

For Debian, Ubuntu, and derivatives:

```bash
sudo dpkg -i rotp-linux.deb
```

Installs to `/opt/` with a desktop entry. It does not update itself: download a new
package, or use the AppImage if you want automatic updates.

---

## Auto-Update Support Summary

| Platform | Build Type | Auto-Update |
|----------|-----------|-------------|
| Windows | Installer | ✅ Yes, and only the changes are downloaded |
| Linux | AppImage | ✅ Yes, in place |
| Linux | .deb | ❌ No, download a new one |
| macOS | DMG | ⚠️ Tells you an update exists, but you download it yourself |

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

The exception is a portable copy, which keeps all of the above in a `data` folder
beside the app instead. See [Portable Mode](portable.md).
