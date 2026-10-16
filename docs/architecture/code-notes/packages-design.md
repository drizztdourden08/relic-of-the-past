<!-- @layer docs @kind doc -->
# Code notes: packages/design

Facts about `packages/design` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/design/game-text/font/game-font.css

The dialogue face is a community recreation of the game's font by Patrick H. Lauke, under Creative Commons Attribution 3.0. It is close to the font a language pack carries but not identical. A surface that measures a line reads the pack's width table, which holds the game's own numbers, while it draws with this face. Measured against one pack's table, 67 of the 73 characters checked advance by the same amount. Six differ, in game pixels:

| Character | Pack width | Face width | Difference |
|-----------|-----------:|-----------:|------------|
| `I` | 5 | 3 | drawn as a bare stem where the pack has a serifed form |
| `i` | 5 | 3 | the same bare stem |
| `Q` | 6 | 7 | one pixel wider |
| `:` | 3 | 5 | two pixels wider |
| `"` | 8 | 5 | three pixels narrower |
| `>` | 8 | 6 | two pixels narrower |

The pack's table stays the source of truth, and every surface keeps billing each character out of it, so the numbers a translator steers by remain the game's. The effect is visual and limited to these six characters: their ink sits up to a game pixel and a half off centre in a cell sized for the real character. A cell centres its ink for that reason. Centring halves the error, while parking the ink at the left edge puts all of it on one side. Closing the gap takes a new asset, a face whose glyphs are the pack's own, and no code change.

## packages/design/src/compounds/Gate/Gate.tsx

Every page outside the member frame (sign-in, waiting for access, a device code, loading, unreachable, not found) is this one Card on the palette's dark gradient, under the rotp mark and the site wordmark, which link home.

## packages/design/src/compounds/GroupChips/GroupChips.tsx

A group with neither marker (by hand, Discord) is the default group a GitHub collaborator falls back to.

## packages/design/src/compounds/HookshopHighlight/behavior/bag-effects.ts

The effects are placed from points on the bag, in bag pixels, so they follow it whatever its
angle. Two stars sit off its top right and bottom right corners. Three speed lines start just off
its right side, bright end first, and fan out by their `spread` as they trail away opposite the
pull.

## packages/design/src/compounds/HookshopHighlight/behavior/near-side-of.ts

The half of the plane on the left of the line from `a` to `b`, as a polygon reaching well past the
scene (`FAR`). It is the hookshot's clip.

## packages/design/src/compounds/HookshopHighlight/behavior/scene-layout.ts

The mascot leans back and holds the hookshot in its right pod. The chain leaves at a fixed angle
and bends along an even arc. The bag is placed so the head's point lands just past the front
face's left edge at mid height, whatever the angles are, and the hookshot is clipped along that
edge. The bag travels back along the chain, so the speed lines trail the other way.

## packages/design/src/compounds/HookshopHighlight/HookshopHighlight.constants.ts

Sizes and anchor points of the parts, in each part's own pixels; they describe the SVGs in
packages/design/art/hookshop, so a redrawn part changes its numbers here. `scale` is the size of one part
pixel in mascot pixels: the bag is drawn at four times the mascot's resolution, and the stamp
(the app logo) at the bag's own size, so one logo pixel is one bag pixel. The bag is drawn in
perspective, so its front's bottom edge is not level: `stampAngle` is that edge's angle, measured
on the art, and the stamp sits square to it. `frontEdge` is the outer side of the front face's
left outline, which the hookshot's head vanishes behind. The logo build script loads this file and
`packages/design/src/compounds/HookshopHighlight/behavior/scene-layout.ts` by path, so both keep their names and exports.

## packages/design/src/compounds/HookshopHighlight/HookshopHighlight.tsx

The mascot pulls a shop bag in with its hookshot. The mascot and the hookshot are built from their
own pieces; this component places and turns them from the layout, and the sparkle, the stars and
the speed lines exist only here. The hookshot crosses the bag's side and is clipped at the front
face's edge, so its point goes in behind the front. The stars are drawn before the bag so it
covers part of them. The stamp sits inside the bag's box, so it turns with the bag. `pixelSize`
is the size of one mascot pixel in CSS pixels, and every length is a count of mascot pixels times
`--px`, so the whole scene scales from that one value.

## packages/design/src/compounds/Hookshot/behavior/hookshot-curve.ts

