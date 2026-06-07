<!-- @layer docs @kind doc -->
# Auto-Update

The app includes a built-in update system that checks for new releases and can download and apply them automatically.

---

## How It Works

1. **On startup** — 5 seconds after launch, the app checks GitHub Releases for a newer version
2. **Manual check** — Menu → Advanced → **Check for Updates** triggers a check at any time
3. **Notification** — if a newer version exists, an indicator appears in the title bar
4. **Download** — clicking the notification opens a dialog where you can choose to download
5. **Install** — once downloaded, you can restart immediately or install later (on next quit)

The update system uses `electron-updater` which compares the running app version against the `latest.yml` file published with each GitHub Release.

---

## Supported Build Types

Auto-update only works with **installed** builds. The portable Windows executable cannot update itself.

| Platform | Build | Auto-Update | Reason |
|----------|-------|-------------|--------|
| Windows | NSIS Installer | ✅ | Updates via differential download |
| Windows | Portable | ❌ | Single file cannot replace itself while running |
| macOS | DMG (installed to Applications) | ✅ | Updates via zip download |
| Linux | AppImage | ✅ | Replaces the AppImage file |
| Linux | .deb | ✅ | Updates via package replacement |

---

## Update Flow (User Perspective)

### Automatic Detection

1. Launch the app
2. After 5 seconds, a check runs silently in the background
3. If an update is found, the title bar shows an update badge
4. Click the badge to open the Update Dialog
5. The dialog shows the new version number and release notes
6. Click **Update** to download
7. Progress bar shows download status
8. Once complete, click **Restart & Update** to apply immediately — or close the dialog and the update applies on next app quit

### Manual Check

1. Open Menu → Advanced → **Check for Updates**
2. The Update Dialog opens immediately
3. If up-to-date: "You're running the latest version"
4. If update available: same flow as above

---

## Technical Details

### Version Comparison

The app compares its embedded version (from `package.json` at build time) against the version declared in `latest.yml` on the latest GitHub Release. Versions follow semver (e.g., `0.8.1` → `0.8.2`).

### Download

- **Windows (NSIS):** Downloads the full installer and runs it silently on restart
- **macOS:** Downloads a `.zip`, extracts, and replaces the app bundle
- **Linux AppImage:** Downloads the new AppImage and replaces the existing file

### No Background Downloads

`autoDownload` is disabled. The app only notifies you — it never downloads without explicit user action.

---

## Portable Users

If you're using the portable Windows build (`rotp-windows-portable.exe`):

- The update check still runs and detects new versions
- The Update Dialog will appear
- However, the download/install mechanism may not work correctly since the app can't replace a running executable

**Recommendation:** Portable users should download new versions manually from the [Releases page](https://github.com/drizztdourden08/relic-of-the-past/releases).

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No update notification | App is in dev mode | Updates only check in packaged builds |
| "Update failed" error | Network issue or GitHub API rate limit | Try again later |
| Update found but can't download | Private repo without token | Requires public repo or embedded token |
| Portable shows update but can't install | Expected — portable doesn't support auto-install | Download manually |
