<!-- @layer docs @kind doc -->
# Sprite Tools

Tools for extracting and inspecting a ROM's sprites. These are mostly developer-facing and live in the
[Data Manager](data-manager.md)'s Sprites tab and the Sprite Debug view.

## What's available

- Extraction pulls and caches the sprites for a ROM. The PNGs keep their transparency, land in the app's data directory, and are served to the UI over a custom `app-sprite://` protocol.
- Sprite review lets you browse and inspect individual sprite images.
- The item-to-sprite mapping is a debugger that shows which sprite each item id maps to.
- Cleanup deletes a ROM's cached sprites.

## What's extracted (and what isn't)

Today only HUD, item, and menu sprites are extracted. Link, enemies, NPCs, and overworld and dungeon
tiles are not. If you need a gameplay sprite that hasn't been extracted, that's a known gap, so flag the
specific sprite instead of assuming it's there.

## For contributors

To check whether an on-screen sprite is right, compare it against the real extracted PNG at
`%AppData%\relic-of-the-past\sprites\<rom-stem>\*.png` instead of eyeballing the scaled pixel art. See
[Rendering & Pixel Art](../architecture/rendering-pixel-art.md) and the `interpret-game-screenshot`
skill.