The curve of a hookshot held by its grip at `grip` and fired at `angle` degrees: the chain runs
`length` pixels and its end has turned `bend` degrees further, in an even arc.

## packages/design/src/compounds/Hookshot/behavior/hookshot-layout.ts

Links hang pin to pin, each turned to its own chord, alternating face on and edge on like a real
chain; the face on links come first, then the edge on links that pass through them. The handle
and the head are each turned along the curve. `tip` is where the head's point lands.

## packages/design/src/compounds/Hookshot/behavior/pin-chain.ts

The curve is sampled into a fine polyline, then stepped pin to pin so every link is a straight
chord of one length. A longer step runs off the end and a shorter one stops short, so a binary
search finds the step that just fits, and the last pin lands on the curve's end.

## packages/design/src/compounds/Hookshot/Hookshot.constants.ts

Sizes and anchor points of the hookshot sprites in packages/design/art/hookshop, in mascot pixels. A redrawn
sprite changes its numbers here. Both links hold their pins the same distance apart, so faces and
edges alternate along one pitch. The logo build script loads `packages/design/src/compounds/Hookshot/behavior/hookshot-layout.ts` by
path, so that file keeps its name and its `layoutHookshot` export.

## packages/design/src/compounds/Hookshot/Hookshot.tsx

Handle, chain links and head, each its own pixel art sprite, laid along a cubic Bezier `curve` in
mascot pixels. The links follow the curve pin to pin, so any path works without redrawing the
art. The handle's muzzle sits on the curve's start and the head's back on its end. It fills its
positioned parent and sizes itself from the parent's `--px`, the size of one mascot pixel. Only
the part inside `clip` shows, which is how the head can vanish behind something.

## packages/design/src/compounds/Mascot/behavior/mascot-layout.ts

The pods sit behind the body. The eyes move inside the visor whole pixels at a time, so they stay
on the grid.

## packages/design/src/compounds/Mascot/Mascot.constants.ts

Sizes and places of the pieces in packages/design/art/mascot, in mascot pixels. `at` is the piece's top left
corner on the body (the eye has one per eye), and a pod's `pivot` is the point it turns around,
in its own pixels. A redrawn piece changes its numbers here. The logo build script
(`apps/desktop/public/logos/build/compose.mjs`) loads this file and `packages/design/src/compounds/Mascot/behavior/mascot-layout.ts` by
path, so both keep their names.

## packages/design/src/compounds/Mascot/Mascot.tsx

Sentri, the mascot, is built from pieces: body, visor, two eyes and two pods. The eyes look
around (x from -2 to 2, y from -1 to 1, in mascot pixels from centre) and each pod turns around
the point where it meets the body, so a scene can pose it without new art. It fills its
positioned parent, and every length is a count of mascot pixels times the parent's `--px`.

## packages/design/src/compounds/ProviderButton/behavior/provider-marks.ts

The Discord and GitHub marks are single colour and drawn in the button text colour. The Google mark is its four colour G, which Google's brand guidelines require.

## packages/design/src/compounds/ProviderButton/ProviderButton.tsx

The button sends the browser to the API start route, which redirects to the provider; nothing is fetched. Without returnTo the API picks the landing page.

## packages/design/src/compounds/RoleName/RoleName.tsx

A Discord role colour is RGB as a number, and 0 means no colour; the dot then takes the dim text colour, as Discord draws it. The colour is the role's own data, so it reaches CSS as the --role-color custom property and not as a design token.

## packages/design/src/compounds/RouteGuard/behavior/route-outcome.ts

The order of the checks is the access rule: a signed-out visitor reaches public routes only, a signed-in one never sees a public route, a waiting or revoked account sees the pending page before any other check, an admin route needs admin access, and a missing right sends the person to the site's home.

## packages/design/src/compounds/RouteGuard/RouteGuard.tsx

Every member route renders inside the same Frame element at the same place, so the nav, the search and the shared lists stay mounted while the page beneath them changes.
A signed out caller on a non public route gets the sign in page with the current path as the return path (none for the root).

## packages/design/src/compounds/SavedViewsMenu/SavedViewsMenu.tsx

PORTALLED_MENU_SELECTOR names the portalled dropdown, so a click inside it does not count as an outside click.

## packages/design/src/compounds/StoreRightsEditor/StoreRightsEditor.tsx

Both sites list this editor in their rights editors: the Hookshop for its own groups, the Sanctuary because its admin page manages the groups of both sites.

