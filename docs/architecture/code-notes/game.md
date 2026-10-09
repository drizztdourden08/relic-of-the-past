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
(`packages/asset-extraction/src/title-screen`) and the intro's own sprite tables (`ending.c`).

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

## language

### language/types

A `LanguageSet` is the fully decoded counterpart of the raw `LanguagePack` in
`shared/types/language.ts`. Dialogue lines are token streams, and glossary and name data are
broken out for editing before a bake step compiles them back into the ROM.

- `Token` is one decoded unit of dialogue text. `cmd`, `break` and `var` cover the game's control
  codes. `ref` defers to a `GlossaryTerm` that expands at bake time.
- `DialogueEntry.id` is the game's own positional index, 1 to 397, and never changes. `note` is a
  translator note that is never compiled.
- `PauseLabelKey` is the fixed set of pause menu section labels a set can retitle.
- `NameTable` holds the display strings that are not dialogue: inventory item names and pause menu
  labels. An `items` key is the item record id plus tier, for example `bow-2`.
- `LanguageSetMeta.id` is a code like `de`, or a custom one like `us-canon`. It becomes the INI
  `Language` value. `base` is the language code the set inherits its alphabet, dictionary, encoder
  and font from: a key of `kLanguages` in `packages/asset-extraction/src/text/data/language-data.ts`.
  `basedOn` is set on a copy of a set installed from the Hookshop and names the original it
  credits.
- `SetStructure`: `continuous` treats an entry as flowing text and derives the box breaks, `block`
  keeps the author's own breaks, and `off` turns the assistance off.
- `LanguageSet.glossary` and `names` are the projection of `variables` through
  `legacyFromVariables`, the shape every current reader expects. The storage layer fills all
  three on read and rebuilds `variables` from the pair on write, so the views cannot drift.
  `variables` and `structure` are optional in the type only, so a fixture need not carry them;
  every stored set has both. `text` holds only what was retyped. The catalog (`./text`) decides
  which slots exist, so an absent field means nothing is translated yet, never that nothing needs
  translating.

### language/blocks/types

A block is the level between a line and a whole entry: one run of lines the player reads before
pressing a button. It is the stretch between two wait for button codes, plus the head and the
tail of the stream. The wait is the only code that stops and asks for a press, so it is the only
place a block can end. A scroll is not a boundary: it animates inside the same box, shifting the
visible lines up, and the text on either side belongs to one block.

A block does not start on a clean box. The pixel buffer is cleared once per message, and no code
path clears it again, not a wait and not a row marker. So a block opens on top of whatever rows
still stand from the blocks before it. Those rows are what `inherited` carries; reading a block
without them is reading half the screen. That is also why authored data almost never returns to
row 1: a row marker blanks nothing, so jumping back up leaves the rows below it on screen. The
upstream corpus bears it out, with scrolls and row 2 and row 3 markers in the hundreds each and
returns to row 1 in the low tens.

- `Block.index` is 0-based across the entry and matches the `box` its lines carry.
- `Block.inherited` is empty for the first block. `splitBlocks` leaves it empty for every block,
  because measuring needs a language, and `resolveInherited` fills it in.

### language/blocks/split-blocks.ts

The cut, and nothing else. A line already knows whether a wait for button follows it
(`endsBox`), so the boundary is read off the lines and not derived again from tokens: one walk
decides where boxes end, and this step only reads its verdict. Lines are carried through
untouched, which lets `flattenBlocks` be an exact inverse and keeps an unedited entry serialising
byte for byte.

Content left after the last wait becomes a final block ending in `message-end`. The player sees
it and the message then closes on its own. No block is ever empty: every line belongs to exactly
one, and a stretch between two waits with nothing in it is a single line with no content.

### language/blocks/flatten-blocks.ts

The exact inverse of `splitBlocks`. Every line comes back in its original order and as the same
value, so `joinLines(flattenBlocks(splitBlocks(lines)))` equals `joinLines(lines)` and an entry
that was only grouped still serialises byte for byte. Nothing about a block survives the trip:
`ends` restates the wait its last line carries, and `inherited` is a derived view of the screen.

### language/blocks/inherited-rows.ts

What is still on screen when each block begins. The pixel buffer is cleared once per message and
no handler clears it again, so a block inherits the surviving rows of every block before it. Only
two things remove a row:

- A scroll shifts the box up a line. The top row falls off for good, the other rows move up one,
  a blank row arrives at the bottom, and the pen parks on that bottom row. Inherit after a chain
  of scrolls and the rows come back shifted, not reset.
- Reaching the end of the message. A wait removes nothing.

A row marker removes nothing either; it only moves the pen to that row's left edge. That is the
one place this walk cannot use the default pen. `measureRows` runs the pen with
`blankOnJump: true`, treating the landing row as empty, so a fresh run is sized without an
earlier run's leftovers charged to it. Its widths are relied on, so that convention stays. A
faithful screen needs the opposite, and asks the pen for it here with `blankOnJump: false`. Both
conventions are described under `language/layout/box-pen.ts`.

The walk replays each block's own tokens (`joinLines`) through the shared pen, so there is one
layout engine and the row a line lands on is the engine's answer, not the editor's. The two
differ in one authored case: a line with no code of its own after a wait is numbered row 1 by box
convention, while the engine leaves the pen wherever the previous block left it. The rows here
follow the engine. The inherited rows are read before the block draws anything, and the first
block inherits a cleared buffer.

### language/choices/types

The decomposed view of a choice prompt: an entry whose final control code turns its last lines
into a selection menu. `question` is a verbatim slice of the original stream, advance codes and
waits included. Each option keeps the advance code that put its line on a row, exactly as
authored, so the inverse can rebuild the entry byte for byte. Nothing is normalised or invented.

- `ChoiceCode`: `Choose3` takes three options, the other codes take two.
- `ChoiceOption.tokens` holds content tokens only: no advance code and no prompt code.
- `ChoiceShape.options` are the trailing lines the cursor moves between, in stream order.
- `LineSpan` locates one line by token index, the same split as `lines/split-lines`. `start` is
  the line's first token (its advance code when it has one), `contentStart` the first content
  token, `end` one past the last content token, and `endsBox` says a wait for button closed it.

### language/choices/choice-shape-of.ts

Detects a choice prompt and takes it apart into question and options. The shape was worked out
from a stored language set: 397 entries, 43 of them prompts, at ids 2, 3, 7 to 13, 25, 38, 45, 51,
134, 137, 138, 140, 142, 150, 201, 202, 210, 217, 218, 219, 230, 244, 255, 266, 284, 287, 315, 323,
324, 331, 335, 353, 383, 386 and 389 to 392. In every one of them:

- The prompt code is the last token of the entry, always without a parameter.
- The options are the last lines before it: three for `Choose3`, two for the other codes. One
  option per line, and no wait for button falls inside them; a wait always sits at the end of the
  question part.
- Option lines open with a row marker (rows 2 and 3 after an in box question, as in 142, 218, 219
  and 315; rows 1 and 2 for `Choose2`, as in 389 and 391; rows 1 to 3 for `Choose3`, as in 390) or
  with a scroll when the question already scrolled (25, 134, 137 and most others). The cursor
  redraw entries 2, 3, 12 and 13 even order their row markers bottom first, so an option's
  advance is data and not a derivable position.
- The selection cursor column is baked into the option text: the default option starts with a
  cursor glyph and the others with spaces covering the same cells (`Selchg` indents both by one
  more cell). Entry 335's options carry number substitutions, and 389 and 390 open with message
  config codes on the first option's line, so option content is not always plain text.

Detection mirrors those facts and answers null for anything that deviates, so the caller falls
back to the raw stream editor and never guesses.

### language/choices/tokens-from-choice.ts

The exact inverse of `choiceShapeOf`. The question slice goes out verbatim, each option adds its
own advance code and then its content untouched, and the prompt code closes the stream, so
taking an entry apart and rebuilding it gives a byte identical serialization. Nothing is
corrected: an option whose advance disagrees with its position goes back out as it came in.

### language/choices/with-added-option.ts

The prompt code fixes the option count, so growing the list changes the code. A two option shape
grows only into `Choose3`. Anything past three options has no code, so the grower answers null
and never produces a stream the engine cannot run. A new option follows the pattern of the line
above it, taking the next row number down or another scroll, and starts with the spaces
(`CURSOR_COLUMN_SPACES`) that keep its text out of the selection cursor column.

### language/choices/with-removed-option.ts

A three option shape shrinks into `Choose2` when its first option sits on row 1 (the layout that
code is used with in authored data), or into `Choose` otherwise. Removal renumbers only trailing
row markers so the survivors stay consecutive; scroll advances are left alone.

### language/codes/code-catalog.type.ts

The plain language control code catalog: the layer that turns a bracketed engine code
(`[Speed 04]`, `[Waitkey]`) into something a translator can read and pick from a menu.

- `CodeRisk`: `safe` is an ordinary formatting or timing code. `structural` builds part of a fixed
  UI shape (a choice cursor, an item picker); it is fine to place, but the surrounding lines
  matter. `dangerous` has no working handler: inserting it breaks or hangs the game, and it is
  never offered in a menu.
- `CodeScope`: a `positional` code acts at the point it appears in the token stream. A `message`
  code is consumed in a pass before the message shows and applies to the whole message; when more
  than one appears, the last one in the string wins.
- `CodeParamRange` is a display hint only, independent of what any one language can encode.
- `CodeInfo.param` is present only when the table gives a known practical range; its absence does
  not mean the code takes no parameter. `offerInMenu` says whether a code picker offers the code
  at all.
- `StructuralEntry` names a dialogue entry a translator must never edit.

### language/codes/code-catalog.data.ts

One entry per control code the game's languages can emit, checked against the decompiled engine.
It covers every name in every language's `commandNames`
(`packages/asset-extraction/src/text/data/language-data.ts`). `EndMessage` (EU only) has no documented
behaviour of its own: it is absent from `kCmdInfo` in `dialogue-encoder.ts`, which fits it being
an automatic message terminator and not something a translator places by hand. It is catalogued
as `structural` on that basis, not from a confirmed engine fact.

### language/codes/encodable-params.ts

Two notions of range are involved. `CodeInfo.param` is a fixed display hint that does not depend
on the language. `encodableParams` computes what a specific language can bake, straight from the
encoders in `dialogue-encoder.ts`.

- The `org` encoder (`orgEncoder`) writes any parameter byte verbatim once the command occupies a
  two byte slot in the language's own `commandNames` and `commandLengths`. There is no narrower
  validation, so the whole byte range is accepted.
- The `new` encoder (`newEncoder`) never reads the language config. It looks the name up in the
  global `kCmdInfo` table, whose parameter map can map a value to null: present but not
  encodable, like `Window` 0 or `ScrollSpd` 0. Those are filtered out.

### language/codes/glyph.ts

Tells a bracketed picture glyph (a button icon, an arrow, `...`) apart from a real control code.
Both are spelled the same, as a bare `[Name]` bracket run, and `parseTokens` classifies both as
`cmd` tokens without a parameter so they round trip. This is the follow up at the presentation
layer: look the bracket's name up in the language's own `alphabet`, where every glyph is listed
with its brackets intact (`'[A]'`).

### language/codes/structural-entries.constants.ts

Dialogue entries a translator must never edit, keyed by `DialogueEntry.id` (1-based, the game's
own positional index). Ids 2 and 3, 7 to 9, 10 and 11, and 12 and 13 are the two and three option
choice cursor frames: each holds only control codes, spaces and a `>` cursor, and every choice
prompt in the game reuses them. Id 5 is `EXTRA_STRING`, the synthetic control string the
extraction pipeline injects at index 4 to pad a 396 string ROM dump up to the canonical 397
(`packages/asset-extraction/src/text/build-language-entry.ts`). It never existed as translatable prose.

### language/compile/compile-set.ts

The bake step. It turns an editable `LanguageSet` into the packed entry the asset blob builder
takes: it resolves every variable reference, serializes the token streams back to the bracket
string format the compression path expects, and hands the packing to `buildPackedEntry` in
`packages/asset-extraction/src`, which runs the same dictionary and compression logic a ROM extracted
language goes through. It is a pure function with no file or ROM I/O.

The compiled entry's language code is the set's id, not its base. `id` is what `kDialogueMap`
carries and what the INI `Language` key selects at boot; `base` only supplies the alphabet,
dictionary and encoder the set inherits. `buildPackedEntry` is called with the base code so
encoding uses the right config, then the result's `code` is set to the set's own id.

- `BAKE` mode keeps the raw code for a variable the game owns and expands everything of ours to
  literal text. The preview runs the same resolution with sample values, which stops the two from
  drifting apart.
- `EXPECTED_LINE_COUNT` is the canonical 397 dialogue lines every compiled entry must match, as a
  contiguous run of ids 1 to 397.
- `NON_BASE_INDEX`: a non zero index tells `buildPackedEntry` this is not the base US ROM entry
  (its flags bit 1 means no US ROM match). A compiled set is always assembled as an extra beside
  the US entry, never as index 0.
- `SetFont` is the persisted font a set carries beside its dialogue: the raw 2bpp glyph sheet and
  its per glyph width table, the same pair `buildPackedEntry` takes from a ROM extraction.
- A set read through storage carries `variables`. One built in memory may not, so the code falls
  back to projecting the legacy pair and still compiles.

### language/compile/compile-sets.ts

Bakes a whole collection of language sets into the packed entries the asset blob builder takes
as extras. Both hosts run this step when they recompile a ROM's asset blob (the main process in
process, the web renderer inside its extraction Worker), so the rules live here once.

It tolerates faults by design. One set that cannot bake (an alphabet the base language cannot
encode, a dialogue list that lost an entry) must not cost the user every other language in the
blob. Each set compiles on its own, and a failure is reported through `onWarn`, which names the
set, and then skipped.

Every stored set becomes an extra, with no id filtering. That matches the folder scanning path it
replaced, including one degenerate case: a set whose id equals the base entry's code (`us`) is
still baked, but the core's lookup takes the first match in the map, so index 0 shadows it and
its content is unreachable. That stays on purpose.

`SetBakeInput` carries the font pair as `Uint8Array`, the storage layer's own type, so the value
survives a structured clone hop to a Worker. The Node `Buffer` wrapping `compileSet` wants
happens here. The function is pure apart from the `onWarn` callback.

### language/glossary/resolve-refs.ts

Replaces every `ref` token with its glossary term's value and merges the adjacent text tokens
that result. It throws when a ref points at a missing key. Text tokens are always copied, so a
later merge never appends into a token object the caller owns. Other token kinds pass through
unchanged.

### language/layout/types

Types for the text box the engine draws. The box interior is fixed at three rows of 21 tiles
(`ROW_WIDTH_PX` is 21 tiles of 8 pixels, 168). The renderer advances the pen by each glyph's own
width and never checks the row bound, so a row authored wider than the interior overruns into the
next row's tiles and does not wrap. Measuring a line in pixels is the only way to know whether
authored text is safe, and every consumer here shares one definition of that measurement.

- `GlyphMetrics` is what sizing and drawing one language's glyphs needs: the per glyph advance
  table, and the alphabet that maps a character to its glyph index.
- `GlyphSheet.tiles` holds the glyph tiles: paired 8x8 halves that make 8x16 characters.
- `RowFit` is one laid out row. `row` is 1-based within the box, `glyphs` are alphabet indices in
  draw order, and `overflow` is true when the row exceeds the interior and the engine would
  corrupt it.
- `ScreenFit` is one box of text as the player sees it before the next wait. A message is a
  sequence of these. The engine never clears the box between them, it scrolls, so a screen
  carries whichever rows were rewritten. `index` is 1-based within the message, and
  `waitsForButton` says the screen ends on a button wait and does not run straight on.

### language/layout/glyph-metrics

The measurement primitives every layout step builds on: a language's per glyph advance table, the
greedy matcher that turns authored text into glyph indices, and the advance lookup.

Matching is greedy longest match over the alphabet, because that is what the encoder does
(`encodeGreedyFromDict` in `packages/asset-extraction/src/text/dialogue-encoder.ts` checks the whole
bracketed run against its alphabet map before it falls through to a single character). Several
alphabets carry entries of more than one character, such as bracketed picture glyph names for an
icon or a button face, and the ellipsis run. Each of those is one glyph with one advance. Matching
a character at a time would score the ellipsis as three dots, and a row the engine draws at one
glyph's width would be predicted three times too wide. Longest match keeps the prediction and
the bake in step.

The dictionary is not simulated, on purpose: every dictionary entry is itself spelled out of
alphabet characters, so it expands to the same glyphs at draw time and cannot change a row's
width.

- `FALLBACK_ADVANCE_PX` is charged to a glyph index the width table has no entry for. The table
  holds values 1 to 8, so the widest glyph is the safe assumption: a row is then never reported
  narrower than the engine could draw it.
- `GlyphMatch.index` indexes both the alphabet and the width table. `length` is the characters
  consumed, more than one for an entry of several characters.
- `lookupFor` memoises the reversed alphabet per metrics object. The cache is keyed on identity
  and never observable, so the functions stay pure.
- The reversal walks the alphabet in ascending order and overwrites: a few alphabets list the same
  character twice, and the encoder's own reversal keeps the last index. This mirrors it.
- `buildGlyphMetrics` pairs a language's alphabet with the raw bytes of its `font-width.bin` (one
  byte per glyph index, in alphabet order). Both are copied, so a later edit to either source
  cannot change a measurement behind its back.
- `GlyphRun.unmatched` is text the alphabet has no glyph for. It is reported and never charged a
  width. A bracketed run is reported whole (`[Unknown]`, not a lone `[`) so the report names
  something the author can find, the same way `validateEntry` reports it.

### language/layout/box-pen

The text box as the renderer drives it: three row buffers and one pen, advanced token by token.
`measureRows` and `splitScreens` both run this walk, so their verdicts cannot disagree.

Engine behaviour modelled:

- Writing advances the pen by each glyph's width and never checks the row bound. A run wider than
  the interior is recorded as overflow and not wrapped.
- A row marker parks the pen at the left edge of that row without clearing it.
- A scroll (`Scroll`) shifts the box up one line and parks the pen on the last row.
- A wait for button (`Waitkey`) holds the box and clears nothing, so the next screen inherits
  whichever rows still stand.

Two conventions exist for a row jump:

- `blankOnJump: true`, the default, treats the landing row as empty. It is a measurement
  convention: a fresh run is sized without an earlier run's leftovers, and every published width
  depends on it.
- `blankOnJump: false` is the engine's real behaviour. The pixel buffer is cleared once per
  message, so a row marker blanks nothing and a shorter rewrite only paints over the left part.
  Anything showing what is on screen (`blocks/inherited-rows.ts`) must use this mode; anything
  reporting a width must not.

Details:

- `Run.offsets` holds each glyph's left edge in pixels from the row start.
- `BoxRow.drawn` says something was written, even if it turned out to be unmeasurable. `stale` is
  what stood when the pen last returned to the row's left edge; only the faithful mode keeps it.
- `Pen.row` is 1-based. `runs` holds every closed run, oldest first, including runs later
  overwritten. `unmatched` is text no glyph was found for, in encounter order. `edits` counts
  visible changes so a caller can tell when nothing happened.
- `visibleRun` is the row as the player sees it: the pen's own run, then the part of an earlier
  run it did not paint over. A glyph straddling the new run's right edge is half repainted, so it
  drops out of `glyphs` while its pixels still count toward `widthPx`. A row's glyph widths need
  not add up to its width.
- `closeRun` records the run the pen just finished; the row itself stays on screen.
- A bracketed name without a parameter is a glyph when the alphabet spells it: several alphabets
  carry bracketed picture glyphs, and the token parser cannot tell those from a control code
  without a language. Anything else is a real control code and moves the pen by nothing.
  `codes/glyph.ts` answers the same question given a `LanguageConfig`; measurement holds only the
  metrics and needs the index, so it goes through the matcher.
- `applyToken` needs refs already resolved.

### language/layout/layout-plan

What the two runtime substitutions are worth in pixels, decided once before a measurement walk.
Neither has a fixed width, so a fit prediction has to commit to something.

- The player name draws 1 to 6 glyphs (the entry field holds six characters and trailing spaces
  are trimmed), and each one counts toward the row like literal text. With no sample the plan
  assumes the worst case, six of the widest glyph in the language's table, so a row reported safe
  is safe for every name a player can enter. `nameSample` measures one concrete name, for a
  preview that matches what a given save would show; it is trimmed and capped at six glyphs the
  way the engine substitutes it.
- The number substitution draws exactly one digit glyph. With no digit given the plan uses the
  widest digit in the alphabet, so a safe verdict holds whatever value the game prints.
- `LayoutPlan.nameUnmatched` is anything in `nameSample` the alphabet could not draw.

### language/layout/measure-line

Row level fit measurement: how wide every run of text in a token stream comes out, and which runs
the engine would draw past the row's edge.

One `RowFit` comes out per pen run, not per physical row, so a row written twice reports twice.
That matters for an overflow check: an entry that overruns row 1 and then returns to row 1 with
something short would look clean if only the final state were reported, and the overrun would
ship. Runs come out in the order the pen closed them.

Unmatched text is never charged a width; it has no glyph and no advance, so it cannot count as
zero either. `measureRowsDetailed` returns it beside the rows, and an entry with a non empty
`unmatched` list reads as unmeasurable, not safe. `measureRows` is the thin form for callers that
already validated their text (`validateEntry`).

### language/layout/split-screens.ts

Cuts a token stream into the boxes a player pages through. A screen ends at a wait for button and
nowhere else. A scroll is not a cut: it shifts the box up a line and parks the pen on the last
row, so the text on either side shares one box. The engine clears nothing at a wait, so the walk
carries straight on across the cut. That is why each screen reports the rows visible while it
waits, leftovers from earlier screens included.

Trailing content after the last wait becomes a final screen with `waitsForButton: false`, and so
does a stream that never waits. A stream ending on its wait adds no such screen, because nothing
was drawn after it. For an overflow audit use `measureRows`: it reports every run the pen closed,
including ones a later run overwrote, while the rows here are the surviving visible state.

### language/lines/types

The line view of one dialogue entry: the editor's model, not a second layout engine. The engine
writes into a three row box and never wraps, so authored text is a stack of lines. Each one begins
with the code that put the pen there (a row marker or a scroll) and ends where the next such code
appears or at a wait for button, which a reader sees as the end of a box. Modelling that directly
gives an editor numbering and a width budget per line, the way a code editor gutters its lines.

These views are derived and read only. Every measurement comes from the shared layout walk
(`layout/box-pen`), and `advance` holds the code as it was authored so the inverse can put it back
untouched.

- `LineAdvance` is what put the pen on a line's row: an explicit row code (kept as authored even
  when it looks irregular), a scroll (the box shifts up a line and the pen parks on the bottom
  row), or null for no code at all, as on an entry's first line or the line after a wait.
- `DialogueLineView.index` is 0-based across the entry. `box` is 0-based, and a wait starts a new
  box. `row` is 1-based within the box, as the engine would place it. `advance` is the code that
  started the line. `tokens` are content only, without the advance code or the trailing wait.
  `endsBox` is true when a wait for button follows. `count` counts characters, with a
  substitution or a picture glyph as one. `freePx` is the pixels still free on the row, negative
  when it overruns.
- `LineDraft` is a line before it is measured or numbered.

### language/lines/advance-codes

The three codes that shape a line (row marker, scroll and wait), read in one direction and
written back in the other. Split and join share this module so they cannot drift: whatever is
recognised as an advance here is exactly what gets written back, which is what makes an
untouched entry round trip.

A code only counts when it carries no parameter, matching `applyCmd` in `layout/box-pen`: the
engine's scroll and wait take no argument, so a lookalike with a parameter is an unrelated command
and stays ordinary content. `advanceOfToken` answers `undefined` for ordinary content, which is
different from a null advance (a real answer: a line with no code of its own).

### language/lines/advance-for-new-line.ts

The code for a line being created. Nothing else here derives an advance: `splitLines` keeps what
it read and `joinLines` writes it back, so the only place a code is invented is the moment an
author asks for a new line, and the caller says when that is. The box fills from the top: row 1,
then row 2, then row 3, and once the bottom row is taken the box has to scroll to make room. A
line added after a wait that ends a box starts the next box, so it opens at row 1 again.

### language/lines/join-lines.ts

The exact inverse of `splitLines`. Each line contributes its own advance code, its content, then
a wait when it ends a box, and nothing else. No code is invented for a line whose `advance` is
null, and none is corrected on a line whose advance disagrees with its row. An entry that was only
read comes back out identical, so opening it in the editor cannot rewrite a translator's data. A
line that should get a derived code has to be handed one first, through `advanceForNewLine`; only
the caller knows a line is new.

### language/lines/line-metrics.ts

