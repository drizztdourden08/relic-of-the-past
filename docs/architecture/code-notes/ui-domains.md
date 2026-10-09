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

## packs

### packs/pack-source.type.ts

A `PackSource` is where a pack's bytes come from for the read only pack viewers. The app adapts its local file store to it and the store adapts a signed link, so a viewer never knows where the pack lives. It has the same shape as the shared `RangeReader`, so a source goes straight into the shared zip readers. `range` reads the local file for a local pack and fetches a byte range for a store pack.

### packs/character/behavior/useAnimationClock.ts

One frame ticker for the whole sprite studio. The contact sheet animates every state at once, and separate timers per canvas would drift apart. One shared counter keeps them in step at the cost of one animation frame, and each canvas takes the tick modulo its own frame count.

### packs/character/behavior/useWearing/useWearing.ts

Outfit and gloves are independent in the engine: the glove colour is written over one palette row entry whatever outfit is loaded. So they stay two controls, never one list of combinations. The bunny is offered beside the three mails because to the palette it is one more outfit, even though its art differs.

### packs/character/compounds/ContactSheet/ContactSheet.tsx

The grid's column minimum follows the sprite's rendered width at the current zoom, so the cells wrap to fit what is on screen at any zoom.

### packs/character/compounds/SpriteSheetViewer/SpriteSheetViewer.tsx

The bunny state (action 0x21) has no palette of its own. Picking it moves the outfit to the bunny too, since bunny art in another outfit's palette reads as a bug.
The app's sprite studio draws its sheet through this viewer with its palette editor in `aside`; the store draws a pack's sheet through it too.

### packs/language/behavior/entry-selectors/count-variable-uses.ts

Both `ref` tokens (ours) and `var` tokens (engine substitution codes) count as a use. An entry naming the same variable twice counts once, so the figure answers how many lines a rename would touch.

### packs/language/behavior/find-translation-hits.ts

Dialogue is searched on its joined `text` runs, so a control code in the middle of a sentence never breaks a match. Chips (control code names and references) are searched on their own and reported as their own field. The needle arrives already lowercased and trimmed.

### packs/language/behavior/set-font-assets.ts

A set's drawable font is its stored pair: the glyph tiles and widths are the set's own bytes, and the alphabet comes from the extraction language table through the set's `base` code. Without a known base language there is no font and callers draw nothing.
The bytes are copied because the host may pass a pooled view whose byteOffset is not zero, and every offset used later is tile relative.

### packs/language/behavior/set-variables/variables-of.ts

A set stores its substitutions as a pair (the glossary and the name tables). They are folded into one list the same way the write path folds them, with the stored per variable metadata applied. `literalTermsOf` keeps every variable with literal text, which is what the measuring walks expand refs with.

### packs/language/behavior/useEntryLayout.ts

Layouts are measured on demand and cached per token array, keyed on the array's identity: every edit produces a new array. A new glossary or font throws the whole cache away.

### packs/language/behavior/useEntryView.ts

Openness is per entry, so two lines can be open side by side for comparison. Each open entry remembers its own view mode, reading by default. Closing an entry forgets its mode, so it reopens for reading.

### packs/language/behavior/useSetVariables.ts

Memoised on the three stored fields, so a new set object with the same tables keeps every layout already measured.

### packs/language/compounds/DialogueBrowser/DialogueBrowser.css

Text in a set is there to be read and copied, so text selection is turned back on for the whole viewer.
The scroll list is the query container for its rows, the same as the editor's list: whether a closed row has room for the line's own words depends on the list's width.

### packs/language/compounds/entry/entry-meta.model.ts

The open entry's metadata answers what a translator cannot read from the words: who opens the line, where, how the game finds it, how many boxes the player pages through, and what it pulls in at runtime.
A row is left out when the fact does not apply, and stated as absent when it applies but is not known. An entry opened by the core has no place; two entries have no mined source and two type bytes carry no record. A plausible guess for either would be worse than saying nothing. `mono` marks a value that is an identifier, not prose.

