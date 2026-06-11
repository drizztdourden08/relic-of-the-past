<!-- @layer docs @kind doc -->
# HUD

The heads-up display shows health, magic, rupees, and equipped items during gameplay.

---

## HUD Modes

### Original

The unmodified SNES HUD, rendered by the game engine and positioned exactly as it was in the original game.

### Enhanced

A React-rendered overlay that replaces the original HUD with cleaner visuals:

- It respects your chosen aspect ratio and places elements correctly no matter the window size.
- Heart and magic meter changes animate more smoothly than the original pixel-based updates.
- Item sprites are pulled from the ROM and drawn as crisp overlay elements.

When enhanced mode is on, the original HUD is hidden underneath. The game still tracks every value internally; the overlay just reads that state and renders it on its own.

---

## How It Works

The enhanced HUD bridges the WASM game engine and the React UI layer:

1. The game engine exposes its internal state such as health, magic, and items.
2. A TypeScript bridge reads that state on every frame.
3. React components draw the HUD overlay on top of the game canvas.

Because the overlay sits on top, you can style, animate, and position the HUD freely without touching the game engine code.
