<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/primitives

Facts about `apps/desktop/src/primitives/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/primitives/ButtonPrompt/

One button prompt: an optional Hold, the pictures of the buttons to press, and a label. A button with no picture (a key the icon set does not cover) shows its name in a small keycap. `height` is the prompt height in CSS pixels.

## apps/desktop/src/primitives/DialogFrame/

A drawn message box border as one SVG: a single line, or a thin line inside a thicker one, with square, rounded or chamfered corners and an optional mark inside each corner. Every size comes from one game tile (`tile`, in CSS pixels; `width` and `height` are CSS pixels too), so the frame keeps its weight at any window size. The inner line runs parallel to the outer one, corners included. The four marks are mirror images of the top left one, so `markAngle` (degrees the top left mark turns) turns them all the same way relative to their own corner; at zero every mark stands upright. A mark's centre sits half a tile from the border ring, and the wider triforce sits a little further.

## apps/desktop/src/primitives/DialogTexture/

The repeating texture on a message box ground, painted into a canvas and repainted each frame while it animates. The canvas fills its parent, which carries the ground's own corner shape, so the pattern is clipped exactly like the fill under it. `width` and `height` are CSS pixels, `unit` is CSS pixels per game pixel, `scale` is a cell size multiplier, and `density` and `scatter` run from 0 to 100 (how close the cells sit and how far they stray from the grid).
`useTextureLoop` paints once for a still pattern and every animation frame for a moving one. A viewer who asked for reduced motion gets the still pattern. The clock starts once per canvas and survives repaints, so a box that grows as its text types keeps its motion continuous.

## apps/desktop/src/primitives/GlyphRow/

One row of the game's own glyphs, drawn from a glyph atlas into a canvas. The atlas holds 16 glyphs per row in 8 by 16 cells. Each cell is copied from the atlas at its pen x, so the row lays out exactly as the engine's bitmap did. A highlighted cell is copied from its highlight's atlas when one is given (`highlightAtlases` lists the primary then the secondary highlight; a missing one draws from the base atlas). The backing store is sized in device pixels and smoothing is off, so the face stays a pixel face. `unit` is CSS pixels per game pixel with magnification included, and `widthPx` is the row width in game pixels.

## apps/desktop/src/primitives/HudBox/

The generic structural element for the HUD domain, standing in for a `div`. The HUD replicates the in-game interface and so keeps its own primitive set; raw HTML lives here. `as` picks the element (default `div`), and `disabled` is forwarded when it renders an interactive element such as a button.

## apps/desktop/src/primitives/HudHeart/

`HudHeart` draws one heart of the life meter and does not blit it, because the sprites could not do two things. Fill is a fraction, not a state: `fill` runs from 0 to 1 and the body is clipped at exactly that share of the width, so full, half and empty are three points on a line, and the smooth heart mode has real intermediate states to travel through and not a crossfade between two pictures of a half heart. The armour tier tints the same drawing: `armor` (0 to 2 from the save, clamped so an unknown tier is white) picks a rim, a highlight and a shaded flank, and the body stays red.
The two modes differ only in what the caller hands in and whether the cut travels: `original` gets the console's own quantised fills and moves the clip instantly, `smooth` gets the true fraction and eases it over 200 ms. `HudLife` owns the quantising, because it knows the save's health units. `scale` maps SNES pixels to CSS pixels, and a heart is 8 SNES pixels square. The `useId` value carries colons, which are legal in an id and illegal in the `url(#...)` reference that has to find it again, so they are stripped.
The heart is vector and not pixel art on purpose. The pixel art pipeline (`parse-pixel-art-svg.ts`) reads a flat list of integer rects and bakes them into a bitmap at extraction time, and can express neither need: a fill cut at an arbitrary fraction of the width is quantised away by an eight column grid to the three states the sprites had, and three armour tints of the same drawing would need three more baked bitmaps. Colours are named constants and not design tokens for the reason `HudMagicBar.constants.ts` gives: a token that moves with the app theme would put app coloured chrome on game coloured pixels.
The drawing grid is two units to one SNES pixel: a curve on an 8 unit grid has nowhere to put the shoulder of a lobe, so the path is authored at 16 and scaled down. The shade path is the lower right flank where the body turns away from the light; the highlight is a crescent on the upper left lobe, the first place the tint reads. The fill red is the console's heart red warmed a shade so the drawn heart does not read as a washed out copy of the sprite; the empty colour is the interior of an unfilled heart, and the outline keeps a heart legible over bright terrain. Stroke widths are in grid units, half that in SNES pixels.
The tint is deliberately slight. It lives in the rim (drawn over the body's edge at every fill), the highlight and the shaded flank, the tint's quietest slot that gives the three tiers different bodies without three body colours. The body stays red at every tier, because a heart that turns silver stops reading as a heart. `HEART_TINTS` is indexed by `GameUIState.equipment.armor`: white, silver, gold, each pulled well back toward the red.

## apps/desktop/src/primitives/HudImage/

A raw `img` passthrough for the `position: absolute` sprite and frame tiles the HUD composes by hand. It stays apart from the design system `Image` so it can stay pixel exact.

## apps/desktop/src/primitives/HudMeter/

A horizontal bar whose own length is the quantity. There is no track: at half the bar is half as long, border and radius intact, and nothing is drawn where the rest would have been. A fixed frame with a fill draws a long empty trough at low values and makes none draws nothing a special case. The lane is not the bar: `width` is the space reserved and the length reached at fraction 1, and the SVG is always that wide so nothing near it shuffles as the value moves.
It is vector and a primitive: a rounded corner and a border that stays one SNES pixel at every HUD scale cannot live in a baked bitmap, and raw SVG markup belongs in a primitive, not in the compound that gives it colours and meaning. What a length means, what a second band says, and whether a meter is drawn at all belong to the caller; see `HudMagicBar`.
Props are in SNES pixels (`scale` maps to CSS pixels). `fraction` is clamped to 0 to 1. `radius` is the outer corner radius at full length and shortens with the bar; `sheenColor` is the lighter band across the top of each band, the bar's light source, covering a third of the band's height; `bands` splits the interior into stacked bands (1 is one bar). A corner may never eat more than a sixth of the bar's length, so at least two thirds of every horizontal edge stays straight: a radius authored for the full bar, carried unchanged to a 6 px stub, turns both ends into semicircles and the stub reads as a lozenge. A bar thinner than its two borders plus a pixel of core is a smudge of border, so any non zero amount draws at least that. The `useId` colons are stripped for the same reason as in `HudHeart`.

## apps/desktop/src/primitives/HudNumber/

`isMax` renders the yellow at max digit variant in place of white (see the Indicate Max Resources setting).

## apps/desktop/src/primitives/HudPie/

A round pie of equal slices that empties clockwise from twelve o'clock (`slicesLeft` counts the slices still in place, so the rest sit after the gap; `size` is CSS pixels). A slice that is out fades while it slides away from the centre, and the next one to leave breathes; the motion lives in `HudPie.css`. The breath keeps running through the exit so the fill never jumps when the slice starts to leave, and reduced motion keeps the fade and drops the breath and the slide.
Geometry is in view box units on a square centred on the pie: the dark disc sits behind the slices, the dim hub over the slice tips sits behind whatever is on the pie, and each slice's dark outline also reads as the gap between two slices. A slice slides 10 units as it leaves, which stays inside the view box. `DISC_INSET_RATIO` is the share of the size left empty between the view box edge and the disc, and `SLICE_SPAN_RATIO` the share the slices span. A lone slice is the whole disc; one arc cannot close on itself, so it takes two half turns. Slices leave in index order, so the first one still in place is the next to go.

## apps/desktop/src/primitives/HudPixelPie/

The countdown pie drawn the way the console would: hard pixels on the game's own grid, a short palette, and motion in whole steps. The canvas holds one pixel per game pixel and is scaled up with no smoothing, so it lines up with the game picture at every HUD scale; it is repainted only when the drawn state moved, never per frame. Its palette is the set of custom properties on `.hud-pixel-pie`, opaque colours only because the pie never blends.
Lengths are game pixels. The grid side is even, so the pie's centre sits on a pixel corner and the grid centres on the frame. A leaving slice travels up to 4 whole pixels, and the grid keeps that much room around the disc. The ring around the slices is one pixel of backing then a one pixel outline. Slice cells inside the 10 pixel hub take the deep colour so the digits stay readable. The shaded band on the lower right is 2 pixels wide, because light comes from the upper left; it sits one colour step under the slice body and never under the shade itself. The next slice to leave cycles through the pulse colours. A leaving slice takes 4 steps of 125 ms (about eight game frames each, matching the smooth pie's exit), moving a pixel outward and losing a quarter each step through an ordered 2 by 2 dither (a cell is kept while its value is under the quarters still drawn). One pulse colour lasts 4 steps.
`buildSliceMap` gives each cell to the slice its centre falls in, by angle clockwise from twelve o'clock. Cells on a boundary stay dark, a one pixel gap that takes the half pixel on each side, closed on the side before it. The pie is centred on the middle of a cell, so the upright boundaries run down one column and the left half mirrors the right. Distances are snapped to drop float noise, so a cell centre exactly half a pixel from a boundary lands on one side, and a point behind a boundary ray's start is on no boundary, which matters when two slices share one line. `pushOffset` adds zero to turn a negative zero into a plain one.
`rasterizePie` draws one frame as palette indices: slices already out leave the dark disc showing, the next slice takes its pulse colour, and the slice that just went is drawn again a whole number of pixels out along its bisector, thinned by the dither (`leavingStep` is 0 when nothing is leaving, else 1 to 4). `usePieSteps` counts motion in whole steps the way the console paces its animations. The count restarts during render each time a slice goes, so no frame shows the old steps: the slice that left runs its exit from the first step and the new next slice starts its pulse on the bright colour. The clock remembers the count before the last restart, which tells a slice leaving from a countdown starting over. A viewer who asked for reduced motion gets no steps at all.

## apps/desktop/src/primitives/HudSprite/

A single sprite with pixel perfect scaling and an optional one pixel (scaled) outline that follows the alpha shape. Silhouette mode flattens the same PNG to a dim shape: the sprite's own alpha leaves exactly its outline, which says something belongs here without revealing what. It is a CSS filter over the unresampled bitmap, so it stays pixel exact, and it replaces the outline, since an outline around a shadow reads as a bug.
A silhouette has to be legible against its ground, and this primitive draws on two. The gameplay cluster sits on bright terrain, where crushing to black reads; the pause menu sits on a near black backdrop, where a black shape is gone (twenty two unowned item cells and four bottles looked like empty holes). So the treatment is a tone: `dark` crushes every channel to black for a bright ground, and `light` inverts to a warm parchment ghost for a dark one (invert lifts the shape off black, sepia warms it, opacity keeps it a ghost). The tone resolves through the `--hud-silhouette` custom property, which `silhouetteTone` sets on the element, so a surface can declare its ground once for a subtree (the pause menu does in `hud.css`) while a caller can still name it; unset anywhere above, it stays `dark`.

## apps/desktop/src/primitives/HudSpriteHeart/

Blits one heart of the life meter from the console's extracted artwork. It is a second component and not a mode on `HudHeart` because the two share only a name and an 8 by 8 box: one is a path cut at a fraction with armour tints, the other a choice between three PNGs, and their props do not overlap. The Original HUD style replicates the console's bar from ROM sprites; the drawn heart belongs to Enhanced, the style that asked for a fractional fill and an armour tint.
There are three states, always the console's own quantising, so `mode` only decides whether the swap is instant or crossfades over 200 ms. `HudLife` owns the quantising for both arts. The crossfade keeps all three sprites mounted and moves opacity between them, which keeps it a plain CSS transition; a freshly inserted element has no previous opacity to travel from. The outgoing picture swells as it goes and the incoming settles in. The states draw in a fixed order so the paint order is stable across a swap.

## apps/desktop/src/primitives/PauseBorderBox/

A bordered box from eight tiled elements: four corner images and four edge strips with a repeating background. All sizes are whole pixels so the tiles meet. `cols` and `rows` are the inner size in tiles; the total size is two more each way. The black ground is inset so it does not bleed past the outer border edge, and the border tiles sit on top with the same cross shaped black outline filter `HudSprite` uses.

## apps/desktop/src/primitives/PauseLabel/

A multi tile label strip in condensed HUD text. Labels are pre composed sprites where each 8 by 8 tile holds about two characters.

## apps/desktop/src/primitives/TypefaceRow/

One row in the app's dialogue font, the modern face of the dialogue font setting. Every glyph sits at the pen x the engine gave it, in its own width, so the face keeps the game's layout and only the letterforms change. Picture glyphs have no face in the font and come from the glyph atlas. The face is drawn for a 16 px em box; the outline is the chosen thickness in game pixels (`strokeWidth`, 0 draws none) and at least one screen pixel. A highlighted cell takes its span's ink (`highlightInks` lists the primary then the secondary highlight); every other cell takes the row's own. `unit` is CSS pixels per game pixel with magnification included.
