<!-- @layer docs @kind doc -->
# Auto-Update

The app checks for new releases on its own. On Windows and Linux it downloads and
applies them for you, and only the parts that changed come down.

---

## How It Works

1. **On startup** the app checks the releases page five seconds after launch
2. **Manual check** from Menu → Advanced → **Check for Updates** whenever you want
3. **Notification** puts an indicator in the title bar when a newer version exists
4. **Download** runs inside the app, with a progress bar, when you accept
5. **Restart** happens on its own: the app closes, the update is applied in about two
   seconds, and the app comes back on the new version

After the first update, only the difference between your version and the new one is
downloaded, so a typical update is a few MB rather than the whole app.

---

## Supported Build Types

| Platform | Build | Auto-Update |
|----------|-------|-------------|
| Windows | Installer | ✅ Yes, downloading only what changed |
| Windows | Portable | ✅ Yes, in place |
| Linux | AppImage | ✅ Yes, replaces the AppImage |
| Linux | .deb | ❌ No, download a new package |
| macOS | DMG | ⚠️ Checks and tells you, but you download it yourself |

On macOS the app can see that an update exists and shows you the release notes, but it
can't install it: applying an update there requires an Apple-notarized signature this
project doesn't have. The dialog's button opens the release page instead.

Installing globally (for everyone on the computer) means each update needs
administrator approval, because the app lives in a folder only an administrator can
write to.

---

## Choosing a Version

The update dialog has a version picker. It lists every release you can install, newest
first, and you can go back to an earlier one if a new version misbehaves. Each entry
shows its size and date, and older-than-installed versions are marked.

There's also an **Include pre-releases** switch. With it on, test builds appear in the
picker and in the update check, grouped separately so you can't pick one by accident.

---

## Where Your Files Live

Updates never touch your profiles, saves, ROMs or MSU packs. They live outside the app
folder, so uninstalling or reinstalling leaves them alone. A portable copy keeps them
in its own `data` folder instead. See [Portable Mode](../getting-started/portable.md).

---

## Troubleshooting

| Issue | Cause | What to do |
|-------|-------|------------|
| No update notification | Running a development build | Checks only run in installed builds |
| "Update failed" | Network problem, or the releases page is rate limiting | Try again later |
| Nothing happens on macOS | That platform can't self-update | Use the button to open the release page |
| Update asks for administrator every time | Installed globally | Expected. Reinstall for just yourself to avoid it |
| Portable copy did not keep my saves | No `data` folder beside the app | See [Portable Mode](../getting-started/portable.md) |