### packs/language/compounds/entry/entry-prose.ts

The reading view and the closed row's excerpt run the shared expansion in preview mode, the same call the fit measurement makes, so the sentence read here is the sentence the box will hold.
Expansion is strict and throws on a reference the set has no variable for. That broken state is what a translator needs to see, so a failure falls back to a tolerant walk that shows the unresolved key in braces and keeps the rest of the line readable.
Control codes add nothing, but a row break or a wait leaves one space so two lines do not run into one word. A bracketed name the code catalog does not claim is a picture character of the alphabet; it draws real ink, so it stays as its bracketed spelling.

### packs/language/compounds/entry/entry-row.model.ts

A closed row answers at a glance which entry it is, who says it, what opens it, how long it is, whether it fits, and where a prompt's options lead. For a source keyed by a place or a room, `who` is the place: which sign it is is the identifying fact, and the trigger badge already says it is a sign. The excerpt goes last because it is the only part that can be long.

### packs/language/compounds/entry/entry-summary.ts

The "contains" phrases come from the control code catalog's own labels, not the bracket names in the stream, so the card says "2 waits for button" where the stored text says `[Waitkey]`.

### packs/language/compounds/entry/fit-chip.ts

The engine never wraps or clamps a row: it draws straight past the box interior and over the row below. So the verdict is pass or fail, never a percentage. A row reads as tight from 90 percent of the interior width. The closed row and the metadata panel share this one verdict so they never disagree.

### packs/language/compounds/entry/trigger-facts.ts

The mined trigger source is keyed the way the core is keyed: a type byte, an area, a room, a receipt index. Each key is looked up and the record supplies the name; where the data has no name, the bare key is reported.
A type byte can match several records because the game reuses one type for what the dataset treats as distinct actors. The row's own pick is named and the rest are offered as other candidates.

### packs/language/compounds/entry/facts-for-entry.ts

Facts are resolved once per entry and kept. The dataset is static for the life of the app and the list re-renders on every keystroke of the search box, so a join across every actor record per row per render would be paid again and again for an answer that cannot change.

### packs/language/compounds/entry/EntryCardCollapsed.tsx

A set holds a few hundred entries, so the list is for finding one. Every cell is always drawn, empty when it has nothing to say: a dropped cell pulls every later cell one track to the left. The whole row is the button that opens the entry, which is also why every child is inline. Nothing on it is editable, so scanning a set is always safe.

### packs/language/compounds/entry/EntryCardCollapsed.css

The closed row and the locked row share this grid so the list reads as one list. Every fact track is a fixed length, never sized by content: each row is its own grid container, so a content sized track lines up only by luck (a locked row once sat 6px right of an entry row). The font size is set on the row for the same reason, since `ch` resolves against the grid container's font and the two row components inherit different sizes.
The excerpt is the only elastic track and the first thing to go in a narrow pane. It is hidden with `visibility`, never `display: none`, because a removed grid item slides every later item one track left.
The locked row stands in for entries that are control code scaffolding the choice prompts depend on.

### packs/language/compounds/entry/EntryListItem.tsx

Memoised: the list holds a few hundred items and re-renders on every mode or draft change. A closed row's props are stable (models come from the shared layout cache, handlers are identity fixed), so only the row whose facts changed renders again. Measurements come from the shared layout cache, and only for rows near the viewport.

### packs/language/compounds/entry/EntryPanel.tsx

The open entry keeps the same frame whatever view is active: the metadata is true of the entry, not of a way of looking at it. The panel is marked at its left edge so an open entry never looks like the rows around it, and the view switch sits at the far end so it lands in one place on every panel.

### packs/language/compounds/entry/EntryMetaPanel.css

Auto fill columns, never a fixed count, because the panel sits in a pane the user resizes. Every row keeps its label above its value, so a column can be as narrow as it likes. A value that states an absence is dimmed and italic so "not recorded" is never read as the answer.

### packs/language/compounds/entry/ReadView.tsx