How much of a row one line's content spends, in pixels and in characters. The width comes from
`measureRows`, so a line is sized by the same walk that audits a whole entry and the two cannot
disagree. A line holds no advance code, so that walk closes one run and its width is the line's
width. That is also why a line is measured alone and does not inherit what an earlier line left
standing further right: a row marker starts a fresh run.

The character count is not the glyph total, on purpose. A gutter tells an author how much room is
left, and a substitution or a bracketed picture glyph is one thing they typed, so each counts once
however many glyphs it draws. Text no glyph matches still counts, so a mistyped bracket run shows
up as content and does not vanish. A bracketed name is a picture glyph only when the alphabet
consumes the whole name; a prefix match means it is a real command.

Refs are resolved once here, so the measurement walk gets an empty glossary: no ref is left to
look up, and a missing key is reported by this call.

### language/lines/split-lines.ts

Cuts a token stream into the lines an author edits. A line is closed by whatever comes next: the
following advance code, a wait for button, or the end of the entry. So a code is always the first
thing in a line and a wait is always the last, and neither needs to sit inline in the editor as a
labelled chip.

Nothing is normalised. An advance is stored as it was read, so a row marker that disagrees with
where the line sits stays that way, and `joinLines` puts it back untouched. Making up a code for a
new line is a separate decision (`advanceForNewLine`).

Numbering follows the pen in `layout/box-pen`:

- A row marker parks the pen at that row, so the line's row is the marker's.
- A scroll parks the pen on the bottom row, so a scrolled line is row 3 whatever came before it,
  including the odd case of a scroll while the pen was still on row 1, where the box shifts the
  earlier rows off the top.
- A wait starts the next box, and a box begins at row 1. The pen itself does not move on a wait,
  so a line with no code of its own is reported at row 1 by box convention. Authored data reaches
  the next box through a row marker, which decides the row by itself anyway.

A line is opened lazily: it only exists once something lands on it, so a wait followed by a row
marker gives one line and not an empty one first.

### language/migrate/set-from-pack.ts

Converts a legacy `LanguagePack` (`shared/types/language.ts`) into an editable `LanguageSet`: the
one time conversion a translation studio session runs when it opens a language that was only
ever extracted. It is pure, with no file I/O and no ROM access; the storage layer reads the pack
in and writes the set out. The pack's language code becomes both `id` and `base`, so the set
inherits its own alphabet, encoder and font unchanged until a translator forks it. `name` stays
the bare code, because the display name lookup lives in the renderer and not in shared code.

### language/migrate/empty-name-table.ts

A name table with no item or bottle names yet and English placeholder pause labels
(`dungeon-item` becomes `DUNGEON ITEM`). A later migration phase seeds real names from the game's
data zone; this never hardcodes them.

### language/structure/types

What a structural edit needs beyond the document: where the author is, and which language the
result has to be measured again in.

The caret is coarse on purpose. An edit here only cuts between tokens: a line is opened before
or after one, never inside a substitution or a control code, so a token offset says everything
the edits need and the editor keeps its own finer selection to itself. The word breaking pass is
the one step that cuts inside a text token, and it decides where from the row budget, not from
the caret.

- `Caret.line` is the 0-based line index across the whole entry, which is a view's own `index`.
  `token` counts the line's content tokens before the caret.
- `StructureContext.opts` is passed straight to the layout plan, so a preview measured with one
  concrete player name keeps measuring with it after an edit.
- `CaretSite.block` is 0-based. `blockStart` is the block's first line, counted across the entry.
- `StructureMode` is the set's stored `SetStructure` read as behaviour. The union lives with the
  set's own types because it is a stored field; a second copy could drift from the one written to
  disk.
- `StructurePolicy` is one mode's answers, and every edit reads these, not the mode name.
  `canOpenLine` says whether a line may open inside a box that holds that many lines.
  `cascadesAcrossBlocks` says whether an edit's push carries on past the wait that ends its box.
  `restartsAtBlock` says whether the derived numbering restarts at row 1 after a wait.
- `WorkLine` is a line in the middle of a reflow, with the box it belongs to and whether its code
  is derived.

### language/structure/modes.ts

The three ways the editor may restructure an entry, one Strategy object each. Every edit asks
the policy the same short questions and never tests the mode itself, so a mode is defined in one
place and a fourth would not mean hunting down conditionals.

- Continuous treats the whole entry as one flowing stack of lines. Opening a line is always
  allowed, and everything after it moves down, across box boundaries, because a wait clears
  nothing: the pen is still on the bottom row when the next box opens, so the honest code for the
  line after a wait is a scroll, not a return to row 1. A full box is not a wall: it scrolls, which
  is the engine's only way to make room, and the numbering pass writes that scroll by itself.
- Block keeps the author's boxes. A line may open only while its box still has a free row, and
  nothing outside that box is renumbered.
- Off opens no lines at all. The author's structure is theirs to type.

Whether the row and scroll codes are derived is not a question here: they are derived in all three
modes. That is the point of the feature, and a flag for it would only invite a mode where an
author hand types a code the engine then disagrees with. Off means do not restructure, not let
the codes rot. `STRUCTURE_MODES` lists the modes in the order a chooser should offer them.

### language/structure/locate.ts

Which box the caret is in, and how much room that box has left. The caret is addressed by line
across the whole entry, because that is what an editor's gutter counts and what
`DialogueLineView.index` means. Every edit needs the same three things from it: the box, where the
box starts, and how many lines it holds. The walk is done once, here, and a caret out of range
gets null and not a clamped guess.

### language/structure/apply-enter.ts

What pressing Enter does. The caret's line is cut in two: the part before the caret stays, and
the part after it becomes a new line directly below. The wait does not move. It belongs after the
last line of a box, so the second half inherits it and the box still ends where the author put
it.

Everything below the cut then moves down a row, and the codes that say so are derived, not typed
(`pushDown`). How far that reaches is the mode's decision:

- Continuous pushes to the end of the entry, past every wait, so a line inserted in the first box
  shifts the whole message down one row.
- Block pushes only to the end of the caret's own box, and refuses once that box already holds
  its three rows. The author asked for their boxes to be left alone, and spilling into the next
  one without a word is not leaving them alone.
- Off does nothing.

A refusal returns the document it was given, unchanged and by identity, so a caller can tell
nothing happened without comparing documents.

A traceless line has no code, no content and no wait. It leaves no trace in the token stream and
would be lost on the way back, so the push has to give it a code. That is also what an author
expects, having just asked for a blank row.

### language/structure/end-block-at.ts

End here: the wait goes after the caret's line. It lands at the end of that line and not at the
caret, because a box ends where a row ends; a wait dropped mid row would hold the screen with half
a sentence on it. Nothing is added or removed: the same lines come back, cut into two boxes, so
the text is untouched and only the button press is new. When the caret is already on the box's
last line, the wait this would insert is the one already there.

### language/structure/continue-by-scrolling.ts

Keep going: the box gains one more line, reached by a scroll. That is the only choice, because a
scroll is the only way the engine makes room. The pixel buffer is cleared once per message and the
blitter draws by inverting the tiles under it, so a row written a second time inverts what is
already there and leaves the tail of the older, longer row standing. There is no fresh box to
offer, and offering one would produce corruption. The new line takes over the box's wait, so the
box still ends the way it ended: a box that waited still waits, and one that ran to the end of the
message still does.

### language/structure/break-line.ts

Where a line that has grown past the row has to be cut. The engine never wraps and never checks
the row bound, so a row authored wider than the interior is drawn straight into the next row's
tiles. Wrapping has to happen while the text is written, and this is the measurement half: the
last word boundary whose left side still fits the row.

Only a space is a cut point. A cut anywhere else would change what the text says: this alphabet
has no soft hyphen, and inserting a real one puts a character on screen the translator did not
write. So a single word wider than a whole row is left whole and reported as an overrun
(`overflow` from `lineMetrics`). Truncating it would lose text and hyphenating would invent text;
refusing does neither, and the author can shorten a word without changing its meaning.

The space itself is dropped, the way any wrap drops it: it joined two words, and carrying it onto
the next row would show as an indent. Codes and substitutions are never split; a cut lands before
or after one. A head only grows as the cut moves right, so the first candidate that overruns ends
the search. A cut with an empty head is no cut: that is the over long single word, and answering
null there leaves it whole and keeps a caller's loop from spinning on a line it cannot shorten.

### language/structure/next-advance.ts

The code a line gets when its position is derived, asked of the one sanctioned place that invents
codes. `advanceForNewLine` answers the per box question: row 1, then 2, then 3, and a scroll once
the bottom row is taken, restarting at row 1 after a wait. Continuous mode wants the same walk
without the restart, because the box is never cleared: the pen is still on the bottom row when the
next box opens, so a scroll is what moves the text up, and a return to row 1 would paint over a
row that still stands. That one difference is expressed by handing `advanceForNewLine` a previous
line with its wait hidden, so there is still one place where a code is invented.

### language/structure/row-of-advance.ts

Where the pen lands once an advance applies, by the same rule `splitLines` numbers its lines with:
a marker names its row, a scroll parks on the bottom row, and no code means the box's first row.

### language/structure/push-down.ts

The push: every line from an edit onward gets the code the engine needs to put it where it now
sits, and every other line stays as authored. A seed marks a line the author changed or a line
just created. From a seed the walk keeps deriving codes forward; inserting a line really does
move the rows below it. The policy decides how far: continuous carries on past a wait, the other
two stop at the end of the box.

A line before any seed, and every line when there are no seeds, keeps the advance it was read
with, irregular or not. That is the anti corruption property: an entry nobody edited comes back
with its codes untouched, so `joinLines` writes the original token stream byte for byte.
`splitLines` never invents a code and `joinLines` never corrects one, so this walk is the only
thing between an opened editor and a rewritten translation. Line count and content are never
touched; only `advance` and the `row` it implies can change.

The cursor carries the row a line ended up on, whether from a derived code or an authored one, so
numbering resumes from the authored position and not an idealised one.

### language/structure/rebuild.ts

Back to a fully derived document, through the canonical split. Every edit here works on a plain
list of lines and only sets the three authored fields: `advance`, `tokens` and `endsBox`.
Everything else a view carries is derived (index, box, row, widths). The edited list is written
back out as tokens and read again by the one walk that owns that numbering, so an edit cannot
invent a row number the layout engine disagrees with.

The round trip is exact for anything these edits produce: `joinLines` writes a line's own code,
its content, then its wait, and `splitLines` cuts on exactly those. The one shape it cannot carry
is a line with no code, no content and no wait, which has nothing to write and so nothing to read
back. That is why an edit that empties a line gives it a derived code first.

### language/structure/reflow.ts

Puts an edited entry back in shape: wraps what the author has overrun, and derives again the codes
that say where each line sits. Two passes, and the order matters, because a wrap adds lines and
the numbering has to be the numbering of the final stack:

1. Wrap. Only a touched line is cut again, at its last word boundary, and only while the mode
   allows another line to open. A wrap can cascade: the remainder is measured too, so a paste of
   three rows of text lands as three lines. A word too wide to break is left whole and keeps
   reporting `overflow`. The wait stays with the last line of the box, so the head gives it up.
2. Push. Every line from a touched or new one onward gets a derived code, as far as the mode
   reaches (`pushDown`).

A line the author has not touched, sitting before anything they have, comes back as it was read,
irregular code and all. With an empty `touched` set that is the whole entry, so opening an entry,
measuring it and writing it out again cannot rewrite a single byte. That is the property this
folder is built not to break: the line model never invents a code on its own, and this is the
only pass that may.

### language/text/types

The translatable text model: every string the game shows that is not a dialogue line, as a flat
list of slots the editor can render. The catalog decides which slots exist. It is rebuilt from the
shipped data on every load, so a set that was never touched still shows every slot with its
original text beside it. Storage only holds the translator's overrides, keyed by the same slot
keys, so a set whose stored payload is empty cannot be told apart from a fresh one.

- `TextGroupId` names the four surfaces a translator works on, each with its own slot source.
- `TextLimit`: `glyphs` is a character budget on a fixed cell surface, over several lines when
  `lines` is set. `tiles` is a raw tile width budget. `none` is a surface with no cap of its own.
- `TextSlot.key` is stable and unique within its group. `label` is the slot's name as the
  translator sees it. `fallback` is the shipped original, shown when there is no override.
  `alphabet` says which characters the surface can draw: `pack` is the set's own glyph sheet,
  `latin-caps` a fixed A to Z ramp baked into the drawing code. `note` states a caveat, such as a
  surface that cannot spell again.
- `TextGroup.note` is a caveat true of the whole group, said once and not on every row.
- In `TextOverrides`, an absent key means untranslated: use the fallback.
- `DecodedLine` is one line as the decoder reports it, matched by structure and never imported.
  `DecodedSlotOptions.keyPrefix` goes in front of each key so two decoded groups never collide,
  and `note` is attached to every slot produced.
- `NamedKind` lists the record kinds that carry a display name a translator would want to reach.
- `RecordSource` is how the caller reaches the records. It is handed in, not imported: this
  module is exported from the language barrel, which the storage layer imports, so a direct
  dataset import would pull the record loaders into every bundle that touches storage, the
  desktop main process included.

### language/text/group-index.ts

Assembles the four groups the editor renders, in render order. This is the whole catalog, rebuilt
from the shipped data on every call and never stored. Two groups come from data this module can
reach itself. The other two are decoded from the loaded pack by the caller and handed in, because
nothing here may reach into the extraction pipeline. The record source is handed in for the same
reason in reverse. `decodedNote` is said once for each decoded group when the words came from
another region's file.

### language/text/catalog/from-decoded.ts

Turns the decoder's output into catalog slots; this is how the menu and credits groups get their
contents. The decoded lines arrive as a parameter, not an import: the decoder lives in the asset
extraction pipeline, which reads a user ROM and has no business being pulled in by a model on
this side of the app. Key and limit pass through untouched, since the decoder alone knows what
the surface measured. Keys read like paths, so the last segment names the line.

### language/text/catalog/pause-names.ts

Slots for the pause menu surfaces: the inventory item names, the bottle contents, the six panel
headings and the six ability words, 42 slots in all (23 item names, 7 bottle contents, 6 panel
headings, 6 ability words).

The first three come straight from the shipped name table, so the keys here are that table's
keys: `<record-id>-<tier>` for an item (the tier is always the last segment), the raw bottle
content value, the panel key. An override folds back onto it without a translation step. The
ability words have no data home yet (they are still an array in the drawing component), so they
are restated here: `ABILITY_WORDS` copies the hardcoded `abilityGrid` array in
`apps/desktop/src/compounds/PauseAbilitiesPanel/PauseAbilitiesPanel.tsx`, because
nothing under `shared/` may reach into `apps/`.

Every one of these surfaces draws from a fixed A to Z ramp, not the set's glyph sheet, hence
`latin-caps` throughout. The limits are proven from the drawing tables in the core: 8 glyphs over
2 lines per item, 5 glyphs over 2 lines in the ability box, and one row of the panel's inner width
(8 glyphs) for a heading. `LEVELLED_ABILITY` is the one ability the drawing code suffixes at run
time with its level.

### language/text/catalog/world-names.ts

Slots for every named thing in the record dataset: places, rooms, pickups, chests and the
structures that hold them. They are read through the dataset facade the caller hands in, the only
door into the records, so this list follows whatever the registry holds. When the dataset is
absent the registry holds nothing, every lookup returns an empty list, and this builder yields
`[]`. That is a supported state, not an error. These names are drawn with the set's own glyph
sheet and laid out by the dialogue system, not a fixed cell surface, so they carry no length cap
of their own.

### language/tokens/parse-tokens.ts

Bracket string to token stream: the import half of the adapter between the stored dialogue dump
format (written by `formatDialogueText` in `packages/asset-extraction/src/text/dialogue-decoder.ts`) and
the editable language set model. Classification is purely syntactic. No language config is read,
so one parse serves every entry of `kLanguages`.

```text
[1] [2] [3]      break tokens (the line start markers)
[Name]           var, the player character's name substitution
[Number NN]      var, a numeric value substitution in slot NN
[Word NN]        cmd carrying a numeric param
[anything else]  cmd with no param
```

The last rule also absorbs, on purpose, the bracketed picture glyph entries some alphabet tables
carry (icon, button, arrow and ellipsis names). Those are ordinary characters, not control codes,
but they are spelled like a code without a parameter, and no glyph name can collide with the
parameter form because none contains a space. Treating them as `cmd` tokens keeps
`serializeTokens(parseTokens(s)) === s` exact for every string the decoder can write, which is the
invariant that matters. A later step that must tell a glyph from a control code looks the name up
in the language's own alphabet. `ref` tokens are never produced: a glossary reference only exists
once a translator tags one by hand. Text runs are maximal, so the result never holds two adjacent
`text` tokens. Command names never contain whitespace.

### language/tokens/serialize-tokens.ts

Token stream to bracket string: the export half of the adapter and the exact inverse of
`parseTokens` for every string the dialogue decoder can write. The output feeds the existing
compression path, so it must match `formatDialogueText` byte for byte: a parameter is written in
decimal and padded to at least two digits (`0` to `00`, `15` stays `15`, `255` stays `255`). A
`ref` token cannot be serialized: `resolveRefs` expands glossary references first, and reaching
one here means that step was skipped.

### language/validate/validate-entry.ts

Predicts, without baking, whether an entry's tokens will encode without error: every `text`
token's characters must resolve against the language's alphabet, and every `ref` token's key must
resolve against the glossary. `cmd`, `break` and `var` tokens are taken as well formed by the
editor and are not checked. An `EntryIssue` is shown live in the translation editor before a bake
would fail.

The text walk matches the encoder's greedy matcher (`encodeGreedyFromDict` in
`dialogue-encoder.ts`, alphabet branch): a bracketed run is matched whole against the alphabet,
and everything else one character at a time. Dictionary matching is not simulated, because every
dictionary entry is made of alphabet characters (`encodeDictionary` enforces this), so skipping it
never turns a success at bake time into a reported failure.

### language/variables/types

One editable substitution list, replacing the two parallel tables a language set used to carry: a
glossary of reusable phrases, and a name table only the pause menu read. They looked alike and
could not reach each other: a term could not retitle a menu entry, and a menu entry could not
appear in a line. A translator now sees one list of everything that varies in shown text, theirs
to change or the game's.

`VariableKind` decides where a value comes from and how it bakes:

- `engine`: the running game substitutes it, so there is nothing to translate. Exactly two exist
  (`./builtin`). `value` is null and `locked` is true, but the entry stays insertable: a line may
  reference it, and the bake step writes the control code the engine reads.
- `term`: a reusable phrase the translator owns, referenced from a line and expanded to literal
  text at bake time.
- `menu-name`: a display string outside dialogue (inventory names, bottle contents, menu section
  titles). Same expansion rules as a term, so a name can also be dropped into a line.

Fields: `key` is unique within a set and reused verbatim as a token `ref` key. `label` is what a
picker shows. `value` is null when the game owns it. `locked` means editable nowhere but still
insertable. `maxGlyphs` is the worst case glyph count, for the row fit maths. `VariableIndex`
maps key to variable for the constant time lookups an expansion walk needs.

- `Occurrence` is one run of literal text that should reference a variable: the entry, the text
  token's position in its stream, the match offset in that token's text, the characters present,
  and the variable key. `exists` is false when the variable is not in the set yet. `match` is
  `exact` (safe to swap) or `case` (matched only with case ignored, reported for a translator to
  judge and never rewritten).
- `Candidate` is one spelling to search for and the variable it should become. `exists` is always
  true: every needle comes from a variable the set holds.
- `LegacyNameData` is the pair the old model persisted, and still the shape every current reader
  expects. It is produced from a variable list and not stored beside it.
- `ResolveOptions.samples` are preview stand ins for the engine variables, keyed by variable key.
  A missing key falls back to the neutral worst case samples.
- `RunScan.exact` holds start offsets of exact case occurrences, the replaceable ones. `caseMiss`
  holds offsets that match only with case ignored.

### language/variables/builtin

The only two substitutions the engine performs at run time, expressed as variables. The message
renderer injects a save file's name field and one digit of a live counter, and nothing else.
There is no item name, place name or count injection anywhere in it, so everything else a set can
vary is ours and has to be expanded to literal text before the dialogue is packed. These two are
locked because their value comes from the running game, never from the set.

The worst cases are the engine's: the name field holds at most `MAX_NAME_GLYPHS` glyphs, the same
figure the layout planner bills it at, so a row judged safe here is safe there. The number
substitution draws one BCD digit, always. The keys match the `var` token names, so a token maps
straight to its variable. `builtinVariables` returns a fresh copy per call, so a caller can never
edit the shared definitions. `ENGINE_SAMPLES` are the stand ins a preview shows where the game
would substitute: neutral and worst case wide, with the name sample six glyphs wide like the
field.

### language/variables/variable-index.ts

A key lookup over a variable list, built once per expansion pass. The first entry wins on a
duplicate key. `variablesFromNameTables` puts the engine's two entries ahead of everything else, so a
locked entry can never be shadowed by a term that shares its key. The game owns those two, and a
set cannot define them again.

### language/variables/variables-from-name-tables.ts

The bridge between the one variable list and the two tables that came before it.
`variablesFromNameTables` folds a glossary and a name table into
one list; `legacyFromVariables` projects a list back into the pair, so the pause menu, the bake
step and the editor's tables keep reading what they always read. The result order is the engine's
two first (locked, so they always win a key clash), then the translator's terms, then the menu
names.

The pair round trips without loss in both directions for everything the old model could express:
a term returns as a term, a menu name returns to the slot it came from. Only the fields the old
model had no room for (`label`, `locked`, `maxGlyphs`, and a note on a menu name) are generated
again. A caller that wants to keep an edited label carries it over itself (`./merge-meta`).

Key shapes: an item keeps the key it already had (`<item-record-id>-<tier>`), so nothing that
references one has to be rewritten. The other two slots had no key shape of their own, so they
take a prefix that cannot collide with an item key: `bottle-<content>` and `label-<section>`. The
reverse never guesses from the key alone; `kind` says which table an entry belongs to first.

`maxGlyphs` for a literal value counts its characters. A bracketed picture glyph spelling
therefore counts high, which keeps a fit verdict on the safe side. A picker reads the value better
than the key, so the label is the value, with the key as fallback. `withNote` adds `note` only
when there is one, so a round trip never grows the shape.

### language/variables/legacy-from-variables.ts

Projects a variable list back into the glossary and name table pair the current readers expect.
Engine variables are dropped: they have no literal value, and neither table ever held one. A
`bottle-7` key maps back to bottle content 7.

### language/variables/merge-meta.ts

Carries the fields the legacy pair has no room for across a rebuild. A set is still edited
through its projected glossary and name table, so the variable list is rebuilt from that pair on
every save. That rebuild makes `label` from the value and cannot know about a note the
translator attached to a menu name, so both would be lost on every save; merging the previous list
back in keeps them. Values, kinds, lock state and widths come from the rebuild, on purpose: those
follow the text, and the text is what was just edited. Only presentation is carried over, and only
for a key that still exists with the same kind.

### language/variables/resolve.ts

The one expansion, used by both the editor's preview and the bake step so the two never disagree
about what a line will say. A reference to a term or a menu name becomes its literal text in both
modes; that text is ours and is packed into the dialogue. A reference to an engine variable is the
one thing that differs, because the game performs that substitution itself:

- `bake` leaves the control code in place (as the `var` token the serializer writes back), so the
  packed line still asks the engine to substitute.
- `preview` puts a stand in there, so a measured row reflects what a player will see.

The literal expansion is delegated to `resolveRefs`, keeping one implementation of text merging
and of the loud failure on a missing key. `stage` rewrites only what the literal expansion cannot
handle: an engine reference in either mode, and a control code already placed, in preview mode.
Anything else passes on untouched, including a reference to a key the set does not have, so the
missing key failure stays where it has always been.

### language/variables/find-hardcoded.ts

Where a set spells a name out instead of referencing it. A variable only earns its keep once the
lines that say it point at it: a reference follows a later rename, literal text does not. This is
the pure half of that job. It reports every run that could become a reference and says which
variable it should be, and changes nothing; applying a report is a separate, deliberate step.

Only `text` runs are searched, so a phrase broken by a control code, a line break or an existing
reference is not a match, the same rule the editor's term linking has always followed. Case policy
and its near miss reporting live in `./scan-run`. The widest match wins inside one run: once a span
is claimed, a shorter overlapping phrase is not reported, so a line is never offered two readings
of the same characters. Results come in reading order.

### language/variables/hardcoded-candidates.ts

The search list behind the hardcoded noun scan: every spelling worth looking for, paired with the
variable a line saying it should reference. The needles are the set's own variables, and only
those: a term or menu name the translator defined is the answer whenever its text turns up in a
line. Their values came out of the player's own file, the only place the game's own spellings may
live; this repository ships none of them.

