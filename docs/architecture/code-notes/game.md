<!-- @layer docs @kind doc -->
# Code notes: shared/game

Facts about the code in `shared/game` (outside `shared/game/data`) that the code cannot say by
itself: game mechanics, what a RAM or ROM value means, and why an odd line has to stay. Each
heading names a file, by its path under `shared/game/`.

## dialog

### dialog/dialog-frame.types

`DialogFrame` is what the text engine has on screen, as the host's message box needs it. It is
built from the core's dialog mirror snapshot (`core/game-hooks/dialog_mirror.c`), one frame at a
time.

- `DialogCell` is one drawn glyph: its id in the language's alphabet, and its pen x and width in
  text area pixels. `highlight` is the span it was drawn in: 1 primary, 2 secondary, absent or 0
  for plain text.
- `DialogWait` is what the engine is parked on, if anything.
- `DialogKind`: `box` is the bordered box, `floating` is `[Window 02]` text (telepathy and story
  lines), `story` is the attract mode story crawl, and `menu` is the death and select menus that
  run through the same engine without a border.
- `topleft` is the BG3 tilemap word address the core chose for the frame's top left tile.
- `rows` holds the three visible rows, in draw order.
- `scrollStep` counts the pixels a `[Scroll]` has shifted the rows up so far, 0 to 15.
- `renderState` is the engine's `kText_Render` state, 0 to 4.
- `nativeHidden` says whether the core withholds the native box for this message. It is decided
  once as the message opens and held for its life (`core/game-hooks/dialog_suppress.c`), so the
  host box draws only where the native one stands down and the two are never both up.
- `generation` counts messages started since boot, modulo 256. Loading a state does not advance
  it.
- `layerScrollX` and `layerScrollY` are the text layer's live scroll in game pixels, as the
  renderer draws it. The story crawl moves its words this way.
- `messageWidth` is the whole message's widest row in text area pixels, measured when it loaded.
  `messageRows` is the most rows any screen of the message shows, 1 to 3. Both are 0 when
  unknown.

### dialog/box-geometry

Where the message box sits, in game pixels, from the BG3 word address the engine chose.

The frame is 24 tiles wide and 8 tall: `RenderText_DrawBorderRow` writes 24 entries per row over 8
rows. The text area starts one tile in and one tile down and spans 21 by 6 tiles: three glyph rows
of 16 pixels each, 168 pixels wide. The tilemap is 32 entries per row from word 0x6000, so 0x6125
is column 5, row 9 (the top slot) and 0x6244 is column 4, row 18 (the bottom slot).

- `INK_OPTICAL_OFFSET_Y`: the glyph bitmaps leave more blank rows under their ink than above it,
  so a pixel down evens the look.
- `BoxSizeMode`: `full` keeps the game's frame, `message` sizes it once to the whole message, and
  `fit` follows the rows in use. `BoxPlacement` adds `native`: the game's own frame and text
  origin. A screen the game lays out around the text (a cursor beside each row) needs the text
  where the game drew it, so it takes `native`.
- `BoxLayout.textOrigin` is where the text block starts, centred in the frame so a wide box
  holds its text in the middle. `textWidth` is the block's width at 1x, magnification excluded.
  `visibleRows` is the rows the layout shows; in fit and message mode the frame is sized to them.
- `LayoutOptions.fontScale` is the text magnification; 1 draws the rows at the game's size.
  `padX` is the game pixels between the frame's side edges and the text (the game's own box
  keeps one tile). `padY` is the space above and below. `messageWidth` and `messageRows` are the
  whole message's extent for message mode; 0 falls back to the rows in use.
- `contentOf`: full and message mode take the whole message's measure when the engine has one,
  so the block does not grow and the text does not creep while the message types. Fit mode
  follows the rows drawn.
- `layoutBox`: full mode keeps the vanilla frame and only grows when magnified text would not fit.
  Message and fit mode shrink the frame to their content, centred on the vanilla frame's centre
  both ways, so the box stays where the game placed it. The block sits in the middle of the frame
  both ways; in a frame sized to it that middle is the pad.

### dialog/box-style

The enhanced message box's look, as the settings name it: the border around the text, its
corners and corner marks, and the texture drawn on the ground. Every choice is a closed ladder, so
a segmented control can list it and a stored value never drifts off it.