The entry as prose and nothing else: no gutter, markers, chips or pixel face, in the app's own face at a comfortable measure. The width cap is on the text, not the panel, so a wide pane still breaks the sentence where a sentence should. The text is selectable because passing a line to a dictionary or a colleague is the commonest thing done here.

### packs/language/compounds/entry/ViewModeSwitch.tsx

Read, edit and preview answer three different questions (what the line says, what it is made of, what the player will see), so they are a switch and not a stack. A read only list leaves out editing.

### packs/language/compounds/glyph/GlyphCell.tsx

One character of the pack's font addressed by its index in the alphabet, as the layout walk reports it. The editor's `GlyphChar` reaches the same cell from a bracketed name matched against the alphabet first. Both share the painter (`useGlyphCanvas`) and the stylesheet, so there is one renderer of the game's pixels. Each cell advances exactly as wide as the pack's width table says, expressed as a multiple of one ink box, so a row is as long on screen as in the box and the caller's cell size still decides how big a character is drawn.

### packs/language/compounds/glyph/glyph-cell-geometry/top-tile-of.ts

A character is two stacked 8x8 2bpp tiles (16 bytes each) making 8x16. The sheet stores 16 characters per row and each character row spans two tile rows (32 tiles), so a character's halves are 16 tiles apart. A 256 tile sheet spells characters 0 to 127.

### packs/language/compounds/glyph/glyph-cell-geometry/edge-at.ts

Both edges of every source pixel come from this one mapping, so a pixel's rectangle ends exactly where its neighbour's begins: no overlap to darken a seam, no gap to show the ground. Giving each pixel a width of `span / cells` accumulates a fraction of a device pixel per column and frays the far edge, which is what once made the glyphs look blurry. Pass `n + 1` for the far edge and subtract to get a pixel's size.

### packs/language/compounds/glyph/paint-glyph-cell.ts

The pixels are decoded from the pack's own `font.bin`, the data the game draws from, so a picture character shows for every pack with nothing to extract first. The CSS size of a cell belongs to the stylesheet; the canvas backing store is sized here in device pixels from the box the stylesheet gave it, and every rectangle is snapped to it. Pixel art is never stretched from a smaller bitmap. Assigning a canvas dimension clears the bitmap, so only a real change is written. When the sheet cannot spell the index nothing is drawn and the cell stays empty. Ramp value 0 draws nothing.

### packs/language/compounds/glyph/measure-store.ts

Reads the canvas's laid out box at the display's pixel ratio. Null when the box has no size yet, which would otherwise bake a cell at one pixel square. It forces layout, so a caller painting many cells measures them all before resizing any.

### packs/language/compounds/glyph/behavior/useGlyphCanvas.ts

Repaints when the character or sheet changes and when the display's pixel ratio changes: the backing store is sized in device pixels, so moving the window to a monitor with different scaling changes the real pixel count without changing the box. A media query only matches the ratio it was built with, so the ratio is held in state, which both re arms the query and drives the repaint (the same approach as the game canvas's fit hook).
Paints are batched per animation frame: every cell mounted in one commit is queued, then the frame measures all of them before resizing any. A cell that measured and resized itself in its own effect forced one reflow per glyph, sixty for a three row box, which made opening the preview lag. With no tiles or no glyph the canvas is left untouched and shows an empty cell of the right size.

### packs/language/compounds/glyph/GlyphChar.css

A picture character's ink box is one cell of the dialogue alphabet (8 by 16 game pixels), sized from the same geometry tokens as the line so it never sits a fraction of a cell out of step with the letters beside it. The advance is a separate number: the width table charges each picture its own advance, so the cell takes `--glyph-advance` when known and the full ink box otherwise. Ink may overflow the advance, the same trade the engine makes. The ink box is two custom properties so a view that sets the game face at its own size (the read only card, the toolbar) overrides the box and not the geometry. A pair cell holds two alphabet entries spelling one picture side by side. The fallback shows the bracketed name tinted, so it reads as "this alphabet has no character for this".

### packs/language/compounds/preview/preview-screens.ts

