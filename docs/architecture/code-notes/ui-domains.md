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

## widgets

### widgets/widgets.constants.ts

Every widget's content by id (the ids of `WIDGET_DEFINITIONS`), for whichever shell draws it: the dock in the main window or a widget's own window. Each widget's own option rows sit beside it, keyed the same way, so the host renders them inside the standard options panel. A widget with no settings entry gets the built in rows only.

### widgets/checks/ChecksWidget.tsx

The shared checks tracker wired to the live tracker data. With a randomizer session loaded it shows each check's actual contents, the same as the randomizer page's spoiler tab. The tracker counts as open for as long as the widget is mounted, and the check toasts follow that.

### widgets/checks/checks.constants.ts

Every checks pref is keyed under the widget id `checks`, the same key the tracker data uses. The notify prefs turn the toasts for completed checks on, and keep them on while the tracker is closed. The view mode pref is the same key `useTrackerData` writes.

### widgets/checks/behavior/useStickyHeader.ts

The pinned header is a per profile widget pref, so the settings panel and the tracker read the same value with no event plumbing, and it survives the widget unmounting and the app closing.

### widgets/debug/DebugWidget.tsx

A live view of every state value the game hooks sync (mode, HUD, equipment, inventory, dungeon progress, text, map). The two toolbar buttons flip the main HUD and the pause screen between the enhanced and the original drawing, through the `hudEnhancedParts` setting.

### widgets/inventory/behavior/useInventoryViewMode.ts

The view mode is a per profile widget pref read by both the widget and its settings popover. It used to be one localStorage key, which made every profile share one mode and left each reader blind to the other's writes without a hand dispatched StorageEvent.

### widgets/logs/behavior/useLogSelection.ts

Selection works on whole lines: click selects one, ctrl or cmd click toggles, shift click extends from the last anchor. The rows are flex components that browser text selection cannot cross, so this replaces it, and a copied report holds exactly what the widget shows.

### widgets/music/MusicWidget.tsx

The music debugger. The live section is the pack engine's own state per session channel, with the studio's meters. Counts turns the feed into rates, so authored odds and measured odds sit on one line. Events is the feed of raises and rolls, each tagged MSU, CHIP or SKIP, so a stray sound names its exact id and owner. Mounting the widget arms the core side traces and closing it disarms them; the traces only observe.

### widgets/music/behavior/useLiveChannels.ts

The same store per readout arrangement as the studio's preview: the poll runs on animation frames, each store deduplicates to the precision its meters draw, and only a changed readout redraws. Stores are keyed by channel name, not the sounding id, so a readout stays subscribed across track changes. The session comes and goes with the profile and the pack, usually after the widget mounted, so it is polled with the channels.

### widgets/music/behavior/useMusicDebugData.ts

The traces are armed exactly while a debugger watches, because each one costs a host call per sound. Events and counters are read through `useSyncExternalStore`, so a burst of events is one render.

### widgets/music/sub-components/ChannelLive.tsx

A silent channel still gets a named row: a debugger asks why a channel is not playing as often as what it plays.

### widgets/music/sub-components/CounterTable.tsx

Running totals per sound and per roll, most recent first. A chance layer reads as tried against played, so 10 percent authored odds landing at 3 of 31 shows as exactly that. A roll row reads played over raised; a sound row reads MSU against chip.

### widgets/music/sub-components/EventFeed.tsx

Every raise the core reported and every roll the engine decided, newest at the bottom, each tagged with its owner. A CHIP line during a storm names the exact id to claim.

### widgets/simulator/behavior/useSimulatorRun.ts

The runner owns the simulator loop: it snapshots the pre run state (a Memento the Restore button returns to), forces auto skip dialog on, drives the pure engine one step at a time, runs the returned triggers through the port, and fans events out to the store, the log bus and the JSONL sink. It stops on an outcome, the Stop button, or a cap of 50000 steps.
The run drives real checks, so SRAM disk sync is paused for its whole length; otherwise a 5 second tick could persist half simulated state to `sram.dat`. Restoring the snapshot makes it safe to sync again at once.
The run arms the `WasmSim*` mutators (`kHostGate_SimulatorSupport`); without them every door unlock, kill drop and cell lock trigger silently does nothing. It also holds the developer tools switch for its own duration: the combat table queries that decide which enemies gate a room sit behind it, and without them every room reads as ungated and a kill gated room's shutters never reopen. The gate is read only instrumentation and the user's own setting is never touched. All three are dropped in the `finally`.
A features word set from here is only wanted until the core latches it on its next frame (`zelda_rtl.c:989`), so the run waits 500 ms before anything reads the tables.
A check can flip the game's progress phase, so a change is surfaced as a Sequence marker. The flood and exits lines are re emitted on entering a new screen or after an unlock reseeds the frontier (an epoch bump), so a "Reset:" line is followed by the new reachability; never after the stop target or the run's end, and never on backtrack pass through hops, where the phase stays `traversing` over explored ground.
Stop flips the store to done at once: the loop may be mid await (a trigger and a frame wait) and would leave the status on running until its next pass. `finishRun` still runs and is idempotent.

### widgets/simulator/behavior/runner-loop/fan-out-events.ts

Narrative events go to the store and the log bus; every event goes to the JSONL sink. A detected check carried on an event is fed into the recorder, so unmatched checks surface as dataset suggestions: an unidentified diff records a null check id, which is what the suggestion builder looks for.

### widgets/simulator/behavior/runner-loop/exits-event.ts

The exits line lists detected exits with their walk step distances, the closest first evidence. `steps` and `stepsNote` are already decoded from the ordering score (`exit-order.decodeScore`); the bias must not be derived again here.

### widgets/simulator/behavior/useDatasetSuggestions.ts

Only check suggestions can be applied. The screen and connection channels take a typed record and allocate the id in the main process, while a suggestion carries a pre rendered code block, the very shape those channels keep out of the dataset. Until the recorder emits records, those two kinds say so plainly.

### widgets/simulator/behavior/useStopAtChecks.ts

The stop at check picker runs the checks widget's own snapshot pipeline (`tracker-statuses`, over the placement where nothing moved) and the shared `filterChecks`, so it offers the same search, tag, item and status filters as the checks widget.

### widgets/simulator/behavior/log-events/classify-event.ts

The order of the tests matters: specific prefixes come before the broad flood match, so "Unlock! re-flooding" is an unlock, not a flood line.

### widgets/simulator/behavior/log-events/compute-indents.ts

Sequence markers and the final outcome sit at the base; an "Area" marker (a big multi sub screen group) opens one level in until "Leaving area"; screen markers sit one under their area (or the sequence outside areas); everything inside a screen goes one deeper.

### widgets/simulator/behavior/log-events/to-log-rows.ts

Line numbers are the event's position in the run (1 to N), never the engine step, which repeats. Position rows drop the START or END prefix because the tag already says it.

