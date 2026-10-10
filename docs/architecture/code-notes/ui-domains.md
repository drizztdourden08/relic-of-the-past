<!-- @layer docs @kind doc -->
# UI domains: code notes

Facts about the code under `apps/desktop/src/ui/domains/` (every domain except `app`) that the code cannot say by itself.
Each heading names a file by its path under `apps/desktop/src/ui/domains/`.

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

The scene tiles are bundled under `apps/desktop/assets/title-scene/light/`: one sky strip, every numbered variant (`<stem>_<n>.png`) of the mountains, trees and clouds, plus the castle. The title screen and the home backdrop both draw from this one lookup.

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

### packs/language/compounds/entry/entry-meta-model.ts

The open entry's metadata answers what a translator cannot read from the words: who opens the line, where, how the game finds it, how many boxes the player pages through, and what it pulls in at runtime.
A row is left out when the fact does not apply, and stated as absent when it applies but is not known. An entry opened by the core has no place; two entries have no mined source and two type bytes carry no record. A plausible guess for either would be worse than saying nothing. `mono` marks a value that is an identifier, not prose.

### packs/language/compounds/entry/entry-prose.ts

The reading view and the closed row's excerpt run the shared expansion in preview mode, the same call the fit measurement makes, so the sentence read here is the sentence the box will hold.
Expansion is strict and throws on a reference the set has no variable for. That broken state is what a translator needs to see, so a failure falls back to a tolerant walk that shows the unresolved key in braces and keeps the rest of the line readable.
Control codes add nothing, but a row break or a wait leaves one space so two lines do not run into one word. A bracketed name the code catalog does not claim is a picture character of the alphabet; it draws real ink, so it stays as its bracketed spelling.

### packs/language/compounds/entry/entry-row-model.ts

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

### theme/packs/entry-row.css

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

### theme/packs/glyph-char.css

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

### widgets/simulator/behavior/fan-out-events.ts

Narrative events go to the store and the log bus; every event goes to the JSONL sink. A detected check carried on an event is fed into the recorder, so unmatched checks surface as dataset suggestions: an unidentified diff records a null check id, which is what the suggestion builder looks for.

### widgets/simulator/behavior/exits-event.ts

The exits line lists detected exits with their walk step distances, the closest first evidence. `steps` and `stepsNote` are already decoded from the ordering score (`exit-order.decodeScore`); the bias must not be derived again here.

### widgets/simulator/behavior/useDatasetSuggestions.ts

Only check suggestions can be applied. The screen and connection channels take a typed record and allocate the id in the main process, while a suggestion carries a pre rendered code block, the very shape those channels keep out of the dataset. Until the recorder emits records, those two kinds say so plainly.

### widgets/simulator/behavior/useStopAtChecks.ts

The stop at check picker runs the checks widget's own snapshot pipeline (`tracker-statuses`, over the placement where nothing moved) and the shared `filterChecks`, so it offers the same search, tag, item and status filters as the checks widget.

### widgets/simulator/behavior/classify-event.ts

The order of the tests matters: specific prefixes come before the broad flood match, so the `Unlock! re-flooding` line is an unlock, not a flood line.

### widgets/simulator/behavior/compute-indents.ts

Sequence markers and the final outcome sit at the base; an "Area" marker (a big multi sub screen group) opens one level in until "Leaving area"; screen markers sit one under their area (or the sequence outside areas); everything inside a screen goes one deeper.

### widgets/simulator/behavior/to-log-rows.ts

Line numbers are the event's position in the run (1 to N), never the engine step, which repeats. Position rows drop the START or END prefix because the tag already says it.

### widgets/simulator/sub-components/LogDialog.tsx

The modal is the only place the log is read: the widget column is too narrow, so the widget itself shows only a button with the live event count. Kinds are filtered before the indents are computed, so hiding a marker type re levels the rows under it.

### widgets/simulator/sub-components/ResultsPanel.tsx

Reaching the configured stop check and completing the goal both read as success; only `not-completable` is a failure, with a softlock summary. "Reveal log file" opens the run's JSONL on disk, which is not the in app log dialog.

### widgets/simulator/sub-components/RunTrail.tsx

The route the run walked, in order, with the checks each stop earned: the event log says what happened, the trail says where the run went. Stops come from the engine's own current screen, so the trail cannot disagree with the run.

### widgets/simulator/behavior/trail-haul.ts

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

A screen resolved by the palace scan fallback carries a wrong `dungeon.palaceIndex`. It still renders the right room, so the mismatch is logged once per room so the mislabel gets fixed.

### widgets/navigation/hooks/usePlayerDebugState.ts

`inDoorway` is the doorway orientation the player occupies, 0 when not in one, and it is sticky, not per frame. `doorAnimStep` is the door open or close animation step, 0 when no door animates.

### widgets/navigation/useRealTransitions.ts

A memo over the observation facade's real transition enumeration (`@app/lib/game/observations`), where the native table reads and their indoor and outdoor split live.

### widgets/navigation/nav-flood/annotate-flooded.ts

Every screen the flood covered is annotated, and not only the player's: on a multi screen area that would hide three quarters of the mechanics. Indoors the flood covers one room, so the detected screen's own id is the only correct id. Outdoors a sub screen's id comes from the screen data through its game id, never formatted from the index by hand.

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

### widgets/navigation/recommendations/strategies/connection/connection-strategy.ts

The `connection` comparison strategy. The tile data (`nav`) fix is a field probe. Direction is derived from `canExit` (`data/connections/derive.ts`), so no `dir:` tag backfill remains. The crossing probe covers entrance, stair, hole and travel crossings and the indoor edge probe covers indoor scroll edges; each says below why they are two probes. Unresolvable differences route through `wire-detector.ts`, not through this strategy's own `detectorFromStrategy` call. Importing the folder's `index.ts` installs the strategy.

### widgets/navigation/recommendations/strategies/connection/wire-detector.ts

Registers the connection detector with its `onUnresolvable` mapper, apart from the generic pass in `strategy-detectors.ts`, which calls `detectorFromStrategy(strategy)` with no second argument and would drop every unresolved crossing if this registration lost the race. `detectorFromStrategy` always mints the id `strategy:${kind}` and `registerDetector` keys on id, so the last write wins: this import must run after `@shared/game/recommendations/strategy-detectors` (see the import order in `useDetectionPass`), while `index.ts` must run before it so the strategy is registered when the generic pass reads `allStrategies()`.

### widgets/navigation/recommendations/strategies/connection/indoor-edge-probe.ts

An outdoor scroll edge is flood only: the flood proves presence, never absence, so it is never proposed for removal. Indoors the room's walk boundary table enumerates every wall the room scrolls through, so an indoor edge is provable both ways once that table is read. The probe is gated on `walkBoundaries` and `doorBoundaries` both being present, not merely `realAvailable`; `doorBoundaries` carries no destination and only proves the room's exits were queried. A batch accept is gated on `certain`, so a wrong gate here would make it unsafe. The `realTransitions` entries with `source: 'walk'` come from the same native call but say nothing about the door table, which is why this probe reads `walkBoundaries` directly; the crossing probe leaves `walk` sources to this one.

### widgets/navigation/recommendations/strategies/connection/connection-crossing-probe.ts

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

### widgets/navigation/recommendations/strategies/connection/nav-probe.ts

The tile data fix: where the crossing physically sits, from the live flood crossing. Flood evidence proves presence only, so it grades `likely`. A record that already has `nav` is complete, and an endpoint that does not resolve to a real screen gets no fix; inventing one is what the connection path refuses to do.

### widgets/navigation/recommendations/strategies/connection/tiles-probe.ts

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
The four `liveGameId` values are included on purpose. Without them, walking from an unmapped room into a different unmapped room (or crossing a recorded palace mismatch, or entering through another entrance) changes nothing else here, so the finding from `screen-presence-probe.ts` would never move to the new room; `screenId` is null both before and after the move. `dataRevision()` covers the write side: an accepted finding changes the dataset, not the game, so without the counter a fix's siblings stay on screen until the player walks into another room.

### widgets/navigation/LiveDataInspector/behavior/useContextSignature.ts

The signature folds `dataRevision()` in, but a module counter only reaches a component that happens to be rendering. Subscribing here is what makes an accepted finding or a hand edited record run detection again at once, and not only once a game frame or another store renders the widget, which with the emulator paused may never happen.

### widgets/navigation/LiveDataInspector/behavior/useDetectionPass.ts

Runs every registered detector against the live context and folds the result into the shared recommendation store. Nothing else calls `runDetectionSweep` from the running game. Detection is gated on the content signature, not on `context` identity, so it only runs when the resolved screen, a count that moves on a real game event (a new crossing, sprite type or grant), or the dataset changes. A 600 ms debounce coalesces the burst of renders one room transition produces into a single pass.
Importing the strategy barrels installs the full detector set; they must come before `strategy-detectors`, which reads `allStrategies()` once at import time. The connection `wire-detector` import must come after it, because it registers the connection detector again with its `onUnresolvable` mapper over the one the generic pass installed.
There is one store write per collection the sweep touched, keyed by the kind each draft names: a finding is decided under its own kind's file, so it is persisted there or accepting it could never close it. The pass runs even when `screenId` is null (an unmapped room), which lets `strategies/screen/presence.set.ts` report a room with no screen record. Every detector tolerates a null `screenId`, and `applyPass` in `store.ts` scopes reconciliation with `scopedToPass(detectorIds, context.screenId)`, so a null screen pass can only resolve a null screen finding.

### widgets/navigation/LiveDataInspector/behavior/useComparison.ts

Per record live field differences for the inline diff display (`260 [0x0104]` in place of `260`). It is not folded into the detection pass effect: that one gates a persisted, async side effect, while this is a pure synchronous read over one screen's records, memoised on the same content signature with no second timer. `runComparison` therefore runs once more here than inside `detectorFromStrategy.detect()`. Sharing that call would force every detector's `detect` to expose the intermediate `Difference[]`, and the duplication is cheaper than that contract change.

### widgets/navigation/LiveDataInspector/behavior/useCurrentRecords.ts and records-for.ts

Every record in the selected collection that relates to the current screen. A screen commonly owns several `connection` and `check` records, and `actor` and `item` can repeat too. Only kinds with a direct live link are handled; a collection without one (area, tag) shows nothing. `connection` reuses `observations.existingConnections` as is: it is already every point touching this screen, the same list the recommendation filtering trusts. Distinct spawns or grants of the same type resolve to one record, so there is one card per record, not one per spawn. `LiveRecord` is the element type every card renders.

### widgets/navigation/LiveDataInspector/behavior/useChestObservations.ts

`wasmGetRoomChests` already reports the `ChestObservation` shape per chest, so the rows pass straight through. Outdoors there is no chest table, so this returns `undefined`, not an empty array: absent means not read, and an empty array would tell a detector the game had proved there is nothing here. The query's own `null` on a closed developer mode gate collapses into the same `undefined`.

### widgets/navigation/LiveDataInspector/behavior/granted-item-ids.ts, granted-items-state.ts, subscribe-granted-items.ts

Every raw item id the native receive path has granted this session, kept as a module set and not component state, because the tracker bridge listeners (`onItemReceived`, `onUnknownItem`) fire whether or not a widget is mounted. Both report ids in the same raw index space `GrantedItemObservation.itemId` wants, so both feed the one set. A granted id with no dataset record is the case the `create` draft of `item-grants` exists for. The snapshot `useSyncExternalStore` compares by reference is rebuilt only when the set changes, never per read: a fresh array on every call reads as changed every render and runs the subscriber into React's update depth limit. The listeners are wired once, however many hooks subscribe.

### widgets/navigation/LiveDataInspector/behavior/useGrantedItems.ts

Each granted id is resolved against the live receive tally and the tracker's current owned set. `fromInventoryDelta` is always false: every id came off the direct receive callback, never a guessed inventory diff, so the evidence is native and `item-grants` may grade it `certain`.

### widgets/navigation/LiveDataInspector/behavior/useLiveContext.ts

Assembles the live `DetectionContext` for the current screen, the one piece the recommendation engine does not build for itself, since a detector only receives observations and never reads the game. `origin` is always `live`; the simulator's recording path (`packages/navigation/src/simulation/recording/`) is a separate producer of the same shape.

### widgets/navigation/LiveDataInspector/behavior/useRecommendationFilter.ts