The engine clears a message's pixel buffer exactly once, when the message opens; no later handler clears it, not at a wait and not at a row marker. So a box is whatever the boxes before it left standing, with its own rows painted over the top. A preview that redraws each box from its own text alone is not the game.
`resolveInherited` walks the whole message through the shared pen in the engine's mode and reports, per box, the rows still on screen when that box begins. The rows on screen while the player reads box N are the rows box N+1 inherits, so the walk runs over the blocks plus one empty sentinel block and every real box has a successor to read its finished screen from.
A row is carried when the same pixels were already standing before this box drew. An entry holding a reference the set cannot expand gives no screens; the caller shows the validation problem.

### packs/language/compounds/preview/choice-of.ts

A choice command draws no pixels. The option text is ordinary rows of the same entry, and the selection cursor comes from the structural cursor frame entries, each of which parks a `>` in column 0 of one fixed row. The command variant decides the rows: `Choose` loads the frames for rows 2 and 3 (a question on row 1), `Choose2` for rows 1 and 2, `Choose3` for all three.

### packs/language/compounds/preview/ChoiceCursor.tsx

The cursor is the pack's own `>` character drawn in the first cell, the column the game's cursor frames reserve for it, through the same matcher and painter as every previewed character. A plain `>` stands in only while the font is not readable yet.

### packs/language/compounds/preview/GlyphRow.tsx

A row already on screen before this box drew is dimmed, not hidden: it is on screen because nothing clears it, and full strength would suggest this box wrote it.

### packs/language/compounds/preview/PreviewBox.tsx

Always three rows at the interior's real width, because the game's box is fixed: a preview that shrank to one line would hide the rows an earlier box left there. Rows are placed by their own row number, so a box writing only row 2 draws it in the middle. The cursor frames repaint column 0 of every option row each frame, the cursor on the selected row and a blank on the others, so the blank covers whatever cursor glyph the stored text carries. A wait marker blinks while the box holds for a press, and an advance replays a short upward shift of the rows, keyed on `scrollKey`.

### packs/language/compounds/preview/PreviewView.tsx

The entry as the player meets it, one real box at a time in the pack's own pixels. The sample values for the engine's substitutions are editable because they change the answer: a six glyph name and a one glyph name make different rows. They default to the shared worst case stand ins, so the first look is the cautious one. The box is the button: focusable, focused when the mode opens, advanced by a click, Space or Enter, with arrow keys moving a choice cursor.

### packs/language/compounds/preview/PreviewPrompt.tsx

The box above is the button, so this line only states the position and names the actions, with the action text in the accent colour so a first time reader sees that the preview moves.

### packs/language/compounds/preview/behavior/usePreviewControls.ts

Activation restarts instead of advancing on the last box, and only a real advance bumps `advanceTick`, the counter the scroll animation is keyed on, so a restart snaps back with no motion. The selection resets on every activation because the next box is a different prompt or none.

### packs/language/compounds/preview/PreviewBox.css

The box is `content-box`, against the app wide `border-box` default: `--game-row-width` is the row's real interior of 21 cells, so it must be the width the rows get. With `border-box` the interior measured 316px against a 336px row, which made every row look 20px roomier than it is.
The row stack clips vertically so the arrival shift stays inside the box, while a row that overruns the interior still draws past the right edge. The engine writes past the interior instead of wrapping, and that overrun is the defect the preview exists to show. The cursor cell paints over the row, as the cursor frames paint over the stored text, and on an option row without the cursor the frame paints a space.

### packs/language/compounds/preview/PreviewView.css

Every line of chrome is set in `--c-text`, `--c-text-dim` or `--c-gold`, never a muted tone: the caption variant's default is too faint for text a reader is meant to act on.

### packs/language/compounds/variables/variable-groups/filter-variables.ts

There used to be two tables, a glossary and a menu name table, that could not reach each other: a term could not retitle a menu entry and a menu entry could not appear in a line. One list fixed that, and `kind` is what remains of the distinction: where a value comes from, never which table it lives in. So kind is a filter, never a second list.
Engine owned variables come first because a translator cannot change them and needs to recognise them on sight. The rest keep the order the set stores them in, so a row stays where it was found.