- Borders: the game's own tiles, nothing, one line, or a thin line inside a thicker one.
- Corners: square, rounded, or cut at a diagonal (a chamfer).
- Corner marks sit inside each corner. The triforce mark points at its corner.
- The texture is the repeating pattern on the ground behind the text. Its animation slides it
  sideways, drifts it diagonally, makes cells appear and fade at random, or makes the whole field
  breathe.
- `strokeWidthsOf` gives stroke widths in game pixels: the outer line, the thin inner line of a
  double border, and the gap between them.

### dialog/dialog-kind

The kind of message comes from the snapshot's flags and the frame position the engine chose. The
death and select menus are the one case the position tells apart: they force their own top left
and do not take one of the two gameplay slots. `RenderText_PostDeathSaveOptions` forces
`MENU_TOPLEFT`, and `DisplaySelectMenu` shares the engine.

### dialog/dialog-prompts

The button prompts a message box shows, from what the engine is doing and which controls are on.
A choice asks for a direction and a confirm. A page that waits asks for the next press. A page
that is still typing offers the controls that act on typing: B to complete it, and holding A to
speed it up, each only when its setting is on and it would change something. Holding A only
helps when the held speed beats the typing speed; instant text has nothing left to speed up. The
story crawl takes no input, so it never shows a prompt. The game over menu has written its lines
and waits on the fairy cursor.

- `DialogPrompt.hold` marks a button that acts while held, so the prompt reads "Hold".
- `PromptControls.speed` is the text speed stop: 1 is the game's pacing, 0 is instant.
- `TYPING_RENDER_STATE` is the engine's pump state while it types (`kText_Render[3]`).

### dialog/dialog-wait.ts

The `TEXT_CMD_*` values are the engine's own text command ids (`kTextCmd_*` in
`core/zelda3/src/messaging.c`) that park it, mapped to what the player is waiting on.

### dialog/dialogue-charset

What one language's message box can draw: its alphabet, plus the extra glyphs
(`extra-glyphs.data.ts`) laid into the font's spare slots.

The sheet holds 128 glyphs (the core has 256 tiles, a top and a bottom tile per glyph). A
language uses the slots its alphabet and its width table cover; the rest are spare. The
characters the alphabet lacks take the spare slots in the extra glyphs' priority order, and a
character with no slot left falls back (`session-dialogue/dialogue-text.ts`). A composed line
writes an extra glyph as a private use token that carries its slot, so the encoder can turn it
into the core's escape bytes and the wrapper can measure it by its slot like any other glyph.

- `TOKEN_BASE` is the first private use code point of the slot tokens, clear of the highlight
  markup at U+E000.
- `DialogueCharset.alphabet` maps a glyph code to the text that encodes to it: alphabet entries,
  then a token per extra slot. `widths` maps every glyph code to its pen advance in pixels.
  `extras` lists the extra glyphs this charset draws, by slot.
- `alphabetChars` takes the single characters an alphabet draws. A bracketed entry is a picture,
  never typed text.
- `withExtras` grows the alphabet to every slot: an empty entry where no glyph is, and the fill
  at each extra slot.