Classifies open findings by what accepting them would do to the dataset (change a property, add a missing record, drop an extra one), which is the axis a reviewer triages on; confidence is already a badge on each card. The active filter is derived: if the screen changes and the selected tab's count drops to zero, the next render already reports `all` with no effect needed. `buildFilterTabs` hides a tab that could never show anything and always keeps `all`, so there is never zero tabs.

### widgets/navigation/LiveDataInspector/behavior/useScreenObservations.ts

The screen and connection half of a live `ScreenObservations`: everything the old Dataset widget read for its status badges and connection audit, so a detection pass reads the same ground truth. The entrance room table is static (entrance id to room index) and read once per room change; absent (module not loaded yet) means not read. Fall hole rooms are read off the transitions and not the table a second time, because the facade already resolved every hole on this area to its destination room and holds the head group rule for what is on this area. Room header tags and the room's exit tables are meaningless outdoors, so they are absent there, not empty. The dungeon map position follows the same rule; a `found: false` for a house or cave is a resolved negative and still reported. The entrance spawn table is static and entrance indexed like the entrance room table, so it is read unconditionally.

### widgets/navigation/LiveDataInspector/behavior/useSpriteObservations.ts

The room addressable simulator queries (`wasmGetRoomSpriteSpawns`, `wasmGetOverworldSpriteSpawns`) already report the `LiveSpriteObservation` shape per spawn, so the rows pass straight through. `spriteCombat` reads one native row per distinct sprite type, never per spawn, so the wasm call count is bounded by kinds of actor, not copies.

### widgets/navigation/LiveDataInspector/behavior/live-only-spawns.ts and spawn-key.ts

`SPAWNS_PROBE` (`packages/navigation/src/recommendations/strategies/screen/spawns-probe.ts`) reports the union of the record's own spawns and every live spawn resolved this pass as `diff.liveValue`, so it is always a superset of the record's list; a reviewer only acts on the entries the record does not carry yet. A spawn's identity is its actor and tile, the same key the probe uses. `diff.liveValue` carries a `ScreenSpawn[]` by the probe's contract even though the comparison engine types a difference's payload `unknown`.

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

Renders a requirement as an emoji icon (known requirements) or a labelled chip. `REQ_ICONS` lives in `ReqIcon.constants.ts`: it is a categorical palette of emoji and colours, and the lint exemptions for raw colours and glyphs name that file by path.

### widgets/navigation/sub-components/ScreenMapWithConnections.tsx

Picks the indoor or overworld minimap from the current room context.

### widgets/navigation/sub-components/TileRecorderBtn.tsx

A debug aid that records the attribute value of each tile the player walks over.

### widgets/navigation/sub-components/ScreenPanel

The On this screen panel: every annotation the simulator derived, grouped the way the overlay colours them, plus the decoded room tags. It is the list side of the same `ScreenAnnotations` the canvas draws, so a mechanic can never appear in one and be missing from the other. Ways on and off the screen belong to the Connections panel, which reads crossings. A multi screen area annotates every sub screen; the panel is one list, so the items merge and the tallies sum. Clicking a row toggles its kind on the overlay; the legend is display only.
`groupAnnotations` groups by the same families the overlay colours by, so the panel and the canvas tell the same story in the same order. `unknown` rides along in the Unmapped group and is never dropped: an unmapped mechanic must stay visible in the list too, not only on the canvas.

## hud

The HUD domain reproduces the in-game interface with the SNES palette, so it keeps its own primitive set and its own inline styles; the lint exemption for static inline styles and raw colours covers this whole folder.

### hud/primitives/ButtonPrompt

One button prompt: an optional Hold, the pictures of the buttons to press, and a label. A button with no picture (a key the icon set does not cover) shows its name in a small keycap. `height` is the prompt height in CSS pixels.

### hud/primitives/DialogFrame

A drawn message box border as one SVG: a single line, or a thin line inside a thicker one, with square, rounded or chamfered corners and an optional mark inside each corner. Every size comes from one game tile (`tile`, in CSS pixels; `width` and `height` are CSS pixels too), so the frame keeps its weight at any window size. The inner line runs parallel to the outer one, corners included. The four marks are mirror images of the top left one, so `markAngle` (degrees the top left mark turns) turns them all the same way relative to their own corner; at zero every mark stands upright. A mark's centre sits half a tile from the border ring, and the wider triforce sits a little further.

### hud/primitives/DialogTexture

The repeating texture on a message box ground, painted into a canvas and repainted each frame while it animates. The canvas fills its parent, which carries the ground's own corner shape, so the pattern is clipped exactly like the fill under it. `width` and `height` are CSS pixels, `unit` is CSS pixels per game pixel, `scale` is a cell size multiplier, and `density` and `scatter` run from 0 to 100 (how close the cells sit and how far they stray from the grid).
`useTextureLoop` paints once for a still pattern and every animation frame for a moving one. A viewer who asked for reduced motion gets the still pattern. The clock starts once per canvas and survives repaints, so a box that grows as its text types keeps its motion continuous.

### hud/primitives/GlyphRow

One row of the game's own glyphs, drawn from a glyph atlas into a canvas. The atlas holds 16 glyphs per row in 8 by 16 cells. Each cell is copied from the atlas at its pen x, so the row lays out exactly as the engine's bitmap did. A highlighted cell is copied from its highlight's atlas when one is given (`highlightAtlases` lists the primary then the secondary highlight; a missing one draws from the base atlas). The backing store is sized in device pixels and smoothing is off, so the face stays a pixel face. `unit` is CSS pixels per game pixel with magnification included, and `widthPx` is the row width in game pixels.

### hud/primitives/HudBox

The generic structural element for the HUD domain, standing in for a `div`. The HUD replicates the in-game interface and so keeps its own primitive set; raw HTML lives here. `as` picks the element (default `div`), and `disabled` is forwarded when it renders an interactive element such as a button.

### hud/primitives/HudImage

A raw `img` passthrough for the `position: absolute` sprite and frame tiles the HUD composes by hand. It stays apart from the design system `Image` so it can stay pixel exact.

### hud/primitives/HudNumber

`isMax` renders the yellow at max digit variant in place of white (see the Indicate Max Resources setting).

### hud/primitives/PauseLabel

A multi tile label strip in condensed HUD text. Labels are pre composed sprites where each 8 by 8 tile holds about two characters.

### hud/primitives/PauseTile

A single 8 by 8 HUD tile with optional horizontal and vertical flip, the base of all pause menu sprite drawing.

### hud/primitives/HudHeart

`HudHeart` draws one heart of the life meter and does not blit it, because the sprites could not do two things. Fill is a fraction, not a state: `fill` runs from 0 to 1 and the body is clipped at exactly that share of the width, so full, half and empty are three points on a line, and the smooth heart mode has real intermediate states to travel through and not a crossfade between two pictures of a half heart. The armour tier tints the same drawing: `armor` (0 to 2 from the save, clamped so an unknown tier is white) picks a rim, a highlight and a shaded flank, and the body stays red.
The two modes differ only in what the caller hands in and whether the cut travels: `original` gets the console's own quantised fills and moves the clip instantly, `smooth` gets the true fraction and eases it over 200 ms. `HudLife` owns the quantising, because it knows the save's health units. `scale` maps SNES pixels to CSS pixels, and a heart is 8 SNES pixels square. The `useId` value carries colons, which are legal in an id and illegal in the `url(#...)` reference that has to find it again, so they are stripped.
The heart is vector and not pixel art on purpose. The pixel art pipeline (`svg-pixel-art.ts`) reads a flat list of integer rects and bakes them into a bitmap at extraction time, and can express neither need: a fill cut at an arbitrary fraction of the width is quantised away by an eight column grid to the three states the sprites had, and three armour tints of the same drawing would need three more baked bitmaps. Colours are named constants and not design tokens for the reason `HudMagicBar.constants.ts` gives: a token that moves with the app theme would put app coloured chrome on game coloured pixels.
The drawing grid is two units to one SNES pixel: a curve on an 8 unit grid has nowhere to put the shoulder of a lobe, so the path is authored at 16 and scaled down. The shade path is the lower right flank where the body turns away from the light; the highlight is a crescent on the upper left lobe, the first place the tint reads. The fill red is the console's heart red warmed a shade so the drawn heart does not read as a washed out copy of the sprite; the empty colour is the interior of an unfilled heart, and the outline keeps a heart legible over bright terrain. Stroke widths are in grid units, half that in SNES pixels.
The tint is deliberately slight. It lives in the rim (drawn over the body's edge at every fill), the highlight and the shaded flank, the tint's quietest slot that gives the three tiers different bodies without three body colours. The body stays red at every tier, because a heart that turns silver stops reading as a heart. `HEART_TINTS` is indexed by `GameUIState.equipment.armor`: white, silver, gold, each pulled well back toward the red.

### hud/primitives/HudMeter

A horizontal bar whose own length is the quantity. There is no track: at half the bar is half as long, border and radius intact, and nothing is drawn where the rest would have been. A fixed frame with a fill draws a long empty trough at low values and makes none draws nothing a special case. The lane is not the bar: `width` is the space reserved and the length reached at fraction 1, and the SVG is always that wide so nothing near it shuffles as the value moves.
It is vector and a primitive: a rounded corner and a border that stays one SNES pixel at every HUD scale cannot live in a baked bitmap, and raw SVG markup belongs in a primitive, not in the compound that gives it colours and meaning. What a length means, what a second band says, and whether a meter is drawn at all belong to the caller; see `HudMagicBar`.
Props are in SNES pixels (`scale` maps to CSS pixels). `fraction` is clamped to 0 to 1. `radius` is the outer corner radius at full length and shortens with the bar; `sheenColor` is the lighter band across the top of each band, the bar's light source, covering a third of the band's height; `bands` splits the interior into stacked bands (1 is one bar). A corner may never eat more than a sixth of the bar's length, so at least two thirds of every horizontal edge stays straight: a radius authored for the full bar, carried unchanged to a 6 px stub, turns both ends into semicircles and the stub reads as a lozenge. A bar thinner than its two borders plus a pixel of core is a smudge of border, so any non zero amount draws at least that. The `useId` colons are stripped for the same reason as in `HudHeart`.

### hud/primitives/TypefaceRow

One row in the app's dialogue font, the modern face of the dialogue font setting. Every glyph sits at the pen x the engine gave it, in its own width, so the face keeps the game's layout and only the letterforms change. Picture glyphs have no face in the font and come from the glyph atlas. The face is drawn for a 16 px em box; the outline is the chosen thickness in game pixels (`strokeWidth`, 0 draws none) and at least one screen pixel. A highlighted cell takes its span's ink (`highlightInks` lists the primary then the secondary highlight); every other cell takes the row's own. `unit` is CSS pixels per game pixel with magnification included.

### hud/primitives/PauseBorderBox

A bordered box from eight tiled elements: four corner images and four edge strips with a repeating background. All sizes are whole pixels so the tiles meet. `cols` and `rows` are the inner size in tiles; the total size is two more each way. The black ground is inset so it does not bleed past the outer border edge, and the border tiles sit on top with the same cross shaped black outline filter `HudSprite` uses.

### hud/primitives/HudPie

A round pie of equal slices that empties clockwise from twelve o'clock (`slicesLeft` counts the slices still in place, so the rest sit after the gap; `size` is CSS pixels). A slice that is out fades while it slides away from the centre, and the next one to leave breathes; the motion lives in `HudPie.css`. The breath keeps running through the exit so the fill never jumps when the slice starts to leave, and reduced motion keeps the fade and drops the breath and the slide.
Geometry is in view box units on a square centred on the pie: the dark disc sits behind the slices, the dim hub over the slice tips sits behind whatever is on the pie, and each slice's dark outline also reads as the gap between two slices. A slice slides 10 units as it leaves, which stays inside the view box. `DISC_INSET_RATIO` is the share of the size left empty between the view box edge and the disc, and `SLICE_SPAN_RATIO` the share the slices span. A lone slice is the whole disc; one arc cannot close on itself, so it takes two half turns. Slices leave in index order, so the first one still in place is the next to go.

### hud/primitives/HudPixelPie

The countdown pie drawn the way the console would: hard pixels on the game's own grid, a short palette, and motion in whole steps. The canvas holds one pixel per game pixel and is scaled up with no smoothing, so it lines up with the game picture at every HUD scale; it is repainted only when the drawn state moved, never per frame. Its palette is the set of custom properties on `.hud-pixel-pie`, opaque colours only because the pie never blends.
Lengths are game pixels. The grid side is even, so the pie's centre sits on a pixel corner and the grid centres on the frame. A leaving slice travels up to 4 whole pixels, and the grid keeps that much room around the disc. The ring around the slices is one pixel of backing then a one pixel outline. Slice cells inside the 10 pixel hub take the deep colour so the digits stay readable. The shaded band on the lower right is 2 pixels wide, because light comes from the upper left; it sits one colour step under the slice body and never under the shade itself. The next slice to leave cycles through the pulse colours. A leaving slice takes 4 steps of 125 ms (about eight game frames each, matching the smooth pie's exit), moving a pixel outward and losing a quarter each step through an ordered 2 by 2 dither (a cell is kept while its value is under the quarters still drawn). One pulse colour lasts 4 steps.
`buildSliceMap` gives each cell to the slice its centre falls in, by angle clockwise from twelve o'clock. Cells on a boundary stay dark, a one pixel gap that takes the half pixel on each side, closed on the side before it. The pie is centred on the middle of a cell, so the upright boundaries run down one column and the left half mirrors the right. Distances are snapped to drop float noise, so a cell centre exactly half a pixel from a boundary lands on one side, and a point behind a boundary ray's start is on no boundary, which matters when two slices share one line. `pushOffset` adds zero to turn a negative zero into a plain one.
`rasterizePie` draws one frame as palette indices: slices already out leave the dark disc showing, the next slice takes its pulse colour, and the slice that just went is drawn again a whole number of pixels out along its bisector, thinned by the dither (`leavingStep` is 0 when nothing is leaving, else 1 to 4). `usePieSteps` counts motion in whole steps the way the console paces its animations. The count restarts during render each time a slice goes, so no frame shows the old steps: the slice that left runs its exit from the first step and the new next slice starts its pulse on the bright colour. The clock remembers the count before the last restart, which tells a slice leaving from a countdown starting over. A viewer who asked for reduced motion gets no steps at all.

