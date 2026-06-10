<!-- @layer docs @kind doc -->
# Importing a ROM & Assets

The app contains **no game data**. You point it at your own legally obtained ROM once; it extracts the
assets it needs and stores them locally. Nothing is uploaded anywhere.

## Import

1. Title bar → **Data** → **ROMs**.
2. **Import ROM** → select your `.sfc`/`.smc` (or import from a URL).
3. The ROM is **copied into the app's data directory** — you can move or delete the original afterward.

Supported regions: US (NTSC), European (PAL), Japanese, and French ROMs. The app **validates the
checksum** (`ZELDA3_SHA1` / `ZELDA3_SHA1_US`) on load, so the wrong file fails loudly rather than
producing a broken game.

## Asset extraction

When a ROM is imported, the app extracts all game assets — graphics, maps, audio, text — into a
`zelda3_assets.dat` blob the game core loads. This is a **one-time** step that takes a few seconds.

Unlike the original PC port, **no Python is required**: extraction is a pure-TypeScript pipeline (see
[Asset-Extraction Pipeline](../architecture/asset-extraction.md) for how it works).

## Related data, per ROM

The [Data Manager](../user-guide/data-manager.md) manages everything keyed to a ROM:

- **Sprites** — extract/cache per-ROM sprite PNGs (used by debug/tracker tooling).
- **Languages** — extract translations (English, French, …) for in-game dialogue.
- **MSU-1** — import custom music packs to attach to a profile.

## Then create a profile

A ROM by itself doesn't start a game — you play through a [profile](../user-guide/profiles.md) that
references the ROM plus a language and (optionally) an MSU pack. See [Quick Start](quick-start.md) or
the full [First Launch](first-launch.md) walkthrough.

> **Never commit ROMs or extracted assets.** They're gitignored and stay on your machine; see the
> [Copyright / Media Gate](../contributing/copyright-gate.md).