Longest phrase first, one candidate per spelling. That order lets the scan claim the widest match:
a line naming a castle should offer the castle, not the wider region whose name is a prefix of it.
The first mention of a spelling wins, so an existing variable beats a proposal.

### language/variables/scan-run.ts

Finds a phrase inside one text run, split by the case policy: detect without regard to case,
offer only an exact match. A reference bakes back as the variable's value verbatim, so swapping a
run that reads a word in capitals for a variable whose value is in title case would restyle the
line without a word. Shouted words are a real device in this dialogue and are not ours to
normalise. A run is offered for replacement only when its characters match exactly, and the ones
that match ignoring case are reported separately with their positions, so a caller can say six to
replace, two differ in case. Fixing a near miss stays a deliberate edit.

This is the same policy the editor's term linking helper applies to a glossary term, ported here
because that helper lives in the renderer and shared code cannot depend on it. It is now the one
place the policy is implemented, and the renderer copy can fold onto it when the picker lands.

- `MIN_PHRASE_LENGTH` is 2: a single character is never a phrase worth replacing, and would
  shred every line it appears in.
- Occurrences never overlap: the scan moves past each match, so `aa` in `aaa` is one hit.
- Lowercasing changes the length of a handful of exotic characters, which would misalign the
  offsets a caller slices with. When that happens the scan reads the original text, so a wrong
  span can never be offered. The cost is that near misses go unreported for that run.

## logic

### logic/check-place.ts

Whether the place a check happens at has been reached. An item check has one screen. An event
that marks the first of several places reached (the dark world, from any of its regions) names
them all in `reachAny`, and any one of them opens it. A dungeon's stage event has no screen of its
own: it happens somewhere inside, so any room of its dungeon opens it and its own rule does the
rest. A combined row is a sum of other rows, never something to go and do, so it has no place.

### logic/check-status.type.ts

What the tracker says about one row: taken, in reach, or not yet.

### logic/evaluate-requirement.ts

Whether a dataset requirement is met by what is held and what is done. This is the dataset's own
small language (an item, an earlier check, `allOf`, `anyOf`, a count over an item group, or
impossible) and nothing more. It is not a rules engine and never decides where a player can go:
detection reads a record's `derived` and `fallback` with it (`tracker/derived-checks.ts`), the
simulator reads a boss gate with it, and the rows no world holds a location for are judged with it
(`logic/record-statuses.ts`).

### logic/record-statuses.ts

The status of a row from the dataset's own record: is its place reached, and is what it asks for
met. Only the rows no world holds a location for come here, which is every event and the fairy
rungs no pond sells (`tracker/tracker-statuses.ts`). Where the player can be is handed in,
derived from the one engine's regions (`logic/regions/reachable-screens.ts`), so this carries no
graph and no rules of its own. `reachableScreens` holds dataset screen ids. `checkOverrides` holds
rows whose requirement the file's own settings decide (`logic/row-overrides.ts`).

### logic/regions/reachable-screens.ts

The screens a player can stand on, derived from the regions the one engine says they can reach.
The engine answers in region ids and knows nothing about screens. Every screen points up at the
region a player walks it from, so this reads that pointer. A region that names a dungeon brings
the dungeon's whole room list with it, because a dungeon reached is a dungeon whose rooms can be
walked, and what each room then asks for is the row's own business. A region with no screen
contributes nothing; that is what the menu is: the graph's own root, a place in the rules and
nowhere in the game.

### logic/run-kind.type.ts

Which run the app is answering for. There are three, not two, and that is the point of the type:
a seed loaded from disk and an online multiworld are both randomized, but only the first can say
what any location holds. Asking whether there is a placement answers the first question and gets
the second wrong, which is how an online session came to be read as plain play.

- `normal`: the unrandomized game with everything on. Every location holds what it always did.
- `seed`: a placement generated here, so every location's item is known up front.
- `online`: a multiworld session. The server hands locations over one at a time, so nothing here
  knows what a location holds until it is collected.

### logic/hero-idle

The idler: what the character does in the pause menu portrait when nobody is asking. Pick a
sequence, play it out, pick again. A view needs `startHeroIdle`, `advanceHeroIdle` and
`heroPoseAt`; the rest is exported for the table's tests and for retuning.

Vocabulary: a sequence is a named thing the character can be seen doing, like standing, pacing,
swinging. A take is one performance of a sequence: the sequence, a facing, and the exact beats it
resolved to this time. A beat is one drawn pose held for a whole number of game frames, the only
clock the source animation understands. Beats carry their own facing, not the take, because a
sequence may turn part way through. Looking around is exactly that, and one facing on the take
would make it a different sequence per direction.

- `HeroSequenceKind` picks the builder that turns a table row into beats. The tunable numbers
  stay in the table; the shape of the motion is the game's own and lives in code.
- `HeroSequenceDef.weight` is a relative likelihood; only ratios matter. `frames` is the inclusive
  range the take's length is sampled from, in game frames, omitted where the game's own tables fix
  the length (a sword swing is as long as the swing is).
- `HeroBeat.action` is the pose atlas action id (`stateFor`). `frame` indexes
  `framesOf(state, facing)`. `vx` and `vy` are the drift in pixels per frame.
- `HeroTake.frames` is the sum of every beat's hold. `endFacing` is the facing the next take
  inherits. `HeroIdleState.startedAt` is the clock value the take started on, in game frames.
- `HeroPose` offsets are SNES pixels from the anchor.
- `HeroRng` returns a uniform value in [0, 1). It is injected so a test can hand in a seeded one
  and replay a take exactly; the view hands it `Math.random`. `seededRng` is mulberry32: small,
  fast, and good enough for choosing between six rows. `pickInt` is inclusive at both ends.

The machine is pure and clock driven. Nothing owns a timer or a frame loop: the caller passes the
current value of a game frame clock and gets back the state and the pose that belong to it, so the
whole behaviour can be stepped by hand in a test. Every take starts and ends on the anchor, so the
machine never carries a position between takes: the offset is a property of where you are inside a
take and is zero at both ends.

- `chooseSequence` never picks the row just played unless that row may repeat. The same sequence
  twice reads as a stutter and not a choice. Standing is the exception (`REPEATABLE`): two rests
  in a row is just a longer rest.
- `advanceHeroIdle` returns the same object while the current take still runs, so a caller can
  compare by identity. It loops (up to `MAX_CATCH_UP_TAKES`) because a menu left open in a
  background tab can come back with several takes of clock to catch up on.
- `heroPoseAt` clamps to the take's last beat and does not fall off it.
- `FACING_TOWARD_VIEWER` is where the idler starts, and where it returns after the flourish, which
  has no facing of its own.

The table (`sequence-table.ts`) is the whole behaviour: one row per thing the character can be
seen doing, so retuning the idle means editing numbers there and nothing else. Frames are game
frames at 60 a second. It paces most of the time, stands and swings often, and does the two
flourishes rarely enough to still be a small surprise the twentieth time the menu opens: walk
34/91 (about 37%), swing 22/91 (24%), stand 14/91 (15%), look 10/91 (11%), spin 8/91 (9%), raise
3/91 (3%). The walk range is quantised to whole out and back pairs by the builder, so its numbers
are the outer bounds it rounds inside: one pair (68) to two (136), 1.1 to 2.3 seconds.

Facings use the engine's own `link_direction_facing >> 1`: 0 up, 1 down, 2 left, 3 right. That
pairing makes `facing ^ 1` the about turn, because up and down are neighbours and so are left and
right, and that is the whole mechanism behind a pacing take landing back where it started. A look
around never picks the direction already faced; turning to it is not a turn and looks broken.

Takes with no sword:

- Standing is drawn from the walk action's standing frame (frame 0), the pose the engine itself
  parks on. A look take turns its head two or three times.
- Pacing returns by construction, not by arithmetic. The return leg is the out leg's beats with
  the facing turned about and the step negated, so the two legs cancel exactly whatever length was
  sampled; there is no drift to correct and no snap at the end. The excursion is capped at
  `MAX_LEG_CYCLES` walk cycles (17 pixels each, 34 at most) so the character paces around the spot
  it stands on: it is drawn at the live player's position, and a stroll of a hundred pixels would
  contradict the one fact the portrait is there to state. The sampled length is quantised to whole
  cycles first, because half a cycle is a foot left in the air and half a step of drift that never
  comes back.

Takes with a blade, each the engine's own button sequence played back with nobody pressing:

- A swing is what a tap does: the draw (action 0x27, nine frames on `kSpinAttackDelays`), then the
  single swing pose the engine draws at `button_b_frames == 9`, then the release.
- A spin is what a hold does: the same draw, then the held pose looping for the 48 frames
  `link_spin_attack_step_counter` needs to reach the charge threshold, then the twelve step
  release. The hold runs whole loops, because stopping half way through one would cut short a pose
  the engine never cuts short.
- Neither travels: the engine halts the character for both (`HaltLinkWhenUsingItems`).
- The flourish is the blade held overhead, the pose the engine reserves for the moment a sword is
  claimed, drawn for 11 frames. It has no facing in the atlas, so the facing passed only decides
  where the take leaves the character looking.

### logic/hero-idle/native-timings.ts

The engine's own animation clocks, transcribed from the decompilation, not chosen: an idle that
invents its own timings looks like a different character. The engine expresses a hold two ways,
and both are folded to frames the pose stays up: a counter that counts up to the table value
(`++c >= tab`, walking), so the hold is the table value; and a timer that counts down past zero
(`sign8(--t)`, every sword clock), so the hold is the table value plus one.

- Walking: `Link_HandleMovingAnimation`'s `tab3` on the normal speed branch
  (`x = link_animation_steps`, no dash, no drag). These are the holds. Step 0 is the standing frame
  and is only entered once (the cycle wraps 8 to 1), so the loop is frames 1 to 8 and lasts 17
  frames.
- The character covers one pixel per frame at normal walking speed, so a cycle is 17 pixels, a
  little over a tile. That lets a pacing take be measured in cycles and land back on the pixel it
  left.
- Drawing a sword: `LinkItem_Sword` advances `button_b_frames` 0 to 8 on `kSpinAttackDelays`, and
  `LinkOam_Main` draws action 0x27 at that index; each hold is the delay plus one. The swing
  itself (action 0x02) is the single frame the engine draws at `button_b_frames == 9`, before the
  release resets everything. The source note for `SWING_HOLD` reads: `kSpinAttackDelays[9]` is 0,
  plus one.
- Holding after the swing: `Player_Sword_SpinAttackJerks_HoldDown` walks `button_b_frames` 10 to
  12 and wraps, and `LinkOam_Main` draws action 0x03 at `button_b_frames - 10`.
  `kSpinAttackDelays[10..12]` is 3, 3, 3.
- `link_spin_attack_step_counter` must reach 48 before the release is a spin, and it ticks once
  per frame while the button is down.
- The spin: `Link_HandleSpinAttack` walks a 12 step counter, drawing
  `kLinkSpinGraphicsByDir[facing * 12 + step]` (the shared 16 frame action 0x0f) on
  `kLinkSpinDelays`, a count down timer, so plus one.
- Raising the blade (`link_unk_master_sword`, action 0x17): the engine drives it off a cutscene
  counter, not a table. Three frames a pose is the rate that counter runs at.

### logic/pause

The pause menu logic: cells, ladders, screens and the reducer.

`pause.type.ts`:

- `PauseContext.owned` covers the 24 item cells and `bottles` the 4 bottles. `gear` is what is in
  force on each ladder. The three tier fields are the tier itself. `bow` is the arrow type the
  launcher register stands on (0 plain, 1 silver), or `NO_ARROW_TYPE` when nothing is held, never
  the raw register, because the ammunition half of that byte is not the menu's business. Absent
  means the same as nothing held, so a context built before the arrow row existed leaves it inert.
  `activeItem` is the hud item id the core has equipped, if known: the cell to open on.
- `PauseEvent` `focus` is a pointer saying where the cursor is, which no directional event can
  express. It still lands through `clampCursor`, so the rule that stops a d-pad walking onto a cell
  that does not exist stops a click too. `screen` is a jump straight to a screen, the tab strip's
  own verb. It is not a focus with cursor zero: a screen entered lands where that screen opens. A
  click on the gear tab that landed on tier zero once armed a confirm that would take the blade
  off, as the d-pad's screen step once did.
- `ItemCell.hudItem` is the core's new style hud item id, 1 to 24. `saveIndex` is the inventory
  save slot the cell reads (15 for every bottle cell). `sprite` is always set, with tier one art
  when `owned` is false. `PauseNameKey` keys the pause name table: items by `<recordId>-<tier>`,
  bottles by value.
- `GearKind` holds the three ladders whose field carries one fact, so tier 0 is a real rung.
  `GearLadderKind` adds the arrow row, in the order the cursor walks them. `GearTierCell.sprite`
  is empty when the tier means nothing equipped; `owned` is true at or below the high water mark.
- `RowSegment.start` is the first cursor value in the run and `column` the visual column of its
  first cell.
- `ConfirmVerb` is what a confirm does, in the one word the legend has room for. The unequip
  target only exists for the three one fact fields; the arrow row has no such rung.
- `AssignPlan` `ignored`: the cursor is on nothing assignable, which is not an error. `refused`:
  the save does not hold it. `assign`: write the target to the pressed slot after clearing every
  slot number in `clear`. `ConfirmPlan` mirrors it: `equip` writes the tier (the caller holds the
  bridge), `exit` leaves the menu the chosen way and the reducer moves to `closing` for it.

The item grid (`build-item-cells.ts`, `item-cells.constants.ts`) has 24 cells, six columns by
four rows. The cells are the twenty inventory save slots with the two changes the core's new style
lookup makes: the digging tool and the wind instrument share one save slot but get a cell each,
and the single current bottle slot is replaced by four bottle cells. 20 + 1 - 1 + 4 = 24. Cell
order is the core's new style hud item order (ids 1 to 24), never the save order. Id 13 is the
instrument, id 16 the digging tool, ids 21 to 24 the four bottles. The ids come from the core's own
new style table.

- Silhouette rule: an unowned cell still carries a sprite, the tier one sprite for its slot, with
  `owned: false`, and the renderer draws it flat. The outline says something goes here without
  revealing which upgrade tier is still out in the world. Drawing the real tier would leak
  progression into a menu the player opens constantly, and drawing nothing would leave the grid
  unreadable. The name key follows the same rule.
- Sprite filenames resolve through the record dataset (`spriteId`). The only literals are the two
  variants the dataset has no sprite for. Bottle values 1 and 2 both draw the plain bottle.
- The two cells sharing save slot 12 use the core's thresholds: under the new style lookup it
  answers the tool for any value at or above one and the instrument only from two up, so the tool
  stays owned after the trade that raises the slot. Reading the tool as `value === 1` would
  silhouette a cell the core still lets the player equip, the one disagreement this grid must
  never have with the register it drives.
- `buildItemCells` reads both arrays defensively, so a short array yields unowned cells and does
  not throw.

The gear screen ladders (`gear-tiers.constants.ts` and the files beside it). Three are upgrade
ladders: blade 0 to 4, guard 0 to 3, armour 0 to 2. Tier 0 is nothing equipped for the first two
and the starting armour for the third, which is why only armour has art at tier 0.

The fourth is not an upgrade ladder. The launcher register holds two facts in one byte (which
projectile, and whether any are on hand), so its rungs are the two projectile types, plain and
silver, and there is no bare rung. Writing 0 there would not mean nothing nocked; it would mean no
launcher, deleting an item from a row about which ammunition is loaded and taking the carrying
half of the byte with it. A later equip could never restore that without handing out free
ammunition or emptying the quiver without a word. The other three fields carry one fact each, so
their tier 0 can be undone; this one cannot, and that is why it has two rungs and not three.
Confirming the type already in force is nothing at all, where on the other three it unequips.
`arrowTypeOf`: register values 1 and 2 are the plain pair and 3 and 4 the silver pair, so the type
is the step of two and the odd or even half is the ammunition the row never touches. 0 holds no
launcher and answers with a rung no ladder has, which leaves the row inert.

Ownership is a high water mark, passed in and never read here: a tier at or below the highest
ever seen on that ladder is selectable, anything above it is a silhouette. That makes going down a
tier (and back up) safe, so a player can drop to a weaker tier for a challenge run and climb back
without the game keeping a separate unlocked set. The arrow row answers the same rule with its own
mark, so silver is a silhouette until the save has held it. Tier 0 is always selectable because it
is always reachable.

The screens and all cursor arithmetic (`screen-rows.ts`, `move-cursor.ts`, `clamp-cursor.ts`).
Nothing else decides where the cursor goes; the reducer delegates here and the views only render.
A screen is a list of visual rows, and a row a list of segments, each a run of one section's cells
from a given visual column. That one shape covers every rule: left and right walk the row across
segment boundaries and wrap at its ends; up and down step to the adjacent row (wrapping top to
bottom) and land on the nearest column there. It also makes the item grid and the bottle row one
thing: the twenty item cells fill three rows of six and leave two in the fourth, so the four
bottles sit beside them in that row. Moving down out of the grid spills into the bottles, and up
out of the bottles returns to the cell above, with no special case. Nearest column is also the
clamp: a cursor never lands where no cell exists, because every position returned comes from a
real segment. A cursor is a cell index, so anything but a whole number names no cell and is clamped
away. The gear rows are driven off `GEAR_LADDER_KINDS`, so a ladder cannot arrive without a row to
walk. The status actions are drawn side by side in one strip along the foot of the panel, as the
published wireframe shows, so they are one row: left and right walk between them, and up and down
find no other row.

Where a screen opens (`opening-cursor.ts`): the cell the cursor lands on when a screen is entered,
not walked into. Every screen used to open on its first cell, which on two of three was a
destructive default. Items opened on cell zero, almost never the equipped tool, so the first slot
press landed on whatever lived there, usually an unowned silhouette. Gear opened on tier zero of
the blade ladder, the no blade rung, so switching to gear and pressing confirm took the sword off.
Tier zero stays reachable, because dropping to a weaker tier (or none) is a choice the ladders
offer; it must not be the rung a confirm falls on by default. So a screen opens on what is in
force: the equipped item, the worn tier, the first cell where nothing is. The rule is written per
section, so all three ladders answer it. The answer lands through `clampCursor`, so a context
reporting a tier or item id no cell exists for is snapped onto a real cell. The arrow row answers
with the type in force, or the rung no ladder has when nothing is held, which `clampGearTier` snaps
onto the first rung. An equipped id outside 1 to 24 means the core has nothing the grid can point
at (a fresh save, or a register the host has not driven yet), and the first cell is as good as
any. Hud item ids 1 to 20 are the tools and 21 to 24 the bottles.

What a slot press means (`plan-assignment.ts`), decided once for every way of making one. A pad
press comes through the input router and a mouse click from the menu's own overlay, and the two
must do the same thing. They used to disagree: one refused an unowned item silently and left a
duplicate standing, the other said so and cleared the duplicate. The rule lives here, as a plan
the caller performs:

- Nothing under the cursor is not a press. The gear screen's guard and armour rows have nothing a
  button could fire.
- An unowned cell refuses, and says so. The grid draws every cell whether the save holds it or
  not, so a player will press a button on a silhouette. Doing nothing reads as a broken menu; a
  refusal reads as an answer.
- One meaning, one button. Assigning anything a different slot already holds clears that other
  slot. Two buttons firing the same thing is a button the player has lost without being told. This
  once applied to items only, on the argument that two buttons swinging the blade are just two
  ways to swing it. They are not: the second does nothing the first did not, and holding it costs
  everything else that button could carry. The blade is no different for being a verb. The reach
  verb goes the same way: the two gameplay verbs sit on two rows of one screen and are assigned by
  the same press, so a rule that held for one and not the other would be a difference the player
  could only find by trying it. Two items match only when they are the same item; the two verbs
  have nothing to compare, so matching kinds is the whole test.

What the cursor points at for an assignment (`assign-target-at.ts`). An unowned item still reports
as an item; refusing is the caller's call. The two verbs live on the gear screen, on the two rows
where a confirm means nothing else: the blade ladder assigns the sword (as the published wireframe
places it), and the passive row assigns the action, because the four abilities drawn there are the
ones the action button performs, it is the one gear row with no tier to equip, and the verb has to
be reachable somewhere. The guard and armour ladders assign nothing: their cells already mean wear
this tier, and there is no guard verb for a button. The status screen assigns nothing either. Its
two rows are the ways out of the game; the only reason they once answered `action` is that the
section is spelled `actions`. A slot press that silently rebound a button while the cursor sat on
save and quit would be a second, invisible meaning for that cell.

What a confirm means (`confirm-target-at.ts`, `plan-confirm.ts`, `confirm-verb-at.ts`), decided
once for every way of making one, for the same reason as assignment. A pad press, a keyboard press
and a mouse click must reach the same outcome. They did not: confirm reached nothing, a click on a
gear tier called the bridge straight from the view, and a click on a status row closed the menu
through an event only the mouse raised. The rule, as a plan the caller performs:

- The arrow row is the one ladder that never unequips. Its rungs are the two projectile types, and
  the byte behind them also carries whether any are on hand, so no rung means none and confirming
  the type already nocked is nothing. A save holding no launcher offers nothing there: conjuring
  the thing that fires it is not a meaning a confirm on that row may take.
- A gear tier equips. At or below the high water mark it is worn; above it the press is refused
  and says so, as an unowned item cell does. The mark is the same `isGearTierSelectable` the ladder
  is drawn from, so what looks selectable and what is selectable cannot drift.
- The tier already worn unequips. Confirming what is already on could only ever be a no op, so it
  is the natural home for taking the piece off, a choice the ladders exist to offer. It writes tier
  0, the rung the ladder already draws as nothing worn, so both routes to that state end the same.
  Both are called an unequip, because the word describes the state the press leaves behind; one
  outcome under two names on two rungs of one ladder is the drift this rule stops. The tier to
  write is worked out first and the target named from that: a write of 0 is an unequip from
  wherever it was asked, and a press that would write the tier already on is nothing. The worn
  tier is clamped first, so a context reporting a tier the ladder lacks cannot make an ordinary
  rung look worn. Taking a piece off is always available: tier 0 is the one rung every save holds.
- A status row activates. The two rows are the two ways out of the game, and confirming one
  chooses it; the second row (`SAVE_QUIT_CURSOR`) saves before it goes. The reducer turns that
  into the `closing` phase and the store performs the exit.
- Everything else is nothing. An item cell, a bottle and the passive row have nothing to activate,
  because items fire from a slot, not the cursor, so the legend drops its confirm glyph and does
  not promise a control that does nothing.

Every position lands through `clampCursor` first, so a cursor left out of range by a shrinking
screen confirms the cell it would have been snapped onto. The legend reads its verb from
`confirmVerbAt`, off the same target the press is planned from, so the bar cannot advertise an
action the plan will not perform. It replaced a bare `canConfirmAt` boolean: a strip that only
knows that a confirm does something has to guess what, and it guessed one fixed word for three
outcomes. A faded tier is the one deliberate exception, matching the item grid: the bar offers what
the cell is for, and a cell the save never held answers with a refusal the player can read.

The reducer (`pause-machine.ts`, `reduce-browsing.ts`) is pure state, no writes. It decides where
the cursor is, never what the game does about it. A confirm on a gear tier moves nothing but the
selection; the caller performs the write, because only the caller holds the bridge. A slot press
returns the state untouched and leaves "what is under the cursor" to `assignTargetAt`. Confirm is
the same shape, asked of `confirmTargetAt`: the one case that is a real state change (a status row
choosing a way out) becomes the `closing` phase, and every other confirm meaning is a write the
store performs from the same answer. A screen entered lands where that screen opens
(`openScreen`), and every door into a screen comes through it so none can drift. Backing out of a
nested section returns to the screen's first section; backing out of the first section closes the
menu.

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

Written by `core/wasm-build/layout-probe.mjs` during the wasm build; never edit it by hand.
It carries only the `@kind data` header, so this note is where its purpose lives. It holds the save state layout this build produces:
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
  range. What each tier means is under `logic/queries/progress-tier` below.
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

## logic/queries

### logic/queries/area-locations

The link between areas and locations is stored one way only: a location record names its `areaId`, and an area record lists nothing. So the reverse read scans. The collection is a few dozen records and is rebuilt on every dataset change, so a plain filter beats an index that would need invalidating with it.

`locationsInArea` returns an empty list for an area nothing has been placed in yet. That is a real answer, not a miss. `areaOfLocation` returns undefined only when no record holds that id: a dangling reference and a location with no area are different faults.

### logic/queries/bundles

A screen bundle groups overworld screens into one logical area.