### hud/primitives/HudSprite

A single sprite with pixel perfect scaling and an optional one pixel (scaled) outline that follows the alpha shape. Silhouette mode flattens the same PNG to a dim shape: the sprite's own alpha leaves exactly its outline, which says something belongs here without revealing what. It is a CSS filter over the unresampled bitmap, so it stays pixel exact, and it replaces the outline, since an outline around a shadow reads as a bug.
A silhouette has to be legible against its ground, and this primitive draws on two. The gameplay cluster sits on bright terrain, where crushing to black reads; the pause menu sits on a near black backdrop, where a black shape is gone (twenty two unowned item cells and four bottles looked like empty holes). So the treatment is a tone: `dark` crushes every channel to black for a bright ground, and `light` inverts to a warm parchment ghost for a dark one (invert lifts the shape off black, sepia warms it, opacity keeps it a ghost). The tone resolves through the `--hud-silhouette` custom property, which `silhouetteTone` sets on the element, so a surface can declare its ground once for a subtree (the pause menu does in `hud.css`) while a caller can still name it; unset anywhere above, it stays `dark`.

### hud/primitives/HudSpriteHeart

Blits one heart of the life meter from the console's extracted artwork. It is a second component and not a mode on `HudHeart` because the two share only a name and an 8 by 8 box: one is a path cut at a fraction with armour tints, the other a choice between three PNGs, and their props do not overlap. The Original HUD style replicates the console's bar from ROM sprites; the drawn heart belongs to Enhanced, the style that asked for a fractional fill and an armour tint.
There are three states, always the console's own quantising, so `mode` only decides whether the swap is instant or crossfades over 200 ms. `HudLife` owns the quantising for both arts. The crossfade keeps all three sprites mounted and moves opacity between them, which keeps it a plain CSS transition; a freshly inserted element has no previous opacity to travel from. The outgoing picture swells as it goes and the incoming settles in. The states draw in a fixed order so the paint order is stable across a swap.

### hud/composites/HudCount

A vertical stack with the icon on top and the digits below, with no absolute positioning. `icon` is the sprite file name without its extension, `iconWidth` is in SNES pixels (8 for one tile, 16 for two), and `isMax` draws the yellow at max digits (see the Indicate Max Resources setting).

### hud/composites/HudCurrentItem

The equipped item inside a bordered item box: the eight tile frame (corners, top, sides, bottom) around a black interior, with the 16 by 16 item sprite centred. The box is 4 by 4 tiles (32 SNES pixels): a one tile border round a 2 by 2 interior. The black fill is inset 0.8 tiles from each edge. `itemId` is the equipped slot id (1 to 20) and `itemValue` the slot's inventory value, its upgrade tier (see `getSlotSprite`).

### hud/composites/HudGlyph

Draws one controller glyph at tile scale, one 16 by 16 SNES pixel tile pair like an item sprite (`size` is the edge in SNES pixels). The glyph layer is shared with the Node side, so it stores root relative asset paths and never runs them through the renderer's public asset helper (it has no `import.meta.env` to ask); applying that prefix is this component's job, which lets the glyph pipeline stay in `shared/`. Glyphs are vector artwork, not extracted sprites, so nothing asks for pixelated rendering: at a fractional scale a nearest neighbour glyph would look broken next to the pixel art.
A custom pack's source is a file key into the player's glyph library, which the glyph store has already turned into an object URL. That URL is used raw: `publicAsset` would mangle a `blob:` URL into a request for a file that does not exist. A key the store has not primed yet renders nothing and leaves the space; the cluster's geometry is fixed, so a missing glyph costs a hole and never a reflow.

### hud/composites/HudMagicMeter

The magic meter is 3 tiles wide and 6 tall, matching the SNES tilemap: a top row (corner, top, corner), four rows of side, fill cell and side, then a bottom row. Magic 0 to 128 maps to 16 fill levels across the 4 interior cells, filled bottom up. The black interior is inset 0.8 tiles from each edge of the frame. In `accurate` mode the frame tiles sit above the black ground and the green fill; the green fill grows from the bottom by percentage, and a white cap line, narrower than the fill, sits on its top edge while it is not full.

### hud/composites/PauseButtonLabel

The Y, X or A button letter sprite in its own colour. Button sprites are vertical strips 8 pixels wide and 16 tall (two tiles).

### hud/composites/PauseCrystalIcon

A single crystal, empty or filled. A crystal is 16 by 8: two tiles side by side, one tile tall; drawing it square stretches the sprite to double height.

### hud/composites/PausePendantIcon

A single pendant, empty or coloured. Pendants are 16 by 16 (2 by 2 tiles).

### hud/composites/PauseEquipSlot

An equipment item (sword, shield, armour and so on) with its level dependent sprite, 16 by 16 SNES pixels. `EQUIP_SPRITES` maps the equipment type and level to the sprite file name. The heart piece and the armour always draw, including at level 0.

### hud/composites/PauseItemSlot

A single item in the pause menu item grid: a 16 by 16 sprite or empty, highlighted when selected. `SLOT_SPRITES` maps a save slot index to its sprite by value; each inventory save slot stores a small value (0 is empty, 1 and up is owned or a level). The selection circle is a native 32 by 32 pixel art sprite drawn once to a data URL and scaled up with pixelated rendering; it is 4 by 4 tiles and reaches one tile past the item on each side.

### hud/composites/PauseScreenTabs

Says which of the three screens is up and where the other two are. The tabs exist because the content does not fit: three screens need about 312 by 264 SNES pixels and the menu area is 310 by 160, so they take turns under a chrome that never moves. A tab strip says that out loud: the player sees there are exactly three and which one is up without pressing anything. Switching is a shoulder press in normal play; the click path makes the menu fully operable with a mouse. The tab wording is half a tile high so three names fit the strip above the panel.

### hud/composites/PauseText

Draws one line of the game's own font from extracted sprites. The enhanced menu writes far more words than the six pre composed label strips cover (three screen names, three gear ladders, the status rows and the two actions), so it draws them a character at a time from the same font tiles the name panel uses. It can draw A to Z, 0 to 9, space and the ampersand; anything else takes a blank column, the same contract the name panel's glyph has. The ampersand is drawn across two native tiles, so its sprite is twice as wide. Folding a translated string down to that set is the caller's job (the view folds through `wrapName`), which keeps this a bare compound with no data of its own. `pauseTextWidth` gives a line's width in SNES pixels, which the screens lay themselves out against. `size` is one character's edge in SNES pixels (default 8, the native tile), and `dim` fades the line for an unowned, unreachable or inactive label.
The menu's colours come from the console's own menu palette and not the app's design tokens, for the same reason the magic meter's do: a token that follows the app theme would put an app coloured frame round game coloured pixel art. The focus green is the one the console uses for its cursor and selection marks, and the dim opacity is how far an unselectable or unowned element fades.

### hud/compounds/DialogBox

The message box: a ground with an optional texture, the text, and a border on top. The border is the game's own three tiles (corner, horizontal edge, vertical edge, the rest flipped), a drawn single or double line with the chosen corners and corner marks, or nothing. When the tiles are not extracted yet the original border falls back to a drawn single line. A feathered ground with no border spreads a tile past the box and fades over two tiles toward every edge, so the words sit on near full shade (`feathered` is ignored under a border). `bordered` is false for a floating message, which draws only its ground. `tile` is one game tile in CSS pixels, the ground opacity runs from 0 to 1, and `markAngle` is the degrees the top left mark turns.

### hud/compounds/DialogPrompts

The row of button prompts under a message box, right aligned to the box's right edge. When the box sits too low for the row to fit below it, the row moves above the box. `box` is the message box in CSS pixels, `limit` the height of the drawable area the row must stay inside, and `scale` CSS pixels per game pixel. The prompt height, the space between box and row, and the space between prompts are in game pixels.

### hud/compounds/DialogRows

The three text rows of a message box, in the game's glyphs or the modern face, clipped to the rows in use and shifted up by the engine's own scroll progress so a scroll animates the way the bitmap does. The item picker's chosen item is a HUD sprite the mirror cannot see, so it is drawn here at the spot the engine blits it to (where `RenderText_DrawSelectedYItem` lands the 16 by 16 item in the text area, in game pixels). `unit` is CSS pixels per game pixel with magnification included, `widthPx` the text area width in game pixels, and `highlight` holds the primary then the secondary highlight: an atlas each for the game's glyphs, an ink each for the modern face.

### hud/compounds/HudButton

