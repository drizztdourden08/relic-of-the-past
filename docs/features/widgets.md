<!-- @layer docs @kind doc -->
# Widgets

In-game overlay panels that provide information and tools while playing.

---

## Overview

Widgets are floating or docked panels that appear on top of the game view. They can be opened from Menu → Widgets.

### Layout Options

- **Dock** — attach to any screen edge (top, bottom, left, right)
- **Float** — position freely anywhere on screen
- **Resize** — drag edges to adjust size
- **Transparency** — adjustable opacity so you can see the game underneath

Widget layout (position, size, dock state, opacity) is saved and restored between sessions.

---

## Inventory Tracker

Displays all items Link currently owns in a visual grid.

- Multiple configurable layouts (grid sizes, groupings)
- Items appear as they're collected
- Sprites extracted from the ROM for accurate visual representation
- Useful for tracking game completion and planning routes

---

## Checks Tracker

Tracks all 257 collectible checks in the game.

- **Status indicators** — collected vs uncollected
- **Grouping** — by region, dungeon, or type
- **Filtering** — show only uncollected, show only a specific area
- **Search** — find specific checks by name

Designed as a foundation for randomizer support — tracks which locations have been checked regardless of what was found there.

---

## Cheats

A panel for modifying game state in real-time:

- **Give items** — add any item to inventory
- **Fill bottles** — set bottle contents
- **Health** — adjust current/max hearts
- **Magic** — adjust magic meter
- **Rupees** — set rupee count
- **Ammo** — set arrow/bomb counts

Changes take effect immediately in the running game. Useful for testing, practice, or casual fun.

---

## Logs

A real-time log viewer showing app events:

- Game state changes
- Asset loading
- Error messages
- Debug output

Useful for troubleshooting or understanding what the app is doing internally.

---

## Accessing Widgets

1. Open Menu → **Widgets**
2. Select the widget to open
3. The widget appears as an overlay on the game view
4. Close via the X button on the widget or through the menu

Multiple widgets can be open simultaneously.