## packages/design/src/compounds/UploadTray/UploadTray.css

The Portal overlay layer is click-through; the tray sets pointer-events back to auto.

## packages/design/src/hooks/useLeaveGuard/useLeaveGuard.ts

Leaving only pauses a job (the next visit continues it), so the browser's own prompt is enough and shows no text of ours. Older browsers show the prompt only when `returnValue` is set, which is why the handler assigns it.

## packages/design/src/hooks/useSession/useSession.ts

A 401 from GET /me is a signed out visitor, not an error. Any other failure is kept as the error so the page can say the API is down.

## packages/design/src/hooks/useSurfaceView/useSurfaceView.ts

The search text is never saved: old text silently hiding rows reads as data loss. Facets are transient for the same reason; the clause list is the durable filter. The query half stores clauses only, so its table part (QUERY_HALF_TABLE) is empty on purpose.

## packages/design/src/packs/character/behavior/useAnimationClock.ts

One frame ticker for the whole sprite studio. The contact sheet animates every state at once, and separate timers per canvas would drift apart. One shared counter keeps them in step at the cost of one animation frame, and each canvas takes the tick modulo its own frame count.

## packages/design/src/packs/character/behavior/useWearing/useWearing.ts

Outfit and gloves are independent in the engine: the glove colour is written over one palette row entry whatever outfit is loaded. So they stay two controls, never one list of combinations. The bunny is offered beside the three mails because to the palette it is one more outfit, even though its art differs.

## packages/design/src/packs/character/compounds/ContactSheet/ContactSheet.tsx

The grid's column minimum follows the sprite's rendered width at the current zoom, so the cells wrap to fit what is on screen at any zoom.

## packages/design/src/packs/character/compounds/SpriteSheetViewer/SpriteSheetViewer.tsx

The bunny state (action 0x21) has no palette of its own. Picking it moves the outfit to the bunny too, since bunny art in another outfit's palette reads as a bug.
The store draws a pack's sheet through this viewer whole. The app's sprite studio takes the same pieces apart (`useSpriteViewer`, the view, playback and zoom controls, `ViewerStage`, `StateList`, `WearingBar`) and places them in its own frame: the controls on the editor toolbar, the stage on the work surface and the state list in a side panel. `StateList` takes `fill` there, so the list grows with the panel and scrolls with it; without `fill` it keeps its own width and height cap for the store's viewer. The viewer state lives in `useSpriteViewer`, so the controls and the stage read one view, state and zoom wherever they are drawn.

## packages/design/src/packs/language/behavior/entry-selectors/count-variable-uses.ts

Both `ref` tokens (ours) and `var` tokens (engine substitution codes) count as a use. An entry naming the same variable twice counts once, so the figure answers how many lines a rename would touch.

## packages/design/src/packs/language/behavior/find-translation-hits.ts

Dialogue is searched on its joined `text` runs, so a control code in the middle of a sentence never breaks a match. Chips (control code names and references) are searched on their own and reported as their own field. The needle arrives already lowercased and trimmed.

## packages/design/src/packs/language/behavior/set-font-assets.ts

A set's drawable font is its stored pair: the glyph tiles and widths are the set's own bytes, and the alphabet comes from the extraction language table through the set's `base` code. Without a known base language there is no font and callers draw nothing.
The bytes are copied because the host may pass a pooled view whose byteOffset is not zero, and every offset used later is tile relative.

## packages/design/src/packs/language/behavior/set-variables/variables-of.ts

A set stores its substitutions as a pair (the glossary and the name tables). They are folded into one list the same way the write path folds them, with the stored per variable metadata applied. `literalTermsOf` keeps every variable with literal text, which is what the measuring walks expand refs with.

## packages/design/src/packs/language/behavior/useEntryLayout.ts

Layouts are measured on demand and cached per token array, keyed on the array's identity: every edit produces a new array. A new glossary or font throws the whole cache away.

## packages/design/src/packs/language/behavior/useEntryView.ts

Openness is per entry, so two lines can be open side by side for comparison. Each open entry remembers its own view mode, reading by default. Closing an entry forgets its mode, so it reopens for reading.

## packages/design/src/packs/language/behavior/useSetVariables.ts

Memoised on the three stored fields, so a new set object with the same tables keeps every layout already measured.

## packages/design/src/packs/language/compounds/DialogueBrowser/DialogueBrowser.css