- `screens` lists every screen index in layout order: NW, NE, SW, SE for a 2x2 area. `head` is the top left screen.
- `QUAD_POSITIONS` names each slot. Slot 0 is the head, slot 1 is head + 1, slot 2 is head + 8 and slot 3 is head + 9, because the overworld grid is 8 screens wide.
- `subNames` holds each screen's quadrant name, and `screenNames` its full name.
- `roomShape` is the indoor room shape when a room has boundaries inside it. `activeQuadrant` is the quadrant Link stands in, for a room of several screens. `effectiveLayout` is the width and height, in map cells, that the room covers on the dungeon map.
- `screenByIndex` builds its map of overworld records by `overworldIndex` once, on first use.

### logic/queries/check-contents

What a row holds, in one order, for every surface that shows one: the tracker's list, its cards, and the toast a check raises as it completes. One shared order keeps a check from reading three ways at once.

The order, first match wins:

1. `override`: an item the caller already resolved, as when a row holding several items is split into one entry per item.
2. What this run placed there. On a seed this outranks everything below it.
3. What a swap chest holds right now (`chest-stand-ins`), a fact about the live file.
4. `receipt`: what the game just paid at this row, for a swap chest it has paid out this moment.
5. The record's own contents. With `expand`, a record holding several items gives one entry each.

Step 5 is skipped on an online run. The server hands locations over one at a time, so nothing here knows what this one holds, and the original item is a claim, not an answer. A single undefined entry means "not known here". `shownItemOf` is for a surface that never expands a row.

### logic/queries/check-grouping

Groups, filters and labels checks for the tracker. World, area, location and dungeon values read the screen, area and dungeon records directly.

- `RunContext` is what the run in progress adds to grouping, filtering and display. `kind` absent reads as the plain game, where every check holds its own contents. `placedItems` maps a check id to the item placed there. `foreignItems` maps a check id to the name of another player's item placed there (online only). `spheres` maps a check id to its verification sweep sphere. `liveItems` maps a check id to what a swap chest holds right now; it is set on a normal profile too.
- `GroupNode.stats` counts over every check under the node.
- `FilterState.activeFacets` holds ids from `CHECK_FACET_DEFS`: a world, location or area facet, or a content tag key. `tagMode` `all` needs every facet to match, `any` needs one. `showMode` picks item checks, events or both; absent reads as items.
- `bigKeyDoors` and `darkRoomsNeedLight` absent read as on. `smallKeyDoors` absent reads as off on the plain game, which has never gated on key counts, and on for a seed (`smallKeyDoorsOf`).
- `shopShelves` absent reads as off: on the plain game a shelf is a shop item to buy, not a check to hunt. A seed's roster already holds only the shelves its shop scope opened, so this never touches one.
- `SPHERE_DIMENSION` only means something with a run loaded, so it is not in `GROUP_DIMENSIONS`. A caller that has spheres appends it, and the widget without a run never offers a dimension that would put every check under "outside the sweep".
- Death Mountain is the one area that spans both worlds. Its label and its area facets split by the check's own screen: one facet per side.
- A dungeon event with no screen of its own sits in its dungeon's world, read from the dungeon's first room.
- Content facets come from the tag collection (`tagsFor('check')`) and test the real tags on `CheckRecord.tags`. `CHECK_FACET_DEFS` is built once, when the module loads.
- `matchesSearch`: with a run loaded, the item a reader searches for is the one actually there. Matching the vanilla contents would answer "where was the lamp", not "where is it".
- `isListedRow` decides whether a row is in the list at all, before any search or facet: the Items, Events or Both switch, and on the plain game the shop shelves. The summary counts over the same answer, so the totals say what the list shows.
- `buildGroupTree` nests 0 to 5 levels. Spheres sort by number. Other groups sort by name with "Other" and "Overworld" last.

### logic/queries/chest-stand-ins

What a swap chest holds right now. A chest whose item names a stand-in (`ItemRecord.aliasOf`) pays that stand-in when the player already holds the item, so the same chest reads two ways over a file's life. An open chest follows the inventory. A taken one paid the real item only if it is the chest a normal file takes it from first, or if that chest is still closed.

There are six such chests: Link's House, the Secret Passage and Zelda's Chest (Lamp), the castle's Boomerang Chest and the Chicken House (Blue Boomerang), and the Brewery (Red Boomerang).

The Red Boomerang has no usual chest, only its one chest. That chest paid the stand-in when the player holds a slot mate and not the item itself. Holding the item says nothing, because it has other sources.

### logic/queries/describe-screen

Turns a screen reference into words: a name when the dataset has one, the game's own hex numbers when it does not, and a combined label for reasons and evidence lines.

It accepts a dataset `ScreenId` or a `GameScreenId` straight off the live registers. The game gives an overworld screen's position within one world (0x00 to 0x3F). The dataset's unified numbering puts the dark world copy of that position at the same number plus 0x40 (`DARK_WORLD_OVERWORLD_OFFSET`). A caller holding a per world number passes `world`, and the offset is applied here once. With `world` omitted the number is read as already unified.

`hexLabel` (`room 0x104`, `screen 0x2c`) is always present, even with no record. `label` is `<name> (<id>)` when a record resolves, `hexLabel` otherwise.

### logic/queries/detection

Reverse lookups from a game index (overworld screen or dungeon room) to the screen record, with variant resolution: several records can share one room and are told apart by game state.

- `VariantGameState.readFlag` reads one WRAM bit. `entranceId` is the entrance used to enter the room. `progressTier` is 0 based.
- `ScreenLookup.byDungeonRoom` is keyed `palaceIndex:roomIndex`. `byCaveRoom` keeps the first match only, so it is lossy for shared rooms; `byCaveRoomAll` keeps every screen sharing a cave room. `byRoomAny` is the first screen holding a room, palace or not, for a last resort match.
- `byEntranceId` maps an entrance to every screen that mouth enters. The cartridge reuses one entrance for several mouths (the generic fairy and hint caves), so it is a list.

Indoor resolution order:

1. The entrance the player came in by, only for the room they stand in. It is the precise answer when two screens share a room, and no answer once they have walked on, because `which_entrance` keeps naming the mouth they used.
2. The exact `palace:room` key.
3. A palace scan over every dungeon screen for the room (`palace-fallback`).
4. Cave or house, resolved by variant.
5. When the palace is unknown (0xFF), the room may still belong to a dungeon, so a palace scan runs last.

Steps 2 and 3 run only when `palaceIndex >> 1` is at most `LAST_DUNGEON_INDEX` (12); step 5 only when it is above. `palaceMismatch` on a palace scan holds the palace the dataset expects and the one the game reported.

### logic/queries/dungeon-group

The dungeon group id is what the simulator's per dungeon ledger keys on, in place of a raw palace index. Every dungeon stands alone under its own index except one: the sewers (dungeon index 0) are reachable only through the castle above them (dungeon index 1). A run that leaves through the castle and comes back through it must find the sewers' owed checks under the same ledger entry. No other palace shares this property. It is a single named exception, not a general grouping rule.

`palaceIndex` is the raw `cur_palace_index_x2` a screen carries. The game's own dungeon tables, and this ledger, index by `palaceIndex >> 1`.

The `screenId` taken here is the simulator's traversal id (`room:N`, a native room number, optionally region and door qualified), not a dataset screen id. Overworld ids carry no room and give null.

A room's dungeon is the dungeon whose `roomScreenIds` claims it, not something inferred from geography. The group still comes from the screen's palace index, which is what folds the sewers in with the castle. When this keying was introduced the data was checked: 193 dungeon screens, no room claimed by two dungeons, no room missing from its dungeon's `roomScreenIds`, and group to dungeon one to one across all 13.

`dungeonGroupName` reads the name from the dungeon record, so no game name is spelled out in code. A group spanning two palace indices takes the name of the dungeon that claims its rooms. It falls back to the bare number.

### logic/queries/dungeon-values

Palace index display labels. The index is the raw value of RAM $040C (`cur_palace_index_x2`): which dungeon the game considers the player to be in. Caves and houses report 0xFF (`PALACE_NONE`). The value is doubled, because the game's own dungeon tables are indexed by `cur_palace_index_x2 >> 1`. Dungeon palaces run up to 0x1A (`LAST_DUNGEON_PALACE`).

The labels are transcribed game wording, so they live in the record dataset. `getPalaceName` falls back to the raw index for a value the dataset has no label for.

### logic/queries/game-id

The link between our screen ids and the identifiers the game uses. A game id is an overworld index, or a room with an optional palace.

`screenForGameId` tries, in order: the exact `palace:room`; any palace holding that room; then a cave or interior by room alone. The second step is a safety net for a dataset `palaceIndex` that disagrees with the live `cur_palace_index_x2`. Without it a dungeon room could resolve to a cave sharing its room number.

Use `screenIdForGameId` to get our id string, never a hand formatted one. `gameIdLabel` falls back to the raw hex numbers when nothing maps.

### logic/queries/item-duplicates

The vanilla duplicate item rule (`Link_HandleChest`, player.c:3850): a handful of chest items swap to an alternate when the primary is already owned. The lamp chest hands out 5 Rupees once the player has a lamp.

Four things name a chest's contents: the simulator's delivery, the sim log, the overlay annotation and the C hook. The first three apply this rule from here, or the overlay would promise a Lamp the run never delivers. The C hook applies the same rule as a backstop.

The alternate lives on the item record (`ItemRecord.aliasOf`). `itemId` is the native receive index (the chest's own byte). `owned` is the tracker's set of dataset item ids.

### logic/queries/item-sprites

Sprite URLs of the extracted set: the base the active ROM's files are served from, and the revision of the set behind it. A set is rewritten in place: a background re-extraction clears the folder and writes it again under the same names, so every URL on screen points for a moment at a file that does not exist. Carrying the revision in the URL (`?v=N`) makes a rewritten set a new source, so the image is fetched again instead of keeping the failure it latched during the rewrite. Revision 0 means the set as found.

- `spriteFilename` strips the `sprite-` id prefix down to the PNG's file name.
- An item shows a rupee reward's coloured gem (`rupee-gem-files`) ahead of the record's own sprite, which for the large values names the game's numbered art.
- `getPoolGameSprite` gives a multiworld pool game's badged icon, `pool-<slug>.png`. A game with no drawing gets the Archipelago mark (`pool-game-icons`).
- `getCapacityUpgradeSprite` gives a family's stamped capacity upgrade sprite, `upgrade-<family>.png`.

### logic/queries/palace-fallback

The palace scan safety net for indoor screen detection. A dungeon screen is keyed by `palaceIndex:roomIndex`, so a screen whose dataset `palaceIndex` disagrees with the live `cur_palace_index_x2` misses the exact key. Detection then matches on the room number alone, which finds the right screen because room numbers are unique across dungeons.

The scan must not hide the mislabel: every hit is recorded, keyed `livePalace:room`, so a wrong `palaceIndex` can be reported. `describePalaceMismatch` turns one into a developer facing line naming the room, both palaces and the screen to fix; the renderer logs it. `clearPalaceMismatches` exists for tests that start from a clean slate.

### logic/queries/progress-tier

The save's progress indicator byte, the game's coarsest story clock. The engine branches on it directly (`< 2`, `>= 2`, `== 2`, `< 3`, `>= 3`), so the tiers are the engine's own, not a reading of the plot. The byte goes up to 3 (`MAX_PROGRESS_TIER`), because the dark world is the last thing it counts.

- 0: the opening. The storm is up, no sword has been given, and the overworld runs the first sprite list (overworld.c:302-306) with the rain ambience (overworld.c:481, `< 2`).
- 1: the passage scene has handed over the sword and shield (sprite_main.c:5739, `Uncle_InPassage` case 1 `GiveSwordAndShield`). The storm and its sprite list are unchanged: everything the engine keys on still tests `< 2`, so 0 and 1 share the same overworld.
- 2: the princess has been delivered to the sanctuary and the priest scene has run (sprite_main.c:6343; the simulator writes the same value in `core/game-hooks/sim_triggers.c`). The storm lifts, sprite list 1 takes over and the sign text changes.
- 3: the tower boss is down and the dark world opens (dungeon.c:2504, on the exit that also flips `savegame_is_darkworld`). Sprite list 2 takes over.

The labels live with the rest of the dataset, as the `progress-tier` enumeration category, so a tier reads the same in a HUD chip, a record editor and a log line. Nothing else may declare its own table of them. `progressTierLabel` is undefined for a value the dataset does not describe, and the caller shows the raw number, because a checkout without the private dataset has no rows at all.

### logic/queries/room-screen.ts

The one room index to screen resolution, for callers that hold a bare room number and no palace context. A room number alone is ambiguous, because a palace room and an unrelated cave can share one. So the order matters: the record with no palace first (the exact meaning of "a room with no palace"), then the cave index, and only then any record holding that room. Every step is an indexed lookup off the cached screen lookup.

### logic/queries/screen-validity

The one owner of "is this screen filled in enough to be a real record". Every validator that guards a screen reads its rules from here, so a screen the editor accepts cannot be one a query then fails to resolve. The rules are noun phrases the callers join into a sentence ("this proposal still needs ..."), which keeps them poolable across callers.

`ScreenCandidate` is a stored record or a draft. Geography is optional and widened to `string`, because a form holds an empty pick until somebody chooses, and that is one of the states being judged. `id` is absent until the screen's id is allocated. The floor in `position` decides which dungeon file the record lives in.

- Index: an overworld screen is addressed by its overworld index and every indoor one by its room index. A dungeon room also needs the palace index, because a room number alone can be both a dungeon room and a cave. Without these the screen resolves to whatever sits at index zero.
- Geography: a screen carries an area and a location, picked from two separate lists, and the location record already names its area, so the two can disagree. Only a real pair is judged for that: a placeholder on either side is reported as its own missing piece first.
- Home: where the record belongs on disk is the `record-file-targets` question. Its `unresolved` reason is passed through, not restated. A candidate with no area is handed the placeholder area, which that resolver reads as "no geographic area"; the missing area is already reported by the geography rule.
- Variant: a variant states its tier twice, as `progressTier` and as a `{ type: 'progress' }` condition. Only the condition is read at runtime, so a disagreement is silent. Both are read as an inclusive range (an omitted bound is open to the end of the scale, as the evaluator reads it) and must describe the same set. A variant gated on anything else is not judged: a flag or a check is a different fact that merely tends to hold from some tier onwards.
- A grid position is the editing form's own affair: only a form can hold half of one, so only a form refuses it.

## navigation

### navigation/types

The flood works on one 64 by 64 grid of 8 pixel tiles per screen (`GRID_SIZE`).

- `ReachState` is one tile's flood state. 0 is unreachable. 1 is reachable with the player in full control. 2 to 9 is a tile the player only passes over without control (a ledge hop), and the value names the hop's direction: `TRAVERSAL_DIRS[state - 2]`, so 2 s, 3 n, 4 e, 5 w, 6 se, 7 sw, 8 ne, 9 nw. 10 (`STAIRS_TRAVERSAL_STATE`) is a stair, which has no fixed direction.
- `FloodFillResult.startPos` is the top left tile of Link's 2 by 2 body where the walk started.
- `FloodFillResult.items` is the traversal tokens the flood ran with. Anything that judges a tile or an entrance afterwards (can Link use it?) needs the same inventory the walk used, so it travels on the result.
- `dynamicBlockerCells` are the runtime sprite blockers stamped into this run. `hookTargets` are hookshot targets in range of walked tiles. `variant` is the screen variant at analysis time, absent for the base ROM layout.
- `tileLayer` says per tile which floor reached it: 0 layer 0 only, 1 layer 1 only, 2 both. It, `reachableByLayer` (layer 0 then layer 1) and `dualLayerGrids` (the raw attribute grid of each layer, for the tooltip) exist only for dual layer indoor rooms.
- `staircaseType` is `kind_of_in_room_staircase` at walk time. 2 means layer changes are blocked.
- `startLayer`: 0 is the upper floor (BG2), 1 the lower floor (BG1).
- `ScreenVariant` is an overworld screen's layout state, set by the progress tier and the screen's event flags; the game patches overlays onto the base tilemap from them. `progressTier` is the progress indicator byte (tiers in `logic/queries/progress-tier.ts`). `eventOverlay` is `save_ow_event_info[screen] & 0x20`, the event overlay being applied. `eventFlags` is that whole byte.
- `ConnectionInfo.sourceScreen` is set when connections are gathered across screens. `isIntraRoom` marks a scroll between quadrants of one room. `layerToggle` means crossing the edge flips Link's floor (door type 22, `kDoorType_PlayerBgChange`).

### navigation/nav-data.types

These types ride on the dataset as optional `nav` fields: `RegionNavData` on a screen, `ConnectionNavData` on a connection. The analysis pass fills them and the pathfinder reads them. They extend the existing records and never replace them.

- `TraversalRequirement` is every requirement the flood can test. Tested in the classifier: `lift.1`, `lift.2`, `boots`, `flippers`. Not yet tested in game: `hammer`, `hookshot`, `bombs`, `sword`, `boomerang`, `mirror`. The rest are progression, not tile level.
- `RequirementSet` is OR of AND. `[['sword'], ['boomerang']]` needs a sword or a boomerang, `[['hammer', 'lift.1']]` needs both, `[]` needs nothing. `[['lift.1']]` is the base lift Link has from the start.
- `ConnectionTransitType`: `walk` is a screen border crossing, position for position. `door` enters or leaves a building. `passage` goes through a building between two overworld areas. `hole` is a one way fall. `staircase` joins floors inside. `ledge` is a one way jump. `mirror` warps from the dark world to the same spot in the light world. `flute` flies to a fixed point. `dungeon_enter` and `dungeon_exit` join the overworld and a dungeon's first room. `whirlpool` is a water warp and `warp_tile` a dungeon warp pad.
- `RegionNavData.totalTiles` is 4096 on the 64 by 64 overworld grid. `freeTileCount` is the tiles walkable with no items from the primary entry, `maxReachableTileCount` the tiles reachable with every item.
- `ConnectionNavData.overlapTiles` (walks only) is the border positions, 0 to 63, where both screens have reachable border tiles: the real corridor. `weight` is the tile distance for a walk and 1 for an instant transition. `validAfter` names the progression event it waits for. `invalid` is set by the analysis (no overlap, unreachable).
- `ConnectionPointData` is a bundle of tiles that forms one logical way in or out. A cliff that splits a border into two gaps makes two points. Its `id` reads `{world}-{screen:hex}-{type}-{dir}-{index}`, for example `lw-38-edge-e-0`, `lw-29-door-0`, `int-011f-exit-e`. `tiles` are columns on a north or south edge and rows on an east or west edge, always contiguous. `requirements` are what it takes to reach the point from the screen's walkable interior. `position` and `entranceIndex` (the game's own entrance index) are for entrances.
- `NavObstacle.tileAttr` is the raw ROM tile attribute byte. `gatesPoint` names the connection point it blocks, if any.

### navigation/crossing.type.ts

`ScreenCrossing` is one record for every way on or off a screen.

- `CrossingClass`: `edge` is a screen boundary scroll; `entrance` is every other crossing (doors, thresholds, stairs, holes, drops, warps, respawn points).
- `CrossingOrigin` is the detector that produced the crossing. `room-border` covers both a room's walk through boundary row and a flood border scroll between rooms; `class` tells them apart.
- `CrossingTarget.native` uses the game's unified 0x00 to 0x7F overworld numbering, where bit 0x40 is the dark world.
- `CrossingSpan` is the run of tiles a boundary scroll covers and how many are plain floor or need an item. `from` and `to` are columns for a north or south scroll and rows for an east or west one.
- `id` is stable within a screen: `ent:5`, `stair:1001`, `edge:north:31-32`, `warp:3`. `kind` uses the dataset's own vocabulary, so a proposal needs no translation.
- `tile` is the walkable tile the player stands on, offset already applied. `placed` is false for a crossing the game names without a position, such as the exit table's way back outside: it belongs in a list but on no map.
- `layer`: 0 upper floor, 1 lower floor. `span` and `layerToggle` are set on edges only; `layerToggle` means the scroll flips the player's floor.
- `target` is resolved once, never per render.
- `available` means the flood reaches it and every requirement is held. An unavailable crossing is kept and marked, never dropped.
- `steps` is the walk distance from the flood's start tile, set only when that distance is real. `arrival` says in words how the crossing is taken ("via north edge, tiles 31-32").
- `ScreenCrossings.screenIndex` is the room index indoors and the overworld screen index outdoors.

### navigation/tile-attrs

One tile attribute map is the single source for collision, item requirements, labels and categories. The tables live in `data/native-tables` (`OVERWORLD_TILE_ATTRS`, `INTERIOR_ATTRS`); this folder derives helpers from them.

- `tileAttrsFor`: the engine's own tile dispatcher (`TileDetect_ExecuteInner`, `core/zelda3/src/tile_detect.c`) branches on one `is_indoors` bool. House, cave and dungeon interiors all read the same table, so indoors or not is all a caller has to say.
- `TILE_ATTRS` is the same table as `OVERWORLD_TILE_ATTRS`, kept for older callers; new code uses `OVERWORLD_TILE_ATTRS`.
- `isDoorPassageAttr`: a door threshold Link can walk through. Plain passages are 0x80 to 0x8D and the layer toggle shutters 0x90 to 0xAF. Neither is floor, but both are crossable. `isPassableAttr` is floor (0x00) or such a threshold.
- `HOOKSHOT_TARGET_TILES` are the overworld tiles the hookshot grabs, pulling Link to them from range.

### navigation/core

- `DIRECTIONS` is north, south, west, east, in that order. The walk visits neighbours in this order, so the order is part of the result.
- `getAdjacentScreen`: an overworld screen index holds the column in bits 0 to 2 and the row in bits 3 to 5 of an 8 by 8 world, and bit 0x40 marks the dark world. A step off the world's edge gives null.
- `has2TileClearance`: Link's body is 2 tiles wide, so a move needs a passable tile beside the target on the axis across the move.
- `PriorityQueue` is a binary min heap, used by the A* and Dijkstra searches.

### navigation/core/bfs-engine.ts

The walk moves Link's 2 by 2 body, keyed by its top left tile, on one or two floors. The layer strategy decides each step.

- A body position reached again is kept only when it now needs fewer requirements. A step that keeps the same requirement set goes to the front of the queue and one that adds a requirement to the back, so item free ground is explored first.
- Every body tile on the bounds' edge records a border transition, once per edge position.
- An entrance counts as reached when the body's centre (top left plus 1 on each axis) comes within 3 tiles before and 5 tiles after the entrance tile on both axes (`ENTRANCE_REACH`).
- Extra seeds (from neighbouring screens, or a ledge landing) start on the start layer, each with the requirements its body tiles need.

### navigation/strategies

The BFS engine asks a layer strategy how the body moves. `SingleLayerStrategy` serves the overworld, single floor rooms and rooms whose stairs lock the floor (staircase type 2). `DualLayerStrategy` serves indoor rooms with layer swap stairs and ledges between floors.

- `getNewTiles` is the two tiles the body's leading edge steps onto: the new top row going north, bottom row going south, left column going west, right column going east.
- `enterTiles` checks those tiles and returns the requirement set after the step, or null when the step is blocked. It returns the same set object when nothing was added; the engine relies on that identity to queue the step at the front.
- A ledge tile can be left only in its jump direction; a diagonal ledge allows either of its two axes.

### navigation/strategies/dual-layer.ts