### widgets/simulator/sub-components/LogDialog.tsx

The modal is the only place the log is read: the widget column is too narrow, so the widget itself shows only a button with the live event count. Kinds are filtered before the indents are computed, so hiding a marker type re levels the rows under it.

### widgets/simulator/sub-components/ResultsPanel.tsx

Reaching the configured stop check and completing the goal both read as success; only `not-completable` is a failure, with a softlock summary. "Reveal log file" opens the run's JSONL on disk, which is not the in app log dialog.

### widgets/simulator/sub-components/RunTrail.tsx

The route the run walked, in order, with the checks each stop earned: the event log says what happened, the trail says where the run went. Stops come from the engine's own current screen, so the trail cannot disagree with the run.

### widgets/simulator/sub-components/trail-haul.ts

A trail stop records the check tally on arrival, so the checks it earned are the next stop's arrival tally minus its own. The last stop has no successor and is closed against the live tally.

### widgets/simulator/sub-components/SimulatorWidgetSettings.tsx

The screen limit here is the same widget pref the run controls edit, so a change in either place shows in the other.

### widgets/simulator/sub-components/SimLog.css

Global styles turn text selection off, and ancestor `user-select: none` rules (the body reset, the widget frame) make `auto` children resolve to none, so selection is forced on for the log and every descendant. Line numbers stay unselectable so they never land in a hand copy. The dialog overrides the base dialog's 400px max width because the log needs room.

### widgets/simulator/sub-components/StopAtCheckPicker/StopAtCheckPicker.constants.ts

No shared per kind icon set exists elsewhere, so the check kind glyphs live here. Their keys follow the `CheckKind` union in `shared/game/data`.

### widgets/cheats/CheatsWidget.tsx

The cheat console: the game's own HUD and pause menu, made clickable. Player holds life, magic, counters and bottles; Items holds the pause grid and its panels; Rules holds state and combat cheats as tiles; Checks grants what a location holds. A profile written by an older console may still name a tab that is gone, so an unknown stored tab falls back to Player.

### widgets/cheats/CheatsWidget.css

The shell holds what more than one tab shares: the section caption, the input glyphs, the legend, the pointer hint and the two floating boxes. The body is a column so the check list can take the whole height while the other tabs keep their own. The floating boxes are portalled; the portal layer lets no pointer event through by itself, so each box takes them back, and it stays hidden for the one frame before it is placed. A long ladder (the wallet) scrolls inside the step box and hides no rung.

### widgets/cheats/behavior/pointer-hint-context.ts

One hint per tab follows the pointer and is shown by whichever control is under it. The context carries the show, move and hide calls; the layer that draws the hint and the hook that binds a control both read it.

### widgets/cheats/behavior/reachable-rungs.ts