Text in a set is there to be read and copied, so text selection is turned back on for the whole viewer.
The scroll list is the query container for its rows, the same as the editor's list: whether a closed row has room for the line's own words depends on the list's width.

## packages/design/src/packs/language/compounds/entry/entry-meta-model.ts

The open entry's metadata answers what a translator cannot read from the words: who opens the line, where, how the game finds it, how many boxes the player pages through, and what it pulls in at runtime.
A row is left out when the fact does not apply, and stated as absent when it applies but is not known. An entry opened by the core has no place; two entries have no mined source and two type bytes carry no record. A plausible guess for either would be worse than saying nothing. `mono` marks a value that is an identifier, not prose.

## packages/design/src/packs/language/compounds/entry/entry-prose.ts

The reading view and the closed row's excerpt run the shared expansion in preview mode, the same call the fit measurement makes, so the sentence read here is the sentence the box will hold.
Expansion is strict and throws on a reference the set has no variable for. That broken state is what a translator needs to see, so a failure falls back to a tolerant walk that shows the unresolved key in braces and keeps the rest of the line readable.
Control codes add nothing, but a row break or a wait leaves one space so two lines do not run into one word. A bracketed name the code catalog does not claim is a picture character of the alphabet; it draws real ink, so it stays as its bracketed spelling.

## packages/design/src/packs/language/compounds/entry/entry-row-model.ts

A closed row answers at a glance which entry it is, who says it, what opens it, how long it is, whether it fits, and where a prompt's options lead. For a source keyed by a place or a room, `who` is the place: which sign it is is the identifying fact, and the trigger badge already says it is a sign. The excerpt goes last because it is the only part that can be long.

## packages/design/src/packs/language/compounds/entry/entry-summary.ts

The "contains" phrases come from the control code catalog's own labels, not the bracket names in the stream, so the card says "2 waits for button" where the stored text says `[Waitkey]`.

## packages/design/src/packs/language/compounds/entry/EntryCardCollapsed.tsx

A set holds a few hundred entries, so the list is for finding one. Every cell is always drawn, empty when it has nothing to say: a dropped cell pulls every later cell one track to the left. The whole row is the button that opens the entry, which is also why every child is inline. Nothing on it is editable, so scanning a set is always safe.

## packages/design/src/packs/language/compounds/entry/EntryListItem.tsx

Memoised: the list holds a few hundred items and re-renders on every mode or draft change. A closed row's props are stable (models come from the shared layout cache, handlers are identity fixed), so only the row whose facts changed renders again. Measurements come from the shared layout cache, and only for rows near the viewport.

## packages/design/src/packs/language/compounds/entry/EntryMetaPanel.css

Auto fill columns, never a fixed count, because the panel sits in a pane the user resizes. Every row keeps its label above its value, so a column can be as narrow as it likes. A value that states an absence is dimmed and italic so "not recorded" is never read as the answer.

## packages/design/src/packs/language/compounds/entry/EntryPanel.tsx

The open entry keeps the same frame whatever view is active: the metadata is true of the entry, not of a way of looking at it. The panel is marked at its left edge so an open entry never looks like the rows around it, and the view switch sits at the far end so it lands in one place on every panel.

## packages/design/src/packs/language/compounds/entry/facts-for-entry.ts

Facts are resolved once per entry and kept. The dataset is static for the life of the app and the list re-renders on every keystroke of the search box, so a join across every actor record per row per render would be paid again and again for an answer that cannot change.

## packages/design/src/packs/language/compounds/entry/fit-chip.ts

The engine never wraps or clamps a row: it draws straight past the box interior and over the row below. So the verdict is pass or fail, never a percentage. A row reads as tight from 90 percent of the interior width. The closed row and the metadata panel share this one verdict so they never disagree.

## packages/design/src/packs/language/compounds/entry/ReadView.tsx

The entry as prose and nothing else: no gutter, markers, chips or pixel face, in the app's own face at a comfortable measure. The width cap is on the text, not the panel, so a wide pane still breaks the sentence where a sentence should. The text is selectable because passing a line to a dictionary or a colleague is the commonest thing done here.

## packages/design/src/packs/language/compounds/entry/trigger-facts.ts

The mined trigger source is keyed the way the core is keyed: a type byte, an area, a room, a receipt index. Each key is looked up and the record supplies the name; where the data has no name, the bare key is reported.
A type byte can match several records because the game reuses one type for what the dataset treats as distinct actors. The row's own pick is named and the rest are offered as other candidates.