- Layer 0 is the upper floor, layer 1 the lower floor. Ledges exist only on layer 0 and drop to layer 1.
- A ledge cross needs the whole 2 wide leading edge on ledge tiles that point the step's way, since a 1 wide ledge cannot carry the 2 by 2 body. Checking the whole body at the entry spot is wrong: it straddles the trigger line and the approach floor, which matches only when the band is 2 or more deep (south fans), and 1 deep north, east and west trigger lines must still fire.
- A ledge drops Link just past the cliff face. After the body clears the ledge tiles, at most 4 landing spots are tried (`MAX_LAND_ATTEMPTS`). Without the cap, a blocked first tile sends the search along the ray until it finds any landable tile, joining two areas across whatever lies between them.
- A landed ledge returns the landing so the flood continues below. Recording the traversed ledge tiles only draws the overlay arrow.
- Swap stairs (attributes 0x1E, 0x1F, 0x3E, 0x3F) are checked on both layers. A swap stair blocks a normal same floor step and can be entered only moving north or south. The stair deposits Link at its end; if the body cannot stand within 4 steps of the band, the cross fails. An unbounded scan would carry the flood across sealed regions (room 0x71's locked corridor seam lies about 17 rows away).
- The door passage bridge: a door threshold belongs to its door's floor, and the game's door transit puts Link on that floor. When a step fails on this floor and every new tile is a door passage on the other floor, the walk continues there. Without it the lower floor doors (the sewers' BG1 corridors, the sanctuary's back door) cannot be reached from an upper floor approach. It is only a fallback: firing it beside a step that already worked claimed the doorway on both floors whenever both stamp the passage attribute. Room 0x62's west door reads 0x85 on both layers, but on the upper floor those tiles are ringed by solid wall, so that copy was a phantom.

### navigation/strategies/dual-layer-build-result.ts

- Tiles under a swap stair on either layer are left out of the body to tile merge; traversed stair tiles are then marked on the floor the stair leads to, and traversed ledge tiles on layer 0.
- Where both floors reach a tile, the one with fewer requirements wins.

### navigation/strategies/ledge-crossings.ts

The ledge hops a dual layer walk really landed, one entry per tile. This is not cliff preprocessing's wall run guess, which only walks layer 0 and cannot see where the drop ends. Nor is it one entry per body position: Link is 2 tiles wide, so an N tile ledge offers N minus 1 places to stand, and recording per body left the last tile of every ledge without an arrow and halved a 2 tile gap to one. A 1 tile gap records nothing, which is right, since the player cannot jump from it. `dr` gives the hop's axis: a vertical hop spans two columns, a horizontal one two rows.

### navigation/tile-classification

`classifyTile` joins five facts about one tile, each from its own source and none derived from another: behavior and visual (native tables keyed by attribute and indoors), room context (plain values from the caller), collision (`classifyTileAttr`) and interactable identity (a live side table lookup). `shared/game` never touches WASM, React, the DOM or Node, so live state always arrives as parameters.

- `RoomContext.indoors` is the only field any tile lookup keys on, and it is the engine's whole tile dispatch context (`core/zelda3/src/tile_detect.c` takes one bool). The rest is descriptive and read only by the tooltip.
- `palaceIndex` is `cur_palace_index_x2 >> 1`. The game stores the index doubled and uses 0xFF for "not in a dungeon" (`NOT_IN_PALACE_X2`); `resolveRoomContext` is the one place that sentinel becomes null.
- `roomTypeLabel` is display wording only. It never invents a room kind the game lacks; there is no cave or house distinction because the game has no such field.
- `resolveInteractable`: three attribute families point at a room local slot. Doors and manipulable tiles keep the slot in the low nibble (`SLOT_MASK`); chests use `attr - 0x58`. The tile's real identity lives in the live side table the caller passes in (door table, `replacement_tile_state`, chest locations), never in the attribute byte. When the family matches but the table has no record for the slot, the tile stays unresolved; guessing is the bug this exists to avoid. `source` records which table answered.
- A manipulable tile's kind is its `replacement_tile_state` entry masked with 0xF0F0, looked up in `MANIPULABLE_NAMES`. A chest location at or above 0x8000 is a shut chest.
- `TileClassification.interactable` is absent when no side table resolved the tile, and that absence is a real answer.

### navigation/screen-data/indoor-ledge-dirs.ts

Indoor straight ledge triggers (0x28 and 0x29 vertical, 0x2A and 0x2B horizontal) have no fixed direction; they jump toward the adjacent wall face. A wall on one side only decides it. Otherwise the walls up to 3 tiles out on each side are counted (`WALL_SEARCH_RANGE`) and the side with more wins; a tie goes east or south. The map is keyed by `row * GRID_SIZE + col` and changes no grid, so a caller can compare neighbours' directions (Link's 2 wide body needs a same direction pair).

### navigation/screen-data/cliff-preprocessing

- Straight cliffs: 0x28 to 0x2B are the trigger tiles. Outdoors they jump north, south, west and east in that order. Indoors their direction comes from `indoor-ledge-dirs`, and only 0x2F has a fixed direction (west). Indoors 0x04 counts as wall (it is thick grass outdoors).
- Indoors a trigger is a real jump only when a neighbour across the jump axis infers the same direction and is standable itself: its approach tile, one step back against the jump, is not wall. Link's body is 2 tiles wide. Outdoors a trigger needs a trigger or wall tile beside it across the axis instead.
- A jump runs from the trigger through the wall run behind it; every tile on the way becomes a ledge.
- Diagonal cliffs mirror the game's own search, and every constant is transcribed from the decompilation; inferring them gave wrong answers. In `tile_detect.c`, 0x2C and 0x2E share one bucket (`Ledge_NorthDiagonal`) and 0x2D and 0x2F another: the tile decides north or south and nothing more. In `player.c`, the sideways half comes from which corner of the body touched the trigger, that is the side walked in from.
- `findDiagonalLanding` is `LinkHop_FindLandingSpotDiagonallyDown` in tile space: x moves 8 pixels and y 9 per step, without bound in the game, until the landing test passes. That test samples three points on one row (x+0 bit 1, x+8 bit 2, x+15 bit 4, at y+8; `kDetectTiles_tab0` to `tab3`) and needs mask 6 going west or 3 going east, the trailing side of the hop (`kLink_Ledge_Func1_bits`). The 64 step cap is ours: leaving the screen ends the search.
- Landable ground is normal tiles, destruction aftermath, thick grass and deep water (landing in water starts a swim), never the cliff. Standable ground for the take off also counts any 0x28 to 0x2F trigger, since walking onto one is how it fires. Any footing needs a 2 by 2 patch.
- A hop has to clear something: landing on the very first step means no face was in the way, so it is no jump. That case once put a stray diagonal on the corner tile where a straight cliff meets a diagonal one.
- The tile does not say which side Link came from, so both are tried. Footing on open ground beats footing that is only more cliff; with equal footing the shorter hop wins, because a hop across a face lands in a step or two and a hop along it travels its whole length.
- South cliffs: only a south facing border tile (0x10, 0x18) with walkable ground above seeds a south run. Only 0x28 to 0x2F trigger a jump in the game; a cliff face is scenery the arc passes over. Seeding from a diagonal trigger or the west face 0x1A re-emitted tiles the diagonal pass had already claimed as straight drops.

### navigation/flood-fill

- `floodFillScreen` runs the dual layer walk only for an indoor room with both layer grids and a staircase type other than 2 (`LAYER_LOCKED_STAIRCASE`, layer changes blocked). A locked room walks only its start layer's grid.
- Dual layer: boundary connected open tiles (0x00) on each layer are turned into wall first. In a dungeon room 0x00 on a layer is either real ground or structural void that belongs to the other layer. Void touches the grid edge; real ground is enclosed by that layer's walls.
- Layer 0 is the upper floor and also gets the unsupported void test (`upper-void.ts`). The same test on layer 1 would wall off every ordinary ground floor, which has open space above it by definition. The mask is applied after cliffs are processed, so the gap blocks the walk without joining the wall runs the cliff scan follows to find a landing.
- Cliff preprocessing is skipped on layer 1; there the 0x28 to 0x2B triggers are ordinary ground.
- Dual layer ledges come from the walk's own landed cross layer hops, not from cliff preprocessing's single layer wall run guess, which knows nothing of layer 1 and can land an arrow on more layer 0 ground. Every recorded crossing is reachable and landable by construction.
- Single layer: the walk moves one tile at a time and cannot jump a cliff band. Each reachable ledge whose landing is free and not yet reached seeds that landing and the walk runs again, up to 4 times for chained plateaus (`LEDGE_RESEED_PASSES`). Only ledges whose start is reachable are reported.
- Dynamic blockers (the uncle, guards and other sprites) stamp a 2 by 2 block of solid attribute 0x01 at their tile.
- `findEntrancePositions`: indoors, the widget adds spawn points and stairs as entrances whose `area` is the room index, so one filter serves both.
- `buildBorders`: a transition on a tile that is only passed over (state 2 or more) is no exit. Door passage tiles at a room's edge count as inter room exits because the walk does not continue past the grid edge.
- `findStartPosition` defaults to tile 32, 32. It prefers the asked tile and its 8 neighbours, then the free tile nearest the centre of Link's 2 by 2 body.

### navigation/flood-fill/screen-prep/collect-void-seeds.ts

Only wide open boundary spans seed the void flood. A walkable exit corridor reaches the grid edge as a narrow gap flanked by wall (standard dungeon doorways are 4 tiles wide; anything up to `DOORWAY_MAX_WIDTH`, 6, counts). Seeding from it would walk up the corridor and wipe the room's real floor, as room 0x72's lower floor did through its open south passage. A run that ends at a grid corner has no flank on that side and is never a doorway.

### navigation/flood-fill/upper-void.ts

Upper layer 0x00 that is only the lower floor showing through. A raised surface has to be supported: somewhere along it, it sits over lower layer structure. A connected run of upper 0x00 that is open on the lower layer at every tile is no surface; it is the gap beside a walkway. Boundary flooding cannot find these, since the walkway's own edges enclose them.

Room 0x62 forced it. A bridge splits its upper layer into three open regions: the deck (supported, over lower structure) and the gaps either side (supported nowhere). Treating the gaps as floor let the walk reach the deck's ledge edge from the wrong side and hop onto a surface the two never share, which drew a column of phantom jump arrows down the room.

The result is a mask, not a rewritten grid. Stamping the gaps as 0x01 would make them `CLIFF_WALL`, and cliff preprocessing walks wall runs to find a landing, so a gap turned to wall extends the cliff beside it and invents hops dozens of tiles long. A lower layer with no structure at all supports nothing, so the mask stays empty then.

### navigation/flood-fill/connections.ts

- An intra room edge is a scroll seam inside one room, between rows 31 and 32 or columns 31 and 32 (`SCROLL_SEAM`). The walk makes no transitions there, so the seam is read straight off the reachable grid. Naming one side of a seam implies the other.
- Indoor rooms sit on a 16 wide grid of 20 rows (`ROOM_GRID`), so the room north is the index minus 16.
- Border tiles split into contiguous runs, so a blocked gap gives separate connections. Each run carries every item requirement seen on that border.
- `usableEntranceTransition`: reaching an entrance is not enough. The tile it sits on may still need an item the player lacks (a staircase under a rock that needs the glove is flooded and visible, but not usable). Every caller that lists entrances (widget, minimaps, overlay) goes through this test so none advertises an entrance the flood considers unusable.

### navigation/link-start-tile.ts

Link's flood start tile is the tile of his 16 by 16 collision hitbox nearest its centre. The hitbox is the lower half of the sprite: the head is skipped and it starts 8 pixels below the sprite's top. This matches the overlay's debug footprint.

### navigation/analysis

The analysis pass that fills the `nav` fields of the dataset.

- `findBorderBundles`: a bundle is a contiguous run of fully reachable tiles (state 1) on one border. A cliff that splits a border into two gaps gives two bundles. The id reads `lw-{screen:hex}-edge-{dir}-{index}`; `requirements` is left empty for the requirement detector.
- `buildWalkConnection`: only border positions present on both sides (the overlap) are real crossing points.
- `buildConnectionNav` derives a connection's nav data from its live flood crossing and its tags. Tags give the transit type and direction; the crossing gives tile geometry and requirements. A walk records its corridor as `overlapTiles`; a door, hole or stair records its entry as `fromPoint` (tiles and grid position). Flood requirements collapse into one AND group. A connection with no crossing tiles is marked invalid.
- `buildConnectionNavUpdates` writes nav data for every connection by id. A transit tag missing from the table counts as a door, and no transit tag at all means a walk.
- `resolveEntrances` maps the WASM entrance table (`wasmGetOverworldEntrances`, `wasmGetExitScreenMap`) to connection points. Screen index 0x40 and up is the dark world. A door has no border tiles and no requirement to reach it. When the room's exit leads to another screen than the entrance's own, the entrance is a passage and is marked one way (enter).
- `runGlobalFlood` floods every screen twice, with no items and with every item, for the free and maximum reachable counts.
- `detectRequirements` floods with growing item sets (`INVENTORY_PROGRESSION`) and records the first set that reaches each target. A target unreached even with every item also gets an empty requirement set, the same value as a target that needs nothing.
- `buildScreenNavUpdates` lists obstacles from the flood's requirement grid by attribute: 0x50 to 0x57 light rocks (lift 1), 0x58 to 0x5F dark rocks (lift 2), 0x44 to 0x47 bushes, 0x4A and 0x4B hammer pegs, 0x66 deep water, 0x62 and 0x63 bombable walls, 0x6C spike floor. Features are left empty; they need deeper analysis.

## recommendations

### recommendations/types/recommendation.type.ts

A recommendation is any finding where the dataset disagrees with the live game. It carries the record the dataset would hold if the finding were applied, never pre-rendered text: a writer cannot check text, a diff cannot align it, and a reviewer cannot accept it in bulk.

- `EntityIdOf`: every record kind declares an `id`, so the id type is read off the record map.
- `ProposedRecord`: a `create` has no id yet. Ids are minted only by the main process allocator, so the id is absent for `create` and present for every other action, the same as `PendingConnectionRecord`.
- `Evidence` is one thing a detector looked at, quoted so a reviewer can check it again. `source` names where the fact came from: a native table, the flood, or the dataset.
- `Confidence` is a property of the evidence. The native room tables can be enumerated in full for the loaded room, so an absence in them is proven (`certain`). The flood fill only proves what is reachable from the player, so anything inferred from reachability is `likely`. Batch accept acts only on `certain`, so a wrong grade makes it unsafe.
- `RecommendationState`: `accepted` and `dismissed` are decisions a person made. `open` and `resolved` belong to the detection pass. Reconciling never overwrites a decision.
- `RecommendationOrigin` says whether the finding came from the live game or from a recorded run.
- `Recommendation.id` is derived from content, never from a counter, so a repeat detection lands on the existing entry and a dismissal survives it. `targetId` and `current` are null only for `create`. `detector` is the id of the `RecommendationDetector` that produced it.
- `DraftRecommendation` is what a detector emits. Identity and lifecycle are not its job: the registry derives the id and the store owns the state and the timestamps.
- `DraftRecommendation.key` is the part of the identity that `targetId` and `screenId` do not carry (a destination id, a field path). It is required whenever one detector can emit more than one finding for the same screen, which for a `create` is always. Derive it from what the finding is about, never from the proposed record: flood nav data shifts between passes and would mint a new id each time.

### recommendations/id

A recommendation id is derived from what the finding is about. A counter would mint a new id on every pass, so the same finding would pile up as a new row each time the player walked back onto a screen, and a dismissal would be forgotten once the finding was seen again. A content id makes a repeat detection land on the entry the first pass made, and the decision recorded on it still applies.

The input is the finding's identity, never its payload. The proposed record is left out because nav data from the live flood shifts as the player moves.

- `fnv1a` is 32-bit FNV-1a. It is not a security hash. It is stable across runs and processes, so a persisted id still matches after a restart, and cheap enough to run per finding per pass. `Math.imul` keeps the multiply in 32-bit integer space, which a plain `*` would not.
- `identityOf` joins the identity parts in a fixed order through `JSON.stringify`, with no separator character. A separator can appear inside a detector name or a field path, and two findings whose parts joined to the same string would share an id and swallow each other. Quoting removes that class of collision.
- `key` carries what `targetId` and `screenId` do not: a `create` has no target, so without it every connection proposed from one screen would collide.
- `recommendationId` has the form `rec-<kind>-<action>-<hash>`. The readable head keeps a persisted file easy to skim.

### recommendations/reconcile

Folds a fresh detection pass into what the store holds. Three rules let it run on every screen change without piling up:

1. A finding that reproduces lands on its existing entry: same content, same id, updated in place.
2. An `open` finding that no longer reproduces becomes `resolved`. The dataset was fixed, or the game now says something else.
3. A decision is final. `accepted` and `dismissed` are the only states a person sets, and neither a repeat detection nor a disappearance moves them. Without this a dismissed finding would come back the next time the player walked onto the screen.

A `resolved` entry is not a decision, so it reopens if the finding comes back. On a match the entry keeps its id and its first seen time. The rest comes from the new draft, so an improved reason or proposed record shows through.

- `ReconcileOptions.inScope` picks which stored entries the pass may resolve. A pass covers one screen through a known set of detectors and says nothing about anything else, so without a scope every entry about another screen would read as no longer reproducing and be resolved. The default is everything, which is correct only for a pass that rebuilt the whole collection.
- `ReconcileOptions.now` is injectable so a test can check `decidedAt` without freezing the clock.
- `scopedToPass` is the usual scope: entries owned by this run's detectors, for the screen this run looked at. Any other entry is left as it was.

### recommendations/store

The recommendation collection, and the only place a detection pass is folded in. `shared/game` has no Node and no `window`, so the store does not open files. It takes a storage port and the host supplies the adapter: Electron writes JSON, a test keeps a Map in memory. The logic lives in `reconcile`; the store decides the scope of a pass and persists the result. There is one file per collection, keyed by the content id.

- `recommendationFile` is `Data/recommendations/<kind>.json`, relative to the app's user data root.
- `memoryStorage` is the in-memory port. It is the default, and what a test uses.
- `applyPass` folds one detector run into the stored collection. The scope comes from the detectors that ran and the screen they ran for, so a pass on one screen never resolves findings about another. `detectorIds` is the set that ran, not the set that produced output: a detector that ran and found nothing is how a finding stops reproducing, and leaving it out would keep that finding open forever.
- `applyPass` skips the write when the pass changed nothing. `reconcile` rebuilds an entry it touched and returns the stored object itself for one it did not, so element identity is a sound and cheap test. A sweep covers every collection, most of which a single pass has nothing to say about, and this keeps that coverage from costing a file write each.
- `decide` records a person's verdict, a state reconcile never moves.

### recommendations/registry

The detector registry, the same Strategy registry the field kits use: a new way of noticing the dataset is wrong is one registration. The built in detectors register as a side effect of importing the strategy barrels. Nothing here reads the game or the dataset; a detector is handed its observations.

- `registerDetector` with an existing id replaces it, so a host can override a built in detector. `clearDetectors` gives tests a clean registry.
- `runDetection` runs every detector registered for a kind and dedupes the drafts by the id they would mint. Two detectors that notice the same thing about the same record agree, and the ids say so. The first draft for an id wins.
- `DetectionRun.detectorIds` lists every detector that ran, silent ones included. The store needs it to scope reconciling.
- `runDetectionSweep` covers several kinds and groups drafts by the kind each draft names, not by the kind whose detectors produced it. A detector may emit a draft about another collection (see `UnresolvableMapper`), and that draft is stored, reconciled and decided under the collection it names. Filing it under the producing kind would put it where no verdict looks, so accepting it could never close it.
- The sweep's `detectorIds` is the union across the sweep, because any detector could have contributed to any group. A group's scope must cover everything that ran, or a cross kind finding that stops reproducing stays open forever. This is sound only because every draft lands in its own kind's group.
- Every kind in `kinds` gets a group, empty or not, and so does any other kind a draft names. A collection with no detectors of its own can still hold a cross kind finding from an earlier pass, and only an empty group lets it resolve. An empty group reconciles to the list already stored, which `applyPass` recognises and does not write.

### recommendations/detection-types/detection.type.ts

What a detector may look at. Everything is plain data: no React, no `window`, no module handles, no wasm calls, so a test can call a detector with an object literal. Reading the game is the caller's job. The observation types are declared structurally and not imported from the renderer, so its `RealTransition` and `DetectedConnection` pass straight in and `shared/` never reaches into `@app/*`.

For every optional field of `ScreenObservations`, absent means not read, never empty. A detector must stay silent then.

- `match` is how the live room resolved against the dataset; null when nothing matched.
- `liveGameId` holds the native values for where the player is, not what the record claims: the ground truth a screen identity fix proposes.
- `realTransitions` is every real transition observed for this screen. `realAvailable` false means the native tables were not read, and an empty table must not be read as absence.
- `unmatchedCrossings` are the crossings the game exposes that no dataset edge covers.
- `floodConnections` are the live flood crossings for this screen, evidence of presence only.
- `existingConnections` are the dataset connections leaving this screen plus those arriving at it.
- `palaceMismatches` are the palace mismatches the detection fallback recorded, newest scan included.
- `entranceRooms` is the native entrance id to room index table (`wasmGetEntranceRooms`). `entranceRooms[whichEntrance] === roomIndex` tests whether the room was entered directly through that entrance. RAM $010E (`whichEntrance`) does not update on an indoor to indoor transition, so without this table a room walked into from another interior reads as entered through the first room's entrance.
- `spriteCombat` holds the combat rows for sprite types seen on this screen, keyed by `spriteType`.
- `grantedItems` are the items the game granted this session, from the native receive count table or the tracker's inventory read.
- `chests` are the chests the loaded room draws, from the room addressable chest table. Outdoors there is no such table, so it stays absent.
- `roomTags` are the loaded room's header tag bytes (`wasmGetRoomTagsFor`): scripted room effects such as kill to open a door, switch doors and moving walls. Outdoors there is no room header.
- `dungeonMapPos` is the room's position on its palace's dungeon map grid. A house, cave or outdoor screen reads as `found: false`.
- `entranceSpawns` is the entrance id to spawn tile table (`wasmGetEntranceSpawns`): the landing position for every entrance in the game. It is reserved for the connection strategy's fall hole and entrance work.
- `isDarkWorld` is a native flag (`ui-bridge-parser.ts`), read alongside `isIndoors` and never absent. Every `ScreenRecord` needs a `world`, so a strategy proposing a new record has a provable answer and does not guess `light`.
- `walkBoundaries` are the room's inter room walk through boundaries (`wasmGetRoomWalkBoundaries`). They are enumerable, so an indoor `kind: 'edge'` connection can be judged for removal against them, unlike an outdoor scroll edge the flood alone can never disprove. Outdoors there is no such table.
- `doorBoundaries` are the room's door tiles (`wasmGetRoomDoorBoundaryTiles`), the second half of "this room's exits were enumerated" beside `walkBoundaries`.
- `RecommendationDetector.id` is stable and part of every id the detector mints.

### recommendations/detection-types/observation.type.ts

The live evidence shapes carried by `ScreenObservations`.