### packs/language/compounds/variables/VariableRow.tsx

Locked means the game owns the value, not that the variable is unavailable. The engine itself substitutes a save file's name field and one digit of a live counter, so there is nothing to translate, but a line may still reference either and the picker still offers both. The row shows a note in place of a field and stays as insertable as any other row. A row without `onChangeValue` shows its value as text; a row without `onRemove` (engine owned or a menu slot) has no remove button.

### packs/language/compounds/variables/VariablesTable.tsx

Presentational: rows arrive already filtered and counted, and every edit, addition, removal and the hardcoded name scan are reported upward. Without `onChangeValue` the table is read only, and each missing handler hides its own control.

### packs/language/compounds/variables/VariablesTable.css

A grid, so key, kind, value, count and lock line up down the whole list, the lock column most of all since "which of these can I change" is what the list is scanned for. The lock and remove slots are always present, empty when they have nothing to show, so locked and editable rows have the same shape and no column shifts. The note on a locked row is italic so it reads as an explanation, not a value.

### packs/music/behavior/clock.ts

`m:ss` is the one spelling for every position or length in the music studio.

### packs/music/behavior/file-audition/start-file-audition.ts

Plays one pack file straight from its bytes, with no layers, schedule or manifest, so it works on a file nothing plays yet. One file plays at a time, enforced through the shared module state, so any row's press silences the last. The loop point comes back from the decode, which has already parsed the `.pcm` header, so the whole file is read once.
The previous file is silenced twice: before the decode so a long file does not keep the previous one going, and after it so that of two racing presses the last to finish plays. A node clears the shared state on its own end only while it is still the current one, since a newer press may already have replaced it.

### packs/music/behavior/sound-names/sound-hex-id.ts

Sound ids are written in hex because the game's tables and every disassembly note write them that way.

### packs/music/compounds/FilePlayer/FilePlayer.tsx

The player samples the playhead itself on a frame loop: the position is the only thing that changes continuously and it belongs to one row. Lifting it into the list's state would re-render every other row sixty times a second. The bar is marked `live` because its width is re targeted every frame, and a CSS transition chasing a moving target lags behind the audio and overshoots the end. The repeat point shades the stretch before it on the same bar, so the part that plays once reads against the whole length.

### packs/music/compounds/TrackList/TrackList.tsx

A music pack's contents, read only: a summary line, then one row per slot the pack fills, tracks first in slot order and replaced sounds after by channel. The file count is the manifest's own file record when it has one, else every file a slot names. What plays and how the bytes arrive is the caller's business.

### packs/views/PackContents/PackContents.tsx

What is inside a pack, drawn by the viewer for its kind: the track list, the sprite sheet or the dialogue. It is the one piece of the packs domain that reads, and only through the source it is handed, so the app and the store show a pack the same way wherever its bytes live. A new source reads the pack again.

### packs/views/PackContents/behavior/preview-bytes.ts

An MSU-1 `.pcm` previews its first 30 seconds, read straight from the pack (the header, then 16 bit stereo at 44100 Hz). Any other audio has to be decoded whole, so it is read whole up to 48 MiB and refused above that.

### packs/views/PackContents/behavior/read-character-pack.ts

The `.rsp` carries its own palettes, so no ROM is needed to draw a character pack's sheet.

### packs/views/PackContents/behavior/read-music-pack.ts

Only the listing is read: the zip directory from the end of the file, then the manifest entry. A track's bytes are read later, when its play button is pressed.

### packs/views/PackContents/behavior/usePackAudition.ts

The engine underneath already silences the last file; this hook holds which file plays, which loads, and why a file did not play. Only the newest press may publish what is playing. Leaving the view stops the sound. A 30 second cut can declare a repeat point past its own end; that point is not shown.

### packs/views/PackContents/behavior/usePackRead.ts

A new source starts the read over, and a read that finishes after its source was replaced is dropped.