## packages/design/src/packs/language/compounds/entry/ViewModeSwitch.tsx

Read, edit and preview answer three different questions (what the line says, what it is made of, what the player will see), so they are a switch and not a stack. A read only list leaves out editing.

## packages/design/src/packs/language/compounds/glyph/behavior/useGlyphCanvas.ts

Repaints when the character or sheet changes and when the display's pixel ratio changes: the backing store is sized in device pixels, so moving the window to a monitor with different scaling changes the real pixel count without changing the box. A media query only matches the ratio it was built with, so the ratio is held in state, which both re arms the query and drives the repaint (the same approach as the game canvas's fit hook).
Paints are batched per animation frame: every cell mounted in one commit is queued, then the frame measures all of them before resizing any. A cell that measured and resized itself in its own effect forced one reflow per glyph, sixty for a three row box, which made opening the preview lag. With no tiles or no glyph the canvas is left untouched and shows an empty cell of the right size.

## packages/design/src/packs/language/compounds/glyph/glyph-cell-geometry/edge-at.ts

Both edges of every source pixel come from this one mapping, so a pixel's rectangle ends exactly where its neighbour's begins: no overlap to darken a seam, no gap to show the ground. Giving each pixel a width of `span / cells` accumulates a fraction of a device pixel per column and frays the far edge, which is what once made the glyphs look blurry. Pass `n + 1` for the far edge and subtract to get a pixel's size.

## packages/design/src/packs/language/compounds/glyph/glyph-cell-geometry/top-tile-of.ts

A character is two stacked 8x8 2bpp tiles (16 bytes each) making 8x16. The sheet stores 16 characters per row and each character row spans two tile rows (32 tiles), so a character's halves are 16 tiles apart. A 256 tile sheet spells characters 0 to 127.

## packages/design/src/packs/language/compounds/glyph/GlyphCell.tsx

One character of the pack's font addressed by its index in the alphabet, as the layout walk reports it. The editor's `GlyphChar` reaches the same cell from a bracketed name matched against the alphabet first. Both share the painter (`useGlyphCanvas`) and the stylesheet, so there is one renderer of the game's pixels. Each cell advances exactly as wide as the pack's width table says, expressed as a multiple of one ink box, so a row is as long on screen as in the box and the caller's cell size still decides how big a character is drawn.

## packages/design/src/packs/language/compounds/glyph/measure-store.ts

Reads the canvas's laid out box at the display's pixel ratio. Null when the box has no size yet, which would otherwise bake a cell at one pixel square. It forces layout, so a caller painting many cells measures them all before resizing any.

## packages/design/src/packs/language/compounds/glyph/paint-glyph-cell.ts

The pixels are decoded from the pack's own `font.bin`, the data the game draws from, so a picture character shows for every pack with nothing to extract first. The CSS size of a cell belongs to the stylesheet; the canvas backing store is sized here in device pixels from the box the stylesheet gave it, and every rectangle is snapped to it. Pixel art is never stretched from a smaller bitmap. Assigning a canvas dimension clears the bitmap, so only a real change is written. When the sheet cannot spell the index nothing is drawn and the cell stays empty. Ramp value 0 draws nothing.

## packages/design/src/packs/language/compounds/preview/behavior/usePreviewControls.ts

Activation restarts instead of advancing on the last box, and only a real advance bumps `advanceTick`, the counter the scroll animation is keyed on, so a restart snaps back with no motion. The selection resets on every activation because the next box is a different prompt or none.

## packages/design/src/packs/language/compounds/preview/choice-of.ts

A choice command draws no pixels. The option text is ordinary rows of the same entry, and the selection cursor comes from the structural cursor frame entries, each of which parks a `>` in column 0 of one fixed row. The command variant decides the rows: `Choose` loads the frames for rows 2 and 3 (a question on row 1), `Choose2` for rows 1 and 2, `Choose3` for all three.

## packages/design/src/packs/language/compounds/preview/ChoiceCursor.tsx

The cursor is the pack's own `>` character drawn in the first cell, the column the game's cursor frames reserve for it, through the same matcher and painter as every previewed character. A plain `>` stands in only while the font is not readable yet.

## packages/design/src/packs/language/compounds/preview/GlyphRow.tsx

A row already on screen before this box drew is dimmed, not hidden: it is on screen because nothing clears it, and full strength would suggest this box wrote it.

