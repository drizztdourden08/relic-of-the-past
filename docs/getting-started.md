<!-- @layer docs @kind doc -->
# Getting Started

## First Launch

When you open Relic of the Past for the first time, you'll see an empty state — no game is loaded yet. The app needs a ROM file to extract game assets from.

---

## Step 1: Import Your ROM

1. Open the **menu** (hamburger icon in the title bar, or press `Escape`)
2. Go to **Data** → **ROMs**
3. Click **Import ROM**
4. Select your `.sfc` or `.smc` file

The app supports:

- US (NTSC) ROM
- European (PAL) ROM
- Japanese ROM
- French ROM

The ROM is copied into the app's data directory — you can delete or move the original file afterward.

### Asset Extraction

When a ROM is imported, the app automatically extracts all game assets (graphics, maps, audio, text). This is a one-time process that takes a few seconds. Unlike the original PC port, **no Python installation is required** — extraction is handled entirely in TypeScript.

---

## Step 2: Create a Profile

1. From the main screen, click **Create Profile** (or go to Menu → Profiles)
2. Give it a name
3. Select the ROM to use
4. Choose a language

A profile is an isolated container that holds:

- ROM reference
- Language setting
- Save data (auto-saves, quick saves, named saves)
- Game settings (display, gameplay, audio)
- Control bindings
- MSU pack selection

You can create multiple profiles — for example, one for casual play and one for speedrunning with different settings.

---

## Step 3: Configure Settings

With a profile selected, open **Profile Settings** to configure:

- **Display** — aspect ratio, window mode, FPS counter
- **Gameplay** — original PC port toggles
- **Audio** — volume levels, MSU pack
- **Controls** — rebind any action
- **Haptics** — vibration events

All settings are per-profile. See the individual feature docs for details.

---

## Step 4: Play

Click **Play** or press your configured start button. The game launches immediately in the app window.

### In-Game Controls

- **Title bar** — hover the top edge to reveal (auto-hides during gameplay)
- **Menu** — hamburger icon or `Escape`
- **Quick save** — hold the configured button (default: Select) for the configured duration
- **Mute** — click the speaker icon in the title bar

### Widgets

While playing, you can open overlay widgets from Menu → Widgets:

- Inventory Tracker
- Checks Tracker
- Cheats
- Logs

Widgets can be docked to any screen edge or floated freely.

---

## Updating the App

If you installed via the NSIS installer (Windows), DMG (macOS), AppImage, or .deb (Linux), the app checks for updates on startup. When a new version is available, a notification appears in the title bar. You can also manually check via Menu → Advanced → **Check for Updates**.

If you're using the portable Windows build, you'll need to download new versions manually from the [Releases page](https://github.com/drizztdourden08/relic-of-the-past/releases).

See [Auto-Update](auto-update.md) for more details.
