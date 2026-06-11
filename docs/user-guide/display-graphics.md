<!-- @layer docs @kind doc -->
# Display & Graphics

Everything about how the game looks lives in the profile's **Settings** tab — there's no `.ini` file to edit, and every setting is saved per profile.

## Display

**Aspect ratio** — choose 4:3 (the original SNES shape), 3:2, 16:9, 16:10, or 18:9. Wider ratios show more of the scene horizontally rather than stretching the picture. **Extend Y** shows the full 240 lines the SNES could output.

When you go widescreen, two extra toggles let you keep sprites unchanged and skip the fixes that normally hide widescreen artifacts.

## Window

**Mode** — run in a normal window or borderless, and optionally start in fullscreen.

**Viewport** decides how the picture fills the window:

- **Letterbox** — keep the exact aspect ratio, with bars on the sides.
- **Fit window** — scale to fit while staying close to the ratio.
- **Stretch** — fill the whole window, which can distort the picture.

## Performance

- **Show FPS** — adds a small frame-rate counter to the **title bar** (not over the game image). Handy for checking performance.
- **Disable frame delay** — drops the frame-pacing wait, which uncaps the speed for benchmarking.

## Rendering

The renderer offers a few engine options — an optimized PPU, enhanced Mode 7, and lifting the per-line sprite limit — plus two picture options: linear filtering to smooth the upscale, and dimming the screen flashes. The defaults are a good starting point; the engine options trade a little accuracy for smoothness.

## Gameplay options

The separate **Gameplay** settings tab holds the original PC-port toggles — movement tweaks, combat options, and bug fixes — and adds extras of its own: auto-save, quick save states, item cycling with the shoulder buttons, and a set of quality-of-life options. As with display, it's all in the UI.

## Related

- [Visual Enhancements](visual-enhancements.md) — edge effects and other overworld extras.
- [Shadow Casting](shadow-casting.md) — heightmap-based shadows and lighting.