- `ObservedDestKind` says how a raw destination index resolves to a screen id. An entrance id is not one of them: it names a room only through the native entrance table, so a producer resolves it there and reports the `room` it found.
- `ObservedTransition` is one real transition leaving the current screen, read off a native table, so an absence is provable. `source` names the table (the exit map, the stair table, the flood). `index` is the raw game index: an overworld screen index, a room index, or an entrance id.
- `ObservedCrossing` is a crossing already resolved against the dataset. `toScreenId` is null when no record covers the destination, the one case nothing may be written for. `targetRoomOrScreen` is the raw index the detector reported. `isExit` is true for the exit screen detector, which reuses the `entrance` type. `label` is display text only.
- `LiveSpriteObservation` is one spawn from `wasmGetRoomSpriteSpawns` or `wasmGetOverworldSpriteSpawns`, declared structurally so the bridge's `SimSpriteRaw` values pass in. `spriteType` is the native sprite type byte and joins to `ActorRecord.gameId.spriteType`.
- `SpriteCombatObservation` is the resolved combat row for a sprite type (`wasmGetSpriteCombat`). The table is enumerable per type, so a disagreement with `ActorRecord.combat` is proven. `damageByClass` has 16 entries indexed by ancilla damage class.
- `GrantedItemObservation.receiveCount` is the `Link_ReceiveItem` call tally (`wasmGetReceiveCount`); nonzero proves the game granted the item at least once. `ownedItemIds` is what the tracker read as held at the same moment, which the vanilla duplicate swap rule (`resolveDuplicate`) needs. `fromInventoryDelta` is true when the entry came from watching the tracker's inventory change. A delta only proves an item appeared, so a detector grades it `likely`, never `certain`.
- `ChestObservation` is one chest the room draws, from `wasmGetRoomChests` (the bridge's `SimChestRaw` rows). The table lists a room's chests, draw tiles and static contents whether or not one was opened, so an absence is provable. A receive event only proves something occurred. `chestIndex` is the draw order slot and joins to `CheckGameId.chestIndex` and the open bit mask. `itemId` is in the same raw id space as `ItemGameId.receiveItemId`. When `posKnown` is false the draw position could not be decoded and `col` and `row` are 0xFF.
- `LiveDungeonMapPosition` comes from `wasmGetDungeonMapPosition`. `found` is the table's own answer: the native call reports false for a house, a cave or outdoors, a resolved negative like `known(undefined)`. Not read is `ScreenObservations.dungeonMapPos` being absent. `floorRaw` is the raw floor byte: 0 is 1F, 1 is 2F, 0xFF is B1, 0xFE is B2, the same encoding as the bridge's `DungeonMapPosition.floorRaw`.
- `LiveWalkBoundary` is one boundary from `wasmGetRoomWalkBoundaries`, such as a palace toggle wall between the castle and the sewer. `destRoom === 0` means no boundary on that wall, like the unused slot of every other room addressable table.
- `LiveDoorBoundaryTile` is one door tile from `wasmGetRoomDoorBoundaryTiles`. It carries no destination. It proves a door exists at a wall and gives its open state, so the indoor edge probe uses it only as a sign that the room's exits were read, never for identity.

### recommendations/diff/changed-paths.ts

The structural difference between the stored record and the proposed one. A line diff over serialized records answers the wrong question: reordered keys read as a change, and a deep change reads as a change to whichever line holds the brace. Walking both objects reports each differing leaf at its real path, which is what a reviewer wants and what `linesForPaths` needs.

- Paths use `a.b` for a member and `a[0]` for an element, bare at the root (`child-path.ts`).
- An absent key and a key set to `undefined` mean the same thing in every record shape here. A connection with `nav: undefined` has no nav data, like one that never declared the field, so neither counts as a difference.
- A subtree present on one side only is compared against an empty container of the same shape and reports its leaves, not itself. A `create` diffs against nothing, and a root level change would give the comparison view a path it cannot map to a line.
- A shape change (an object became a scalar, an array became an object) is reported at its own path and not walked into: the whole subtree changed.
- An empty result means the records are structurally identical, whatever their serializations look like.

### recommendations/diff/lines-for-paths.ts

Gives the 1-based lines those paths sit on in a serialized record, JSON or the record emitter's TS output. A path the source does not declare falls back to its nearest declared ancestor: a value the proposal removed has no line of its own, so the object that held it is the honest answer. Lines come back sorted and deduplicated, since several changed paths often share one line.

### recommendations/path-lines.ts

Maps every path in a serialized record to the line it is written on, so the comparison view can highlight what the diff found. It is a character scanner and not a set of per line regexes: the record emitter writes unquoted keys, single quotes, trailing commas and several fields per line, JSON writes none of those, and a `{` inside a string is not a container.

- A container records the line its key sits on, not its closing brace.
- `pendingPath` is the member path the next `{` or `[` opens, set when its `key:` is read.
- An array element that is itself a container has no key, so it takes the next index of the array it sits in.
- A scalar array element is claimed by the first non space character after the opening bracket or the previous comma. The rest of the element is consumed so one value claims exactly one index.
- `keyBefore` returns null when nothing key shaped precedes the colon, and that colon is ignored. No segment is made up.
- `Frame.index` is the next array index to assign; objects do not use it.

### recommendations/strategy-detectors.ts

Turns every registered comparison strategy into a registered detector through `detectorFromStrategy`. Without it a registered strategy never runs. Import it after every `strategies/*` side effect import (see `use-detection-pass.ts`), so `allStrategies()` already holds every strategy for the pass. Running it again is harmless: `registerDetector` keys on id, so a repeat call replaces the same entries with themselves.

### recommendations/compare/probe.type.ts

A probe reads one live value or one live set. A strategy bundles the probes for one entity kind and only declares what to read; `compare-field.ts`, `run-comparison.ts` and `compare-set.ts` own the walk, the classification and the formatting once, for every kind.

- `Probe` with `known: false` means the backing table was not read this pass: silence, never a negative answer. `known(undefined)` is a different thing (see `compare/probe-reading`).
- `FieldProbe.read` gets the observations and the record because some fields only make sense given what the record already claims (an entrance only field on a non entrance screen). `applies` gates that.
- `FieldProbe.path` uses the diff path grammar, such as `gameId.roomIndex` or `tags[2]`. `source` names where the live value came from, such as `native:room-identity`.
- `SetProbe` compares a whole collection, such as every edge leaving a screen. Live items and dataset records are matched by key, not by position, because nothing orders both sides the same way. Every function receives the current `screenId` so a crossing probe can tell which end of a `ConnectionRecord` is here. `noun` is the singular noun used in a finding's key and reason, such as `edge` or `chest`.
- `SetProbe.removable` is true only for an enumerable native table. The flood proves presence only, so a flood backed set never proposes a delete.
- `SetProbe.removalConfidence` grades an `unbacked-in-dataset` finding when a removal deserves a different grade from an addition. A delete proves an absence, and that proof is only as strong as the enumeration behind it. A probe whose live read can miss a crossing keeps its deletes below `certain`, so a gap in the enumeration is never batch writable.
- `ComparisonStrategy.sets` types each probe's item as `any`. One strategy holds probes for different collections with different item shapes, and `SetProbe<K, unknown>` makes `liveKey` and `toProposed` uncallable without an unsound cast. The `any` stays contained: nothing in the engine inspects an item beyond passing it to the same probe's own functions.

### recommendations/compare/difference.type.ts

What the engine hands back: the outcome of checking a probe against the live game, before it becomes a recommendation. A probe describes how to look and a difference describes what was found. A strategy author writes probes; only the engine builds differences.

- `mismatch`: both sides hold a value and they disagree.
- `missing-in-dataset`: the game reports something the record does not hold.
- `unbacked-in-dataset`: the record holds something the game does not confirm. For a set it comes only from a `removable` probe. For a field it means the live read came back `known(undefined)` while the record holds a value.
- `unresolvable` (sets only): a live item with no dataset match and no way to propose one, because `toProposed` returned null (a crossing whose destination has no screen of its own). It carries the live `item` so a strategy's `onUnresolvable` mapper can act on it. The connection strategy's mapper reads a crossing's raw destination index from it to propose the missing screen, without parsing one out of `key`.
- `SubjectComparison` is one record plus everything the game disagrees with about it. `Difference.shown` holds both values already formatted.

### recommendations/compare/probe-reading

- `known` means the table was read and the value may be absent. `known(undefined)` means "we looked and there is nothing", as authoritative as `known(5)` meaning "we looked and it is 5". A record that claims a value the live read returns `known(undefined)` for is a real `unbacked-in-dataset` finding: the game was checked and disagrees. A record compared against `unread()` gets no finding, because nothing was checked. Mixing the two up either invents findings for a screen whose tables were never read or drops a real one.
- `known` folds a live `null` to `undefined`, since both mean nothing here.
- `unread` is silence, not a negative answer.

### recommendations/compare/value-format

- `hex2` and `hex4` print `0x` and 2 or 4 uppercase hex digits, or `-` for anything that is not a finite number.
- `defaultFormat` is the formatter for a probe without its own `format`: `-` for nothing, a primitive as is, JSON for anything structured. It is good enough for a reason string.

### recommendations/compare/deep-equal.ts

Structural equality between a probe's live value and the record's current value. `undefined`, `null` and a missing key all compare equal: a record that never declared a field, one that set it to `undefined` and one that set it to `null` all mean nothing here, so none reads as a difference against the others.

### recommendations/compare/compare-set.ts

Joins a live collection against its dataset counterpart by key, through one `SetProbe`. An unread live side yields no differences: not read does not mean empty. A live item whose evidence cannot become a valid record (a crossing whose destination has no screen) is reported as `unresolvable` and keeps its item for the strategy's mapper. Only a `removable` probe reports dataset records the live read did not match, because a flood backed set only proves what is reachable, never that a record is gone.

### recommendations/compare/compare-field.ts

Compares one field probe against one record. It stays silent when the probe does not apply, when the table was not read (an unread table proves nothing either way), or when the values agree. `classify` sees presence after `isAbsent` has normalised absent values, so a `false` there means that side has nothing.

### recommendations/compare/run-comparison.ts

The field half of the engine; `compare-set.ts` is the collection half. For every subject record, each probe stays silent or yields one `Difference`. It never decides what to do about a difference: `detector-from-strategy.ts` turns differences into drafts.

### recommendations/compare/record-path

Get and set over the path grammar the diff produces: dotted keys and bracketed array indices (`gameId.roomIndex`, `tags[2]`). Tessera's data engine (`@drizztdourden08/tessera/data`, the schema path helpers) uses a dot numeric grammar (`items.0.name`) and lives where `shared/` may never import from, so this is a small local parser that behaves the same way. `getPath` never throws. `setPath` clones every container along the path and creates missing ones, leaving the input untouched. `SEGMENT_PATTERN` matches one dotted key run or one bracketed index, in path order.

### recommendations/compare/strategy-registry

The registry of comparison strategies, shaped like the detector registry: one kind, one strategy. Adding a kind is one registration and no edit in the consumers that walk kinds. Registering a kind again replaces it, so a host can override a built in strategy. `clearStrategies` gives tests a clean registry.

The map holds `ComparisonStrategy<EntityKind>` behind a cast in `registerStrategy`. A `FieldProbe`'s `read` and `applies` take the record in a contravariant position, which makes `K` invariant, so `ComparisonStrategy<'screen'>` is not a subtype of `ComparisonStrategy<EntityKind>` and a direct cast fails the overlap check. Every strategy is checked against its own `K` when registered, so the stored values were sound at that point.

### recommendations/compare/diffs-by-record.ts

Every live field difference across all registered strategies, keyed by record id and then by field path, so a caller with a record id can look its differences up directly. Only field probes feed it. A set difference describes a whole record that is missing or unbacked, so it has no path to key by and no row to bracket. `detector-from-strategy.ts` turns those into their own create and delete recommendations.

### recommendations/compare/detector-from-strategy.ts

Turns one `ComparisonStrategy` into a `RecommendationDetector`, so the registry never knows a detector was built from a strategy. It emits one draft per differing field path, not one draft for the whole record: a reviewer accepts "fix the room index" apart from "fix the palace index" even when both come from the same stale record, and a batch accept over `certain` findings would otherwise swallow a `likely` one in the same draft.

- A reason is scanned, not read: it states the field and the two sides. The full pair is repeated in the evidence line for the record view.
- A delete proposes the record itself. Nothing replaces a deletion, and the action is the change. `connection-remove.ts` follows the same convention.

### recommendations/compare/detector-from-strategy.type.ts

A strategy supplies an `UnresolvableMapper` when it wants an `unresolvable` set finding surfaced; by default such a finding is dropped. It returns the bare `DraftRecommendation` union, not `DraftRecommendation<K>`, because the connection strategy's mapper proposes a `screen` record for an uncatalogued crossing destination, a different kind from the `connection` strategy that found it. Crossing that boundary is what the mapper is for.

### recommendations/strategies/actor/actor.strategy.ts

The `actor` comparison strategy. The engine allows one strategy per kind (`strategyFor(kind)` is a single lookup), so combat and spawns share it. An `ActorRecord` is not scoped to the current screen: a sprite type is catalogued once and can spawn anywhere. So `subjects` is the whole catalogue, and the combat probe's `applies` and `read` narrow it to what this pass observed.

### recommendations/strategies/actor/combat-profile.ts

Converts a resolved native combat row into the `ActorCombatProfile` shape `ActorRecord.combat` stores. The combat field probe and the spawns set probe (a proposed actor carries a profile when a combat row proves it fights) share it.

### recommendations/strategies/actor/combat.probes.ts

Field probe over `ActorRecord.combat`: the health, `flags4` and per class damage facts `kSpriteInit_Health`, `kSpriteInit_Flags4` and the per class damage lookup report for a sprite type. The table is a native, enumerable fact about the sprite type and not inferred from watching a fight, so a disagreement is always `certain`.

`spriteCombat` only carries rows for sprite types observed this pass. A type missing from it was not seen this time and is not proven to lack combat data, so `read` returns `unread()` for it. Returning `known(undefined)` would propose deleting a correct combat profile because this room did not spawn that sprite type.

### recommendations/strategies/actor/spawns.set.ts

A live sprite spawn with no `ActorRecord` cataloguing its sprite type. The room's spawn table is fully enumerable, so a spawn no record's `gameId.spriteType` names is a proven gap: `certain`. Repeat spawns of one type on one screen collapse into a single live item.

The actor's `kind` is not provable from the spawn byte. The proposal is `enemy` only when a native combat row proves the sprite fights, and `object` (the dataset's catch all) otherwise, never a name level guess like `npc` or `boss`. A person still reviews the proposal.

`removable: false`: the per room table only proves what this room spawns, never that another catalogued actor is wrong to exist.

### recommendations/strategies/check/check.strategy.ts

The `check` comparison strategy. The chest presence probe covers a chest the room draws that no record catalogues. The correction probes cover an existing record the same chest table proves wrong about its `kind` or `screenId`. `subjects` resolves each of the current room's chests to its own `CheckRecord` through `getCheckByGameId`. A check with no chest match gets no field correction; the presence probe proposes a record for it.

### recommendations/strategies/check/chest-for.ts

Returns the live chest a `CheckRecord`'s own room and chest index name, if the room's chest table was read and draws it. It derives the match from `record.gameId` each time: a field probe's `read` and `applies` only receive the observations and the record, so a value computed while building `subjects` cannot reach them. The scan over a small array is cheap.

### recommendations/strategies/check/room-id-of.ts

The loaded room's index, or null when there is none to read (outdoors, or the room table was not read).

### recommendations/strategies/check/chests.set.ts

A chest the loaded room draws that no `CheckRecord.gameId` covers. The chest table is enumerable (no chest has to be opened for it to report one), so the absence is proven: `certain`.

- The kind `chest` is proven by the object the room draws.
- `name` has no native answer, so the proposal carries an obvious placeholder a reviewer must replace, not a guessed name.
- The contents byte is a raw receive id in the same space as `ItemGameId.receiveItemId`, so `vanillaItemIds` holds a real item when the catalogue has it and stays empty when it does not.
- With no chest table, no resolved room, or no screen to attach a proposal to, the probe stays silent and does not invent a placement for an orphaned chest.
- `removable: false`: the chest table never proves an existing check wrong to exist, only that a new one is missing.
- Big and small chests are not told apart: no native read distinguishes them yet, so the probe does not guess.

### recommendations/strategies/check/corrections.probes.ts

Two corrections the room's chest table proves about an already catalogued check: it is not recorded as a chest though a chest object draws it, or its `screenId` names a screen of a different room. Both read the same enumerable chest table as the presence probe, so both are `certain`.

- The screen probe's live value is the current screen's id, which a field probe has no direct channel for. `observations.match?.screen.id` is the same value `context.screenId` always carries in production (`use-screen-observations.ts` sets `screenId = match?.screen.id ?? null`), so reading it there is not a guess.
- Chest contents are left alone by both probes: the check collection's `vanillaItemIds` is edited per dungeon reward in ways the raw chest byte cannot settle. That belongs to the item strategy.
- The screen comparison goes through the recorded screen's own `roomIndex` and does not compare screen ids. One room can carry several screen records (a progress variant of the same interior), so a check attached to a variant this pass did not resolve is correct. Only a recorded screen in another room is a real mismatch.

### recommendations/strategies/dungeon/dungeon.strategy.ts

The `dungeon` comparison strategy: the loaded room resolves to a dungeon whose `roomScreenIds` does not list this screen. `subjects` is at most the one dungeon the loaded room's own palace index names; no other dungeon record has anything to say about this room. The live palace index is already carried on `liveGameId`.

### recommendations/strategies/dungeon/rooms.probe.ts

`DungeonRecord.roomScreenIds` against the loaded room. The fix is an append, so this is a field probe whose `read` returns the union of the record's list and the current screen, never a smaller set, and an existing member is never dropped. A set probe does not fit an append onto one array field of a record that exists: a `missing-in-dataset` set finding always becomes a `create`.

Room to dungeon membership is a native, enumerable fact about the loaded room (`cur_palace_index_x2` names the dungeon outright), so a missing entry is `certain`. The live value is the current screen's id, read from `observations.match?.screen.id` for the same reason as the check screen probe. With no resolved screen there is nothing provable to append.

### recommendations/strategies/item/item.strategy.ts

The `item` comparison strategy. The grant probes cover a native item id no record catalogues. The alias probes cover an existing record whose `aliasOf` duplicate swap rule an observed grant contradicts. `subjects` is the whole catalogue: an `ItemRecord` is not scoped to the current screen, so there is no narrower set to hand the alias probes.

### recommendations/strategies/item/grants.set.ts

A native item id no `ItemRecord.gameId.receiveItemId` covers, from the three places the game says so. Each is its own set probe because confidence and source are fixed per probe, not per live item, and the three differ in both:

- the room's chest table needs nothing to have happened: `certain`, `native:room-chests`;
- a direct native receive count tally is enumerable too: `certain`, `native:receive-count`;
- a grant seen as a change in the tracker's inventory only proves an item appeared, never that the native table backs it: `likely`, `tracker:inventory-delta`.

One combined probe would give every finding one confidence and one source and overstate the weaker two. All three share one join (the raw native id, the space `ItemGameId.receiveItemId` uses) and one placeholder, so a `create` from any of them has the same shape; only the evidence differs.

`grantProbes` is in priority order: chest, native receive, tracker delta. When more than one fires for the same id in a pass, `runDetection` keeps the draft produced first, so the enumerable source wins a tie against a grant and a native tally wins a tie against a delta.

