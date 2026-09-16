<!-- @layer docs @kind doc -->
<!-- @wiki-title: Display Settings -->
# Display Settings

These settings live in the profile's Settings tab and are saved per profile.

## Display

**Aspect Ratio:** a segmented control with 4:3, 3:2, 16:9, 16:10, and 18:9. It sets the shape of the game screen. Wider ratios show more of the scene horizontally instead of stretching the picture. The default is 16:9.

**Extend Y:** a toggle, on by default. It shows the full 240 lines instead of 224, revealing a little extra at the top and bottom of the screen.

The widescreen options give you two more toggles. **Unchanged Sprites** keeps the original sprite spawn and despawn behavior instead of the widescreen-adjusted timing, and it's off by default. **No Visual Fixes** skips the corrections that hide widescreen edge artifacts, so some edge tiles may look wrong, and it's also off by default.

## Window

**Window Mode:** a segmented control with Default and Borderless. It picks how the window is framed. The default is Default.

**Start in Fullscreen:** a toggle, off by default. When on, the game enters fullscreen as soon as it starts.

**Viewport:** a segmented control that decides how the picture fills the window. Letterbox keeps the exact aspect ratio with bars on the sides. Fit Window scales the picture to fit the window and stays close to the ratio. Stretch fills the whole window and may distort the picture. The default is Letterbox.

## Performance

**Show FPS:** a toggle, off by default. It shows a frame-rate counter in the title bar, not over the game image.

**V-Sync:** a toggle, off by default. It paces the game against your display's refresh rate instead of an internal timer, which smooths scrolling on 60 Hz displays. Game speed stays correct at any refresh rate.

**Set Synced Refresh Rate in full screen:** a toggle, off by default. While in fullscreen it switches the display to a refresh rate that divides evenly into the game's 60 frames a second, and puts your original rate back when you leave. Desktop only.

**Turbo:** a toggle, off by default. While it is on, holding the Turbo shortcut runs the game faster than normal. Bind the shortcut under [Input & Controllers](input-controllers.md). Music keeps its own tempo; everything else moves at the chosen speed.

**Turbo Speed:** a slider from 1.25x to 10x (default 2x), shown once Turbo is on. It sets how much faster the game runs while the shortcut is held.

## Rendering

**Optimized PPU:** a toggle, on by default. It uses a faster rewritten pixel pipeline that looks identical to the accurate SNES PPU but runs much faster.

**Enhanced Mode 7:** a toggle, on by default. It renders the world map and flying scenes at higher resolution with smooth rotation and scaling.

**No Sprite Limit:** a toggle, on by default. It removes the SNES limit of 8 sprites per line, so sprites stop flickering in busy scenes.

**Linear Filtering:** a toggle, off by default. It smooths the upscale with bilinear filtering. Leave it off if you want crisp pixels.

**Dim Flashes:** a toggle, off by default. It softens screen flashes such as lightning and boss hits, which helps with photosensitivity.

## Related

- [Visual Enhancements](visual-enhancements.md) covers the edge effect and other overworld extras.
- [Shadow Casting](shadow-casting.md) covers heightmap-based shadows and lighting.
