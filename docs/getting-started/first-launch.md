<!-- @layer docs @kind doc -->
# First Launch

The first time you open Relic of the Past, nothing is loaded yet. The app needs a ROM to extract its game assets from.

## Step 1 · Import your ROM

1. Open the menu (the hamburger icon in the title bar, or press `Escape`).
2. Go to **Data** → **ROMs**.
3. Choose **Import ROM** and select your `.sfc` or `.smc` file.

The game runs on the **US (NTSC) ROM** only. ROMs from other regions can be imported too, but only to extract their **language** for in-game text, and those ROMs don't run the game. The ROM is copied into the app's data directory, so you can move or delete the original afterward.

### Asset extraction

When you import a ROM, the app extracts its assets (graphics, maps, audio, and text) once, in a few seconds. Unlike the original PC port, no Python is required; it's all handled in TypeScript.

## Step 2 · Create a profile

1. Choose **Create Profile** (or go to **Data** → **Profiles**).
2. Give it a name.
3. Select the ROM to use.
4. Choose a language.

A profile is a self-contained space that holds its own ROM and language, save data, settings (display, gameplay, audio), control bindings, and MSU pack. You can keep several, say one for casual play and one tuned for speedrunning.

## Step 3 · Configure settings

With a profile open, head to its **Settings** to set up:

- **Display:** aspect ratio, window mode, and an optional FPS counter in the title bar.
- **Gameplay:** the original PC-port toggles plus this app's extras: auto-save, quick saves, item cycling, and quality-of-life options.
- **Audio:** volume levels and your MSU pack.
- **Controls:** rebind any action.
- **Haptics:** vibration for in-game events.

Every setting is saved per profile. The feature pages cover each area in detail.

## Step 4 · Play

Click **Play** (or your configured start button) and the game opens in the app window.

While playing:

- **Title bar:** hover the top edge to reveal it; it auto-hides during play.
- **Menu:** the hamburger icon or `Escape`.
- **Quick save:** hold the save button (Select by default).
- **Mute:** the speaker icon in the title bar.

### Widgets

From **Menu → Widgets** you can open overlay panels, among them the inventory tracker, checks tracker, cheats, and logs. Widgets dock to any screen edge or float freely.

## Updating the app

Installed builds (Windows installer, macOS DMG, Linux AppImage/`.deb`) check for updates on startup and show a notice in the title bar when one's available; you can also check via **Menu → Advanced → Check for Updates**. The portable Windows build doesn't auto-update, so grab new versions from the [Releases page](https://github.com/drizztdourden08/relic-of-the-past/releases). See [Auto-Update](../user-guide/auto-update.md) for details.
