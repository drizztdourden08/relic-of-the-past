<!-- @layer docs @kind doc -->
# Shadow Casting

> [!WARNING]
> **Heavy development.** Shadow casting is experimental and actively changing. Expect rough edges and incomplete per-screen data. It's fine to leave it off.

An optional post-processing effect that adds **heightmap-based dynamic shadows and lighting** over the
game canvas, authored per screen. It's a visual enhancement plus a dev-facing editor.

## What it does

Each screen can carry a **heightmap** (shapes with a height) and one or more **light sources**. At
runtime the app computes a shadow/lighting mask from the light positions and composites it onto the
frame, giving overworld scenes depth and ambient lighting.

## The Shadow Editor (dev tool)

Opened from the title bar (dev), it lets you author the per-screen data:

- **Tools:** select, heightmap, and light editing.
- **Heightmap elements:** rectangles, polygons, freehand shapes; per-element height (presets
  Low/Mid/High/Wall or custom) and a smoothing radius.
- **Lights:** position, intensity, radius, falloff/colour; plus global defaults for the screen.
- **Preview:** see the effect live on the canvas; a debug mode visualizes the heightmap and light projection.
- **Undo/redo:** 20-level history.

Projects are stored per screen and saved through the Electron `shadow-casting` IPC domain; editor
state lives in `stores/shadow-editor-store.ts`. Runtime loads each screen's heightmap + lighting and
renders the overlay.

> Heavier than the other enhancements. Leave it off if you want pixel-pure output. See
> [Display & Graphics](display-graphics.md) and [Visual Enhancements](visual-enhancements.md).