The placeholder's `category` and `name` have no native answer and `ItemRecord` requires both, so it uses the dataset's neutral defaults. `origin: 'vanilla'` is provable: anything that reached this join (a chest's static contents or the native receive path) is a real in game item. `removable: false` on all three: none of these tables proves an existing `ItemRecord` wrong to exist.

### recommendations/strategies/item/alias.probes.ts

An existing record's `aliasOf` claims a duplicate swap rule (`resolveDuplicate`) that an observed grant contradicts: the record's own raw id was granted as is while its own item was already owned, at which point `resolveDuplicate` says the swap should have applied. The check uses only the record's own id and the observation's owned set snapshot.

There are two probes on the same path because confidence is fixed per probe: a direct native tally (`fromInventoryDelta: false`) is `certain`, a tracker inventory delta is only `likely`. The two `applies` gates are exclusive on the same grant's flag, so at most one fires for a record in one pass. `format` shows the dataset side as the alias's display name, the item a reviewer recognises.

### recommendations/strategies/screen/screen.strategy.ts

The `screen` comparison strategy. Every field reads `ScreenObservations` directly. `subjects` is the current screen plus every screen a recorded palace mismatch names, deduped by id. Only the palace probe needs the extra screens, but every probe runs over `subjects`, so the dedup happens here once.

### recommendations/strategies/screen/game-id.probes.ts

Field probes over `ScreenGameId`, the native identifiers a screen record claims. Every value is read off a table fully enumerable for the loaded room, so every probe is `certain` and compares unconditionally: a wrong value is reported, not only a missing one.

- The room, overworld and entrance probes describe only the room the game is in, so each requires the record to be the resolved screen. `subjects` can widen past the current screen for the palace mismatch case, and comparing against an unrelated subject would make up a mismatch.
- Indoors the overworld index RAM slot is left over from the last outdoor screen (it is not refreshed on an indoor transition), so it is compared only outdoors.
- The palace probe reaches beyond the current screen. The current screen reads the live RAM value (indoors only), any other subject reads its value from the recorded mismatch list, and anything else is unread.
- `PALACE_NONE` is what the register holds for a cave, for a house, and for a palace room the game has not put in palace context. The three cannot be told apart, so it says nothing about the record's palace membership and reads as unread.
- RAM $010E names the entrance a room was entered through only when it was entered directly. Walking in from another indoor room leaves it stale, and `entranceRooms[whichEntrance] === roomIndex` is the only way to tell.
- RAM $010E holds 0 from boot and is not rewritten by loading a save state, so a live 0 cannot be told apart from walking through entrance 0x00. It is not evidence and reads as unread.

### recommendations/strategies/screen/identity.probes.ts

The game reports a screen's kind only through `isIndoors`. Outdoors that bit proves `overworld`. Indoors it settles nothing: the record could be `dungeon`, `interior` or `cave`, and no native byte tells them apart, so a guess would be a finding the game never proved. Only the outdoor case is provable, and only for the currently loaded screen: `subjects` can include other screens named by a palace mismatch, and `isIndoors` is a global flag that says nothing about those. There is no probe for `position.floor`; inventing one without an observation would be a guess.

### recommendations/strategies/screen/palace-mismatches.ts

Every palace mislabel the fallback rescued this session, folded with what the live match just resolved. The live match is folded in so a screen that appears in both yields one finding, not two that share an id. `screen.strategy.ts` uses it to widen `subjects` past the current screen, and the palace probe uses it again to read the value for whichever extra screen it is looking at.

### recommendations/strategies/screen/presence.set.ts

The screen the player stands on has no record cataloguing it. Reaching this needs a pass that runs with a null `context.screenId`, which `use-detection-pass.ts` provides.

- Both sides hold at most one entry: the screen the player is on, identified by its game id.
- `datasetKey` does not derive a room and palace key from the matched record's own `gameId`. Several resolution methods of `resolveCurrentScreenDetailed` (`palace-scan`, `cave-single`, `cave-ambiguous`, `variant`) return a record whose `gameId` disagrees with or omits the live values: a palace scan match still carries the stale expected palace index (which `palace-mismatches.ts` corrects), and a cave or interior record has no `palaceIndex` while the live register does. Keying each side off its own `gameId` would make a mapped room fail the join and mint a duplicate `create` beside the correction the field probes already propose. So the live item carries the id `observations.match` resolved (`matchedScreenId`) and `liveKey` prefers it. The join fails, and proposes a `create`, only when `observations.match` is null.
- The fallback key is `room:<index>:<palace>` or `overworld:<index>`. It carries the palace index indoors so room 0x80 in the castle and room 0x80 as a cave never collide. It is also the finding's persisted `key`: a `create` draft's `screenId` is null for every unmapped room, so without a per room key every unmapped room would collapse onto one recommendation. An id like `room-080` is never built by hand, because a room number alone is ambiguous.
- `readLive` builds its probe directly: `known()` collapses a missing value to `undefined` for a single field, the wrong shape for a one item array.
- The proposal leaves `palaceIndex` off when it is `PALACE_NONE` (a cave, a house, or a palace room not in palace context), since that is an absence. It leaves `entranceId` off entirely: no dataset record carries one, and RAM $010E holds a stale boot or entry value for a room reached from another interior.
- Outdoors the proposed kind is `overworld`, provably. Indoors it is `interior`: `dungeon` would claim palace membership, which one byte cannot prove, and `interior` is the dataset's catch all for an indoor screen with no palace (as in the wells and shops data). Raising a real dungeon room from `interior` later is a one field fix; a wrong `dungeon` would mark a house or a cave as a palace room.
- `removable: false`: the lack of a match does not prove a record wrong. It may be a detection bug, an unresolved variant, or a stale palace index the field probes are already correcting.
- Confidence is `likely`: the game supplies the identity but never the geography a screen record must carry, so the create is never batch safe.

### recommendations/strategies/screen/screen-draft.ts

The minimal `ScreenRecord` a `create` proposes for an uncatalogued room or overworld index: everything besides the identity (`gameId`, `kind`) and the label, which differ by caller. The presence probe (the screen the player stands on) and the connection strategy's `onUnresolvable` mapper (a crossing destination) share it. Only the current screen's live registers carry a palace index; a crossing destination never can. Geography has no native answer, so the draft carries the placeholder area and location ids and an unfinished name. `validate-create.ts` refuses to let it reach disk.

### recommendations/strategies/screen/spawns.set.ts

`screen.spawns` against the live sprite spawn table. It is a field probe despite the file name. `SetProbe` works over whole records and `spawns` is one array field on a record that exists, so a set probe would turn a `missing-in-dataset` difference into a `create` of a second screen record for the same room (`direction-tag.detector.ts` met the same limit). Comparing the path as one array yields an `update`.

- `read` returns the union of the record's spawns and every live spawn missing from them, never a smaller set. Sprites spawn conditionally and the dataset models that with variant screens, so one pass proves nothing about a spawn being impossible. This is `removable: false` made structural.
- A spawn's identity is which actor at which tile, independent of order.
- A sprite type with no `ActorRecord` is skipped; that gap is the actor spawns probe's finding.
- An empty union becomes `undefined`, not `[]`: an empty array is a real value and would make up a finding against an undefined `record.spawns`.

### recommendations/strategies/screen/geography.detector.ts

A screen whose two geography ids contradict each other: it names an area and a location, and the location record names a different area. It is hand written and not a field probe because there is no live signal: the game never reports which area or location a room sits in. This is the dataset disagreeing with itself, which only a detector reading the records can see. `screenBlockers` refuses such a pair at edit time; this detector is the read side of the same rule for records already on disk.

- The fix proposed is a corrected location, never a corrected area. Screen files are grouped by area and an area's own locations can go unreferenced, so the area is the dependable half of the pair and the location is the stale one.
- The reason states the fault, then whether the proposed value is forced (only one location in the area) or a guess. An area and a location often share a name, so naming both sides would read as a contradiction. The evidence line names the records involved.
- Confidence is `likely`: which half is stale is inferred, and `certain` is the grade batch accept acts on.
- A placeholder on either side means no place assigned, not a contradiction. A location id no record answers to is a dangling reference, a different fault with a different fix.
- When nothing is filed under the area there is no value to propose.

### recommendations/strategies/screen/index.ts

Importing a strategy barrel (`strategies/actor`, `check`, `dungeon`, `item`, `screen`) installs that strategy as a side effect. `strategy-detectors.ts` turns a registered strategy into a runnable detector, so import it after these. The geography detector compares the dataset with itself and is not strategy derived, so this barrel registers it directly. It has its own detector id, so wiring the strategies cannot overwrite it.

## simulation

### simulation/types

Flag snapshots are raw SRAM copies. The simulator only byte-diffs them and never reads check data to decide what happened; naming a diff is the check matcher's job.

- `SimConfig.stopAtCheckId` halts the run right after that check triggers. `goalCheckId` is the check whose completion ends the run (the final boss check by default). `screenLimit` stops the run once that many distinct screens were visited, for bounded testing.
- `VirtualPlayer` is the simulated position: the screen the virtual player explores, and its tile.
- `FlagSnapshot.dungInfo` is `save_dung_info`, a uint16[320] indexed by room id. `owEventInfo` is `save_ow_event_info`, a uint8[0x82] indexed by overworld screen. `progress` is the progress buffer from `WasmGetProgressFlags`.
- `SimObservation.inventory` holds items by dataset id (the tracker's own set). `interactables` is what the runner assembled from the port for the current screen. `grids` are the attribute grids used to flood-fill tile reach.
- `SimObservation.presenceState` is the live state snapshot for NPC presence conditions, the simulator's one sanctioned data read. When it is absent, presence gating fails open.
- `SimObservation.itemReceived` is the item delivered since the previous step. The tracker already resolves the native id to a record, so the id travels intact.
- `SimObservation.exits` are the exits found by flooding the current screen in game. When present, traversal runs on this graph alone and never consults the static connection dataset. `reached` holds the flood-reached tiles of the current screen. `combat` holds the combat rows for the sprite types on screen. `sectionSplit` says which axes of the current indoor room split into separate scrolling sections; it is undefined outdoors or with no room loaded.
- `SpriteCombatInfo` is the resolved damage row of one sprite type: initial health, initial flags4, and the 16 entry damage-by-class table already reduced through the game's own two-step lookup.
- `CombatTables.ancillaDamageClass` is the shared ancilla (projectile) damage class table. `projectileTileCollision` maps a tile attribute to projectile collision: 0 pass, 1 block, 2 sloped, 3 layer dependent, 4 priority flip.
- `CombatContext.tables` is null when the developer tools combat gate is off. Combat reasoning is then unavailable and every gating sprite reads as not killable. `bySpriteType` has one row per sprite type seen; a missing or null row means the query missed.
- `SimArea` is a big overworld area made of several sub-screens (the castle style 2x2 groups).
- `SimExit` is a way off a screen found by the game: the destination plus where the player lands. `origin` names the detection branch that produced it, for diagnosis only and never for a decision.
- `SimExit.edgeSig` is which way in the crossing uses, seen from the destination. A wall can carry several separate crossings, so explored state keyed on the screen alone skips real ground. For a border it is the contiguous tile span of the crossing (from the flood's `ConnectionInfo.positions`); for a door, hole or stair it is the game's entrance id.
- `SimExit.twoWay`: border crossings are walkable both ways; holes and doors are not implied to be. `fromTile` is the tile the exit sits on in the flooded screen (walk distance ordering). `via` is the big area sub-screen the exit sits on, when not the visited one.
- `SimExit.steps` is the true walk distance from the entry tile, or undefined when unknown. It never carries a sort bias: showing the raw ordering score as a step count once printed "4096 steps". `score` is that raw ordering score, which may include the out of area bias, for sorting only. `stepsNote` says why `steps` is missing or qualified. `area` is the big area the destination belongs to.
- `SimLocation` names the screen or room the room-addressable reads target: `roomId` indoors, `owScreenIndex` outdoors.
- `ScreenGridBundle` holds the attribute grids for one screen, ready for `floodFillScreen`. `dualLayerGrids` is present for dual layer indoor rooms. `staircaseType` is `kind_of_in_room_staircase` (2 means layer changes are blocked). `variant` is the progress dependent overworld screen variant.
- `RoomInteractables.tags` are the room header TAG bytes `[tag1, tag2]`, `[0, 0]` outdoors or when unknown.
- `TriggerAction` `bombWall` blasts a cracked wall open. Bombs are permanent once obtained, so it needs no count. `pullSwitch.drain` is set when the switch's effect reaches beyond its own room, onto a remote overworld screen's event byte, in place of a local shutter.
- `FlagDiff` is one changed flag location from pure byte diffing. `index` is the room id for `room`, the screen for `overworld` and the buffer index for `progress`. `setBits` are the newly set bits: `(before ^ after) & after`.
- `DetectedCheck.matched` is the identified check's record, for display and dungeon attribution, never for detection. `checkId` is absent when the diff matched no check.
- `DatasetSuggestion.targetFile` is relative to `shared/game/data/`. `targetId` null means insert a new entry. `code` is a code block ready for the writer IPC.
- `SimChest.isBig` is bit 15 of the chest room word; a big chest needs the big key. `posKnown` is false when the C layer reports an unknown position (col and row 0xFF) for a remote room.
- `SimSprite.outdoor` is true when the sprite came from the overworld spawn table, so `roomId` is a screen index. `kind` cannot answer this (a check giving NPC is `npc` indoors or out), and the screen index says which world the sprite is in (see `NpcCheckConfig.owWorld`). `posKnown` false means the tile is unknown (coarse reach). `carriesKey` means it drops a small key when defeated (the room's die action marker); `carriesBigKey` means it drops the big key (marker 0xe4 or 0xfd).
- `SimDoor.index` is the slot in the room's door table, which is also the open bit index (slots 0-3). `opened` comes from the room's door open flag bits. `cellLock` marks a jail cell keyhole plate (room object 0x18), not a door table door: `index` is then its chest slot and opening it writes that slot's open bit. `nativeType` is the raw `kDoorType`, which tells apart doors that share a `kind` (throne push wall 0x14, warp room door 0x46). `layer` 0 is upper (BG2) and 1 is lower (BG1), from door position slots 6-11.

### simulation/types/room-section.type.ts

A multi screen indoor room can carry more than one scrolling section, each with its own shutters and sprites. The game loads sprites only for the section the player stands in.

- `splitX`: column 32 divides the room into a west and an east section. `splitY`: row 32 divides it into a north and a south section. A destroyed blast wall merges two quadrants back into one.
- `playerSectionX` is the player's section along the X split (0 west, 1 east). `playerSectionY` is the same along the Y split (0 north, 1 south).

### simulation/traversal-id.type.ts

`TraversalId` is the simulator's own identity for a place, and deliberately not a `ScreenId`. The engine keys visited, frontier, route and discovered on the game's own number: `room:<roomIndex>` indoors and `ow:<screenIndex>` outdoors, set by the live port's observe. Seeding it from screen detection put the virtual player in the wrong place when a room index collided across a palace and a cave.

A `TraversalId` is not a dataset key. Handing one to a dataset getter returns a stand-in record, so anything that needs a display name does an explicit lookup that can answer "nothing" (`screenLabel`).

The static graph fallback (`buildAdjacency`) walks real `ScreenId`s through the same fields, so the id space holds both vocabularies. That is why it is a plain string alias: a template literal union would exclude the ids the fallback puts there.

### simulation/annotations.type.ts

What is on a screen and what state it is in, derived from the simulator's own discovery so the overlay, the minimaps and the widget panel cannot disagree with the run. A kind with no renderer is a test failure (see the renderer registry); an unmapped kind still draws as a neutral marker.

- `AnnotationState`: `shut` and `open` are physical; the rest are check progress.
- `ScreenAnnotation.layer` is the BG layer the thing sits on, when it is layer specific.
- `ScreenAnnotation.direction` is the wall a door record sits in, for door table kinds only. A door's footprint is wide along the wall and shallow through it (`n` and `s` are wide in columns, `e` and `w` wide in rows), so a marker is sized per direction.
- `label` is a short human label for display only, never an identity. `checkId` is the check this thing is, when it is one; without it `state` can only say "available", since nothing knows whether the run already collected it. `detail` is the secondary line (item name, destination screen, walk distance). `requires` lists the traversal tokens the thing demands.
- `ScreenTag` is one decoded room header TAG byte. It is screen wide, so it has no tile.
- `ScreenAnnotations.screenIndex` is the room id indoors and the overworld screen index outdoors, used for world placement. `checks` is the check progress for the minimap badge. `tags` are the decoded room tags saying what mechanic the room header arms, indoors only.

### simulation/port.type.ts

`SimulatorPort` is the single seam between the pure engine and the outside world. `LiveGamePort` drives the real game through the wasm bridge; a later `DataWorldPort` would replay the recorded dataset offline. The engine only ever speaks to this interface.

- `getRoomTags` reads the room header TAG bytes for scripted effects (the kill to open door family and others).
- `getSpriteCombat` returns the resolved combat row for one sprite type; null off the developer tools gate or out of range. `getCombatTables` returns the shared ancilla and projectile tables; null when the developer tools gate is off.
- `getRoomSectionSplit` returns the scroll section split of the loaded indoor room (all false outdoors or with no room loaded).
- `setAutoSkipDialog` and `setDeveloperTools` set the features0 bits: true or false force them, null defers to the user's setting.
- `setSimulatorSupport` sets the host gate `kHostGate_SimulatorSupport`, which arms the `WasmSim*` mutators (and the item grant fallback in `TriggerGrantAllowed`) for the length of a run. It is on at start and off at the end, including on abort or crash, so it never lingers armed against a live session.
- `snapshotState` and `restoreState` save the pre run state so it can be restored afterwards.
- `onItemReceived` reports the granted item by dataset id. The tracker resolves the native receive index to a record already, so nothing downstream derives it again.

### simulation/dungeon-key-target

What a key requirement token points at. A `smallkey:` or `bigkey:` token either names the dungeon whose key it wants, by `DungeonId`, or carries the wildcard `ANY_DUNGEON` (`*`). The wildcard is what a connection's `barrier:small-key` or `barrier:big-key` tag turns into, because the tag says a key is needed without saying whose. Keeping the wildcard as its own value (and not a string looked up in a per dungeon map that always misses) is what makes the two cases answerable separately.

`keyTargetOf` returns the target a key token's suffix names, or null when it names nothing real.

### simulation/key-items

Which received item is a dungeon key, by id. Identity is the native receive index the game delivers through `Link_ReceiveItem`: 0x24 for a small key and 0x32 for the big key, resolved to a record through the facade. These are the same two constants the discovery step uses for a guard's drop.

The dataset also holds 26 per dungeon key records (native 0x92-0xad) with no `dungeonId`. They are deliberately not a second path here: the vanilla core never delivers them, and one could not be attributed from the record anyway, which is why attribution comes from the matched check's `dungeonId`.

`keyKindOf` resolves the key item ids lazily, per call. A published dataset bundle can replace the records after import, and a snapshot taken at import time would pin the ids from before the bundle.

### simulation/logic-referenced-items.ts

`logicReferencedItems` holds every item referenced anywhere in the check and connection requirement graph (`CheckRecord.requirements` and `ConnectionRecord.requirements`). Receiving one can change whether a gated check becomes triggerable (boss gates, medallion checks, pendant and crystal counts), so picking it up triggers a reach re-flood even when the item carries no direct traversal token. The set is id based, like the requirement graph, so two records can never collapse onto one shared name.

### simulation/requirements-map

Turns what a run holds into the `TraversalRequirement` tokens the nav data gates on, maps connection barrier tags to tokens as a fallback when a connection has no explicit `ConnectionNavData.requirements`, and evaluates an OR of AND `RequirementSet` against a reach context. The item side is `ItemId` throughout; the token table lives in `data/native-tables/traversal-tokens.ts`.

- `ReachContext.tokens` holds item derived and always available tokens. `keyAvailable` says whether a small key remains for a dungeon, or for any dungeon. `bigKeys` holds the big keys possessed, by dungeon. `events` holds the observed done events.
- `tokensForItem` returns every token an item grants, including the rungs a progressive token implies.
- `inventoryToReachTokens` always adds `BARE_HANDS_LIFT`: the base lift needs no item.
- `requirementsMet`: an empty set means no requirements.
- `bigkey:*` is unsatisfiable on purpose, and that is a known defect. The barrier tag says the crossing wants the big key without saying whose, and a wildcard big key means nothing for a per dungeon set. The 12 connections tagged `barrier:big-key` are impassable on the static graph. Unblocking them changes what the simulator can reach and belongs in its own verified change. The engine's own big key door handling is already coarse (`bigKeys.size === 0` in discovery), which shows the mismatch is an oversight.
- `affectsTraversal`: progress buffer changes (events, Agahnim, the rescue) and overworld event changes gate traversal.

### simulation/room-tags.ts

Human names for the room header TAG bytes, indexed like the game's own tag routine dispatch table (`kDungTagroutines`, 0x00-0x3F). A raw `tag 0x26` in the widget says nothing; a name says why a door is shut. Entries the dispatch table sends to an unnamed stub are left out and fall back to the hex value, so the table never claims to know more than it does. Tags 0x01-0x13 are the clear the room family the simulator gates on (`isClearRoomTag`), all named `CLEAR_ROOM_TAG_NAME`.

### simulation/detect/check-matcher

Identifies a raw flag diff as one of the known checks, using the check records' own `gameId`. This is identification only: detection already happened by byte diffing. A diff that matches no known check yields nothing, so the recorder can propose a dataset fix.

Every matcher returns the record, so the caller holds the check's id. Matching by name once let 11 dungeons that each hold a "Big Chest" collapse onto one record, and 57 checks became unreachable.

- `CHEST_OPEN_MASKS` are the `save_dung_info` bits for chest slots 0-6.
- A progress check with mask `WHOLE_BYTE_MASK` (0xff) matches any nonzero value.
- Progression events are threshold reads of the progress buffer, not bitmasks (`sram_progress_indicator` 1 is after the uncle, 2 is the completed rescue). A diff names an event only when it crosses that threshold, and the highest crossed threshold wins. Reaching 2 is the completed rescue, not the started one.

### simulation/detect/flag-snapshot

Pure byte diffing of raw SRAM snapshots. This layer never touches check data; it reports which flag bytes changed and which bits were newly set.

- `save_ow_event_info` starts at 0xF280 and the flag tables index up to screen 0x81. Screens 0x80 (the sword pedestal) and 0x81 (the waterfall ledge) alias into the adjacent SRAM word at 0xF300 and 0xF301, so `OW_EVENT_LEN` spans through 0x81.
- `diffSnapshots` emits one `FlagDiff` per changed byte or word across the three buffers.

### simulation/detect/unidentified.constants.ts

`UNIDENTIFIED` is what the log calls a flag change no check accounts for. It is only a display string; the matcher returns nothing for an unmatched diff and never this sentinel.

### simulation/presence/presence.type.ts

`PresenceGameState` is the read only snapshot of live game state that `evaluatePresence` reads to decide whether a check giving NPC is spawned. Every field comes from a raw game read; the live port fills it on each observe through `buildPresenceState`. Plain scalars and array-likes keep it cheap to build and trivial to construct in tests.

- `progressFlags` is the `sram_progress_flags` byte (0xF3C6). `progressIndicator` is `sram_progress_indicator` (0xF3C5). `progressIndicator3` is `sram_progress_indicator_3` (0xF3C9). `followerIndicator` is `follower_indicator`, the tagalong id (0 is none, 0xF3CC).
- `inventory` holds the items held, by dataset id (the tracker's inventory set).
- `owEventInfo` holds the `save_ow_event_info` bytes, indexed by overworld screen (base 0xF280). `roomState` holds the `save_dung_info` words, indexed by room id.
- `status` holds the live facts behind the status pills. It is absent on a snapshot with no live core (the simulator, the offline reader).
- `StoryStatus` matches `WasmGetStoryStatusBytes` byte for byte (`core/game-hooks/story_status.c`).
- `PresenceStateInput` is the raw input the live port hands in. `progress` is the buffer from `WasmGetProgressFlags` (byte layout documented in `checks/flags/npc.ts`); the other two buffers are the SRAM copies the simulator already snapshots for flag diffing. `statusBytes` are the `WasmGetStoryStatusBytes` bytes, when a live core is there to read them.

### simulation/presence/presence.constants.ts

- `BOSS_DEAD_BIT` is the `save_dung_info` bit marking a room's boss defeated or the room cleared.
- `PROGRESS_INDICATOR_SLOT`, `PROGRESS_FLAGS_SLOT`, `PROGRESS_INDICATOR_3_SLOT` and `FOLLOWER_INDICATOR_SLOT` are byte offsets in the `WasmGetProgressFlags` buffer. The follower indicator sits at index 13; a value of 1 means the follower is tagging along.

### simulation/presence/evaluate

Pure evaluation of a declarative `PresenceCondition` against a `PresenceGameState`. This is the simulator's one sanctioned data read: the transcribed spawn conditions live as data on the checks (`CheckRecord.presence`) and this function reads them. An absent condition means "always present". An `itemId` leaf asks the inventory directly.

### simulation/presence/state

`emptyPresenceState` is a zeroed snapshot for the idle or no map path, where nothing is discoverable.

### simulation/recording/recorder

Accumulates what a run observed in game: check positions discovered, screen transitions traversed and door gates seen. `dataset-updates` turns disagreements with the static data into suggestions.

- `ObservedCheck.checkId` is null when the diff matched no check. An unmatched observation is exactly what becomes a dataset suggestion.
- `recordCheck` dedupes by identity and location, not identity alone: every unmatched observation has a null `checkId`, so an identity only key would collapse all of them into one, and they are the ones worth reporting one by one.

### simulation/recording/dataset-updates.ts

Turns recorder output into `DatasetSuggestion[]`, the ready to write code blocks for the widget's Apply button. Suggestions arise where what the run observed disagrees with or extends the static screen, connection and check data.

- `knownConnectionSet` holds every crossing the dataset already covers, in the direction it can be walked.
- Open work: a connection suggestion's `code` still emits an informal shorthand, not a real point pair literal. A connection point now always needs a minted `toConnectionId` partner, which a suggestion cannot allocate. Once connections live in the vault as JSON, the suggestion has to become a JSON fragment for the vault in place of a TS snippet.
- `checkSuggestions` takes every observation the matcher could not account for. A null `checkId` is the unmatched case; comparing names once suppressed real suggestions when an unknown thing shared a name with another dungeon's check.

### simulation/sim-run/sim-run.type.ts

Types for the headless sim run automation (`--sim-run`): the config the CLI flag parses into, and the report the run writes for the data correction loop.

- `SimRunConfig.startSlot` is the 0-based save state slot to load before running (null is the current state). `stateName` is a named manual save to load in place of a slot. `--auto-state` cannot be combined with `--sim-run` because both hooks load the profile on mount and race, so the flag loads it itself.
- `target` stops early once that screen is reached (null runs to an outcome). `stopAtCheckId` halts right after that check triggers. `maxSteps` is a hard step cap so a stuck run always ends.
- `floodScreen` is a diagnostic: flood this overworld screen addressably, report its numbers, then exit. `probeRoom` is its indoor counterpart: report the room's entrance seeds, exit table entry and detected exits, to find out why a room reads as a dead end. `probeItems` are extra traversal tokens for the flood diagnostic (`lift.2`, `boots`), comma separated and fed straight to the flood, not item ids. `probeTile` is an optional entry tile for `probeRoom`.
- `scanSprite` reports every room whose spawn table holds that sprite type, then exits. It answers where the game puts a sprite when a dataset room index is suspect. `combatSprite` reports the sprite type's resolved combat row (health, flags4, per class damage) and the shared ancilla and tile combat tables, then exits.
- `screenWalkLimit` is the most distinct screens the game driven flood visits before ending (null is unlimited).
- `BoundaryEdge` is a dataset edge from a reached screen to a screen the run never reached.
- `SimRunReport` is written to `debug-output/sim-run.json` for the correction loop to read. `reachedTarget` is true when `target` was reached before the run ended. `reachedScreens` are the logical screens the flood reached. `verifiedChecks` are the real checks triggered and confirmed by flags, by id. `boundaryEdges` show where traversal stopped. `suggestions` are the recorder derived corrections.

### simulation/sim-run/report.ts

Builds a `SimRunReport` from a finished `EngineState` and `RecorderState`. `boundaryEdges` are the dataset edges that leave the reached set: the places to point `--dump-nav` at when hunting a missing or blocked connection. There is one per exitable point, since a two way crossing already surfaces both orientations as separate records. The report is read by a person, so edges carry tag terms, not ids.

### simulation/trigger/boss-gate

Bosses are a position plus a prerequisite gate; no combat is simulated. A boss is triggerable when its trigger tile is reachable in the flood fill result and the inventory meets the beatability requirement. `BossSite.beatableWith` defaults to the boss check's own `CheckRecord.requirements`; `bossRequirement` falls back to an always true requirement.

### simulation/trigger/trigger-plans

Maps a discovered interactable (chest, NPC sprite, standing or overworld item) to the `TriggerAction` that fires the real check. NPC sprites resolve their flag and item payload from the check records' `gameId` by sprite type.

- `npcConfigForSprite`: a config that pins a `room` matches only when the sprite's live room equals it (`CheckGameId.room`). For an overworld sprite the room is the screen index, so it says which world the sprite is in; overworld screens from `DARK_WORLD_SCREEN_BASE` (0x40) up are the second world. That is the only thing that separates two NPCs sharing a sprite type across the worlds (`CheckGameId.owWorld`).
- A room flag NPC records its completion where the chest bits live, which the npc action cannot reach, so the chest action writes exactly that bit.
- Outdoors a pickup is an overworld event bit (`OW_PICKUP_MASK`, 0x40), and the sprite's room is the screen it stands on. Item id 0 is a real item, so a sprite with no mapped item is never triggered.
- `indoorPickupSlot`: indoors the game records a pickup in the room's own state bits (`HeartUpgrade_CheckIfAlreadyObtained`, `sprite_main.c`): 0x2000 when `sprite_x_hi & 1` is set (a column in the room's right half, from column 32, since a room is 64 columns of 8 pixels), 0x4000 otherwise. Both are room state slots (5 and 6), which the chest action already writes.
- `checkForStandingItem` derives the check a standing or overworld pickup is from the same facts `planSpriteTrigger` writes, so the two cannot disagree.

### simulation/arrow.constants.ts

`RIGHT_ARROW` is the arrow the log lines, the clear room tag name and the door suggestion code print. It matches the arrow in the other `ROOM_TAG_NAMES` entries, so every tag name reads the same way.

### simulation/engine/state

Everything the run holds or has done is keyed by dataset id (`ItemId`, `CheckId`, `DungeonId`), never by display name: 11 dungeons each hold a check named "Big Chest". Place identity is the simulator's own `TraversalId`, not a `ScreenId`.

- `SimTargetRole` says whether a target is a thing the run is owed or a gate that explains why something else is blocked. It is never derived from the log noun.
- `SimTarget` is a discovered interactable paired with the trigger that fires it. `key` is the stable identity for dedupe and done tracking. `label` names it in the narrative log, `noun` is the interactable noun ("chest", the NPC kind) and `verb` the trigger verb ("Opening", "Talking to"). `tile` is the flood grid tile, when the position is known. `trap` means interacting walks into a live trap section, so the shutters slam shut behind the player first.
- `EngineState.area` is the big area the virtual player stands in (log grouping). `inventory` mirrors the game inventory, by dataset id. `reachTokens` are the item derived traversal tokens, rebuilt from the inventory on each observation. `keys` counts the small keys left per dungeon (consumable). `bigKeys` holds the big keys by dungeon. `events` holds the observed done events that `event:*` tokens gate on.
- `visited` holds the screens explored this epoch (cleared by `resetFrontier`). `everVisited` holds every screen explored in the whole run; the screen limit counts these. `discovered` is the game discovered exit graph; once any screen contributes exits, traversal runs on this graph alone. `regionReach` is the per screen union of flood reached tiles for the whole run. `regionJobs` are pending visits into unexplored regions of visited screens. `frontier` holds the screens reachable but not explored this epoch. `reachedScreens` holds every screen reachable this epoch and feeds the softlock report.
- `arrivals` holds the ways in already used, as `screenId#edgeSig` (`arrivalKey`). `crossings` holds the boundaries already crossed, by canonical identity (`crossingKey`); a crossing recognised from either side is walked once. `cameFrom` is where the last hop came from and the tile it landed on: crossing a link uses it up from both ends, and the far end can only be identified once the destination's own exits are known (`markWayBackUsed`). `pendingEdgeSig` is the edge signature the current route must arrive through, when pinned.
- `trapClosed` holds the screens whose trap shutters sit slammed shut behind the player. `done` holds target keys already triggered. `failed` holds target keys whose trigger produced no flag change this epoch; they are retried next epoch. `completedChecks` holds the verified checks by id and feeds the goal and the softlock report. `pending` holds interactables found on the current screen awaiting a trigger. `route` holds the remaining screen hops.
- `preTrigger` holds the flags captured just before the active trigger, for the verification diff. `progressSinceEpoch` says whether any check completed since the current epoch started.
- `cloneState` is a shallow structural clone, so a step never mutates its input state.

### simulation/engine/event-log

The two `SimEvent` constructors live on their own so a module that only logs (the dungeon ledger) never imports the hop and side effect modules. Those pull in the explorer, and a ledger module the explorer calls into cannot import back through that chain.

### simulation/engine/screen-label.ts

Builds a label like `screen-183 (Uncle Estate)` for the run's log. It is display only; traversal never consults the dataset. The lookup must be able to answer "nothing", because most ids reaching it are `TraversalId`s (`room:80`) that are not dataset keys, and the dataset getters answer a miss with a stand-in record. It is memoized because it runs several times per engine step and a run's id space is small. The cache holds a label, never an identity, so a replaced dataset bundle can at worst leave a stale string in a log line.

### simulation/engine/goal

Terminal condition evaluation. The `not-completable` verdict (the frontier emptied with no progress since the epoch began) is the softlock signal this tool exists to produce.

- `DEFAULT_GOAL_CHECK` is the ledger's "Ganon beaten" event, by id.
- `allChecksDone` is true only when a non empty set of checks is fully covered.
- The screen limit is a bounded testing cap: the run stops once that many distinct screens were visited over the whole run (`everVisited` survives epoch resets; `visited` does not).

### simulation/engine/softlock-report.ts

Builds the `SoftlockReport` from a finished run: the checks completed, the checks left blocked with the requirement sets on every edge into their screen, and the screens never reached. Blocked checks are matched by id; a name join once marked all 11 dungeons' "Big Chest" complete the moment any one of them was.

### simulation/engine/end-summary

What the run found versus what it resolved. `not-completable` alone is a verdict, not a report. This counts everything discovery saw and how much of it was dealt with, so a run that stops early can be told apart from one that exhausted its reach, and a blocked chest or an unentered room is visible.

- `exits.edges` counts the edges the discovered graph knows; `leadingNowhereNew` counts the screens they lead to that were never entered.
- `MAX_LISTED` (40) caps the listed screens, so a run that entered nothing does not print a novel.
- `formatEndSummary` renders one line per fact for the run log.

### simulation/engine/traversal

Screen level traversal over the static screen graph (all screens and connections from the data facade). There is no tile walking: a route is a sequence of screen ids. Connection requirements gate every edge: `ConnectionNavData.requirements` when present, else a fallback derived from `barrier:*` tags.

- A light to dark crossing is detected two ways: by the cross world and warp tags, and by comparing the endpoints' `world` fields, since some crossings carry no marker (the Superbunny Cave doors join light world East Death Mountain screens to a dark world interior). Endpoints missing from the registry count as the same world, so unknown screens never gain a false gate. The lookup uses `get`, since a getter throws on a missing end.
- A cross world portal with no explicit nav data requires the Moon Pearl. Without this the rain intro run with an empty inventory warped from lw-10 to west-dark-world and swept the whole dark world. This is a conservative placeholder until the connections dataset pass gives the real requirement set.
- `buildAdjacency` adds one edge per record: a `ConnectionRecord` is one point on one screen, and `canExit` says whether the player can leave through it. A two way crossing gets two edges because both paired records carry `canExit: true`; a drop's `canExit: false` adds none.
- `findScreenPath` is a BFS by hop count and returns the crossed edges too. `reachableFrom` returns every screen reachable under the `canPass` predicate.
- `gameNumberOf` gives the game's own number for a screen on a path, or -1 when the screen has neither index or the registry never held it. It goes through `get`, never a throwing getter. `toRoute` and `toScreenPath` adapt a path to the navigation `Route` and `ScreenPath` stubs (no tile paths).

### simulation/engine/discovered-graph

The game driven traversal graph, revealed screen by screen: each visited screen's flood contributes the exits it detected (border connections, doors, holes, stairs). There is no requirement gating, because the flood already ran with the current inventory, so every recorded edge is passable now.

- `discoveredExitFor` returns the exit record for a hop, which carries the landing tile. `wantSig` pins which exit when several lead to the same screen: a screen can be entered by more than one crossing and they need not land in the same place, so a job that exists to try one must not be satisfied by another.
- `recordExits` keeps previously known edges the new flood did not detect again (synthetic reverse edges), and mirrors every two way border crossing as a reverse edge, so a dead end room never strands the BFS.
- `owWorldOf`: overworld screen indices from 0x40 up are the second world. That is a game fact, so it holds for synthetic `ow:N` ids too. It is undefined for interiors, whose world only their palace context knows.
- A discovered edge that jumps between the worlds without a warp or mirror is always an artefact. Once rooms with no dataset entry gained real geometry they could report other world exits, so the world test sits on the edge, where it holds however the endpoint got its name.

### simulation/engine/regions

Region aware exploration memory. A room can hold several walkable regions that do not connect inside it, so the engine keeps a per screen union of every flood's reached tiles and treats an entry landing outside it as a fresh visit.

- `stampReach` marks an attempted entry point (a 5x5 patch, `ENTRY_STAMP_RADIUS` 2) as explored, so a landing whose flood cannot reach its own doorway never queues the same screen again forever.
- `regionCovered`: landing tiles sit on walls and door notches, so it scans a window (`LANDING_SCAN_WINDOW` 3) around them. A screen with no recorded reach counts as fully covered.
- `RegionJob.from` is the screen holding the exit into the unexplored region; `edgeSig` is the way in, so traversal takes that exit and not another to the same screen.
- `crossingKey` is the canonical identity of a crossing, the same from either side: the screen pair, the axis and the tile span. An arrival key cannot do this because each side derives its own `edgeSig` from its own flood. Region qualifiers (`@col,row`) are stripped from the pair, since the quadrant each side landed in says nothing about which boundary was crossed.
- `arrivalAccountedFor`: a way in is accounted for when it was used, when its boundary was crossed from the other side, or when it lands inside explored ground (several edges on one side mostly drop the player in the same place). An edge landing outside the explored region is not skipped: a ledge the lower part of a screen cannot reach is a different place behind the same screen id.
- `markWayBackUsed`: crossing a link uses it up from both ends; otherwise the way back reads as unexplored and the run goes back and forth across one doorway forever. The far end is identified on arrival: the exit leading back where the run came from, launching within `SAME_DOORWAY_RADIUS` (6) of the tile it landed on. A door's trigger tile is a few tiles off the spawn it puts the player on, and a border crossing's launch tile sits on the seam. It matches on position, not axis: two crossings can share screens and axis while landing in places that do not connect.
- `unexploredRegionJobs` lists visited screens that some discovered exit enters outside their explored region; a room with several regions still owes a visit through that doorway.
- `takeRegionJob` walks to the job's source screen and then takes its exit, since routing straight to the target screen would enter again through the explored door. It pins the way in, because arriving through the wrong exit would leave the job unsatisfied forever.

### simulation/engine/explorer

Virtual player bookkeeping: inventory to reach tokens, consumable dungeon keys, events, and the unlock reset epoch rule. Dungeon identity is a `DungeonId`.

- `keyAvailable`: a key is available while its counter is positive; `ANY_DUNGEON` asks about any dungeon.
- `spendAnyKey` spends one small key from whichever dungeon has one (coarse).
- `applyItem`: the game grants a generic small or big key with no dungeon attached, so `dungeon` (from the matched check, else where the run stands) attributes it. A key with no dungeon to credit is dropped, not guessed. It returns the requirement tokens the grant satisfies, for `reopenLedgersFor`.
- `localRefresh` follows an unlock or kill inside a room: a new epoch where only the current screen loses its visited mark. `progressSinceEpoch` stays set, so the exhaustion pass still sweeps everything once at the end.
- `globalRefresh` follows a change that alters reach in other screens (the follower tagging along opens the throne room's push wall passage, far from where she was rescued). Every screen but the current one becomes explorable again.
- `resetFrontier` starts a new epoch. Visited screens are cleared because they may expose new tiles and targets after an unlock, and failed triggers get one retry per epoch.
- `onCheckVerified`: a traversal affecting unlock runs a local refresh and advances the epoch; anything else marks the check done. Key grants with no dungeon go to the matched check's dungeon, or, for an unmatched grant like an enemy's key drop, to the dungeon the run stands in. `events` is optional only for direct call tests; the live engine always passes it, since a reopened dungeon group is only reviewable through the narrative log.

### simulation/engine/dungeon-ledger

Per dungeon group bookkeeping of what a run still owes there. `complete` is permanent: the group is fully cleared and never reopens, and it is set only when `owed` is empty. `exhausted` is provisional: nothing owed can be acted on right now, but an acquisition listed in `reopensOn` can undo it. Keeping the two states distinct is the point: a group can go between exhausted and open again, but never leaves `complete`.

- `OwedCheck.blockedBy` is what stopped the run taking it: a missing token or a gate it could not open.
- `upsertOwed` adds or refreshes an entry's blocking reason. A check already struck off (the caller's `done` filter) never enters again through it.
- `pruneDoneChecks` strikes every entry the run has since taken.

### simulation/engine/dungeon-ledger-scan.ts

Fills a dungeon group's ledger from one observed room. Every chest and key drop guard becomes an owed entry, reachable or not, and anything else the engine turned into a target (a standing item, an NPC check) is recorded the first time it is seen. Gates (doors, cracked walls, switches) are never owed; they only explain why something else is blocked. Which of the two a target is comes from `SimTarget.role`, never from its log noun.

- `targets` is the same list `discoverTargets` produced this step, so what counts as reachable here never disagrees with what the engine is about to trigger.
- A chest's `opened` bit is the live ground truth, independent of `done`, so the chest is struck even when this run did not open it (a pre-opened save).
- `hasUnblastedWall` looks for any bombable attribute tile still standing, ignoring reach: a wall the flood treats as impassable never shows up as a target without bombs.
- `guessBlocker` gives a best effort reason from the same gates discovery checks for doors, walls and kills. Outside a dungeon there is no key bucket to be short of, so a locked door there explains nothing.

### simulation/engine/dungeon-ledger-lifecycle

Closes a dungeon group once nothing in it can be acted on, and reopens an exhausted one when the run acquires something on its `reopensOn` list. This is the only path back into a group: it hooks the frontier reset on item gain (`onCheckVerified`) and adds no second reset mechanism.

- `closeIdleDungeonGroups` settles every ledger the run has nothing left to do in: `complete` when nothing is owed, `exhausted` with reopen requirements otherwise. A group stays live while any part of it is reachable or workable this epoch.
- `reopenLedgersFor` reopens every exhausted group whose `reopensOn` includes a token just gained. Marking the group's own screens unvisited is enough, because the discovered graph already has their edges.
- `inCompletedGroup`: a group settled as complete owes nothing, so the engine keeps its screens out of the frontier for the rest of the run. Without this the run kept walking back through dungeons it had already finished.

### simulation/engine/discover-reach

Neighbour reach against the detect flood's `reached` grid, shared by every interactable whose own tile is solid (a sprite, a door record inside a wall, a cracked wall marker). What matters is whether the player can stand on a tile beside it. A `Reached` of undefined means no grid, so the gate is skipped.

- `SPRITE_TALK_RADIUS` (2): a sprite's own tiles are often solid (a blocking NPC like the uncle stamps a 3x3 footprint into the grid, so the spawn tile never floods). Any reached tile within two tiles counts as able to talk to it.
- `DOOR_REACH_RADIUS` (10): door records sit several tiles inside walls; internal quadrant doors run up to about 10 tiles from the nearest floor.

### simulation/engine/discover-bombs

Cracked walls the run can blow open now. The flood models one as an obstacle needing bombs, which only lets the player stand on it while the passage beyond stays shut. So a reachable wall is offered as a target: blast it, mark it floor, and flood again. There is one target per contiguous patch (`BLAST_PATCH_RADIUS` 4), since one blast opens the lot.

- `BOMBABLE_ATTR_MIN` to `BOMBABLE_ATTR_MAX` (0xf0-0xff) are the cracked wall attributes (`TileBehavior_FlaggableDoor`), solid until blasted.
- `attrGridsOf`: a split level room keeps its floor on the layer grids, and the dual layer flood reads those, so scans read every grid. A scan of the raw grid alone missed every cracked wall in such a room.

### simulation/engine/discover-switches

Pull switches (`Sprite_PullSwitch_bounce`, sprite types 0x04-0x07) and the one remote effect a switch can have.

- Pulling a switch sets `dung_flag_statechange_waterpuzzle`, which the room's tag routine reads to raise its trapdoors. That is what opens the shutter behind the sanctuary onto the sanctuary. It only matters in a room that still has a shutter shut.
- `DRAIN_SWITCHES` lists switches whose effect reaches past their room: the tag routine writes an overworld event bit on a remote screen (`save_ow_event_info[screen] |= mask`), lowering water there. The same bit gates the one standing item whose spawn code stays inactive until it is set. The switch offer and the item's presence read this one table so they cannot drift apart.
- `standingItemPresent`: the one item the game holds back this way is a heart piece type sprite on the drain gated screen, which checks `save_ow_event_info[screen] & mask` and stays dormant otherwise. Every other standing item fails open.

### simulation/engine/discover

Turns interactables found in game on reachable tiles into triggerable targets. Reach comes from the observation's `reached` grid, the same flood exit detection ran (entrances, blockers, correct start layer). Flooding again here with a weaker option set once put split level rooms on the wrong layer. With no grid, everything counts as reachable.

- `CHEST_OPEN_ROW_OFFSET` (2): a chest is a 2x2 (16 pixel) block anchored at its top left 8 pixel tile. The open routine only fires facing up from the first walkable row under the footprint, two rows below the anchor. The chest spans `col` and `col + 1` and the 16 pixel wide player can stand below either, so either open tile counts. A chest is never stood on; one with an unknown position or outside the 64x64 flood grid keeps the coarse fallback.
- An interactable with an unknown position (a remote room) falls back to coarse screen level reach. A known position is always local to the observed screen; overworld sprites are resolved to their true screen and local tile first (`getOverworldSprites`).
- A sprite is a target only when it maps to a check giving NPC and that NPC's presence condition holds. The game gates NPC spawns in hard coded C prep functions, so the conditions are transcribed as data. Sprites with no check and a missing `presenceState` both fail open.
- `isClearRoomTag` picks the room header tags of the kill or clear to open door family. Sequence triggered shutters (the sanctuary's escape door) share the door kind but not the tag. The game only calls `Sprite_CheckIfRoomIsClear` in a room whose tag gates on it, so the threat sweep only runs there. `EMPTY_THREAT` is the verdict for a room with nothing to clear, without running the sweep.
- The run's overworld screen comes from its virtual position (`ow:N`); the game's physical position stays wherever the save started.
- A killable enemy is alive until its own kill target ran (a key carrier) or until the room's clear trigger ran (a gating sprite).
- With shutters open and killables still alive, walking deeper slams the doors shut behind the player (the game's trap door rule), so every target found in that window carries the trap marker.
- Bombs are checked by the `bombs` traversal token, not a name substring ("Bomb" also matches the medallion). Bombs are permanent once obtained, so any cracked wall is openable from then on. The sword is checked by the sword ladder item ids; "Fighter Sword & Shield" is a record of its own.
- Door targets: any held small or big key qualifies, because key bookkeeping is coarse.
- A big overworld area's spawn table lists every screen's sprites at once, resolved to the screen each sits on. A sprite on a neighbouring screen has no flood here; it becomes a target when that screen is observed.
- `FOLLOWER_SPRITE` (0x76) and `FOLLOWER_STEPS` are the follower's two scripted interactions. They are transcribed like the presence conditions, because the states live in hard coded C handlers no raw read recovers. Touching her in the cell (room 0x80) starts the tagalong, which opens the throne room passage. Reaching the sanctuary (room 0x12) with her runs the priest scene that completes the rescue. She is in tow when the follower indicator is `FOLLOWER_IN_TOW` (1).
- `EVENT_STEPS` are milestones reached by working a sprite, which nothing in the save records unless the run does it. The shelf (sprite 0xee, room 0x51) needs the follower in tow, as the mantle's handler does (`follower_indicator != 1` returns early). The sage (sprite 0x16, room 0x105) needs nothing: his idle handler routes a player with no pendant into the errand. Event steps are checked before the presence gate, which asks whether the sprite's check is on offer (for the sage, the pendant gated boots) while his errand is available all along. Their reach uses the door radius: they are furniture worked from a distance, and the mantle's tile sits inside the shelf.
- A pull switch is offered while the room is tagged and still has a shutter shut, or while its drain target bit is unset; throwing a drain switch twice wastes a step.
- A key carrier enemy drops its key or big key when defeated (the die action marker in the room's sprite data); the generic key receive ids (0x24, 0x32) are its kill item. It needs a sword. The last living killable's death satisfies the room's kill tag, so its kill reopens every shutter, including the ones that slammed behind the player.
- The clear room target opens kill gated shutters once every gating sprite is confirmed killable (`RoomThreat.clearable`). It anchors on a gating sprite that carries no key where possible, since carriers have their own drop target.

### simulation/engine/engine.constants.ts

- `ROOM_CLEAR_KILL_ITEM` (0xff) is the kill action's item id for a room clear that drops nothing.
- `SCREEN_CENTER` is where the virtual player lands when a crossing names no entry tile.
- `TRAP_ENTRY_RADIUS` (8 tiles, Chebyshev) is how close a shutter must sit to the landing tile to count as the door just walked through.

### simulation/engine/enemy-reach

Decides which sprites gating the current room's clear can be killed with the inventory on hand. A sprite gates the clear unless its flags4 carries the room clear exempt bit 0x40 (`Sprite_CheckIfRoomIsClear`, `sprite.c`). Damage class 0 is a real class resolved through `damageByClass` like any other: a weapon whose class reads 0 is not automatically harmless, and one whose class is nonzero is not automatically lethal. Both are runtime lookups.

- `isGating`: an unknown flags4 (no combat row for the sprite type) gates, since a room cannot be called clear on the strength of a sprite nothing is known about.
- `evaluateRoomThreat`: a missing `combat`, or one with null tables, means combat reasoning is unavailable (the developer tools combat gate is off), and every gating sprite reads as not killable.
- `inSameSection`: the game's clear test walks its sixteen live sprite slots, while the simulator holds the room's whole static spawn list, and one room can cover several scrolling sections, each with its own shutters and guard. The castle's boomerang room is two: entering the first slams its shutters until its guard dies, then the section to its east does the same. Judging both at once makes each look unclearable, so sprites are counted per section. Inside a section every gating sprite must be killable. A missing split, or a split on neither axis, means one section where everyone gates. `SECTION_SPLIT_LINE` is 32 because every indoor room screen is 32x32 tiles and the game never divides one anywhere else.

### simulation/engine/enemy-reach-geometry

Tile geometry for enemy reach: whether the player's 2x2 footprint fits at a tile, and whether a ranged weapon has a clear orthogonal line from a candidate tile to a target. Diagonal firing lines are not modelled for any weapon, including the boomerang's longer diagonal range.

- `MAX_SEARCH_STEPS` (64) bounds a firing line search; the flood grid is 64x64.
- `findLineOfFirePosition` finds a standable tile along an orthogonal ray from the target, within the weapon's travel, with every tile in between passable for a projectile. A tile blocks when any layer's attribute maps to `PROJECTILE_BLOCKED` (1) in the collision table; a split level room keeps floor on the per layer grids. With no attribute grid the line cannot be verified, so there is no position.

### simulation/engine/enemy-reach-weapons

The weapons an inventory can bring to bear against a sprite: each one's ancilla type (null for the sword, which is not an ancilla), its resolved damage class and its reach. Thrown bombs are not modelled because their parabolic travel distance was not pinned down; only the placed (contact) bomb is. Every match is on an `ItemId`; the tracker's sword ladder adds every rung below the one held, so the bare tier 1 sword is always in the set.

- `CONTACT_RADIUS` (2 tiles) is the reach of the sword and the placed bomb.
- `SWORD_BASE_DAMAGE_CLASS` holds the `kSprite_Func14_Damage` base entries (`sprite.c`), indexed by sword tier minus 1. Swing timing adjustments on top are not modelled.
- `SWORD_TIER_IDS` come from the dataset's own Swords group, already ordered weakest first.
- `SWORD_BEAM_ANCILLA` (0x0c) needs a sword above tier 1. Its near full health firing condition is not modelled, so the beam is offered whenever the sword requirement is met.
- `BOMB_ITEM_ID` (the bomb pickup) stands in for carrying bombs, since no record expresses bomb capacity. `PLACED_BOMB_ANCILLA` is 0x07.
- `ANCILLA_WEAPONS` lists ancilla weapons by the item that unlocks them. The ancilla type and travel distance come from that item's own `weapon` profile; only the short log label is stated here.
- `damageByClass` is indexed by damage class, not ancilla type; the ancilla to damage class step is the first half of the game's two step lookup.

### simulation/engine/hop

- `foundMessage` reads "Found chest at 12,20" when the tile is known, else it names the room.
- `landingTile`: a discovered exit lands on its entry tile, a static edge on its entry point, else the screen centre. A connection point is one sided: `edge.connection` is the point being left, so its partner's `nav.fromPoint` is the point arrived at.
- `arrivalLabel` says in words how the player got in, from the crossing's `edgeSig`. A screen id alone cannot say which way in was used, and two ways in need not lead to the same ground. Border signatures carry the tile span because one side of a screen can hold more than one crossing.
- `emitHop` narrates one screen hop and updates `s.virtual` and `s.area`. It records which way in was used (`arrivals`), so the same screen entered another way still counts as unexplored. It records the boundary too (`crossings`): the same tiles seen from the far side resolve to the same key, so a doorway is never walked twice. The way back is used up once the destination's own exits name it (`markWayBackUsed`).
- `spendKeysForEdge`: a wildcard token names no dungeon, so there is no bucket to spend from. That is a real leak (the static graph lets a run walk a `barrier:small-key` edge for free), kept because spending would change what the simulator can reach. It is the same family as the unsatisfiable `bigkey:*`; both want the connections dataset to name the dungeon.

### simulation/engine/side-effects

Side effect cycles that settle a trigger without naming a check, each ending with `settleTrigger`.

- `emitDoorUnlock`: a door unlock is state progress, not a check. Spend the key, log it, and flood the room again through the opened door (`refloodHere`).
- `emitSwitchPulled`: a local switch raised the room's trapdoors, so the room floods again. A drain switch lowered water on a remote screen, so every screen but this one is invalidated, since a screen already passed through may now offer new ground.
- `emitWallBombed`: unlike every other trigger, a blast writes no game state (the opened tiles live in the flood facade), so it produces no flag diff and never reaches the diff check, which would mark it failed.
- `emitShutterClear`: the room clear kill was verified and the shutters are open.
- `emitFollower`: the follower now tags along. It unlocks the throne room's passage, a remote screen, so the whole graph reopens.
- `emitEntryTrapSlam`: arriving beside a closed shutter in a kill tag room means it slammed shut behind the player. The flood's zero edges line is the hard evidence; this only narrates it.
- `interceptTrap`: interacting inside a trap section that is still hostile slams every open shutter first. The virtual tile moves to the target, the real target is queued again, and the slam runs as its own trigger and verify cycle. It returns true when it used up the step.
- `emitTrapClosed`: the slam was verified (the door open bits dropped).

### simulation/engine/verify-step.ts

The verifying phase: diff the flag snapshots around the trigger, name the check, fold in the item, and route the side effect cycles for door unlocks, shutter clears and trap slams, each of which floods the room again in place.

- A blast changes no game state, so it can never show a diff. It is settled first, or the no diff branch would mark the wall failed for good.
- No flag change means nothing observable: the target is marked failed so this epoch skips it.
- Names are resolved here, for a person reading the log, and stored nowhere.
- A drop kill that satisfied the room's kill tag (the last living killable) reopens the trap shutters the game closed behind the player.
- A traversal affecting unlock seeds the frontier again. When the check is the stop target, the run goes straight to planning, because it must end on the verification with no reset, flood or discovery after it.

### simulation/engine/engine.ts

The pure step state machine: observing, planning, traversing, triggering, verifying, then observing again. Steps never mutate their input. Once observations carry flood detected exits, traversal runs on that discovered graph alone.

- `observe` adopts the runner's real tile only when it is on the virtual screen. The detect flood (`obs.reached`) is the only flood. When exits are observed the frontier comes from the discovered graph, and the doorway just walked through is spent from this side too. Visited rooms entered outside their explored region (a hall behind another door) still owe a visit.
- `plan`: when everything is exhausted but progress happened this epoch, the run makes one more pass; `resetFrontier` keeps that from looping.
- `traverse`: in discovered mode a hop must be a flood detected exit. Passing through explored ground is one backtrack line with no new observation (an unlock clears `visited`; a landing outside the explored region is a fresh visit). Otherwise the destination is observed so its targets get triggered.
- `trigger`: a target marked as a trap slams the shutters shut behind the player first, as its own trigger and verify cycle; the real target runs right after.
