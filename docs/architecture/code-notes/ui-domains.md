<!-- @layer docs @kind doc -->
# UI domains: code notes

Facts about the code under `apps/web/src/ui/domains/` (every domain except `app`) that the code cannot say by itself.
Each heading names a file by its path under `apps/web/src/ui/domains/`.

## title

### title/choreography/draw-title-frame.ts

One frame of the reimagined title, layered in the order the original draws it: black, the scene fading in, the triangles, the logo fading in, the sword with its sparkle, the flash, then the brightness.
Once the core draws its own picture again (the file select, the story), the overlay clears itself and covers nothing.
The recurring sparkle plays from the logo fade on (title submodule 5 or later). The sweep plays only once the picture is finished.

### title/choreography/choreography.type.ts

A `Picture` carries the factor it was stored at: the ROM's extracted set is written at 2x the game's pixels, a bundled tier picture at 1x.

### title/choreography/draw-marks/draw-logo-over-blade.ts

The two bars of the logo's first letter are drawn a second time over the blade, so the sword threads through the letter.

### title/choreography/draw-sword.ts

The sword sits where the intro's ten sprites put it. The hilt sparkle and the glint down the blade follow the frame counts of the core routine `Intro_PeriodicSwordAndIntroFlash`. The hilt sparkle has seven steps that alternate between a small and a large star.

### title/choreography/draw-star.ts

A four point star the way the game draws its sparkles: one pixel arms, a bright three pixel core from radius 3 up, and short diagonal points when asked.

### title/choreography/create-triforce-picture.ts

The three triangles come from the core's own picture. The poly thread writes a 0x800 byte block of 4bpp tiles, decoded here into a 64x64 image with the eight colours it draws with. The spin and the zoom are already inside the block.
The block's tile rows are not stored in picture order: the sprite grid reads chars 0x80, 0x90, 0xa0, 0xb0, 0x88, 0x98, 0xa8, 0xb8.

### title/choreography/draw-triforce.ts

The picture is placed three times where the intro's sprites are, the third one mirrored.

### title/choreography/draw-shine.ts

The shine on the finished title: a sparkle that grows and shrinks over six steps, a pause, then the next one elsewhere. Each sparkle lands on a pixel drawn at random from the logo's opaque pixels, and from the sword's too once it is planted.

### title/choreography/logo-sweep.ts

A slanted band of light sweeps across the logo, kept to the logo's own pixels. It sets off fast, all but stops about a third of the way across, then runs on to the far edge. The speed curve is integrated once and scaled so every pass still ends at the far edge.

### title/choreography/shine-pixels.ts

A picture from another origin taints the canvas and its pixels cannot be read. The pixel set is then empty and no sparkle lands on it.

### title/scene/build-scene-layout.ts

Mountains stand behind the trees with their flat base 8 pixels above the water line.
Trees are placed every 16 columns from past the left edge, so the row never opens however far it drifts. They all sit on the same row: a tree lifted one pixel leaves a sliver of sky on the water line.

### title/scene/scene.type.ts

`SceneGeometry` is the canvas in game pixels with the place of the 256x224 frame inside it. `horizonY` is the first of the two water line rows. A cloud's `speed` is its own motion in game pixels per second, on top of the parallax.

### title/scene/layers/ridge-layer.ts

The trees carry a baked reflection below their trunks. Only their top rows are drawn, and the reflection layer draws the real reflection.

### title/scene/layers/landmark-foot-layer.ts

The castle is drawn twice. The whole piece goes down before the reflection is taken, then its stone foot again from the water line down, so the lake does not wash it out and the water line runs up to the castle without crossing it.

### title/scene/layers/reflection-layer.ts

Each water row copies one row from above, compressed toward the viewer and shifted sideways in whole pixels, then the lake gets a two pixel block blur (down to half width and back with smoothing off) and a blue tint.
The sideways shift sums two slow waves of unrelated periods, snapped to one pixel at most, with a fixed phase per row. One wave alone, snapped to whole pixels, dwells at its peaks and jumps through the middle, and every row jumping at once reads as a single lurch.

### title/scene/layers/water-texture-layer.ts

The open water starts 30 percent of the way down the lake; the mirrored trees own the rows above. Stepped bands deepen the blue toward the bottom, and one row ripples drift and breathe at their own pace.

### title/scene/scene-files/scene-files.constants.ts

The scene tiles are bundled under `apps/web/src/assets/title-scene/light/`: one sky strip, every numbered variant (`<stem>_<n>.png`) of the mountains, trees and clouds, plus the castle. The title screen and the home backdrop both draw from this one lookup.

### title/views/SceneBackdrop/SceneBackdrop.tsx

The title's lake scene drawn once and still, as the background of a box, at a whole number pixel scale. `horizon` places the water line as a fraction of the box's height. Without `scale`, the smallest whole scale that lets the 224 row frame cover the box's height is used. The same `seed` always draws the same scene.

### title/views/SceneBackdrop/behavior/useSceneAssets.ts

The tiles decode once for the whole app. A failed load forgets the attempt so the next mount tries again.

### title/views/TitleView/behavior/useTitleAssets.ts

A picture from the `app-sprite://` scheme is another origin, so a canvas that draws it can no longer be read and the sparkles could not find its pixels. Its bytes are read through the file store and shown from a same origin blob. When that read fails the picture still draws from the scheme.
A sword picture lives in `assets/title-scene/sword/<id>.png`. An id without a file draws the ROM's sword.

### title/views/TitleView/behavior/useTitleGeometry.ts

The game canvas buffer holds two rows per native line: 448 for 224 lines, 480 for the 240 line mode. The overlay's height is the native height and the 256x224 frame sits centred, with the rows a tall view adds above it.

### title/views/TitleView/behavior/useTitleProgress.ts

The sword tier and the world come from the profile's battery save, read once per mount. The default picture shows when the setting is off, the save is missing, or the read fails.

### title/views/TitleView/sub-components/TitlePrompts.css

The Start prompt blinks 32 frames on and 32 off at 60 fps: the pace of the game's own blinking cursors, doubled.
