<!-- @layer docs @kind doc -->
# HUD

The heads-up display shows health, magic, rupees, and equipped items during gameplay.

---

## HUD Modes

### Original

The unmodified SNES HUD rendered by the game engine. Positioned identically to the original game.

### Enhanced

A React-rendered overlay that replaces the original HUD with improved visuals:

- **Proper aspect ratio placement** — the enhanced HUD respects your chosen aspect ratio and positions elements correctly regardless of window size
- **Smoother animations** — heart and magic meter changes animate more fluidly than the original pixel-based updates
- **Extracted sprites** — game item sprites are extracted from the ROM and rendered as high-quality overlay elements

The original HUD is hidden underneath when enhanced mode is active. The game still tracks all values internally — the overlay reads state from the game engine and renders it independently.

---

## How It Works

The enhanced HUD uses a bridge between the WASM game engine and the React UI layer:

1. The game engine exposes its internal state (health, magic, items, etc.)
2. A TypeScript bridge reads this state on every frame
3. React components render the HUD overlay on top of the game canvas

This approach means the HUD can be styled, animated, and positioned freely without modifying the game engine code.
