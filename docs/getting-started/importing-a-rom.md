<!-- @layer docs @kind doc -->
# Importing a ROM & Assets

The app ships with no game data. You point it at your own legally obtained ROM once, it extracts the assets it needs, and it stores them locally. Nothing is uploaded anywhere.

## Import

1. Open the title-bar menu → **Data** → **ROMs**.
2. Choose **Import ROM** and select your `.sfc`/`.smc` file (you can also import from a URL).
3. The ROM is copied into the app's data directory, so you can move or delete the original afterward.

The game runs on the **US (NTSC) ROM** only. The app checks the ROM on import, so any other file is rejected instead of silently producing a broken game. ROMs from other regions can still be imported, but only to pull their **language** for in-game text; they don't run the game themselves.

## Asset extraction

When you import a ROM, the app extracts its assets (graphics, maps, audio, and text) into a single `zelda3_assets.dat` file that the game loads. This happens once and takes a few seconds.

Unlike the original PC port, you don't need Python: extraction is a built-in TypeScript pipeline. See the [Asset-Extraction Pipeline](../architecture/asset-extraction.md).

## Related data, per ROM

The [Data Manager](../user-guide/data-manager.md) keeps everything tied to a ROM in one place:

- **Sprites:** cache per-ROM sprite images used by the tracker and debug tools.
- **Languages:** import a non-US ROM to extract its translation for in-game dialogue. This is the only thing other-region ROMs are used for.
- **MSU-1:** import custom music packs to attach to a profile.

## Then create a profile

A ROM on its own doesn't start a game. You play through a [profile](../user-guide/profiles.md) that points at the ROM plus a language and, if you like, an MSU pack. See [Quick Start](quick-start.md) or the full [First Launch](first-launch.md) walkthrough.

> Never commit ROMs or extracted assets. They're gitignored and stay on your machine.
