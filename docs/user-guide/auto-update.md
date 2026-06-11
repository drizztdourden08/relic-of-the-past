<!-- @layer docs @kind doc -->
# Auto-Update

The app checks for new releases on its own and can download and apply them for you.

---

## How It Works

1. **On startup** — five seconds after launch, the app checks GitHub Releases for a newer version
2. **Manual check** — Menu → Advanced → **Check for Updates** runs a check whenever you want
3. **Notification** — when a newer version exists, an indicator appears in the title bar
4. **Download** — click the notification to open a dialog and choose to download
5. **Install** — after the download finishes, restart right away or wait and install on next quit

Updates run through `electron-updater`, which compares the running app version against the `latest.yml` file published with each GitHub Release.

---

## Supported Build Types

Auto-update works only with installed builds. The portable Windows executable can't update itself.

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
2. After five seconds, a check runs quietly in the background
3. When an update is found, the title bar shows an update badge
4. Click the badge to open the Update Dialog
5. The dialog shows the new version number and release notes
6. Click **Update** to download
7. A progress bar shows download status
8. When it's done, click **Restart & Update** to apply right away, or close the dialog and let the update apply on the next quit

### Manual Check

1. Open Menu → Advanced → **Check for Updates**
2. The Update Dialog opens immediately
3. If up-to-date: "You're running the latest version"
4. If update available: same flow as above

---

## Technical Details

### Version Comparison

The app compares its embedded version, baked in from `package.json` at build time, against the version declared in `latest.yml` on the latest GitHub Release. Versions follow semver, for example `0.8.1` → `0.8.2`.

### Download

- **Windows (NSIS):** Downloads the full installer and runs it silently on restart
- **macOS:** Downloads a `.zip`, extracts, and replaces the app bundle
- **Linux AppImage:** Downloads the new AppImage and replaces the existing file

### No Background Downloads

`autoDownload` is off, so the app only notifies you and waits for you to start the download yourself.

---

## Portable Users

If you're using the portable Windows build (`rotp-windows-portable.exe`):

- The update check still runs and detects new versions
- The Update Dialog still appears
- The download and install step may not work, because the app can't replace a running executable

If you're on the portable build, download new versions by hand from the [Releases page](https://github.com/drizztdourden08/relic-of-the-past/releases).

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No update notification | App is in dev mode | Updates only check in packaged builds |
| "Update failed" error | Network issue or GitHub API rate limit | Try again later |
| Update found but can't download | Private repo without token | Requires public repo or embedded token |
| Portable shows update but can't install | Portable builds don't support auto-install | Download manually |