- `displayAlphabetOf` is the alphabet as a reader sees it: each extra slot holds its own
  character (the modern font's lookup). `readableText` turns every slot token in composed text
  back into its character.

### dialog/extra-glyphs.data.ts

Glyphs the dialogue fonts lack, drawn in the game's own style, so any name another game sends
shows as it was typed. The core writes each one into a spare slot of the active font
(`core/game-hooks/dialog_extra_glyphs.c`) and the composer encodes the character to that slot.

Every glyph is the font's own cell: 8 columns by 16 rows, the top 8 rows one tile and the bottom 8
the next. In the rows, a space is the transparent ground, `.` the dark edge (palette entry 1) and
`#` the letter's body (entry 2). The body is one pixel wide like the game's letters, starts on
column 1, and sits on the same lines: capitals from row 2, the baseline on row 12, descenders to
row 14. The edge rings the body on every side, the way every glyph in the sheet has it. The width
is the pen advance (1 to 8, as the font's width table stores it): the body plus one edge column on
each side. Every edge pixel lies inside it because the engine draws only that many columns.

The list is in priority order. A font with fewer spare slots than missing characters takes them
from the top, so the characters that turn up most in player and item names come first. The left
and right pointers are drawn as the US font's own.

### dialog/extra-glyph-tiles.ts

An extra glyph's pixel rows as the font sheet stores a glyph: two 8x8 2bpp tiles, the top 8 rows
then the bottom 8, 32 bytes in all. Each pixel row is two bytes, bit plane 0 then bit plane 1,
leftmost pixel in bit 7. This is the SNES layout the engine reads (`messaging.c`
`VWF_RenderSingle`). A space maps to the ground entry, `.` to the edge and `#` to the body.

### dialog/frame-geometry

The shapes a drawn message box frame is made of, as plain strings the renderer hands to SVG and
CSS: the outline path of a box with square, rounded or chamfered corners, the clip that gives the
ground the same corners, and where the four corner marks sit and which way they turn.

- `CornerPlacement.sx` and `sy` are mirror factors: the top left mark is drawn as is, the others
  are its reflections.
- `cornerAtInset` gives the corner size of an outline inset inside one with a given corner size,
  so the two run parallel. A concentric arc loses the inset from its radius, and a chamfer cut
  moved inward by the inset shortens by the inset times (2 minus root 2).
- `triforcePath` draws a triforce of the given height centred on the origin, apex up: the outer
  triangle split into three.

### dialog/highlight-color.ts

`hexToSnes15` turns a `#rrggbb` colour into the game's 15 bit colour word (5 bits a channel, red
lowest), each channel snapped to the nearest of its 32 levels. The core draws highlighted letters
with this word, and the host box paints with the same word expanded back, so both boxes show one
colour.

### dialog/pacing

The dialog pacing ladders. Text speed is a multiplier over the game's own pacing, with 0 meaning
instant (the ROM's own "Speed 00" convention). Speed stops run slowest first, and instant sits at
the end. A stop below 1 only slows typed lines. The hold ladder is the multiplier applied while A
is held. The font scale ladder sizes the modern font of the enhanced box, as a multiple of the
game's glyph height. The stroke widths are the outline around a modern glyph in game pixels; 0
draws no outline.

- `toQ4` converts a stop to the core's quarter tick fixed point: 1 becomes 4, 1.5 becomes 6, 4
  becomes 16, and instant stays 0.
- `nearestStopIndex` finds the stop closest to a stored value, so an odd value still lands on the
  ladder.

### dialog/picture-glyph.ts

An alphabet entry that names a picture and does not spell a character: an arrow, a button face, a
heart piece, the ellipsis run. The modern font has no face for these, so a row renderer draws
them from the glyph sheet.

## title

### title/title-frame.type.ts

`TitleFrame` is the intro's clock as the core reports it each frame, from
`core/game-hooks/title_mirror.c`. Every field is a counter the game keeps itself. The host never
counts frames of its own for the choreography.

- `inidisp` is the screen brightness, 0 to 15. The boot fades it out and the story fade brings it
  down again.
- `swordY` is the falling sword's base. It comes to rest at 30.
- `sparklePhase` is 0 for none, 1 for the sparkle on the hilt, 2 for the glint running down the
  blade.
- `flashLeft` counts the frames of the clang flash left. The flash is lit on three frames of every
  four.
- `fade` is the palette fade countdown. It runs 31 to 0, one step every other frame, first for the
  logo and then for the scene.
- `pieces` holds the top left corner of each of the three 64x64 triangle sprites.
- `TitleProgress.fromSlot` is the save file the pick came from, or null when no file is valid.

### title/title-layout.ts

Positions in the 256x224 frame, measured from the ROM with the title extractor
(`shared/asset-extraction/title-screen`) and the intro's own sprite tables (`ending.c`).

- `LOGO_AT` is the logo's top left corner, the drawn extent of the BG1 tilemap.
- `SWORD_X` is the sword picture's left edge. `SWORD_TOP_FOR_BASE` is the row its top lands on
  for a sword base of 0. `SWORD_REST_BASE` is the base the sword comes to rest at.
- `HILT_SPARKLE_AT` and the `GLINT_*` values place the hilt sparkle and the glint that runs down
  the blade (`Intro_PeriodicSwordAndIntroFlash`).
- One triangle piece is a 64x64 picture. The third piece is drawn mirrored.
- `HORIZON_Y` is the first of the two water line rows the trees stand on. `CASTLE_TOP` is the
  castle's top row; its stone foot stands in the water below the line.
- `COPYRIGHT_AT` is the copyright sprite's spot, kept for a mark of our own in the same place.
- The blade runs through the logo's first letter: behind its top and bottom bars, in front of the
  diagonal between them. `LOGO_BARS_OVER_BLADE` holds those two bars, in logo pixels, across the
  blade's columns.
- The confirm prompt sits under the picture, and the smaller story prompt sits below it.

### title/title-phase

The phase and the fade amounts are read straight from the core's counters, so a skip or a state
load lands on the right picture (`Module00_Intro`, `ending.c`).

- The palette fade runs 31 steps. The logo layer turns on when 13 are left, so the logo fades in
  during submodule 5 from that step and is solid after it.
- The lake and castle fade in during submodule 7.
- The sword shows from its drop on (submodule 6). The triangles show from the moment the poly
  thread starts (submodule 3).
- The clang flash lights three frames of every four while it runs.
- `brightness` reads the INIDISP register that the boot and the story fade drive.

### title/title-progress

The title shows the sword tier and the world of the profile's most advanced battery save file.
The code is pure over the 8 KiB save. The slot geometry and checksum come from the caller, so it
stays free of the host's storage.

- `SWORD_OFFSET` and `PROGRESS_OFFSET` are block offsets in a save file (`variables.h`): the sword
  byte and the progress indicator.
- `SECOND_HALF_AT` is the progress indicator's value once the tower's keeper falls and the second
  half begins.
- `TIER_OF_SWORD` is indexed by the sword byte. No sword yet, and no save at all, show the game's
  own title sword.
- `SlotReader.validSlots` returns 0-based slots. `blockOffset` is the byte offset of a slot's
  valid block.

### title/title-swords

The swords the title can plant, in the order the setting steps through them: the save's own pick,
then one per tier. All four tier pictures are efracrafting's. `nextTitleSword` wraps to the first.

## top level

### index.ts

The old screen types in `./types` are re-exported for consumers that have not moved to the
records in `./data`. The old names that collide with the new records (`BitState`,
`PresenceCondition`, `InteriorKind`, `Requirement`, `ScreenVariantInfo`, `VariantCondition`,
`World`) are not re-exported, because `./data` is the authoritative source for those.

### events

Event names for the bridge between the game core and the React app.

### quiet-receipts

Rupees, bombs and arrows the randomizer hands over can go straight into the wallet, the bomb bag
or the quiver, with no hold up and no message. There is one switch per kind, stored with the rest
of the profile's settings. It applies to every randomizer delivery, local or online. A profile
that never saved a switch reads as the default.

## save-state

### save-state/save-state.type.ts

Save state identity: what a build declares about the format it reads, what a `.sav` records
about the build that wrote it, and the verdicts drawn from comparing them.

- `KnownFormat` is a format the project has shipped. Its id comes from the generated module. The
  row is the human readable half: `since` is the first app version that shipped the format, and
  `note` says in one sentence what changed in the layout.
- `StateStamp` is written into the trailer of every save this build produces, and kept tiny. `v`
  is the trailer schema, not the state format. `app` is the app version that wrote it. `at` is in
  epoch milliseconds. `dialog` is the core's dialog hook state at the save, in base64
  (`core/game-hooks/dialog_hook_state.c`). It is present only when a message was up and the host
  was allowed to draw it.
- `TargetCompat` has `unverifiable` as a first class answer. A target that published nothing, or
  that could not be reached, is unknown. Calling it `compatible` is how save states get lost
  without a word.

### save-state/current-format.generated.ts

Written by `core/wasm-build/layout-probe.mjs`; never edit it by hand, and its comment and
constant stay as the generator writes them. It holds the save state layout this build produces:
the ordered snapshot region lengths and the id derived from them. It is committed on purpose. It
lets typecheck and the release gate see the layout without building wasm, and a layout change
shows up as a diff to review.

### save-state/formats.ts

The record of save state formats this project has shipped. Nothing here decides compatibility;
that is the generated id's job. This is the written history: which id, from which version, and
what moved. The release gate (`scripts/build/check-state-format.mjs`) reads this file as text by
its path and blocks an id that has no row, so a layout change cannot ship without one. The file
must keep its name and its `id: '...'` lines.

`BASELINE` is the last release that shipped before a format id was published with it. Without
it, every older version reads as unverifiable and the update dialog would warn about builds that
are provably fine. No build that could produce them ever wrote anything but that id. It is
frozen: nothing is ever added, because later versions publish their own format.

`isCurrentFormatRegistered` is the release gate's whole question: does the current build's
computed id have a row.

### save-state/state-file

The `.sav` container: the core's header, and the metadata trailer we add to it. A save state is
an 8 word header, the input log, then the snapshot. Every length comes from the header and
nothing is read to the end of the file, so bytes appended past the end are invisible to the
core. That is where the stamp goes:

```text
[ core bytes ][ stamp json ][ uint32 json length ][ 8 byte magic ]
```

One write site covers quick, manual and auto saves, and the metadata travels with the file when
it is copied or synced. Loading strips the trailer anyway and does not rely on the core to
ignore it. The core does ignore it today; stripping means nothing depends on that staying true.

- `HDR_SNAPSHOT_OFFSET` is `hdr[6]`, the snapshot's byte length, which is what the core reads
  back.
- A trailer length that would run past the front of the file is not our trailer.
- A trailer that cannot be parsed counts as no trailer.
- `appendStamp` replaces an existing stamp, so a buffer saved twice still carries one stamp.

### save-state/compatibility

There are two compatibility questions, kept apart because they are answered differently. A file
on disk can be inspected directly. A version being offered cannot: the running build can only
compare against what that version published about itself. That is why `unverifiable` exists and
never collapses into `compatible`.

- `checkLoadable`: every save this app writes carries a stamp, so a file without one was made by
  a version this build does not read.
- `compareTargetFormat` compares a published id against this build's. Fetching the id is the
  caller's job.
- `describeTargetCompat` writes the update dialog's text. The reinstall line is the point of the
  message and holds in both cases: an update replaces the installed application, while save
  states live in the user data directory and an update never touches them.
- `describeStamp` names the version a stamped save was made in, for any list of saves.

## types

### types/screen.type.ts

The old screen data model.

- `ScreenType` names the three screen contexts. `overworld` is an outdoor screen, 64 per world,
  indexed 0x00 to 0x3F. `dungeon` is an indoor room that belongs to a dungeon, keyed by palace
  index and room. `interior` is every other indoor room: caves, houses, shops, fairy fountains.
- `OverworldContext.gridX` and `gridY` place the screen in the 8x8 overworld grid.
- `DungeonContext.palaceIndex` is the runtime `cur_palace_index_x2` (0x00 to 0x1A), the canonical
  dungeon identifier. `dungeonForPalaceIndex` resolves the dungeon from it. `floor` runs -2, -1, 0,
  1, 2 and up. `gridX` and `gridY` place the room in the dungeon's map grid.
- Several variants of one `roomIndex` can coexist. The first whose `VariantCondition` is true at
  runtime wins; a definition with no variant is the fallback.
- `ScreenVariantInfo.progressTier` is one progress indicator value or an inclusive `[from, to]`
  range. What each tier means lives in `logic/queries/progress-tier.ts`.
- A `ScreenBundle` groups screens that are one area in the game: the Lost Woods (4 overworld
  screens), the Two Brothers house (2 rooms), or a large dungeon room spanning several
  supertiles.
- `ScreenBase.location` is the structural parent: every screen sharing a location is one place.
  `area` is the broad zone shown on the notification's second line.
- `entranceId` is RAM `$010E`, which tells apart rooms that share a room index.
- `ScreenConnection.entranceId` is set for an overworld to indoor transition, `stairIndex` (0 to 3)
  for a stair between rooms, `exitId` for an indoor to overworld transition.

### types/game-state

- `HUDState.maxRupees`, `maxBombs` and `maxArrows` are the current caps a counter can reach right
  now, after upgrades and settings.
- `InventoryState.items` holds the 20 item slots, bow through mirror. `bottles` holds the 4 bottle
  contents. `order` is the 24 byte inventory grid order.
- `CountdownState` is the HUD countdown that the digging game and the Super Bomb share. `seconds`
  is stored as the game stores it, with the sign bit set while no countdown runs. `frames` counts
  the frames left in the current second and reloads to 62 when a second comes off.
- `HostMenuState` is the host owned pause menu, in bytes 131 and 132 of the UI state buffer.
  `holding` is true while the takeover is in force and the core's gate allows it.
- `HostMenuState.activeItem` repeats `hud.equippedY` (byte 14) on purpose. Byte 14 is the HUD's
  equipped item readout. `activeItem` is the host's own register read back, so the host can see
  when the native menu moved it and write it again. It does move: the menu's own init walks the
  21 entry grid before the hold engages, and that replaces any id the grid has no row for. Its
  range is 0 to 24, in the new style ids while held.
