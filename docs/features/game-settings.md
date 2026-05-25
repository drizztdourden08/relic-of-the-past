# Game Settings

All game settings are configurable in-app through the Profile Settings panel. No `.ini` file editing required.

---

## Display

### Aspect Ratio

- **4:3** — original SNES ratio
- **3:2** — slightly wider, fills more of modern screens
- **16:9** — widescreen (game renders with extended horizontal view)

### Window Mode

- **Windowed** — standard resizable window
- **Fullscreen** — exclusive fullscreen
- **Borderless** — fullscreen without exclusive mode (allows fast alt-tab)

### Viewport

- **Autofit** — maintains aspect ratio with black bars (or edge effect) on the sides
- **Stretch** — fills the entire window, may distort the image

### FPS Display

Toggle an FPS counter in the corner of the game view. Useful for verifying performance.

---

## Gameplay Settings

All original PC port settings are exposed in the UI:

- **Item switch (L/R)** — use shoulder buttons to cycle through equipped items
- Additional original zelda3 port toggles as they existed in `zelda3.ini`

These map directly to the underlying game engine configuration but are managed per-profile through the UI instead of a shared config file.

---

## Per-Profile

All display and gameplay settings are stored per-profile. Switching profiles loads that profile's settings immediately.