Draws a control's own face, picked per state. A face is a picture the author chose, not an auto resolved binding: `states.idle` names a specific pack and glyph (or a file), so the button always draws what was picked in the states editor. `unassigned` is the one state computed here from a flag: `unassigned` says whether the bound slot fires anything right now, derived by the caller from the placed node's own `dimmed` (which the validator derived from this node's `bind`, see `validate-node.ts`) and never from `content.slots`, which answers item ownership. A missing state falls back to `idle`; no automatic dimming stands in for a face nobody drew. Live press and hold detection is not wired yet, so `pressed` and `held` default to false and every button reads as idle or unassigned until real input state is fed through. A glyph face's `glyph` is a plain string in the document, validated at load time against the SDL position or `DPAD` set (`validate-button-node.ts`), so narrowing it to a glyph position is safe.
The state and face resolution sits in `behavior/hud-button-state` so it is testable with no React or DOM. The priority is a live press, then a hold, then nothing bound, then the plain default; a state with no face of its own falls back to `idle`, the only state every button must declare.

### hud/compounds/HudCountdown

The HUD countdown: a pie that loses a slice per share of the time, with the seconds drawn over the middle of the pie. `variant` picks hard pixels on the game's grid or smooth vector slices; `total` is the seconds the countdown started from, `remaining` the whole seconds left (the number drawn), and `fractionLeft` the share still to run, 1 down to 0, moving every frame.
`resolveSlices` cuts a countdown into slices and counts those left. A countdown at least as long as the slice count (10) gets that many equal shares of its time, and a slice leaves each time a share is used up; a shorter one gets one slice per second. No slice is left once the seconds reach zero. A rounding slack keeps a share that lands on a slice edge from counting one slice too many. The slices are 32 game pixels across, four HUD tiles. `countdownSize` is the whole pie box for a HUD scale, empty rim included; `countdownBox` gives the box and the empty rim between its edge and the disc, and the pixel pie measures both in whole game pixels so its box lands on the game's pixel grid.

### hud/compounds/HudLife

Draws the heart row and, for the two callers that still want it, the console's caption above it. Two arts, and the default is the enhanced one: `heartArt` picks the drawn heart (`HudHeart`, with a fractional fill and an armour tint) or the console's extracted sprites (`HudSpriteHeart`). The Original style replicates the console's bar from the ROM's artwork, so it opts into `sprite` along with the caption; every other caller is Enhanced and takes the drawing. `armor` (0 to 2) only reaches the drawn heart, because a baked bitmap has nothing to tint.
No caption in the enhanced HUD: `showCaption` defaults to false because the enhanced style is hearts and nothing else, and the nine pixels the caption cost were baked into the life block's published size for every caller, which put the shipped magic bar under the second row of hearts. The two callers drawing a replica of the console's interface (the vanilla styled `HudView` top bar, and the pause status panel, where the caption is the row's only label) opt back in, and neither is sized by `element-sizes.ts`.
Fill is a fraction. `original` quantises with the console's own arithmetic: health is rounded up to the next quarter heart, then five units or more reads full and anything left reads half, kept verbatim. `smooth` hands over the true fraction and lets the heart ease to it. Sprite hearts are always quantised the console's way whatever the heart mode, because there is no third picture for a fraction to land on. A heart is 8 health units, and only hearts the save holds are drawn, ten to a row, wrapping.

### hud/compounds/HudMagicBar

The enhanced HUD's magic meter: a green bar with a thin dark border and a slight corner radius under the heart row, 80 by 16 SNES pixels (5 to 1) when full. The drawing is `HudMeter`; this compound decides what the drawing must not. The bar's own width is the quantity: half the magic is half the bar, border and radius intact, so none draws no meter at all as the end of a continuum. The element keeps its full 80 by 16 reserve at every value, so the hearts above and the counts beside it never move as the player casts. `value` is raw magic power, 0 to 128, and zero draws nothing.
The half magic upgrade is a second band, not a tick. A tick marks the midpoint of a fixed trough, and once the bar's length is the value there is no fixed midpoint: a tick at half the drawn bar slides as spells are cast and says nothing about an upgrade that never changes. The upgrade makes every spell cost half, so the same bar goes twice as far, and it is drawn as a property of the whole bar: the interior splits lengthwise into two stacked bands, each with its own sheen, two bars' worth of casting in one. It reads at every length including a sliver, does not move with the value, and does not recolour the single green fill.
The colours come from the console's palette and not the app's design tokens: this is emulated hardware output on top of emulated hardware output, and a token that shifts with the app theme would put a UI coloured bar over game coloured pixel art. The shape is not the console's: 80 by 16 is a clean modern meter under the heart row and exactly as wide (80 is also the lane the element reserves), in place of the console's tall jar (which cannot sit under a life row without pushing everything down) or the 82 by 8 hairline that replaced the jar first. There is no fourth colour because there is no track. The frame is one pixel on every side at every length; it keeps the bar legible over any background and rules the two bands apart under the upgrade. The radius is slight, enough to soften the corner and not a pill, authored at full length (`HudMeter` shortens it with the bar). The sheen is a lighter band across the top of each band, the bar's light source.

### hud/compounds/HudShape

Draws the two pictures the tree cannot compose from a sprite: a heart and the magic bar. See `shared/types/hud/hud-shape.ts` for why this leaf exists; it hands off to the same primitives the compounds it replaces use (`HudHeart`, `HudMeter`). Nothing about how either looks changed, only how many there are and what feeds their fill, which is now the document's repeat and expression machinery in place of a compiled in loop over the save's health units.
Original heart mode is quantised here and not in the document: which of full, half or empty a heart reads is a live per player setting (`heartMode`), not a game data variable, so it cannot be an expression in the preset. `quantiseHeartFill` reproduces the console's rule (round the total up to the next quarter heart, then read this heart's share) from the continuous fraction alone, the arithmetic `heartFills` in `HudLife` applies to the whole row, restated per heart. That is exact because subtracting a heart's own whole multiple of four offset commutes with rounding up to the next multiple of four. A heart is 8 health units, the plan's own unit for `life_current`.

### hud/compounds/HudText

Draws a `text` element's own ink: the game's extracted glyph sprites or a real font. Content and sizing are resolved once upstream by `resolve-text.ts`; this only draws the string it is handed. The default stroke is the `.game-text` rule generalised: white fill, blue edge, `paint-order`, and a four way shadow ring filling a blocky face's diagonal gaps become the default when a `font: 'game'` face carries no stroke of its own, with the author's width and colour in place of one pixel of one blue.

### hud/compounds/HudNodeRenderer

Draws a solved layout and computes no geometry. Every rectangle arrives from the engine (`layoutHud`) already absolute in SNES pixels, carrying the scale its subtree was laid out at and the opacity and dim state it inherited. This component multiplies by the display scale (`scale`, display pixels per SNES pixel), subtracts the origin it was pinned to, and hands each element to the compound that owns its art. The arrangement is a pure function nothing renders, and the drawing knows nothing about layout.
Containers draw nothing; they are in the list because the editor selects and drags them. Their order is kept as the engine emitted it (parents before children, siblings in document order), the paint order the document chose. Every node is positioned against this component's own box and never flowed, because the flow already happened; mount it inside a `position: relative` parent, or an absolute one that fills its box. It is inert unless asked: without `onSlotPress` nothing takes a pointer event, which lets the gameplay HUD sit over the play field. With it, every node that names a slot (a glyph drawing a slot's control, or the item that slot holds, both the same button) becomes that slot's click target. It is the control that is drawn, not a separate overlay measured against it, which is how the pause menu's targets used to drift from the cluster they covered. The motion hook combines an animation's clock, a transition's CSS string and any fading exit ghost, so a document with none of the three (every shipped built in today) costs one boolean check.
The props have two halves. `nodes` is geometry, whatever `layoutHud` handed back, already absolute, scaled and dimmed. `content` is data: what the save holds, what each numbered slot fires, which artwork a glyph resolves to. Neither knows the other, so the live HUD, the pause menu's copy of the button map and the editor's preview mount this with the same geometry and three different sets of values. Nothing here reads a store or computes a position. `origin` is the SNES pixel point mapped to the renderer's top left corner; the default is the play field's corner, and the pause menu passes the button map's bounding origin to pin it into its right hand column. `dataScope` is what a node's `style` resolves bound values against (a border width, a shadow's blur, a tint's amount); the empty default still resolves every literal number. `clockOverrideMs` parks every animation's shared clock at that instant; the HUD layout editor's scrub and play head (`hud-layout-editing/motion-preview.ts`) is the only caller, and leaving it out keeps the free running clock.
In the content, a slot role says what a numbered slot fires, which decides whether it wears a sprite. The vitals are in the units the core reports (armour tier 0 to 2 tints every heart; magic is raw power 0 to 128). A slot entry holds the sprite file name without extension for what the slot holds, and `dimmed` for unassigned or holding something the save does not own. Slots are keyed by slot number, and a slot with no entry draws nothing. `glyph` is a function and not a table because a glyph names a fixed position or a slot, and only the caller knows the packs and the device. The countdown content is the countdown as the caller tracks it (`hud-countdown-track.ts`) plus the profile's pie style (`hudCountdownStyle`, which a node's own `variant` overrides); absent draws no countdown, and the pause menu's copy of the map leaves it out.
`DIMMED_GLYPH_OPACITY` is the one dim for the whole button map. 0.4 was tuned when only assigned buttons drew and a dim glyph meant an item not owned yet, a rare state. Since contract section 15.4 the map draws every assignable control all the time, so on a pad most of it is dim over the brightest terrain in the game, and at 0.4 the three free d pad chips over grass and canopy were all but invisible, defeating the reason the map stopped hiding them: an empty button answers where could I put this. 0.7 is legible on that ground and still reads as not assigned; the item sprite is what says assigned. The d pad's shared cross uses it for its group and a face disc for itself, so the two cannot drift apart.
`GROUP_GLYPH_ART` resolves the glyph that is not a position. A glyph pack (`packages/input-mapping/src/glyphs/`) is keyed by SDL position (`DPAD_UP`, `EAST`, `LEFT_SHOULDER`) because that is what a device enumerates and a binding row names. The whole d pad is not a position: nothing can be bound to it and no device reports it, so adding a key for it would put a non control into the table that describes controls. A document names it with the synthetic `DPAD` position and it resolves here. There is one picture for every family: of the six shipped packs only `snes` has whole d pad art, and promoting one console's pad would draw the wrong hardware for five players of six. The cross is drawn in the generic pack's style with no family's accent colour, the fallback every family reaches. The path is root relative like `glyph-asset-paths.ts` produces, so `HudGlyph` prefixes it with the app's base.
`drawOrigin` is where a placed node's box starts in SNES pixels, the one place a solved rect becomes a drawing position. The countdown snaps to whole game pixels and nothing else does: `HudPixelPie` is a canvas of one cell per game pixel scaled with no smoothing, so it only lines up when its corner sits on a game pixel. The engine may answer a fraction (a centred box in a view of odd width is half a pixel off) and is right to, because rounding there would move the flow every other node is measured by. So the snap happens after layout, on the drawing only, for the one kind that needs it (section 62); every other kind keeps the exact rect.
`countdown-inset` and `countdown-variant-of` say which pie a countdown node draws (the node's own pie when it names one, else the profile's) and how far it sits in from its box. The box is the pixel pie's (`COUNTDOWN_SIZE`, 44 game pixels); the smooth pie is a hair wider, about 44.4, around the same disc. `HudView` centres the pie across the frame and pins the disc's bottom edge, so the smooth one is centred across this box and keeps its top edge: its rim ends where the pixel pie's does, and both discs share a centre and a bottom line. The inset is 0 for the pixel pie.

### hud/compounds/HudNodeRenderer/sub-components/HudNodeArt

One placed element, drawn by the compound that owns its kind of art. There is exactly one scale, `placed.scale * scale`: the engine reports SNES pixels per intrinsic pixel, the view reports display pixels per SNES pixel, and every compound wants the product. A 20 px box over a 16 px glyph hands down 1.25, which is the d pad cross. `dataScope` is what a text element's bound value resolves against, the same table the renderer's style resolution reads.
Dimming arrives from two places and means two things. `placed.dimmed` is the engine's answer to `dimWhenEmpty`: no slot named by this node fires anything, which dims the whole d pad cross for its four directions. `content.slots[n].dimmed` is the save's answer: the slot is unassigned or holds something not owned yet. A glyph naming a slot takes either, because the button under an unfound item should read as quiet as an empty button. A sprite's own box may not be square (the bomb and arrow counters are 16 by 8, the key counter 8 by 8), so a sprite reads the engine's contained rect and not the fixed tile the 16 by 16 kinds use. `repeat` and `switch` never reach this component, because `layoutHud` expands the tree (`packages/hud/src/engine/expand.ts`) before a node is placed.

### hud/compounds/HudNodeRenderer/sub-components/HudNodeCountdown

A placed countdown node: the same `HudCountdown` the Original style draws, at the node's box (`scale` is CSS pixels per game pixel for this node). It draws whatever reading it is handed; whether it is on screen is the engine's answer (an idle countdown is not placed), so a fading exit ghost still shows the last reading, as `HudView`'s slot does.

### hud/compounds/HudNodeRenderer/behavior (node motion: useHudNodeMotion and its helpers)