## packages/design/src/packs/language/compounds/preview/preview-screens.ts

The engine clears a message's pixel buffer exactly once, when the message opens; no later handler clears it, not at a wait and not at a row marker. So a box is whatever the boxes before it left standing, with its own rows painted over the top. A preview that redraws each box from its own text alone is not the game.
`resolveInherited` walks the whole message through the shared pen in the engine's mode and reports, per box, the rows still on screen when that box begins. The rows on screen while the player reads box N are the rows box N+1 inherits, so the walk runs over the blocks plus one empty sentinel block and every real box has a successor to read its finished screen from.
A row is carried when the same pixels were already standing before this box drew. An entry holding a reference the set cannot expand gives no screens; the caller shows the validation problem.

## packages/design/src/packs/language/compounds/preview/PreviewBox.css

The box is `content-box`, against the app wide `border-box` default: `--game-row-width` is the row's real interior of 21 cells, so it must be the width the rows get. With `border-box` the interior measured 316px against a 336px row, which made every row look 20px roomier than it is.
The row stack clips vertically so the arrival shift stays inside the box, while a row that overruns the interior still draws past the right edge. The engine writes past the interior instead of wrapping, and that overrun is the defect the preview exists to show. The cursor cell paints over the row, as the cursor frames paint over the stored text, and on an option row without the cursor the frame paints a space.

## packages/design/src/packs/language/compounds/preview/PreviewBox.tsx

Always three rows at the interior's real width, because the game's box is fixed: a preview that shrank to one line would hide the rows an earlier box left there. Rows are placed by their own row number, so a box writing only row 2 draws it in the middle. The cursor frames repaint column 0 of every option row each frame, the cursor on the selected row and a blank on the others, so the blank covers whatever cursor glyph the stored text carries. A wait marker blinks while the box holds for a press, and an advance replays a short upward shift of the rows, keyed on `scrollKey`.

## packages/design/src/packs/language/compounds/preview/PreviewPrompt.tsx

The box above is the button, so this line only states the position and names the actions, with the action text in the accent colour so a first time reader sees that the preview moves.

## packages/design/src/packs/language/compounds/preview/PreviewView.css

Every line of chrome is set in `--c-text`, `--c-text-dim` or `--c-gold`, never a muted tone: the caption variant's default is too faint for text a reader is meant to act on.

## packages/design/src/packs/language/compounds/preview/PreviewView.tsx

The entry as the player meets it, one real box at a time in the pack's own pixels. The sample values for the engine's substitutions are editable because they change the answer: a six glyph name and a one glyph name make different rows. They default to the shared worst case stand ins, so the first look is the cautious one. The box is the button: focusable, focused when the mode opens, advanced by a click, Space or Enter, with arrow keys moving a choice cursor.

## packages/design/src/packs/language/compounds/variables/variable-groups/filter-variables.ts

There used to be two tables, a glossary and a menu name table, that could not reach each other: a term could not retitle a menu entry and a menu entry could not appear in a line. One list fixed that, and `kind` is what remains of the distinction: where a value comes from, never which table it lives in. So kind is a filter, never a second list.
Engine owned variables come first because a translator cannot change them and needs to recognise them on sight. The rest keep the order the set stores them in, so a row stays where it was found.

## packages/design/src/packs/language/compounds/variables/VariableRow.tsx

Locked means the game owns the value, not that the variable is unavailable. The engine itself substitutes a save file's name field and one digit of a live counter, so there is nothing to translate, but a line may still reference either and the picker still offers both. The row shows a note in place of a field and stays as insertable as any other row. A row without `onChangeValue` shows its value as text; a row without `onRemove` (engine owned or a menu slot) has no remove button.

## packages/design/src/packs/language/compounds/variables/VariablesTable.css

A grid, so key, kind, value, count and lock line up down the whole list, the lock column most of all since "which of these can I change" is what the list is scanned for. The lock and remove slots are always present, empty when they have nothing to show, so locked and editable rows have the same shape and no column shifts. The note on a locked row is italic so it reads as an explanation, not a value.

## packages/design/src/packs/language/compounds/variables/VariablesTable.tsx

Presentational: rows arrive already filtered and counted, and every edit, addition, removal and the hardcoded name scan are reported upward. Without `onChangeValue` the table is read only, and each missing handler hides its own control.

## packages/design/src/packs/music/behavior/clock.ts

