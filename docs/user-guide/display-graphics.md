<!-- @layer docs @kind doc -->
<!-- @wiki-title: Display Settings -->
# Display Settings

These settings live in the profile's Settings tab and are saved per profile.

## Display

**Aspect Ratio** — a segmented control with 4:3, 3:2, 16:9, 16:10, and 18:9. It sets the shape of the game screen. Wider ratios show more of the scene horizontally rather than stretching the picture. The default is 16:9.

**Extend Y** — a toggle, on by default. It shows the full 240 lines instead of 224, revealing a little extra at the top and bottom of the screen.

The widescreen options give you two more toggles. **Unchanged Sprites** keeps the original sprite spawn and despawn behavior instead of the widescreen-adjusted timing, and it's off by default. **No Visual Fixes** skips the corrections that hide widescreen edge artifacts, so some edge tiles may look wrong, and it's also off by default.

## Window

**Window Mode** — a segmented control with Default and Borderless. It picks how the window is framed. The default is Default.

**Start in Fullscreen** — a toggle, off by default. When on, the game enters fullscreen as soon as it starts.

**Viewport** — a segmented control that decides how the picture fills the window. Letterbox keeps the exact aspect ratio with bars on the sides. Fit Window scales the picture to fit the window and stays close to the ratio. Stretch fills the whole window and may distort the picture. The default is Letterbox.

## Performance

**Show FPS** — a toggle, off by default. It shows a frame-rate counter in the title bar rather than over the game image.

**Disable Frame Delay** — a toggle, off by default. It removes the per-frame pacing wait. This can reduce input lag on 60 Hz displays where v-sync already paces the game, and it uncaps the speed for benchmarking.

## Rendering

**Optimized PPU** — a toggle, on by default. It uses a faster rewritten pixel pipeline that looks identical to the accurate SNES PPU but runs much faster.

**Enhanced Mode 7** — a toggle, on by default. It renders the world map and flying scenes at higher resolution with smooth rotation and scaling.

**No Sprite Limit** — a toggle, on by default. It removes the SNES limit of 8 sprites per line, so sprites stop flickering in busy scenes.

**Linear Filtering** — a toggle, off by default. It smooths the upscale with bilinear filtering. Leave it off if you want crisp pixels.

**Dim Flashes** — a toggle, off by default. It softens screen flashes such as lightning and boss hits, which helps with photosensitivity.

## Related

- [Visual Enhancements](visual-enhancements.md) — edge effect and other overworld extras.
- [Shadow Casting](shadow-casting.md) — heightmap-based shadows and lighting.
