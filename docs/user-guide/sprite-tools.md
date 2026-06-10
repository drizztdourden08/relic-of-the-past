<!-- @layer docs @kind doc -->
# Sprite Tools

Tooling for extracting and inspecting the game's sprites, per ROM. Mostly developer-facing, surfaced
in the [Data Manager](data-manager.md)'s **Sprites** tab and the Sprite Debug view.

## What's available

- **Extraction** — extract and cache sprites for a ROM. PNGs (with transparency) land in the app's data
  directory and are served to the UI via a custom `app-sprite://` protocol.
- **Sprite review** — browse and inspect individual sprite images.
- **Item → sprite mapping** — a debugger showing which sprite each item id maps to.
- **Cleanup** — delete a ROM's cached sprites.

## What's extracted (and what isn't)

Only **HUD, item, and menu** sprites are extracted today. **Link, enemies, NPCs, and overworld/dungeon
tiles are not.** If a task needs a gameplay sprite that isn't extracted, that's a known gap — flag the
specific sprite rather than assuming it exists.

## For contributors

When judging whether an on-screen sprite is correct, compare against the **real extracted PNG** at
`%AppData%\relic-of-the-past\sprites\<rom-stem>\*.png` rather than eyeballing the scaled pixel art —
see [Rendering & Pixel Art](../architecture/rendering-pixel-art.md) and the
`interpret-game-screenshot` skill.