`m:ss` is the one spelling for every position or length in the music studio.

## packages/design/src/packs/music/behavior/file-audition/start-file-audition.ts

Plays one pack file straight from its bytes, with no layers, schedule or manifest, so it works on a file nothing plays yet. One file plays at a time, enforced through the shared module state, so any row's press silences the last. The loop point comes back from the decode, which has already parsed the `.pcm` header, so the whole file is read once.
The previous file is silenced twice: before the decode so a long file does not keep the previous one going, and after it so that of two racing presses the last to finish plays. A node clears the shared state on its own end only while it is still the current one, since a newer press may already have replaced it.

## packages/design/src/packs/music/behavior/sound-names/sound-hex-id.ts

Sound ids are written in hex because the game's tables and every disassembly note write them that way.

## packages/design/src/packs/music/compounds/FilePlayer/FilePlayer.tsx

The player samples the playhead itself on a frame loop: the position is the only thing that changes continuously and it belongs to one row. Lifting it into the list's state would re-render every other row sixty times a second. The bar is marked `live` because its width is re targeted every frame, and a CSS transition chasing a moving target lags behind the audio and overshoots the end. The repeat point shades the stretch before it on the same bar, so the part that plays once reads against the whole length.

## packages/design/src/packs/music/compounds/TrackList/TrackList.tsx

A music pack's contents, read only: a summary line, then one row per slot the pack fills, tracks first in slot order and replaced sounds after by channel. The file count is the manifest's own file record when it has one, else every file a slot names. What plays and how the bytes arrive is the caller's business.

## packages/design/src/packs/pack-source.type.ts

A `PackSource` is where a pack's bytes come from for the read only pack viewers. The app adapts its local file store to it and the store adapts a signed link, so a viewer never knows where the pack lives. It has the same shape as the shared `RangeReader`, so a source goes straight into the shared zip readers. `range` reads the local file for a local pack and fetches a byte range for a store pack.

## packages/design/src/saved-views/create-view-keys.ts

A view key reads `<prefix>:<surface>[.query][~<nonce>]`. One surface has two halves bound to the same server record: the table half (columns, sort, group by) owned by the DataTable, and the query half (filter clauses) owned by the page. The nonce is bumped when a saved view is applied, so both halves reload from the storage cache. currentViewId is the reserved id `current-<surface>`, one per surface, because view ids are global.

## packages/design/src/saved-views/create-view-storage.ts

Storage runs over GET and PUT /me/views. One record per surface, the reserved `current-<surface>` view, holds the whole snapshot, and each half of a key merges its part into it. A cache per surface answers a reload at once, which lets an applied saved view land in the table without a round trip. A local write made during a read wins: the read only fills an empty cache.

## packages/design/src/session/session-context/session-context.type.ts

`access` is null with no session, or before the user's first sign-in on this site.
`groups` holds groups added by hand, from Discord, or by the default fallback.
`rights` is the union of the user's groups, everything for an admin, and null with no session.
`loading` stays true until the first GET /me answers. `error` is the last GET /me error, shown when the API is unreachable.

## packages/design/src/site/site-definition.type.ts

The kit's frame, nav, pages and guard read only the site definition, so a second site is a second definition.
SiteSection.path: the active section is the one whose path the location starts with. SiteSection.permission shows the section only to a caller holding that permission.
SiteDefinition.home is the section pinned as the nav's home; the root path counts as it.
SiteDefinition.name is used in sentences such as "Sanctuary is unreachable".
SiteSearch.Results is what the content pane shows while the search is in use.
MemberData wraps every member page, for the lists and uploads they share.
rightsEditors holds one editor per site whose rights the admin page sets.

## packages/design/src/site/theme.css

The design system reset locks scrolling and text selection for the game shell; a site scrolls and lets text be copied, so this sheet overrides both for every site. Its tokens size the site kit's own parts.

## packages/design/src/theme/packs/entry-row.css

The closed row and the locked row share this grid so the list reads as one list. Every fact track is a fixed length, never sized by content: each row is its own grid container, so a content sized track lines up only by luck (a locked row once sat 6px right of an entry row). The font size is set on the row for the same reason, since `ch` resolves against the grid container's font and the two row components inherit different sizes.
The excerpt is the only elastic track and the first thing to go in a narrow pane. It is hidden with `visibility`, never `display: none`, because a removed grid item slides every later item one track left.
The locked row stands in for entries that are control code scaffolding the choice prompts depend on.