The capacity rungs a player can stand on with the upgrades the seed hands out, as ladder indices (the core's numbering). Custom progressive: the plan's own climb, since every copy takes the next planned jump. Custom fixed jumps: the start plus any subset of the plan's jumps, since the items can be found in any order and any skipped. In pool: the vanilla rung plus any subset of the reference jumps. Vanilla: the pond sells every native tier of bombs and arrows, the meter only has the bat's half cost level, and the wallet has nothing to buy.
Nothing below the start is ever offered: logic reads a family as its start plus what was collected, so a lower value would leave a price or the ending's arrows unpayable while logic still counts them as open. Without a seed the result is null and the core's ladder stands.

### widgets/cheats/behavior/useCapacityLadder.ts

The core reports every rung its gates allow; a running seed narrows that to the rungs its plan reaches. The core has no event for a profile change, so the ladder is re read on the store's mode changes, on a 750 ms tick, when a session arms or disarms, and right after a write. Only a rung the ladder offers is ever written, so a seed's floor holds whatever the caller asks.

### widgets/cheats/behavior/useCheatGates.ts

Which cheat categories the core honours right now, read from the effective gate word. A category that is off draws its surface inert with the reason, never a control the core silently refuses. The word only moves on a settings change or a game start, so it is re read on mode changes and on a one second tick, fast enough that a settings change lands before the next click.

### widgets/cheats/behavior/useConsoleScale.ts

The pause components take a near integer scale (1 SNES pixel equals scale CSS pixels). A tab says how many tiles wide its widest row is and gets the largest quarter step scale that fits, the same way the pause menu derives its scale from the game view's height. Quarter steps keep every tile a whole number of pixels at the common widget widths.

### widgets/cheats/behavior/useDismiss.ts

A press outside the box and its anchor, or Escape, closes it. The press is caught in the capture phase so a click on another control closes this box before that control opens its own.

### widgets/cheats/behavior/useInPlay.ts

Normal play means module 7 (dungeon), 9 (overworld) or 11 (special overworld area) with submodule 0: no menu, message or transition running. The writes that change what the HUD draws (a capacity, the heart containers, an item, a bottle, the keys) redraw the HUD at once, and the HUD shares its layer with the message box, so the console offers them only in play.

### widgets/cheats/behavior/useWheel.ts

A non passive wheel listener on whatever element the callback ref lands on, so an element that mounts later still gets it. The handler is read through a ref, so a new closure on every render never re subscribes.

### widgets/cheats/sub-components/ChoicePopover.tsx

The list a slot opens: one row per choice with its sprite, the current one marked, and an optional "all" control per row for a rack of identical slots (the four bottles). A give row plays the receipt, a set row writes the byte, a remove row takes it away. Portalled under its anchor so the widget's edges never cut it.

### widgets/cheats/sub-components/ControlGlyph.tsx

The picture of an input: a mouse with the pressed part filled (left button, right button, wheel) or a key cap. The legend and the pointer hint both draw it, so both say "right click" with the same drawing.

### widgets/cheats/sub-components/NumberSetter.tsx

The box a right click opens on a number. A counted value takes plus and minus steps; a value with a ladder (a capacity tier) walks the ladder and shows every rung as a chip. Every press writes at once, so the game answers while the box is open.

### widgets/cheats/sub-components/PointerHintProvider.tsx

The hint box sits 14 pixels from the pointer so the cursor never covers it, and is kept inside the window.

### widgets/cheats/tabs/ChecksTab/ChecksTab.tsx

The Grant button hands over what this run put at each location, and the row names that item, so a randomized file shows the seed's item and never the vanilla one. The rows are the tracker's own roster, so the console lists exactly what the tracker lists; building the whole dataset instead used to hide a seed's shop shelves and offer locations the seed never generated. A few pure progress buffer events carry no screen. Resolving a row's item walks the item records, so the visible list is planned once per session.

### widgets/cheats/tabs/RulesTab/RulesTab.tsx

The tiles come from three tables: one row per tile with its sprite, gate category, and the getter and setter it is wired to. The getters return plain module state, which never re renders by itself, so the tab bumps a tick after every write and when the remembered rules land a moment after the game starts. Tiles belong to different categories, so each tile goes inert on its own when its category is off. A ladder's first rung is the game's own value, so the tile lights its edge only once another rung is chosen.

### widgets/cheats/tabs/RulesTab/RulesTab.css

Three sections of tiles in a widget about 340px wide; the square tile size comes from the spacing scale so three squares and their gaps fit. On a state tile the checkbox label fills the square so the whole tile is one click target, reversed so the art reads first, and written through the tile so it outranks the checkbox's own single class rules.

### widgets/cheats/tabs/ItemsTab/ItemsTab.tsx

The pause menu's five panels, made clickable. The name box follows the slot under the pointer only; the ITEM grid, EQUIP, PENDANTS or CRYSTALS and A boxes each edit what they draw. One tier list is open at a time, under the cell that opened it. The ITEM box is 19 tiles wide with its border; two more keep it clear of the edge.

### widgets/cheats/tabs/ItemsTab/ItemsTab.constants.ts

The panel geometry repeats the pause compounds' numbers so the editors land on the same pixels. The bow byte counts the arrows loaded on top of the bow held, so its two rungs sit at values 1 and 3. Save index 15 is the bottle selector, edited on the Player tab. The ITEM box has 17 by 13 inner tiles with the 5 by 4 grid one tile down and two across. EQUIP holds sword, shield and armor along row 1 and a dotted rule on row 3. The PENDANTS or CRYSTALS box is one tile narrower than the game's so it fits beside EQUIP; pendants sit courage on top, wisdom left, power right, and crystal N sits at index N in the game's 2, 3, 2 layout. The game shows crystals once the progress indicator reaches 3. The A box has the ability words in a 3 by 2 grid and the four passives on the bottom row in the game's order. Slots 20 to 26 are the CheatSlot numbers for gloves, boots, flippers, pearl, sword, shield and armor.

### widgets/cheats/tabs/ItemsTab/behavior/slot-specs/build-slot-specs.ts

Nothing is retyped: a ladder's rungs, a by value pick and a held flag all come from the tracker's `item-ids.ts`, the sprites from the pause slot components, the labels from the item records (a fighter's shield reads "Blue Shield"). Specs are built per call because a published dataset bundle can replace the records under the labels. Rung i of a ladder is held at byte value i + 1, except the bow. The mirror byte is 1 for the scroll it starts as and 2 for the mirror the receipt hands over. A slot whose zero draws a sprite (armor) names that tier instead of "None".

### widgets/cheats/tabs/ItemsTab/behavior/slot-specs/is-removal.ts

A tier that draws nothing holds nothing, so picking it is the removal.

### widgets/cheats/tabs/ItemsTab/behavior/slot-value/is-slot-owned.ts

Armor always draws a mail, so it reads as owned at zero; every other slot is owned above zero.

### widgets/cheats/tabs/ItemsTab/behavior/useSlotClick.ts

An owned slot (and the bottle slot) opens its list under the cell; an unowned one gives the lowest tier the receipt can hand over and flashes. The flash is a counter per slot, so the cell remounts and restarts its animation on every give.

### widgets/cheats/tabs/ItemsTab/behavior/useSlotName.ts

An owned grid slot shows the localized name the pause menu would draw; an unowned one is named as if it held its first tier, drawn dimmed, so a ghost reads before it is clicked. Equipment and ability slots show the tier label from the item records. An unowned bottle slot draws an empty bottle.

### widgets/cheats/tabs/ItemsTab/behavior/useSlotWrite.ts

A give rides the delivery queue, so the hold up, the message and the counters are the game's own. A set writes the byte directly: the remove, the downgrade and the "exactly this tier" path.

### widgets/cheats/tabs/ItemsTab/sub-components/AbilityTextGrid.tsx

The six ability words (LIFT with its level, READ, TALK, PULL, RUN, SWIM) come from the game's letter sprites in the pause menu's 3 by 2 grid, read only. When the store's ability word is still zero, the flags are derived the way the game sets them: gloves light LIFT, the book lights READ and TALK, PULL is always on, boots light RUN, flippers light SWIM.

### widgets/cheats/tabs/ItemsTab/sub-components/ProgressEditor.tsx

The label switches between pendants and crystals; the default follows the game's progress indicator. Every pendant and crystal is a toggle on its SRAM bit.

### widgets/cheats/tabs/ItemsTab/sub-components/SlotCell.tsx

A right click opens the list on any slot, owned or not, so a tier can be picked outright. A remount (a new key from the caller) restarts the flash that follows a give.

### widgets/cheats/tabs/ItemsTab/sub-components/TierList.tsx

A tier above the held one with a receive id is a Give (the receipt plays); every other tier is a Set (the byte is written); the empty tier is the Remove. The bottle slot shows a notice instead, since bottles are edited on the Player tab.

### widgets/cheats/tabs/ItemsTab/ItemsTab.css

Every pixel size that follows the console scale is inline, the way the HUD components set theirs; the sheet holds only the click affordance over the game's own drawing. A panel label sits on the top border on a black plate that hides the border line under it. The flash after a give is a gold ring that fades while the receipt plays in the game.

### widgets/cheats/tabs/PlayerTab/PlayerTab.tsx

Every value is read from the live store and written through the bridge; nothing here mirrors game state. All of it sits under the stats gate.

### widgets/cheats/tabs/PlayerTab/PlayerTab.constants.ts

The widest block is the ten heart life meter with a little room either side (16 tiles). Small keys have no capacity byte. A ladder longer than 12 rungs (the wallet's 101) is walked by steps, not shown as chips. The keys counter reads 255 outside a dungeon. The meter's level codes are 0 none, 1 full, 2 half, 3 quarter. Save index 15 is the bottle slot the sprite table is keyed on. A bottle is two tiles square, one tile from its neighbour and from the frame. The HUD draws the silver arrow icon from bow value 3 up.

### widgets/cheats/tabs/PlayerTab/behavior/heart-clicks/heart-write.ts

Health and capacity are in the game's units: 8 per heart, 4 per half heart. A left click lands health on that heart, the left half of an owned cell on the half heart, and a cell past the capacity raises the capacity to include it, then fills it. A right click lands the capacity on that heart.

### widgets/cheats/tabs/PlayerTab/behavior/useNumberEdit.ts

A click opens a field over the digits with the value selected; Enter or blur commits it clamped, Escape drops it. A wheel tick moves one, or to the next rung on a ladder; the value a tick wrote is kept until the game reports a value of its own, so fast ticks step from the last write. Every commit goes through `write`, so the value stays in the game.

### widgets/cheats/tabs/PlayerTab/sub-components/LifeEditor.tsx

Twenty transparent cells sit over the hearts on the same tile arithmetic, under the LIFE label row (one tile plus its one pixel shadow). A container change redraws the HUD, so outside play only the health inside the owned hearts moves.

### widgets/cheats/tabs/PlayerTab/sub-components/MagicEditor.tsx

Sixteen rows lie over the meter's interior, inset 0.8 tile from each edge of the 3 by 6 tile frame, the inset the meter uses for its black well. Row r from the top sets level 16 minus r, 8 magic units per level.

### widgets/cheats/tabs/PlayerTab/sub-components/MagicLevelBar.tsx

The meter's cost level as a column of steps read like the hearts: one rectangle per level the file can stand on, filled from the bottom. A vanilla file has two (full cost and the bat's half cost); a seed has exactly the levels its upgrades reach, its empty level included when it starts there. The column spans the meter's inner well so the steps line up with the fill. A level redraws the HUD, so the column is locked outside play.

### widgets/cheats/tabs/PlayerTab/sub-components/CounterEditor.tsx

The ceiling walks the capacity ladder the mode offers: the native tiers on a vanilla file, exactly the rungs the seed's upgrades reach on a randomized one, plain digits where there is a single rung or no ladder (keys). A ceiling redraws the HUD, so it is locked outside play, and so is the key count.

### widgets/cheats/tabs/PlayerTab/sub-components/NumberCell.tsx

Without a writer the number is plain digits, for a ceiling the console does not set; with a locked reason it is plain digits too, dimmed, with the reason as its tooltip.

### widgets/cheats/tabs/PlayerTab/PlayerTab.css

Every pixel size that follows the HUD scale is inline; the sheet holds the layout, the hit zones and their hover and ghost treatments. The meter's frame layer sits at a low z index of its own, so the meter box isolates it and the rows can rise above the frame without competing with the popover outside. Hovering a magic row lights it and every row under it, so the level a click would set reads as a fill first.

### widgets/navigation/useNavigation.ts

All of the navigation widget's state, data reads and flood orchestration. Flood output is read from the overlay store, never mirrored into component state: the widget unmounts whenever the hub opens, and a local copy used to leave with it, which is how the minimap once vanished while the overlay stayed.
Manual or auto mode is remembered by the profile. The overlay store stays the live value because auto mode has to survive the widget unmounting mid run; the pref is the copy that survives the app closing. The saved mode is restored once per app run and only after the profile's prefs land, since before that the pref reads as the `manual` fallback and would overwrite a real `auto`. The `--auto-flood` flag is applied once per app run, held at module level: a ref resets when the hub unmounts the widget and would force auto back on after the user chose manual.
The room's starting layer is captured when a room loads. A lightweight 200 ms tick re renders so live debug values follow the player. The overlay and the bundle drop when the active screen changes, and a bundle that no longer covers the player is dropped.
An indoor run bails early while the room's tile data is not there yet (a transition in progress); the transition settled event only fires once the core considers the room settled, so this guards the manual button, the CLI flag and the inventory trigger. Fall hole entrance ids are left out of the regular markers; overworld door ids mark physical doors. The outdoor bundle is set before the early return so it persists with no reachable screens. The annotations derive from the same reads the run gates on, so the overlay and the run never describe a screen differently.
The indoor half of the auto reflood listens for the native transition settled event, which the core only fires when the developer tools feature bit is set (`core/game-hooks/transition_events.c`). That bit is off for a normal player, so auto mode holds the developer tools override while it is on; the gate only unlocks read only instrumentation. A change in sword, gloves, boots, flippers, hookshot or hammer re floods, since it changes reachability. Switching to auto floods at once so the overlay matches the mode just picked.

### widgets/navigation/hooks/useFloodOnTransition.ts

Re floods in auto mode when the player's surroundings change. It replaced a polling loop that guessed whether a transition had finished from latched game state flags and got it wrong three times running.
Indoor transitions (room, quadrant, door, stairs) are pure event subscription: the core fires `window.__onTransitionSettled` on the frame it considers the room settled, so nothing is polled. Walking across an overworld screen boundary is the one real exception: overworld travel is continuous scrolling with no discrete transition (`overworld_screen_index` in WRAM only changes on special cased area exits, never on a plain screen crossing), so there is no event. That case is derived from the player's live world position, which the per frame UI bridge already keeps current; reacting to it adds no timer.

### widgets/navigation/nav-flood/live-overworld-screen.ts

The overworld screen under the player: each screen is 512 world pixels, so bits 9 to 11 of the X and Y position give the column and the row of the 8 by 8 grid.

### widgets/navigation/hooks/useScreenDetection.ts

A screen resolved by the palace scan fallback carries a wrong `dungeon.palaceIndex`. It still renders correctly, so the mismatch is logged once per room so the mislabel gets fixed.

### widgets/navigation/hooks/usePlayerDebugState.ts

`inDoorway` is the doorway orientation the player occupies, 0 when not in one, and it is sticky, not per frame. `doorAnimStep` is the door open or close animation step, 0 when no door animates.

### widgets/navigation/useRealTransitions.ts

A memo over the observation facade's real transition enumeration (`@app/lib/game/observations`), where the native table reads and their indoor and outdoor split live.

### widgets/navigation/nav-flood/annotate-flooded.ts

Every screen the flood covered is annotated, not just the player's: on a multi screen area that would hide three quarters of the mechanics. Indoors the flood covers one room, so the detected screen's own id is the only correct id. Outdoors a sub screen's id comes from the screen data through its game id, never formatted from the index by hand.

### widgets/navigation/nav-flood/collect-screen-crossings.ts

One crossing record per flooded screen, off the same flood and border bundles the overlay draws, so the panel, the minimap and the overlay agree on a screen's ways out. A response's `screenIndex` is the room index indoors and the overworld screen index outdoors.

### widgets/navigation/nav-flood/finalize/annotate-layer-toggles.ts

Stamps the border bundles the overlay and the internal edge lists read. The crossing facade answers the same question for its own edge records off the same predicate, so both views of a boundary agree.

### widgets/navigation/nav-flood/finalize/build-indoor-screen-bundle.ts

A multi screen room expands into virtual quadrant cells; its shape gives the grid. Whether a room is multi screen comes from the layout info directly, not from flood transitions, since the flood now covers the whole grid without quadrant bounds. The effective layout from the dungeon map data wins when there is one.

### widgets/navigation/nav-flood/indoor-entrances.ts

Merges the canonical indoor entrance list (`roomEntrances`, shared with the simulator) into the widget's seed array and reports the respawn points: real entrances that are neither a fall hole landing nor an overworld door. The overworld pass may already hold an id with outdoor grid coordinates, so it is replaced. Overworld screen ids overlap indoor room ids (OW 0x51 and room 0x51), so an unrelated overworld entrance can leak in and is dropped; fall holes (id 200 and up) and synthetic stair and boundary ids are exempt.

### widgets/navigation/nav-flood/prepare/build-inventory.ts

`lift.1` is bushes and pots (no glove), `lift.2` the Power Glove (light rocks), `lift.3` the Titan's Mitt (dark rocks). Inventory slot 2 is the hookshot, 3 the bombs, 11 the hammer.

### widgets/navigation/nav-flood/prepare/compute-start-context.ts

The overworld blockers used to be built here from the live sprite list, which only describes the screen the game occupies. They now come from the addressable spawn table inside the shared flood (`lib/game/flood/blockers.ts`), so the widget and the simulator agree about every screen.

### widgets/navigation/nav-flood/propagate.ts

An adapter: the flood lives in `lib/game/flood/flood-area.ts` and the simulator runs the same code. The widget used to assemble the options by hand and read solid sprite blockers from the live sprite list, which made its numbers diverge from the simulator's on every screen the game was not on. `dynamicBlockers` is kept for the widget's blocker tally.

### widgets/navigation/nav-flood/useNavConnections.ts

Splits connections into internal and external. Indoors that is the `isIntraRoom` flag (quadrant boundaries); outdoors it is bundle membership (the screens of a 2 by 2 big screen group). Internal borders are deduplicated: A to B east and B to A west are the same border, and east or south is kept for spatial correctness. Intra room edges are all kept, since south and north are two sides of the same boundary. The crossings get the same split, so the panel lists the borders the minimap draws arrows for.

### widgets/navigation/build-connection-record/build-connection-record.ts

Editor state to a `ConnectionRecord` minus its id. `kind` and `dungeonId` are derived the way the dataset's own split derived them, so an edge written here matches the files, and `transit:*` tags that became a kind are retired from the tags. Both endpoints must resolve to real screens or nothing is written.
A connection point always needs a real `toConnectionId` partner (`data/connections/derive.ts`). When the destination already has a point aimed back, it links to it; otherwise it links to `pendingPartnerId(to.id)`, because minting a real id needs the allocator round trip only the write path (`record-creators.ts`, over IPC) can do. `createConnection` checks every accepted proposal for that sentinel and mints both halves as a pair (`connection-pair-writer.ts` on the main side). A proposal always describes a point the player was just seen leaving, so it can exit; overall direction is whatever the partner's `canExit` says. The draft carries tag terms, the record carries references to them.

### widgets/navigation/build-connection-record/connection-kind-for.ts

The kind follows a priority order: a fall through is a hole wherever it leads; a warp or portal is a teleport; an overworld to non overworld crossing is an entrance (the `ctx:entrance`, `ctx:exit` and `ctx:dungeon-enter` tags say the same); otherwise the physical mechanism names it (stairs, door); everything left is a scroll across a boundary. Approach tags (grave, bomb, bonk, rock, push, hookshot, ledge, waterfall) never name a kind.

### widgets/navigation/build-connection-record/rewrite-connection-record.ts

The record an existing dataset connection would be rewritten as. Fields the editor does not own are carried across untouched.

### widgets/navigation/connection-issues/connection-issues.ts

Per connection warnings, so a reviewer sees what a connection is missing instead of an editor that renders nothing. `tileDesc` is the already resolved crossing description (persisted nav, else the live flood). The messages are named constants because the shape detector matches on them and turns the fixable ones into record edits. Direction is not a tag to check: it is `canExit`, a required field the types already guarantee.

### widgets/navigation/connection-tile-display/describe-connection-tiles.ts

Where a connection crosses: the persisted `nav` first (overlap tiles or entry point), then the live flood's matching crossing, else nothing. The flood always runs from the current screen, so only edges leaving it can be backed by a live crossing. A flood crossing backs a connection when its target index resolves to the connection's `to` id; the index is an overworld screen outdoors and a room indoors, so both resolutions are tried.

### widgets/navigation/detect-connections/detect-connections.ts

Every detection carries the screen id it resolves to, so no consumer recovers identity from the label; the old "Exit" label prefix is now the `isExit` flag. The label is display text only. Entrances lead into this room from an overworld screen, stairs lead to their destination room, the exit screen is where this room exits back onto, and each fall hole on an overworld screen drops into a room.

### widgets/navigation/screen-data-status.ts

Screen data completeness as a plain function of the detection, so the recommendation detector can read exactly the same verdict outside React and both agree on what "incomplete" means. Each correction is one field the live game can settle that the record gets wrong or leaves blank.

### widgets/navigation/hooks/useConnectionStatus.ts

A detection is matched when a stored pair already links this screen and the resolved target, whichever side the stored point sits on: the question `pairLinksScreens` answers for the connection audit, so the badge and the audit cannot disagree. Which side of a pair can be taken is `canExit`, a separate fact.

### widgets/navigation/screen-editor/allocate-geography/allocate-area.ts

The renderer's only source of a new area or location id. Nothing here derives an id: the request carries a display name and the main process answers with an `Allocated<...>` record it numbered itself. The brand is nominal, so a record assembled locally (from a slugified name, a hex index or anything else) is not assignable where these are expected.

### widgets/navigation/screen-editor/build-screen-record.ts

Form state to a `ScreenRecord` minus its id. The return type is the record shape itself, so a field a migration adds is either filled here or fails to compile. Fields the form does not edit (`nav`, `triggerIds`, `spawns`, `review`) are carried across from the record being edited. Anything missing comes back as a blocker, never a fabricated value. Only the two rules a form alone can break are judged here (a name, and a grid position under a floor); whether the screen is real belongs to `screenBlockers`, so the editor cannot accept a screen a query then fails to resolve. The form picks tag terms and the record stores references to them.

### widgets/navigation/screen-editor/dungeon-geography.ts

`DungeonRecord` carries no area or location of its own, so a dungeon's geography comes from the rooms it lists: every room of a dungeon shares one `areaId`, one `locationId` and one world. This replaced a name keyed table whose lookup silently returned nothing once a dungeon was renamed.

### widgets/navigation/recommendations/strategies/connection/connection.strategy.ts

The `connection` comparison strategy. The tile data (`nav`) fix is a field probe. Direction is derived from `canExit` (`data/connections/derive.ts`), so no `dir:` tag backfill remains. The crossing probe covers entrance, stair, hole and travel crossings and the indoor edge probe covers indoor scroll edges; each says below why they are two probes. Unresolvable differences route through `wire-detector.ts`, not through this strategy's own `detectorFromStrategy` call. Importing the folder's `index.ts` installs the strategy.

### widgets/navigation/recommendations/strategies/connection/wire-detector.ts

Registers the connection detector with its `onUnresolvable` mapper, apart from the generic pass in `strategy-detectors.ts`, which calls `detectorFromStrategy(strategy)` with no second argument and would drop every unresolved crossing if this registration lost the race. `detectorFromStrategy` always mints the id `strategy:${kind}` and `registerDetector` keys on id, so the last write wins: this import must run after `@shared/game/recommendations/strategy-detectors` (see the import order in `useDetectionPass`), while `index.ts` must run before it so the strategy is registered when the generic pass reads `allStrategies()`.

### widgets/navigation/recommendations/strategies/connection/indoor-edge.set.ts

An outdoor scroll edge is flood only: the flood proves presence, never absence, so it is never proposed for removal. Indoors the room's walk boundary table enumerates every wall the room scrolls through, so an indoor edge is provable both ways once that table is read. The probe is gated on `walkBoundaries` and `doorBoundaries` both being present, not merely `realAvailable`; `doorBoundaries` carries no destination and only proves the room's exits were queried. A batch accept is gated on `certain`, so a wrong gate here would make it unsafe. The `realTransitions` entries with `source: 'walk'` come from the same native call but say nothing about the door table, which is why this probe reads `walkBoundaries` directly; the crossing probe leaves `walk` sources to this one.

### widgets/navigation/recommendations/strategies/connection/points.set.ts

Every non edge crossing leaving the current screen, as one `SetProbe`: the missing, unresolvable and unbacked split falls out of `compareSet`'s own join. The live set is `realTransitions`, not the pre filtered unmatched crossings, so the join decides what is missing. Only enumerable sources count (exit, stair, travel, hole, entrance, doorway): a flood source proves presence only and can never back a removal, and `walk` belongs to the indoor edge probe. Live entries are deduplicated by resolved key, since two sources can name the same destination (a stair and a travel byte landing in one room) and `compareSet` does not dedupe its input.
Removal needs the backing table to have been read: indoors no source enumerates fall holes, so a missing hole or drop proves nothing. Such a record is still matched by the far side pair check, which keeps the live crossing from being proposed twice.

### widgets/navigation/recommendations/strategies/connection/points/infer-tags.ts

A doorway object through an outer wall joins two rooms of the same interior. An exit (the overworld screen this room exits to) and an entrance (an overworld door leading into a room) are both door crossings.

### widgets/navigation/recommendations/strategies/connection/screen-endpoint/auditable-from-here.ts

A record backs a crossing leaving the screen only when it sits on that screen and can be exited. A record sits on exactly one screen; the arriving side is its own record on the other screen.

### widgets/navigation/recommendations/strategies/connection/screen-endpoint/transition-key.ts

The resolved destination screen id, or a sentinel unique to the raw kind and index when it resolves to no screen. A dataset key is always a real screen id, so an unresolvable item can never read as already covered. A pair with no far side yet keys on the record's own id for the same reason.

### widgets/navigation/recommendations/strategies/connection/screen-endpoint/stored-on-far-side.ts

A stored pair already links this screen to the destination, but no exitable point on this screen carries it: the pair covers the crossing from the far side, so proposing it again would duplicate the dataset. The accepted cost is that a near side `canExit: false` error stays invisible.

### widgets/navigation/recommendations/strategies/connection/nav.probe.ts

The tile data fix: where the crossing physically sits, from the live flood crossing. Flood evidence proves presence only, so it grades `likely`. A record that already has `nav` is complete, and an endpoint that does not resolve to a real screen gets no fix; inventing one is what the connection path refuses to do.

### widgets/navigation/recommendations/strategies/connection/tiles.probe.ts

Fills `placement.tiles`. The migration codemod left about 700 points with an empty tile list because a static rewrite cannot read room geometry. Indoors `wasmGetRoomWalkBoundaries` enumerates every walk boundary tile with the room it leads to, so the tiles sharing this point's destination room are its footprint; the table covers the whole wall, so an empty result is proof and this grades `certain`. It is gated on both boundary tables like the indoor edge probe, and only applies to a point on the currently loaded room. The screen is looked up with `get`, not `getScreen`, because a record being edited can name a screen nothing holds yet.

### widgets/navigation/recommendations/strategies/connection/unresolvable-screen.ts

A crossing whose destination resolves to no screen used to vanish silently. It is the most informative finding the connection probes can make (the game goes somewhere the dataset never catalogued), so the `onUnresolvable` hook turns it into a `screen` create proposal built with `strategies/screen/screen-draft.ts`, matching a screen minted by the presence probe. An overworld destination names one real screen and grades `certain`. A room number alone can be a castle room or an unrelated cave and a crossing carries no palace index, so that proposal stays palace less (`interior`) and grades `likely`. Room 0 is every table's empty slot, not a destination. The difference's `item` is `unknown` because the engine erases a set probe's item type; the cast holds because this mapper is registered only for the connection strategy, whose set probes both use `ObservedTransition`.

### widgets/navigation/LiveDataInspector/LiveDataInspector.tsx

The Live Data Inspector widget (id `dataset`). Detectors run against the live game (`useDetectionPass`) and surface what they find as cards a reviewer can act on from the widget; only the comparison itself opens in the Data Inspector. A collection tab shows every record this screen relates to, each in its own `RecordCard`. Clicking a reference in a card, or its edit button, jumps to the Data Inspector at that record through `openRecord`, the same handoff `openRecommendation` uses for a finding. `useComparison` feeds each card its own record's live differences, keyed by id, so a wrong field shows inline where it lives.
A screen's `spawns` field renders through `SpawnsSection`, supplied as a per path field renderer. The generic array cell shows an object element as an unreadable `{...}` (see `summarizeList` in `array-kit.tsx`), so this one field gets its own view and keeps the place the schema gives it, inside the Contents group. Every real collection's rows carry a plain string `id` (see `getId` in `collection-sources.ts`).

### widgets/navigation/LiveDataInspector/LiveDataInspector.constants.ts

The tab strip reuses the Data Inspector's own `KIND_NAV_ITEMS` (same icons, same order) so a reviewer recognises the collections at a glance. There is no curated field allow list: the widget shows a record's full set of fields, like the full Data Inspector. `DEFAULT_KIND` is `screen` because every screen has a screen record and nothing else is guaranteed. `JOINABLE_KINDS` lists the kinds `useCurrentRecords` can resolve live records for. `FILTER_ORDER` is also the filter strip's left to right order.

### widgets/navigation/LiveDataInspector/behavior/context-signature.ts

The content signature the detection pass debounce gates on, shared so `useComparison` memoises its own undebounced diff on the same key. `context` is a fresh object every render, so this turns it into a string that only changes when something a detector or a comparison could act on does.
The four `liveGameId` values are included on purpose. Without them, walking from an unmapped room into a different unmapped room (or crossing a recorded palace mismatch, or entering through another entrance) changes nothing else here, so the finding from `presence.set.ts` would never move to the new room; `screenId` is null both before and after the move. `dataRevision()` covers the write side: an accepted finding changes the dataset, not the game, so without the counter a fix's siblings stay on screen until the player walks into another room.

### widgets/navigation/LiveDataInspector/behavior/useContextSignature.ts

The signature folds `dataRevision()` in, but a module counter only reaches a component that happens to be rendering. Subscribing here is what makes an accepted finding or a hand edited record run detection again at once, and not only once a game frame or another store renders the widget, which with the emulator paused may never happen.

### widgets/navigation/LiveDataInspector/behavior/useDetectionPass.ts

Runs every registered detector against the live context and folds the result into the shared recommendation store. Nothing else calls `runDetectionSweep` from the running game. Detection is gated on the content signature, not on `context` identity, so it only runs when the resolved screen, a count that moves on a real game event (a new crossing, sprite type or grant), or the dataset changes. A 600 ms debounce coalesces the burst of renders one room transition produces into a single pass.
Importing the strategy barrels installs the full detector set; they must come before `strategy-detectors`, which reads `allStrategies()` once at import time. The connection `wire-detector` import must come after it, because it registers the connection detector again with its `onUnresolvable` mapper over the one the generic pass installed.
There is one store write per collection the sweep touched, keyed by the kind each draft names: a finding is decided under its own kind's file, so it is persisted there or accepting it could never close it. The pass runs even when `screenId` is null (an unmapped room), which lets `strategies/screen/presence.set.ts` report a room with no screen record. Every detector tolerates a null `screenId`, and `applyPass` in `store.ts` scopes reconciliation with `scopedToPass(detectorIds, context.screenId)`, so a null screen pass can only resolve a null screen finding.

### widgets/navigation/LiveDataInspector/behavior/useComparison.ts

Per record live field differences for the inline diff display (`260 [0x0104]` in place of `260`). It is not folded into the detection pass effect: that one gates a persisted, async side effect, while this is a pure synchronous read over one screen's records, memoised on the same content signature with no second timer. `runComparison` therefore runs once more here than inside `detectorFromStrategy.detect()`. Sharing that call would force every detector's `detect` to expose the intermediate `Difference[]`, and the duplication is cheaper than that contract change.

### widgets/navigation/LiveDataInspector/behavior/use-current-records

Every record in the selected collection that relates to the current screen. A screen commonly owns several `connection` and `check` records, and `actor` and `item` can repeat too. Only kinds with a direct live link are handled; a collection without one (area, tag) shows nothing. `connection` reuses `observations.existingConnections` as is: it is already every point touching this screen, the same list the recommendation filtering trusts. Distinct spawns or grants of the same type resolve to one record, so there is one card per record, not one per spawn. `LiveRecord` is the element type every card renders.

### widgets/navigation/LiveDataInspector/behavior/useChestObservations.ts

`wasmGetRoomChests` already reports the `ChestObservation` shape per chest, so the rows pass straight through. Outdoors there is no chest table, so this returns `undefined`, not an empty array: absent means not read, and an empty array would tell a detector the game had proved there is nothing here. The query's own `null` on a closed developer mode gate collapses into the same `undefined`.

### widgets/navigation/LiveDataInspector/behavior/granted-items-store

Every raw item id the native receive path has granted this session, kept as a module set and not component state, because the tracker bridge listeners (`onItemReceived`, `onUnknownItem`) fire whether or not a widget is mounted. Both report ids in the same raw index space `GrantedItemObservation.itemId` wants, so both feed the one set. A granted id with no dataset record is the case the `create` draft of `item-grants` exists for. The snapshot `useSyncExternalStore` compares by reference is rebuilt only when the set changes, never per read: a fresh array on every call reads as changed every render and runs the subscriber into React's update depth limit. The listeners are wired once, however many hooks subscribe.

### widgets/navigation/LiveDataInspector/behavior/useGrantedItems.ts

Each granted id is resolved against the live receive tally and the tracker's current owned set. `fromInventoryDelta` is always false: every id came off the direct receive callback, never a guessed inventory diff, so the evidence is native and `item-grants` may grade it `certain`.

### widgets/navigation/LiveDataInspector/behavior/useLiveContext.ts

Assembles the live `DetectionContext` for the current screen, the one piece the recommendation engine does not build for itself, since a detector only receives observations and never reads the game. `origin` is always `live`; the simulator's recording path (`shared/game/simulation/recording/`) is a separate producer of the same shape.

### widgets/navigation/LiveDataInspector/behavior/useRecommendationFilter.ts

Classifies open findings by what accepting them would do to the dataset (change a property, add a missing record, drop an extra one), which is the axis a reviewer triages on; confidence is already a badge on each card. The active filter is derived: if the screen changes and the selected tab's count drops to zero, the next render already reports `all` with no effect needed. `buildFilterTabs` hides a tab that could never show anything and always keeps `all`, so there is never zero tabs.

### widgets/navigation/LiveDataInspector/behavior/useScreenObservations.ts

The screen and connection half of a live `ScreenObservations`: everything the old Dataset widget read for its status badges and connection audit, so a detection pass reads the same ground truth. The entrance room table is static (entrance id to room index) and read once per room change; absent (module not loaded yet) means not read. Fall hole rooms are read off the transitions and not the table a second time, because the facade already resolved every hole on this area to its destination room and holds the head group rule for what is on this area. Room header tags and the room's exit tables are meaningless outdoors, so they are absent there, not empty. The dungeon map position follows the same rule; a `found: false` for a house or cave is a resolved negative and still reported. The entrance spawn table is static and entrance indexed like the entrance room table, so it is read unconditionally.

### widgets/navigation/LiveDataInspector/behavior/useSpriteObservations.ts

The room addressable simulator queries (`wasmGetRoomSpriteSpawns`, `wasmGetOverworldSpriteSpawns`) already report the `LiveSpriteObservation` shape per spawn, so the rows pass straight through. `spriteCombat` reads one native row per distinct sprite type, never per spawn, so the wasm call count is bounded by kinds of actor, not copies.

### widgets/navigation/LiveDataInspector/behavior/spawn-diff

`SPAWNS_PROBE` (`shared/game/recommendations/strategies/screen/spawns.set.ts`) reports the union of the record's own spawns and every live spawn resolved this pass as `diff.liveValue`, so it is always a superset of the record's list; a reviewer only acts on the entries the record does not carry yet. A spawn's identity is its actor and tile, the same key the probe uses. `diff.liveValue` carries a `ScreenSpawn[]` by the probe's contract even though the comparison engine types a difference's payload `unknown`.

### widgets/navigation/LiveDataInspector/behavior/accept-all-certain-here.ts

A thin wrapper: `acceptAllCertain` (the Data Inspector's batch runner) is already generic over entries and an `accept` callback, so this supplies the callback with `entry.proposed` unedited, since the widget's cards never open a draft the way the comparison view's `ProposalForm` does.

### widgets/navigation/LiveDataInspector/sub-components

`CollectionTabs` is icon only: eleven full labels do not fit a docked widget, and the iconography is the one a reviewer already knows from the full inspector, so the label stays as the hover tooltip. `RecommendationCard` shows one open finding (kind, confidence, one line reason); clicking it opens the Data Inspector's comparison view at that finding, so a finding's current and proposed pair is only ever rendered in one place.
`RecommendationList` has a collapsible count header, the filter strip, one card per open finding in the selected tab (certain first, oldest first, the review's pass order) and a batch accept button that only appears once there is something safe to batch. The batch acts on the filtered list, so a hidden tab can never let a reviewer accept a finding they cannot see, and it sits outside the scrolling list because a button that scrolls away with the cards it acts on is unreachable when it is most useful. A batch that writes nothing says so through `batchOutcomeMessage`.
`RecordCard` gives each record its own bordered card, since a tab can hold several records for one screen. Its edit button is `IconButton` with a `title` beside its `label` for a tooltip. `ReviewControls` sits on each card because reviewing means reviewing one real record; the mark goes into the record's own file through the same record writers an edit uses, so it travels with the data. The status is written at once, the note on blur, because every write rewrites a source file. The heading matches the card's field group headings, and the id and date sit under it as metadata.
`SpawnsSection` resolves each spawn to its actor's name and tile. A spawn the live game reports that the record does not catalogue yet is appended below the recorded list and marked in the same red accent `DiffBracket` uses for a live value that disagrees with the dataset.

### widgets/navigation/LiveDataInspector styles

The inspector shell normally never scrolls, since the recommendation list and the record region each own a `ScrollArea`; `overflow-y: auto` is the escape hatch when the widget shrinks so far that two tab strips and the list header exceed the body. The record region has a real floor of `6rem` (one card header plus a line or two of fields) so a long recommendation list can never shrink it away; no size token covers a content area floor yet. The collection tab bar scrolls sideways because eleven tabs never fit the docked width. The recommendation list is capped at 45% of the body and can still shrink; the batch button and outcome line are pinned outside the scrolling list. The review label restates the uppercase accent of `compact-record-view__group-label`, and the record id is monospaced and clipped so a long id cannot widen the card. The spawn section carries the same reserved accent gutter as `compact-record-view__row`, and its colours follow that composite's label and empty conventions; a live only row uses the danger accent of `compact-record-view__row--differs`.

### widgets/navigation/sub-components/ActiveStates.tsx

The States chips: everything the game holds true at once, like a follower, story beats or keys in hand. It renders whatever the registry reports, so a new state needs no change here. A state that affects traversal reads brighter (`chipGating`), because it changes what is reachable.

### widgets/navigation/sub-components/AnnotationLayer.tsx

The minimap half of `ScreenAnnotations`: a dot per annotated tile plus the check tally for the screen, so the small map shows the same mechanics as the overlay and not only reachability. The cell props place the annotated screen's 64 by 64 tile grid on the minimap. Screen wide kinds (room tags) have no tile and are skipped, since they live in the widget panel.

### widgets/navigation/sub-components/ConnectionsPanel.tsx

The Connections panel, in order: entrances, edges, internal edges and fall hole landings.

### widgets/navigation/sub-components/CrossingCard.tsx

One way on or off the screen. A crossing the player cannot take is marked, not hidden. The layer tag shows the floor the crossing sits on when the record names one.

### widgets/navigation/sub-components/DescRow.tsx

A clickable info row label that expands an inline description. The open state is keyed by label so each row remembers itself, not the last one opened.

### widgets/navigation/sub-components/EdgeArrowSvg.tsx

A small directional arrow glyph coloured by edge direction.

### widgets/navigation/sub-components/EdgeCard.tsx

One boundary scroll off the flooded area. `playerLayer` is the floor the player stands on, which a toggling border flips. The span badge lists the tiles the scroll runs across, on the axis its side runs along; the tile badge counts the walkable tiles of the run, with the gated ones behind a plus.

### widgets/navigation/sub-components/FunctionsPanel.tsx

`MODE_OPTIONS` sits at module level so the array identity is stable across renders. The flood and clear buttons only show in manual mode: flooding by hand is the point of manual mode, and in auto the widget owns the timing.

### widgets/navigation/sub-components/GameStatePanel.tsx

The Game State info panel. The viewport size is the base room shape expanded by the quadrant fullsize flags.

### widgets/navigation/sub-components/PlayerStatePanel.tsx

The Player State info panel.

### widgets/navigation/sub-components/IndoorMinimap.tsx

The indoor and dungeon minimap: a single full size rectangle.

### widgets/navigation/sub-components/OverworldMinimap.tsx

The overworld minimap: a grid with one cell per 512 by 512 screen. Every annotated screen draws in its own cell, because a multi screen area has mechanics on sub screens the player is not standing on.

### widgets/navigation/sub-components/InternalEdgeDiamond.tsx

A four slot diamond layout of internal edge connection cards around a room.

### widgets/navigation/sub-components/InternalEdgeSvg.tsx

A two square connector glyph showing an internal room edge transition. `SQ` is the square size and `LINE_OVERFLOW` is how far the separator line runs past the squares.

### widgets/navigation/sub-components/InternalEdgesSection.tsx

Intra room boundary pairs plus inter screen internals. Intra room connections are grouped into boundary pairs (south with north, east with west): each contiguous run on one side matches the run on the opposite side that starts at the same position, and south and east are the side a card is drawn from. Overworld inter screen internals are kept as they are and shown unpaired.

### widgets/navigation/sub-components/NavigationWidgetSettings.tsx

The widget's own options: manual or auto flooding. The overlay store holds the live value and the widget pref is the copy that survives the app closing, so a change here writes both, the same way `setMode` in `useNavigation` does.

### widgets/navigation/sub-components/PathCopyBtn.tsx

Copies the currently locked pathfinding path to the clipboard.

### widgets/navigation/sub-components/ReachabilityCanvas.tsx

A pixel canvas drawing a flood fill reachability grid, one pixel per tile.

### widgets/navigation/sub-components/ReqIcon.tsx

Renders a requirement as an emoji icon (known requirements) or a labelled chip. `REQ_ICONS` stays in this file: it is a categorical palette, and the lint exemption for raw colours names this file by path.

### widgets/navigation/sub-components/ScreenMapWithConnections.tsx

Picks the indoor or overworld minimap from the current room context.

### widgets/navigation/sub-components/TileRecorderBtn.tsx

A debug aid that records the attribute value of each tile the player walks over.

### widgets/navigation/sub-components/ScreenPanel

The On this screen panel: every annotation the simulator derived, grouped the way the overlay colours them, plus the decoded room tags. It is the list side of the same `ScreenAnnotations` the canvas draws, so a mechanic can never appear in one and be missing from the other. Ways on and off the screen belong to the Connections panel, which reads crossings. A multi screen area annotates every sub screen; the panel is one list, so the items merge and the tallies sum. Clicking a row toggles its kind on the overlay; the legend is display only.
`groupAnnotations` groups by the same families the overlay colours by, so the panel and the canvas tell the same story in the same order. `unknown` rides along in the Unmapped group and is never dropped: an unmapped mechanic must stay visible in the list too, not only on the canvas.