`useHudNodeMotion` is the one hook the renderer calls: animation (its own clock), transition (the browser's clock primed by a CSS string) and enter or exit (a node arriving or leaving), combined per node. A document with none of the three costs one boolean check, because the clock's frame loop never starts unless something animates. Render `renderNodes` (the nodes plus any still fading exit ghost), not `nodes`. `styleFor` gives transform, filter, width, height and transition for the wrapper; opacity is handled only by `opacityFor`, because it multiplies and does not replace, so only the transform half of an enter or exit override belongs in `styleFor`. Always call `opacityFor` and never read `placed.opacity` directly once motion is wired. The barrel also exports `useReducedMotion` so the HUD editor's motion transport reads the same signal the renderer does, not a second `matchMedia` call that could disagree.
`resolveNodeAnimationStyle` samples one node's `animation` list at `nowMs` and turns it into the CSS that node's own wrapper needs, under the reflow rule: every property is a transform part, a filter, an opacity multiplier, or (only `width` and `height`) a pixel override on this node's own box. None of it feeds back into placement (`measure.ts` and `place.ts` never run again), so the six safe properties cannot move a sibling, and `width` and `height` resize only this node's box (`validate-motion-warnings.ts` tells an author who reached for them). `x` and `y` are authored in SNES pixels like every other bound field, so `displayScale` converts them. Tint animates an amount, not a colour: its keyframes modulate the node's own `style.tint` amount (0 to 1) with that tint's colour and mode, replacing the static tint for as long as the gate is true and not stacking a second tint filter. A node with a tint animation and no static tint gets a plain white `replace` flash. The opacity multiplier applies on top of `placed.opacity`, which already carries ancestor opacity and dim state, so keyframes of 1, 0.5, 1 read as half as opaque as usual.
`transitionCssValue` turns a `transition` into the browser's own `transition` property. A bound value that changes between renders is a plain CSS value change (`left`, `opacity`, `transform`), and handing the browser a transition string beforehand is all it takes for that change to ease, the `CLUSTER_FADE` technique of `HudLayoutView.tsx` generalised to an author chosen property list per node. `delta` is the one thing CSS cannot answer: easing only when a value grew needs the signed change, which `useNodeTransitionCss` computes from this render's and the last render's reads and folds into the `when` gate's scope under that name (the plan's example is `delta > 0`). The delta reads the first property in the list the snapshot can answer: `size` reads width, `position` reads x, `opacity` reads opacity. A transition naming only tint, scale or colour has nothing to diff and gates on a delta of 0, which is why an absent `when` is the common case. The snapshot is committed after paint, so a render's delta reads what was on screen a moment ago.
`useEnterExit` handles a node's own `transition.enter` and `exit`: a repeat's count changing is a node appearing or disappearing, not a value transition. Arriving and leaving are not symmetric in React. An arriving node is already in `nodes` and needs one extra render to flip from its pre enter style to rest under a transition string, the standard two frame mount fade; one frame later the pre enter override drops and the already active transition eases it to rest. A leaving node is gone from `nodes` the instant its repeat stops producing it, so the hook keeps drawing a ghost at its last rect for exactly `exit.duration` ms. The pre enter override pulls opacity and scale toward rest; the exit override pushes them away for the ghost's whole window. A known, accepted limit: ghosts are keyed by node id, so an instance that exits and a different one entering with the same id in one exit window are not handled; `expand.ts` suffixes ids with the index, so this only bites an id an author reused by hand.
`useMotionClock` gives ms since the clock last turned on, the one shared clock every animation samples against (`packages/hud/src/engine/motion.ts` explains why one clock). `active` is computed by the caller from the same nodes list, so a document with no animations never starts a frame loop and the shipped HUD stays pixel identical with no new per frame cost. `override` is the editor's scrub and nothing else should pass it: a number parks the clock at that instant and stops the loop, which is how the editor shows 300 ms of ease out without saving and watching the game.
`useReducedMotion` reads `prefers-reduced-motion: reduce` live. The app honours it in CSS already; the HUD's own motion samples in JS, so there is no media query for the browser to apply. A looping animation is decorative by construction, a clock the document drives for its own sake, so reduced motion silences every animation entry regardless of its `loop` and holds the node at its rest keyframe. Transitions and enter or exit keep running: they carry real information (a counter changed, a heart arrived) over a short, non repeating span, the essential motion that accessibility guidance asks to keep.

### hud/compounds/HudNodeRenderer/behavior (node style: resolve-node-style and its helpers)

`resolveNodeStyle` turns `HudBoxStyle` into one `CSSProperties` object, the whole face applied to the wrapper every placed node mounts: background, border, radius, shadow and clip as plain CSS, plus outline and tint combined into one `filter`, since CSS allows exactly one. A ring or tint is a flat colour in practice (a gradient outline has no meaning), so a non string paint reads as opaque black and does not silently draw nothing. `styleToCss` is the CSS grade half: every numeric field is a value resolved against the same data scope the engine resolves size, scale and opacity against (`resolve-value.ts`, the same seam `packages/hud/src/engine/resolve-box.ts` uses). A paint is a flat colour, a gradient or an image; the image's repeat and size keywords are set apart from the CSS value.
The outline traces the ink of whatever the node draws, not its box, and the tint recolours that ink. The outline is stacked `drop-shadow`s in eight directions, cheap at one or two pixels and expensive beyond, so the width is capped at 2 px whatever a bound expression produces; eight directions read as a continuous ring at that width, and the stack works the same on a PNG or an SVG image because the browser rasterises either first. The tint is an inline SVG filter as a data URL (the same trick as the outline filter in `HudSprite`), not a hue rotate guess: a flood of the exact colour is composited against the source alpha (`replace`) or blended with it (`multiply`), then crossfaded against the untinted original by `amount`.

### hud/compounds/PauseAbilitiesPanel

The player's abilities and equipment. Game layout: tiles (1,21) to (19,29), 19 by 9 tiles with a 17 by 7 interior. Abilities come from `link_ability_flags` in a 3 by 2 grid: row 1 (y 22) is bit 7 LIFT, bit 6 READ, bit 5 TALK at tile columns 3, 8 and 13; row 2 (y 24) is bit 3 PULL, bit 2 RUN, bit 1 SWIM. Bit 4 is skipped by the original loop's outer shift. The gloves level sets the level suffix on LIFT (none is .1, Power Glove .2, Titan's Mitts .3). Equipment sprites sit on the bottom row (y 27): boots, gloves, flippers and moon pearl. Both rows align with the item grid above, starting at column 2 and 14 tiles wide. The A button mark sits in the corner and the DO label on the top border at column 2.

### hud/compounds/PauseBottlePanel

Shown when the cursor is on the bottle slot, in place of the progress and equipment panels on the right: a yellow bordered panel with all four bottle slots stacked and centred, the active bottle under the blinking selection circle. `BOTTLE_SPRITES` maps a bottle's content value to its sprite.

### hud/compounds/PauseEquipmentPanel

The equipped sword, shield and armour, plus heart pieces or dungeon items. Game layout: tiles (21,21) to (30,29), 10 by 9 tiles with an 8 by 7 interior. Row 0 is the label; rows 1 and 2 hold the sword, shield and armour (2 by 2 each, at columns 0, 3 and 6); row 3 is a dashed separator of eight dots; row 4 is the dungeon items label (in a dungeon only); rows 5 and 6 hold the heart piece indicator (overworld) or the map, compass and big key (dungeon). Dungeon item possession for the current palace is read from the bit masks shifted by half the palace index.

### hud/compounds/PauseItemGrid

The Y button item grid, 5 columns by 4 rows (20 slots), in a green border box with the Y button mark. Game layout: tiles (1,5) to (19,19), 19 by 15 tiles; each item is 2 by 2 tiles with one tile gaps, placed to match the SNES BG3 layout. The visual order is the save RAM index order 0 to 19. The ITEM label sits on the top border at column 2.

### hud/compounds/PauseNamePanel

The selected item's name with its icon above the text. Game layout: tiles (21,5) to (30,10), 10 by 6 tiles with an 8 by 4 interior. The icon (16 by 16 SNES pixels) and the name pack together, matching the original's fixed two row icon and two row name, with the name bottom aligned in its two rows. The ampersand is drawn across two native tiles in the ROM's own font, so its sprite is twice as wide. Every line shares one glyph size: the caller already broke the name onto this grid (see the view's `wrap-name`), so a line still wider than the box shrinks the whole name and every row stays at the same scale.

### hud/compounds/PauseProgressPanel

Pendants or crystals, depending on game progress. Game layout: tiles (21,11) to (30,19), 10 by 9 tiles with an 8 by 7 interior. Pendants: green (Courage, bit 2) top centre, blue (Wisdom, bit 1) bottom left, red (Power, bit 0) bottom right, from `link_which_pendants`. Crystals: seven icons from `link_has_crystals` bits 0 to 6 in rows of 2, 3 and 2, positions in tiles from the inner top left; each crystal is 2 tiles wide and 1 tall, and the middle row of 3 is inset one tile. The index order is the crystal bit order, so slot N shows bit N.

### hud/compounds/PauseGearScreen

Draws the equipment ladders and the passive row, with the hero beside them at three times native (this screen is about gear). How many ladders is the caller's answer: one row per entry of `ladders` (blade, guard, armour and arrows, in the order the cursor walks them), the passives under the last, and the box sized from that count. Three are upgrade ladders; the fourth is the arrow row, whose rungs are the two projectile types and not a rank, so it has no nothing worn rung. A row draws owned, worn and cursor, and what a press means is decided where every other press is decided.
The ladders are selectable, which the console's menu never allowed: a tier at or below the highest ever held can be worn again, so a player can drop to a weaker blade for a challenge run and climb back. The high water mark the view supplies makes that safe; ownership is never read off the live equipment, which only says what is worn now. The passive row (gloves, boots, flippers and the world charm, each held or not) is a readout: the cursor walks it like the ladders so there is no dead region, and having no tier to equip makes it the row that assigns the ACTION verb. Every cell reports a click the same way (move the cursor here, then confirm, the pad's confirm from a pointer), and what that confirms is not this screen's business; it used to check ownership and call the write itself, which gave the mouse a path the pad did not have. `hintLines` says what the row offers or why a faded tier cannot be chosen, already wrapped to the portrait column by the view.
Geometry is true scale in SNES pixels from the screen area's top left. The published plan measures the content at 152 by 88: a 40 pixel label column (wide enough for the longest ladder name at half a tile) plus five tiers on the menu's 24 pitch (16 by 16 art, like an item cell), and four rows on the same pitch. The bordered box is one tile larger on every side, 168 by 104 outside, unlike the items box whose published 152 by 104 is the outside measurement. The row count is computed, not constant: a fourth ladder makes five rows, so the box height (`gearBoxRows`, content height in tiles for `PauseBorderBox`) and the hint position follow the rows handed in, and at four rows they return the published numbers. The content height is the last row's art plus the pitch for the rest. The panel area runs from y 56 to the legend at y 208 (152 pixels); four rows take 104, five take 128. Width is unchanged: the five tier blade row is still the widest at 152, and the two rung arrow row is 80. The hero column starts one tile past the 168 wide box. The hint sits below the panel, half a tile clear of the box: a hint level with the frame's last row and centred in the 96 pixel portrait column grew back across the panel for any wider line, and the caller now wraps it to the column. At five rows the box ends at 128 and three lines of half tile text end at 150, clear of the legend.

### hud/compounds/PauseGearScreen/sub-components/PauseGearRow

One labelled ladder: a name, then its tiers left to right. All rows of the gear screen are this component. The upgrade ladders and the passive row differ only in what a cell means (a tier to drop to, or a thing held or not), and both answer the same two questions: is it owned, and is it in force. One shape keeps the cursor's left and right walk identical on every row. A cell's sprite is the file name without extension, empty for a nothing worn tier; owned means at or below the high water mark (a tier) or held (a passive); the worn tier keeps a steady one pixel frame so it reads apart from the cursor. `cursor` is -1 while the cursor is on another row. A tier above the high water mark draws as a silhouette like an unowned item cell, so the ladder's full length is visible from the start without saying what waits there. The cursor ring clears the 16 pixel cell by one tile on every side.

### hud/compounds/PauseHeroPortrait

Shows the player character as the game would draw them, wearing what the save holds and doing what the idler says. It is the same composer the sprite studio previews with, given the palette the core would hold (resolved for the armour and glove tier worn): change the armour tier on the gear screen and the portrait repaints on the next render, because the palette is a prop recomputed from live equipment. It draws one pose and holds no clock: the pose, the facing (`link_direction_facing >> 1`: 0 up, 1 down, 2 left, 3 right) and the frame (out of range wraps) arrive as props, chosen by a pure sequencer in the shared layer and ticked by the view, so the sequence table is testable without a canvas. `zoom` is whole steps over native size.
The pose atlas reserves a canvas big enough for every pose, so the box is larger than the standing frame and the padding is transparent; `POSE_ORIGIN` says where the character's own origin (the pixel the engine positions them by) sits inside it, so a caller can line the canvas up with a world position. With no sheet yet (assets loading, or a ROM with nothing compiled) the space is reserved so the screen never reflows. The pose canvas ships with the sprite studio's editor chrome, a checkerboard behind and a rounded hairline around; here the portrait is drawn at the live player's position over the running game, so both are reset, and the compound selector beats `.pose-canvas` on specificity whichever stylesheet loads first.

### hud/compounds/PauseItemsScreen

Draws the inventory: twenty item cells, four bottles, the hero and the name of whatever the cursor is on. Items are unstacked: the console shares one save slot between the digging tool and the wind instrument and collapses four bottles into one current bottle cell; here each of the twenty four has its own cell, which is why a slot can be assigned to a specific bottle. `buildItemCells` does the splitting; this only draws it. The bottles get their own bordered box because they are a different kind of thing (contents that change, not tools owned), while the cursor still treats them as the grid's next row, so walking down out of the grid lands in them. The name lines are the localized name already folded and wrapped by the view; the hint lines (the standing invitation or a refusal) are wrapped to the portrait column; the portrait is built by the view so this stays free of sheets and palettes. Clicking a cell moves the cursor; assignment is a separate press.
Geometry is the published plan's, in SNES pixels from the screen area's top left (the view places that corner): a 16 by 16 icon on a 24 pitch, six columns by four rows, so the grid content is 136 by 88 and the bordered box 152 by 104. The border box measures in whole tiles and adds a tile of frame per side, so the box sizes are content in tiles (17 by 11 for the items, 11 by 2 for four bottle cells). The bottle box sits one tile below the items box (104 plus 8). The hero column is 96 wide, one tile past the 152 wide items box; the name and then the hint sit under the portrait, and the hint is half a tile high so a long one still fits.

### hud/compounds/PauseItemsScreen/sub-components/PauseCellGrid

A run of inventory cells on the menu's 24 pixel pitch. The item grid and the bottle row are the same thing at different widths (six columns and four), so they are one component; the cursor walks from the bottom of the item grid into the bottles, and two separately built grids would drift apart on the pitch that makes that read as one movement. An unowned cell still draws its tier one sprite as a silhouette, never an empty hole, so the grid's geography is identical from the first pause to the last and the outline never says which tier is still out in the world. `showCursor` is false while the cursor lives in another section; clicking a cell only moves the cursor. The cursor ring is 4 tiles wide, one tile clear of the icon on every side.

### hud/compounds/PauseNavLegend

The strip along the bottom saying which button does what. Every glyph comes from the player's actual bindings, resolved through the glyph pack chain before it arrives; nothing is a hardcoded letter, because a menu saying press A to someone who moved confirm onto a shoulder is worse than no legend, and the menu verbs are rebindable. A control with no artwork falls back to its own text (usually a keyboard key with no cap sprite) and leaves no hole. An entry pairs one or two glyphs (two for previous and next screen) with the verb; its `id` is the stable key and `width` is the full play field in SNES pixels.
The strip is 398 by 16 SNES pixels along the bottom of the play field. Its height comes from the layout layer, because a bottom anchored HUD element must be placed clear of it and the two are drawn by files that cannot see each other; the wallet in the shipped layout sits in this band, flush with the bottom. The left padding keeps the centred pairs clear of the bottom left corner, from the same file the layout takes the corner's width from. It is a fixed promise and not a reading of the live layout: the chrome does not move out of the HUD's way, so a player who moves the wallet leaves the strip very slightly off centre. The plate stays the full field width and only the content starts clear of the corner. Glyphs are 12 pixels, leaving a pixel of air top and bottom; verbs are half a tile so six pairs fit a 4:3 field. Pairs are 8 apart, not the 12 they were: the strip shares its row with the 64 pixel corner reserve (334 of the narrowest 398 wide field) and can carry five pairs (SCREEN, MOVE, a confirm verb, ASSIGN, CLOSE), which on a d pad profile (four glyphs for MOVE) measure 294; twelve made 342 and ran past the reserve, eight makes 326 and fits every legend context, still four times the 2 pixels inside a pair. The dark plate keeps a verb readable over any play field.

### hud/compounds/PauseStatusScreen

Everything the save is on one panel, plus the two ways out of the game. Continue and Save and quit live here because quitting is a status decision, and a fourth screen for two buttons is one screen too many. They are the only cells the cursor can land on; the rows above are a readout. They are activated and never assigned: a button pressed on Save and quit either quits or does nothing, and never rebinds itself. `onConfirm` fires the row the cursor is on, the pad's confirm from a pointer.
This panel is Enhanced, so its hearts are the drawn ones, tinted by the armour tier as in the Enhanced HUD's life block. The caption is the row's only label, so it opts into the console's LIFE strip while taking none of the console's heart art. `armor` (0 to 2, `GameUIState.equipment.armor`, published by `usePauseMenu` as `data.armor`) is optional only so the host can add its pass through independently; without it every tier shows the armour 0 tint. Every progress mark draws whether held or not: an unfound dungeon item is its sprite as a silhouette, the item grid's rule, so the row's shape never changes. Heart pieces run 0 to 3, magic is raw power 0 to 128, pendants and crystals are bit masks from the save, and the dungeon items are the map, compass and big key of the current dungeon.
Geometry is true scale from the screen area's top left: the plan measures the panel at 216 by 144 outside its frame, 25 by 16 tiles of content (200 by 128) holding the rows and the two actions. Row labels are half height so the widest fits before the value column. The life block owns the top and is 25 tall. Full icons sit on a 24 pitch; crystals pack tighter, and a crystal's sprite is 16 by 8 so its row sits half a cell lower. Pendants draw in bit order red, blue, green. The two actions sit side by side at a full tile so they read as buttons. The row words are plain English constants, not name table lookups: the shipped table keys only the six pre composed label strips the console drew, and adding keys is a change to the language types in another part of the tree.

### hud/compounds/PauseStatusScreen/sub-components/PauseStatusRow

A label on the left and whatever the row reports on the right, on the screen's one shared value column. The status screen is a table, and rows that each computed their own left edge would drift by a pixel per row at these scales. `top` is the row top in SNES pixels from the panel's content origin, and `valueTop` nudges a value shorter than a full cell so it centres on the label.

### hud/hud-visibility.ts

Which game modes the main HUD overlay is present in: active gameplay and dialogue (where the native HUD shows too), plus `paused_menu` so the open and close slide can animate the HUD off screen. Everything else (intro and title, loading, full screen maps, flute and save menus, game over) hides the overlay.

### hud/hud.css

The pause cursor flashes 16 frames on and 16 off at 60 fps, a 533 ms cycle. The bottle panel expands from the bottom upward and collapses from the top downward, like `Hud_ExpandBottleMenu` and `Hud_EraseBottleMenu`.
The enhanced pause menu has no ground of its own: painting over the paused game hides what the player paused to look at, so the world stays visible between the panels and every readable part brings its own ground. Each rule is there because removing the backdrop broke something specific. `--hud-silhouette` is a surface's answer to what colour an unowned thing is. `HudSprite` defaults to the dark shape the gameplay cluster needs over bright terrain, and the pale one suits the menu's black panels, where a black silhouette is an empty cell. It used to be set on `.enhanced-pause` for the whole subtree, which was right only while a near black backdrop lay under all of it; with the backdrop gone the button chips are back over live terrain, so the pale tone is scoped to the panels, the only surface that is dark.
Text drawn outside a panel (the tab strip, the selected item's name, the assignment hint) now sits on terrain. The glyphs are light, so they take a dark halo: a filter and not a plate, because the game's font sprites are irregular and a rectangle behind them reads as a box. Inside a panel there is already a black ground, so the halo is off there, border tiles included. The halo is two rings: a single soft shadow is a smudge that loses to bright terrain, while the tight one repeated compounds into a near solid black edge (the read the HUD's sprite outline gives) and the wide one separates the word from what it crosses. The tight rings are stacked and not darkened because `PauseText`'s dim opacity fades the halo with the glyph. The tab strip also takes a faint plate, the one run of text with nothing near it and the one the eye finds first.
The item's name and the hint under it are the two strings a screen writes outside its panel, in the portrait column, so they take a plate on the column and not on the line: `PauseText` fades a dim line to 45% and would fade its own plate with it, giving the hint the weakest ground. The column box carries no opacity, so the plate stays at full strength under a deliberately quiet line. `:has(> div > img[src*="font-"])` is that column, the box whose children are runs of the game's font sprites, the same shape on the items and gear screens. It is scoped inside the screen area, so the legend and tab strip (which have plates) do not get a second one, and outside a panel, where the ground is black anyway.

### hud/hooks

`useHud` gives the HUD's data and sprite config. All HUD layout is in SNES pixel units (native 256 by 224, tiles of 8) multiplied by the scale (1 SNES pixel is `scale` CSS pixels); the original top bar is 32 SNES pixels (4 tile rows). `items` is the 20 item slots used to pick the equipped item's upgrade tier sprite, and the max fields are what each counter can reach now, with upgrades and settings counted.
`usePauseMenu` gives the pause menu's state from the game UI store, mirroring `useHud`. Pendants and crystals are bit masks (bits 0 to 2 and 0 to 6); sword 0 to 4, shield 0 to 3, armour 0 green, 1 blue, 2 red; gloves 0 none, 1 power, 2 titan; boots, flippers and moon pearl 0 or 1; `abilityFlags` is `link_ability_flags`; crystals show once the progress indicator reaches tier 3, where the dark world opens (see `progress-tier.ts`); heart pieces 0 to 3; the palace index is doubled; bottles are 4 slots of values 0 to 8.
`useLocationNotification` subscribes to map changes in the game UI store and fires screen and transition notifications through the location notification store; call it once in `GameOverlay` so the subscription lives for the session. It only acts when the room or screen changed and deduplicates against refs for the first mount and rapid renders. A screen notification fires only when the location changes (same zone, no notification) and dismisses after 3 s; a transition notification is a name change within the same location and dismisses after 2 s. Location notifications belong to the in progress navigation feature and are switched off until it ships.

### hud/views/DeliveryQueueIndicator

A bottom right overlay showing the delivery queue, visible only when items are queued. It shows up to 20 items, with a more in queue line beyond that. Known source types have their own colours (cheat amber, randomizer purple, network cyan, system grey); player sources (`player:Name`) are teal and show the name after the colon, and unknown sources are soft blue.

### hud/views/LocationNotification

Animated screen and transition banners at the bottom centre of the game overlay. A banner slides in over 300 ms and fades out over 400 ms, starting the fade before the auto dismiss clears the store.

### hud/views/HudUnavailableNotice

Replaces the main HUD overlay when it cannot draw its sprites, which has one cause: no extracted sprites for the active ROM. It used to have a second, the Modern style having no renderer, but Modern draws the same HUD as Enhanced. Plain HTML, informational only.

### hud/views/HudView

The Original style HUD. One game pixel in CSS pixels is measured against the canvas's native height, which already counts the rows a tall view adds and the 240 line mode's sixteen, so a game pixel is the size the core drew it at in every shape. The content is centred at the chosen ratio's width ('match' uses the full container, and a ratio can never be wider than the screen) and placed against the rendered frame on both axes: the left and right groups sit two tiles in from its edges and the bar 1.75 tiles below its top, so a wide view spreads the groups and a tall view puts the bar over the rows it adds, and the pause menu it slides against measures the same way. The left group is the magic meter, the item box and (in original count layout) the counts; the centred layout puts the counts in the middle; the life sits on the right.
A key count of 0xFF means no key display. The rupee counter needs a fourth digit once the Larger Wallet cap raises it past 999. A bow value of 3 or more means Silver Arrows, as `Hud_Update_Inventory` in `hud.c` reads it. The life uses `heartArt="sprite"` and the caption because the Original style replicates the console's bar from ROM sprites. The countdown of the digging game and the Super Bomb draws at the bottom centre and draws nothing until one runs.
`useHudCountdown` feeds the game's countdown reading into the countdown store and returns the tracked result. `HudCountdownSlot` places the countdown at the bottom centre of the content box while the game counts down and fades it in and out over 400 ms; the pie stays mounted through the fade out with its last reading. The bottom gap is two HUD tiles (the HUD's side margin), measured to the disc, which sits inside the pie box by its empty rim; it follows the HUD scale, so it is set inline.

### hud/views/DialogView

The enhanced message box. It reads the core's dialog mirror through the dialog store and the look from the dialog settings store, and draws the frame and rows over the canvas in either HUD mode. Skipped messages never show: with skip dialog on, only a box that waits on a choice is drawn. Nothing is drawn for a message the core is still drawing itself, which is how a setting changed mid message lands: that message stays native and the next one is ours (`dialog_suppress.c`). A save state load that brought the mirror back shows its message where it was saved; one that did not leaves the store stale until the next message, and nothing is drawn. The box fades in when a message starts and fades out on its last content when it closes, so the last shown frame is kept while it fades.
Message 0x112 is the legend told over the pictures, the story crawl's first part (`attract.c` loads it by this id). Messages 0x184 and 0x185 are the spawn picker on starting a game or continuing after death, without and with the mountain spawn (`misc.c`); the spawn picker always floats on a faded ground whatever border the player chose. Message 0x1F is Zelda's telepathy in the opening at Link's house, her call while Link is still in bed (the uncle raises it).
A drawn border and its corner marks take room the game's one tile inset never had to give. The game's box keeps its one tile inset; a drawn border needs a little side air past its ring, more with corner marks so the rows clear them, and only a sliver above and below. Screens the game lays out around their words keep the game's text position and size: the game over menu (the fairy points at each row) and the story crawl (placed over its scene, moved by layer scroll). A talk box always has a ground. The legend told over the pictures and the game over menu never do; the later story scenes do, always faded at the edges. A borderless message such as telepathy follows its setting, with the opening telepathy at Link's house on a setting of its own. The glyph atlas is cached per font and palette; asking per message catches a language switch or a colour line.
`pickerItemSprite` gives the sprite of the item the throw picker has selected. The picker index walks the save block from the Bow on: 0 to 19 are the item slots, 20 to 23 the Power Glove, Pegasus Boots, Flippers and Moon Pearl, 25 to 27 the sword, shield and mail, and 28 to 31 the four bottles by their contents. Index 24 is a byte the game never fills. Bombs hold a count, so any count shows the one bomb sprite.
`useButtonGlyphs` resolves a prompt's buttons to pictures of the input the player is using: the active input profile's binding for each SNES button. It follows profile switches and controllers plugging in or out, so a prompt already on screen updates. A profile picked on the Controls screen changes the manager without an event, so each call reads it fresh, and the version counter re renders for the changes that announce themselves.
`useChoiceLatch` holds the wait a message is on through a choice redraw. Moving the cursor makes the engine load the menu's other message and retype it into the same box, so for a few frames it reports typing and no choice. Once a box has asked for a choice it keeps asking until a new box starts or it parks on a plain next or close wait, which is what the prompts and the skip rule need to see. `useOpeningMessage` gives the message a box opened with: a menu that redraws on a cursor move loads other messages into the same box, so the id on screen stops naming the menu while the first one still does.
`useDialogGeometry` gives the box layout in CSS pixels: the game pixel layout from `box-geometry`, placed by the overlay's scale. A box that follows its rows keeps the layout it had once a scroll starts, because the rows in use change under the box mid scroll; the frame never changes size while the rows slide, and the next still frame lays it out again. The text width is in game pixels with magnification included; `unit` is CSS pixels per game pixel for the text and `tile` for the frame tiles. The padding is in game pixels between the frame and the text, and a native layout moves with the text layer's scroll as the game's text does.
`useDialogScale` maps game pixels to CSS pixels the way `HudView` does: the scale comes from the container height against the canvas's native height (the canvas buffer is twice the native height, 448 for 224 lines and 480 for the 240 line mode), the 256 pixel screen sits centred inside a wider canvas, and the picture starts below any lines the view adds on top, shared with the HUD so the two cannot drift apart. The renderer draws output row r from scanline r plus 1, as the hardware does (`ppu_runLine` skips line 0), so every background tile shows one game pixel above its tile coordinate, and the box follows the text.
`useFadePresence` keeps a thing mounted through its fade out (140 ms by default). `shown` says whether it should be on screen; the hook answers whether to render it and at what opacity, so a box that just closed stays for the fade with its last content, and a box that just opened mounts at zero and rises on the next frame so the transition has a start value.
`useHighlightLook` gives the two highlight colours of randomizer messages as the box paints them, snapped to the game's 15 bit colours first, the same words the core draws the native box with, so both boxes match. Original glyphs get an atlas per colour; the modern face gets the colour as ink. Index 0 is the primary span and index 1 the secondary. The atlases are asked per message, like the plain atlas, so a language switch or a new palette is caught.

### hud/views/HudLayoutView

The app drawn HUD: a document of nested containers, solved against the display it is on and drawn. It is the only tier here allowed to touch a store, and it touches three: the layout store for the document, the control scheme store for what each numbered slot fires, and the game UI store for what the save holds. Everything below is bare and presentational, which is why the whole HUD can be previewed in the layout editor without a game running. There are no fixed elements and nothing here knows the name of one: the layout is a tree, `usePlacedLayout` turns it into rectangles in SNES pixels against the real view, and `HudNodeRenderer` draws them at the display scale. A layout survives a resize, a change of aspect ratio and 240 line mode without being re authored, and it reflows: a save with three heart containers closes the gap under them.
The button map is the one part that comes and goes. The pause menu pins its own copy to the right column, so this one stands down while the menu is up, and the layout's own reveal rule can hold it off screen until something about it changes. The rest is drawn unconditionally, because vitals and wallet stay readable with the menu open. Whether the menu is up is asked of the core's own view of the menu, not of the pause store: the hold is in force and the native menu module is running. The data scope every bound value, repeat and switch reads from (`packages/hud/src/data/variables.ts`) is built from the same vitals object the renderer gets, so the two never disagree about the save. `showAllChips` holds the cluster on screen regardless of the reveal rule, for a host showing the HUD and not playing under it; it no longer decides which chips are drawn, since every assignable button is drawn everywhere so a player can always see where an item could go. `slideTransform` and `slideTransition` let a host slide this HUD with a pause animation; the host drawn pair does not, because its menu's chrome is measured around the HUD, which holds its place while only the button cluster stands down.
`countdownContentOf` splits the tracked countdown into what a `countdown` node draws and what the data scope reads (section 62); it is pure so the path from a parsed reading to a placed node is testable with no store and no DOM. `frames` is the game's frames left in this second, which the track does not keep; the seconds are the track's, so the scope and the pie agree. `useCountdownContent` feeds the same store `HudView`'s countdown slot feeds (`hud-countdown-store.ts`), so the length a countdown started from survives the HUD unmounting on the map screens; feeding it twice with one reading changes nothing.
`deviceFamilyOf` says which device family a bound slot list came from. The glyph chain needs a family so the auto pack can follow the pad in hand, but the control scheme store carries bindings and not hardware, and asking the SDL device list would put an IPC round trip in a per frame render path. Slot icon keys are family stamped by construction (`xbox-a`, `ps-cross`), so the answer is in hand. The icon is asked first, because it is the only thing that describes the device; the binding describes what one control was rebound to read, and asking it first once let a single slot moved to a keyboard key turn the whole cluster into key caps. The binding only counts for a slot that names no position (a keyboard profile's slots, which SDL never enumerates). The family most slots vote for wins, so one rebound control cannot outvote the pad it sits on. The prefixes are ordered so a short one cannot shadow a longer key. With no vote, the profile's declared family is the backstop, then `generic`.
`declaredDeviceFamily` reads the active input profile's own declared family. A generic or unrecognised pad names its controls with family less icon keys (`generic-btn`), so the slot list says nothing about the hardware, but the profile has known the answer since the device was assigned. It uses `peekInputManager`, never `getInputManager`, because it runs in a render path and the getter constructs and starts the engine; a HUD drawn before the engine exists must get null. Reading without subscribing is safe: both readers call it inside a memo keyed on the resolved bindings, which the engine rebuilds and rebroadcasts on every profile change and device snapshot (`rebuildSchemeBindings`).
`useClusterVisibility` says whether the button cluster is on screen. `on-change` is the reason it is a hook: the cluster is a reminder and earns its space only when something about it changed (an assignment moved or a different pad was picked up), then gets out of the way after 2 s, long enough to read four chips and gone before the next room. The first signature is not a change, or loading a save, opening the pause menu or resizing the window would look like a rebind. A document with no rule means always.
`useGlyphPacks` gives every glyph pack the resolver should see, the shipped ones plus the profile's own, with their images primed. A custom glyph needs both its pack in the list `resolveGlyph` walks and an object URL `HudGlyph` can read synchronously; both are async and neither is useful alone, so priming happens before the state update and the first render that sees a custom pack can draw it. The shipped packs are the initial value so the cluster has art to draw on the first frame.
`useHudViewport` gives the display scale and the play field size in SNES pixels. The scale comes off the canvas's own native height, not a constant, because the core can run in 240 line mode and a hardcoded 224 would leave the HUD a few percent oversized exactly when the extra rows show. The width derives from the same scale, so a wide display reports a wide play field and an anchored element keeps its corner.
`placeLayout` solves the document and splits it into the button map and everything else. Two surfaces draw the same document at once and disagree about one part: the gameplay HUD draws all of it, while the enhanced pause menu draws its own copy of the button map pinned to its right column with the vitals and wallet left in place. The map is separated by what it contains, not by name: a band holds the button map when something in it draws a numbered slot, so a custom layout is treated like a shipped one. A band is a direct child of the screen, what a `regions[]` entry became in section 42; `layoutHudBands` reads the groups off one layout pass, because a child of a grid cannot be placed alone. The screen's own row rides with the rest, being the ground the layout sits on. `bounds` is the union of the map's ink (elements, not containers, whose box can reach past their children), item overhang included, so there is no second measurement of the cluster. `usePlacedLayout` memoises on `ctx` by identity, so a caller memoises it over the values it is built from.
`useSlotContent` is the live half of what a placed layout draws: what each numbered slot fires, whether the save holds it, and which artwork its control wears. The arithmetic is `buildSlotContent`, pure and shared with the editor's preview; this hook only reads the stores, which stopped the editor and the live HUD disagreeing about a rebound button. Every slot is answered for, in gameplay as in the pause menu, because the map answers what is left and a map that hid empty buttons could not. The player's own packs are included or a custom pack would resolve against a list it is not in. The control scheme slice (contract section 10) is declared structurally so the dependency is a shape, not a coupling.
`useVitalsContent` gathers everything the vitals draw from: the game's counters, the two display preferences that change how a counter reads, and the armour tier, which is equipment and tints every heart. Health is stored in eighths of a heart, and bow tier 3 and up is the silver art, as the console reads it. `hearts` comes back with them because it decides a size: the life block grows a row per ten containers, so the layout pass needs it as context.

### hud/views/PauseMenuView

The pause menu drawn from extracted sprite tiles. A CSS grid of 32 by 28 cells (one SNES tile each) lays out five panels matching the SNES BG3 tilemap, with the 24 pixel BG3 scroll offset (tile row 5 in BG space is visual row 2, three tiles up): items (1,5) to (19,19), 19 by 15 tiles; name (21,5) to (30,10), 10 by 6; progress (21,11) to (30,19), 10 by 9; abilities (1,21) to (19,29), 19 by 9; equipment (21,21) to (30,29), 10 by 9. On a widescreen view the 256 pixel BG3 content is centred. The canvas buffer is always twice the native height (448 for 224 lines, 480 for the 240 line mode), so the scale matches the game's pixel size. `GRID_TO_SAVE` maps a grid slot to its save RAM index (`kHudItemToItemOrg` in `hud.c`), for cursor navigation and not for display order.
Slot 15 holds a bottle index, so the bottle's own content is swapped in for display. On the bottle slot, a bottle panel replaces the progress and equipment panels with an expand and collapse animation of about 300 ms in 18 steps, matching the SNES 18 frame expand. Names come from the active profile's language set with English defaults behind it, then are folded to drawable glyphs and wrapped onto the panel's column grid. When the core has not exported `link_ability_flags` (byte 81) yet, the ability flags are derived from equipment: bit 7 LIFT from gloves, bits 6 and 5 READ and TALK from the Book of Mudora, bit 3 PULL always, bit 2 RUN from boots, bit 1 SWIM from flippers.
`itemNameKeyForSlot` maps a save RAM slot to a name record key, a record id plus tier (tier 1 is the base pickup), which the name dataset is keyed by; names stay in the data layer so a language set can retitle them. `SLOT_RECORD_IDS` is the base record per slot 0 to 19 in save order. Three slots read their value: one upgrade is a second tier of the same record, two are a rename to a different record, and the rest only recolour their icon and keep the base record at tier 1.
`loadNameTable` resolves the name table the running profile displays names from. Two lookups sit behind one call: the profile's language set id and that set's name table (which pulls the whole set off disk). Both are memoised per key at module scope as pending or settled reads, so two callers in one tick share a lookup, reopening the menu never touches storage again, and a profile switch resolves the new one once. It returns null when there is no profile, no set selected, or the set cannot be read, and the caller answers each with the built in defaults.
`useLocalizedNames` resolves display names against the running profile's language set. English is the floor: each lookup falls back per key to the built in defaults when the set is absent, still loading, missing the key, or holding an empty string, so a half translated set shows its translated entries and English for the rest. A tier fallback stays inside the chosen language first, because an untranslated upgrade name reads better as the translated base name than as English. The profile id is read at render and not subscribed to: it is set when a game starts, and the menu only exists while one runs.
`wrapName` folds a display string to the characters the name panel can draw and breaks it onto the panel's grid (8 columns, 2 rows for the name; lines wider than a row are shrunk by the panel). The panel composes text from one sprite per character, and only A to Z, 0 to 9, space and the ampersand (double width, two columns) have one; anything else would draw as a gap. So a letter with a diacritic folds to its base ASCII letter (NFD splits it into base and combining marks, and uppercasing first also expands the ligature like cases), the few letters with no canonical decomposition are mapped by hand in both cases, dashes and slashes become spaces so they still offer a break point, and the rest is dropped. Drawing real accented glyphs needs new sprites and a new draw path and is out of scope. Wrapping is greedy: a word moves to the next row when it no longer fits and the final row keeps what is left; every name that used to carry a hand placed break still breaks at that space. Only a lone word wider than every row combined is broken mid word, since it cannot be shrunk into anything readable. An empty name yields one empty row so the panel keeps its space.

### hud/views/EnhancedPauseView

The host owned pause menu: three screens under one chrome, drawn at true SNES scale over the running game. It is the only tier in the feature allowed to touch a store, and it touches four: the pause machine for where the cursor is, the control scheme for what the buttons fire, the layout store for the cluster's shape and glyph pack, and the game UI store for what the save holds. Everything below is bare and presentational, so the screens can be drawn from props alone. The chrome never moves: three screens need about 312 by 264 SNES pixels against the 310 by 160 the menu area has, so they take turns while the tabs, the legend and the cluster column stay where they are. The cluster is held on the right with every assignable button drawn, assigned or not, because a player looking for somewhere to put an item has to see the empty buttons; this is where the menu deliberately disagrees with the gameplay HUD. Scale comes off the canvas's own height so the menu stays pixel aligned with the game in 240 line mode too.
It performs no writes of its own: a click lands as the same `PauseEvent` a pad press does (focus, then confirm), and the store performs whatever that means. The view once held the bridge for a gear tier, which left a pad player able to move onto a blade and press confirm to no effect. The menu has no ground: everything readable carries its own (opaque panels, the legend's plate, a dark halo on loose text, see `hud.css`), and the portrait is the live character drawn at their own screen position with the game's sprite suppressed underneath (`PauseHeroLayer`). The view draws the browsing position from `useVisibleBrowsing` and not `state` directly, because `closing` names no screen. It solves the same document the gameplay HUD draws, once, and pins only the part that draws numbered slots to its own column wherever the layout puts it, so a player who moved their buttons still finds them, with no second copy of the map's geometry. The name `EnhancedPauseView` is the product's name for this menu and is kept because `GameOverlay` in the app domain imports it.
The published chrome: a top strip for the vitals, a 16 pixel legend along the bottom, and a column on the right for the button map, leaving the screens 310 by 152 at 16:9. The column is no longer a number: it was an 80 pixel reserve with a comment claiming the cluster was 72 wide, false since the d pad group was added (contract section 15.5, open item 3); the menu now pins the map by its own measured bounds, and only the two insets (8 from the right and the top, like every fixed element) survive. The top strip is 56, not the 48 first published, because the vitals reach y 44. The tab strip sits beside the vitals, not under them: the vitals are an L, two 80 wide rows down the left (hearts 6 to 22 at a full block, the meter 28 to 44) with the 30 wide counts column beside the hearts at x 94, reaching x 124 and y 44. The panels start at y 56 and the strip is 9 tall (a 6 pixel glyph, 2 of padding, a 1 pixel underline), from y 46 to 55. A vertical answer cannot work: when the counts stacked under the meter the block reached y 74, eighteen pixels past the panels' origin, and the column has only eight pixels of slack (the bottle box ends at 200 and the legend owns 208 to 224). Beside the vitals there is room: the strip is 106 wide (ITEMS 30, GEAR 24, STATUS 36, two 8 pixel gaps) from x 132 (8 plus 116 plus 8) to 238 in a menu area that runs to 318, and the two rectangles are disjoint on X, so the life block growing to a second heart row can never reach it.
The menu wording is uppercase A to Z only, because the menu draws text from the game's font sprites (letters, digits, space and the ampersand). A hint line holds 16 characters: the 96 pixel portrait column divided by the half tile glyph; a centred line wider than that sticks out both ways and runs back across the panel, so hints wrap to it. The gear screen's two assignable rows (the blade and the passives) say so, because they are the only home the two gameplay verbs (the swing and the reach) have. A refusal stays up 1.6 s. The legend verbs read left to right. MAP was dropped because the map button raises no menu event (`menu-edges.ts` emits none), and CONFIRM because the word never answered what a press would do; a confirm's verb is keyed by the confirm rule's own answer (equip, remove, activate), so a new outcome cannot reach the strip without a word. The assign row names no button, because any button the menu is not using will do.
`heroScreenPoint` turns world position into screen position for the one sprite the menu draws itself. The engine writes `link_x_coord - BG2HOFS_copy2` into OAM (`player_oam.c`), so the screen position is the world position minus the camera, but the rendered view is not the camera: a wide or tall view renders a band on each side and, under the camera lock, shifts by `cameraLockShift`, so the canvas origin is the camera minus the lock shift minus the side budget. That is the origin the navigation overlay anchors against (`buildDrawContext`); an overlay that subtracts the bare camera drifts as the view re centres. The result is in SNES pixels from the rendered view's top left, the space `useHudViewport` reports. `useHeroAnchor` reads it once per open and again when the save's `linkX` and `linkY` move, which under a held menu is never; the store's copy is only the trigger, and the answer comes from the viewport query, which reports the position and the camera from the same frame. A refused or not yet running query reports zeros, and drawing the character in the corner is worse than not drawing them.
`useHeroIdle` is the clock behind the idle sequencer in `@shared/game/logic/hero-idle`, which is pure and knows only what a clock value means. It counts in game frames (sixtieths of a second) because every hold in the sequence table was transcribed from the engine's per frame counters. It re renders only when the drawn pose changes: the clock ticks at the display rate (120 or 144 here) while poses change about fifteen times a second, so the setter returns the previous object when nothing moved. Before the first tick the character stands facing the viewer. The take is re rolled on every open; re opening onto the closing pose looks like a paused video.
`useHeroWearing` gives what the character wears and the palette that shows it. The core keeps armour and gloves as two small numbers, and `resolvePalette` mirrors PushBank in the C player sprite hook, so the sixteen colours are the ones the PPU would hold and a tier change on the gear screen repaints the portrait in the same breath. Armour tiers map to the first three outfits; the fourth outfit is its own art. The sheet is the profile's chosen sprite over the stock one, with the stock palette behind a tiles only container so an imported sheet is never colourless; it loads in an effect because it is a one shot read of a file that cannot change during a game.
`useGearModel` builds the gear screen's rows. Selectability is the high water mark, never the live equipment, which is why the ladders can be walked down; the mark lives beside the profile's other JSON and not in the save, because every byte of a cartridge save already means something. Passive sprites resolve through the record dataset so the game's item names stay in the data layer where the copyright gate expects them. Only the lifting pair has a second tier, and an unheld passive draws its tier one art as a silhouette. The launcher's byte carries which arrows and whether any are nocked, so the arrow row's rung is the type read back out of it.
`useItemModel` splits `buildItemCells` (twenty four cells from twenty save slots, the split tool and instrument pair, the four bottles, and the tier one silhouette) into the grid's twenty cells and the bottle row's four, and looks up the selected cell's name through the same localized names and fold and wrap as the original menu. The bottles follow the twenty item cells in the cell index.
`useLegendEntries` builds the bottom strip from the player's actual bindings; no letter is hardcoded, since every menu verb is rebindable and a legend saying A to confirm would be wrong the moment confirm moved. Each verb resolves binding to position to glyph through the same pack chain the cluster's chips use, with the player's own packs included (contract section 12, gap 3), so strip and chips never disagree. A stick claims no SDL button position (which frees the d pad for slots), but for the legend it is a visible control, so an axis maps to its own axis position (`LEFT_X`, `LEFT_Y`), which every pack answers with the neutral stick art, and never to the stick click, whose glyph means pressing the stick in. Both axes of one stick share an entry and collapse to one glyph. The strip says what this cursor can do: every row is asked of `pause-menu-store`, which answers from the same rules the presses are planned through (`confirmVerbAt`, `assignTargetAt`, `firstSectionOf`). Navigation and CLOSE are true everywhere. `canConfirm` from `useVisibleBrowsing` and the store's cursor actions are two readings of one rule; where they disagree the confirm row is dropped, because a strip one verb short for a frame costs nothing and a strip promising a dead press costs the player the try. A control no pack draws shows its own text, folded to the letters the font can draw.
`usePauseAssign` is the mouse's way of putting the cursor's thing on a button, plus the hint line. A click dispatches the same `slot` event a pad press raises, so both go through `planAssignment`. The wording and the refusal flash are this hook's own: the store only counts refusals, and the flash must clear itself or it becomes a permanent label. The standing line is per section: the item grid, the blade ladder and the passive row each put a different thing on a button, and the guard and armour ladders accept none. The hint is wrapped here, through `wrapName`, to the 96 pixel portrait column every screen centres it in, with one row more than the longest line needs, because `wrapName` keeps whatever is left on its last row.
`usePauseCursor` is the mouse's half of the menu: land the cursor, jump to a screen, fire what it landed on, each a `PauseEvent`. A click uses the machine's `focus` event, which still lands through `clampCursor`, so it cannot reach a cell a d pad could not. A tab click raises the screen verb, because a screen opens where it opens (on the worn blade, not the no blade rung); sending cell zero once let a click on the GEAR tab arm a confirm that would have unequipped the sword. A gear tier and save and quit are now both `confirm`, so the rule for what a confirm means is asked in one place.
`useStatusModel` gives the dungeon row: map, compass and big key for the current dungeon. The flags are 16 bit masks with dungeon 0 at the top, and the palace index is doubled, so the test is the core's: shift the mask up by half the index and read the top bit. Outside a dungeon (palace index 0xFF) all three are silhouettes, so the row keeps its shape.
`useVisibleBrowsing` separates what the menu draws from what the machine is doing. `closing` carries no screen, section or cursor, but the menu is on screen for the whole 483 ms slide out, and falling back to a default there swaps the panel to the item grid on its way off (the tab underline jumps, the ladders become the inventory, the name changes, the legend drops CONFIRM). So the view keeps the last browsed place, including the confirm answer, until the layer is gone. Assigning during render is safe because the value is derived from this render's state and the write is idempotent.
`PauseHeroLayer` draws the character where they stand, at the live player's screen position from `useHeroAnchor`, never a constant; the camera keeps them near the middle, which looks like a layout choice but moves with them. The game's sprite is suppressed underneath while the layer is up (`HostMenu_HidePlayerOam`, `host_menu.c`), and the character draws at native size so it registers with the world. It is a sub component because it re renders about fifteen times a second and the view does not. Its outer box is mounted whether or not the menu is open and carries `counterTransform`, the exact inverse of the menu's slide with the same transition, so the character stays on their spot during the animation; it must exist before the slide starts or the cancellation would be a frame late. The idle clock runs only while the menu is open.
`PauseScreenHost` picks which of the three panels is on, which keeps the view about stores, and lets the screens be exercised with every value as a prop. No screen draws the portrait any more; the columns stay reserved because the name and the hint are laid out against that width. The status vitals carry the armour tier so the panel's hearts match the main HUD. The hint lines are chosen and wrapped by the view, and `onConfirm` fires the cell the cursor is on, one door for every screen.