## packages/design/src/theme/packs/glyph-char.css

A picture character's ink box is one cell of the dialogue alphabet (8 by 16 game pixels), sized from the same geometry tokens as the line so it never sits a fraction of a cell out of step with the letters beside it. The advance is a separate number: the width table charges each picture its own advance, so the cell takes `--glyph-advance` when known and the full ink box otherwise. Ink may overflow the advance, the same trade the engine makes. The ink box is two custom properties so a view that sets the game face at its own size (the read only card, the toolbar) overrides the box and not the geometry. A pair cell holds two alphabet entries spelling one picture side by side. The fallback shows the bracketed name tinted, so it reads as "this alphabet has no character for this".

## packages/design/src/views/Admin/behavior/useAdminQueue.ts

Setting groups sends the person's whole manual group list, then reloads, because the API may move the person between access states. Ignore on a pending user is a revoke: the user stays out of the content until an admin gives them a group.

## packages/design/src/views/Admin/behavior/useDiscordRoles.ts

available is false when the API has no Discord bot to ask; the group editor then falls back to typing a role id.

## packages/design/src/views/Admin/behavior/useGroups.ts

Every write reloads the list because member counts are computed by the API. save with a null id creates a group; otherwise the whole body is sent as a patch. save resolves true on success so the editor knows to close.

## packages/design/src/views/Admin/sub-components/GroupEditor.constants.ts

GROUP_NAME_MAX_CHARS mirrors MAX_GROUP_NAME_CHARS in packages/hub-contracts/src/hub/schemas/group-schemas, which does not export it.

## packages/design/src/views/Admin/sub-components/GroupEditor.tsx

The body is checked against the shared createGroupSchema, so what Save sends is what the API accepts. The rights of a site with no editor on this page are kept as they were. A single site's rights section has no heading.

## packages/design/src/views/Admin/sub-components/MemberGroups.constants.ts

PORTALLED_MENU_SELECTOR names the portalled dropdown, so a click inside it does not count as an outside click.

## packages/design/src/views/Admin/sub-components/MemberGroups.tsx

A click sends the person's whole manual group list. A group held through a Discord role is ticked and locked here because only the role decides it.

## packages/design/src/views/Admin/sub-components/RolePicker.tsx

A linked role the Discord server no longer has stays listed, marked, so an edit never drops it unless the admin picks another.

## packages/design/src/views/PackContents/behavior/preview-bytes.ts

An MSU-1 `.pcm` previews its first 30 seconds, read straight from the pack (the header, then 16 bit stereo at 44100 Hz). Any other audio has to be decoded whole, so it is read whole up to 48 MiB and refused above that.

## packages/design/src/views/PackContents/behavior/read-character-pack.ts

The `.rsp` carries its own palettes, so no ROM is needed to draw a character pack's sheet.

## packages/design/src/views/PackContents/behavior/read-music-pack.ts

Only the listing is read: the zip directory from the end of the file, then the manifest entry. A track's bytes are read later, when its play button is pressed.

## packages/design/src/views/PackContents/behavior/usePackAudition.ts

The engine underneath already silences the last file; this hook holds which file plays, which loads, and why a file did not play. Only the newest press may publish what is playing. Leaving the view stops the sound. A 30 second cut can declare a repeat point past its own end; that point is not shown.

## packages/design/src/views/PackContents/behavior/usePackRead.ts

A new source starts the read over, and a read that finishes after its source was replaced is dropped.

## packages/design/src/views/PackContents/PackContents.tsx

What is inside a pack, drawn by the viewer for its kind: the track list, the sprite sheet or the dialogue. It is the one piece of the packs domain that reads, and only through the source it is handed, so the app and the store show a pack the same way wherever its bytes live. A new source reads the pack again.

## packages/design/src/views/SiteLayout/SiteLayout.css

The frame is the viewport: pages scroll inside main, never the document, and the footer stays in view.

## packages/design/src/views/SiteLayout/SiteLayout.tsx

The frame of every member page (TX-54 B): Tessera's SiteHeader with the rotp mark, the site wordmark and the signed-in person as the title bar's dropdown action, then SideNavLayout with the sections and the site search, then SiteFooter. RouteGuard renders it around each member route, so it stays mounted while member pages change and the nav keeps its search text and its focus. While the search is in use the pane shows the results in place of the page; the route does not change, and picking a section clears the search.
