<!-- @layer docs @kind doc -->
# Code notes: packages/languages

Facts about `packages/languages` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/languages/src/assets/read-language-sets.ts

- Reads the edited set files, so a translator's saved changes are what lands in the blob. A folder missing the set payload or its font pair is skipped as incomplete.
- Compiling the sets is the caller's job (`compileSets`), because that runs off this thread in the renderer.

## packages/languages/src/data/pause-names/default-names.ts

- The seed name table for the pause menu: the English strings, keyed to item records so a language
  set can retitle them. Item keys are `<item record id>-<tier>`, tier counting from 1 (the base
  pickup). Multi word names are one space joined string; line breaks are decided at render time.

## packages/languages/src/messages/blocks/flatten-blocks.ts

The exact inverse of `splitBlocks`. Every line comes back in its original order and as the same
value, so `joinLines(flattenBlocks(splitBlocks(lines)))` equals `joinLines(lines)` and an entry
that was only grouped still serialises byte for byte. Nothing about a block survives the trip:
`ends` restates the wait its last line carries, and `inherited` is a derived view of the screen.

## packages/languages/src/messages/blocks/inherited-rows.ts

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
conventions are described under `packages/languages/src/messages/layout/box-pen`.

The walk replays each block's own tokens (`joinLines`) through the shared pen, so there is one
layout engine and the row a line lands on is the engine's answer, not the editor's. The two
differ in one authored case: a line with no code of its own after a wait is numbered row 1 by box
convention, while the engine leaves the pen wherever the previous block left it. The rows here
follow the engine. The inherited rows are read before the block draws anything, and the first
block inherits a cleared buffer.

## packages/languages/src/messages/blocks/split-blocks.ts

The cut, and nothing else. A line already knows whether a wait for button follows it
(`endsBox`), so the boundary is read off the lines and not derived again from tokens: one walk
decides where boxes end, and this step only reads its verdict. Lines are carried through
untouched, which lets `flattenBlocks` be an exact inverse and keeps an unedited entry serialising
byte for byte.

Content left after the last wait becomes a final block ending in `message-end`. The player sees
it and the message then closes on its own. No block is ever empty: every line belongs to exactly
one, and a stretch between two waits with nothing in it is a single line with no content.

## packages/languages/src/messages/blocks/types/

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

## packages/languages/src/messages/choices/choice-shape-of.ts

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

## packages/languages/src/messages/choices/tokens-from-choice.ts

The exact inverse of `choiceShapeOf`. The question slice goes out verbatim, each option adds its
own advance code and then its content untouched, and the prompt code closes the stream, so
taking an entry apart and rebuilding it gives a byte identical serialization. Nothing is
corrected: an option whose advance disagrees with its position goes back out as it came in.

## packages/languages/src/messages/choices/types/

The decomposed view of a choice prompt: an entry whose final control code turns its last lines
into a selection menu. `question` is a verbatim slice of the original stream, advance codes and
waits included. Each option keeps the advance code that put its line on a row, exactly as
authored, so the inverse can rebuild the entry byte for byte. Nothing is normalised or invented.

- `ChoiceCode`: `Choose3` takes three options, the other codes take two.
- `ChoiceOption.tokens` holds content tokens only: no advance code and no prompt code.
- `ChoiceShape.options` are the trailing lines the cursor moves between, in stream order.
- `LineSpan` locates one line by token index, the same split as `packages/languages/src/messages/lines/split-lines.ts`. `start` is
  the line's first token (its advance code when it has one), `contentStart` the first content
  token, `end` one past the last content token, and `endsBox` says a wait for button closed it.

## packages/languages/src/messages/choices/with-added-option.ts

The prompt code fixes the option count, so growing the list changes the code. A two option shape
grows only into `Choose3`. Anything past three options has no code, so the grower answers null
and never produces a stream the engine cannot run. A new option follows the pattern of the line
above it, taking the next row number down or another scroll, and starts with the spaces
(`CURSOR_COLUMN_SPACES`) that keep its text out of the selection cursor column.

## packages/languages/src/messages/choices/with-removed-option.ts

A three option shape shrinks into `Choose2` when its first option sits on row 1 (the layout that
code is used with in authored data), or into `Choose` otherwise. Removal renumbers only trailing
row markers so the survivors stay consecutive; scroll advances are left alone.

## packages/languages/src/messages/codes/code-catalog-entries.constants.ts

One entry per control code the game's languages can emit, checked against the decompiled engine.
It covers every name in every language's `commandNames`
(`packages/asset-extraction/src/text/data/language-data`). `EndMessage` (EU only) has no documented
behaviour of its own: it is absent from `kCmdInfo` in `packages/asset-extraction/src/text/dialogue-encoder`, which fits it being
an automatic message terminator and not something a translator places by hand. It is catalogued
as `structural` on that basis, not from a confirmed engine fact.

## packages/languages/src/messages/codes/code-catalog.type.ts

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

## packages/languages/src/messages/codes/encodable-params.ts

Two notions of range are involved. `CodeInfo.param` is a fixed display hint that does not depend
on the language. `encodableParams` computes what a specific language can bake, straight from the
encoders in `packages/asset-extraction/src/text/dialogue-encoder`.

- The `org` encoder (`orgEncoder`) writes any parameter byte verbatim once the command occupies a
  two byte slot in the language's own `commandNames` and `commandLengths`. There is no narrower
  validation, so the whole byte range is accepted.
- The `new` encoder (`newEncoder`) never reads the language config. It looks the name up in the
  global `kCmdInfo` table, whose parameter map can map a value to null: present but not
  encodable, like `Window` 0 or `ScrollSpd` 0. Those are filtered out.

## packages/languages/src/messages/codes/glyph.ts

Tells a bracketed picture glyph (a button icon, an arrow, `...`) apart from a real control code.
Both are spelled the same, as a bare `[Name]` bracket run, and `parseTokens` classifies both as
`cmd` tokens without a parameter so they round trip. This is the follow up at the presentation
layer: look the bracket's name up in the language's own `alphabet`, where every glyph is listed
with its brackets intact (`'[A]'`).

## packages/languages/src/messages/codes/structural-entries.constants.ts

Dialogue entries a translator must never edit, keyed by `DialogueEntry.id` (1-based, the game's
own positional index). Ids 2 and 3, 7 to 9, 10 and 11, and 12 and 13 are the two and three option
choice cursor frames: each holds only control codes, spaces and a `>` cursor, and every choice
prompt in the game reuses them. Id 5 is `EXTRA_STRING`, the synthetic control string the
extraction pipeline injects at index 4 to pad a 396 string ROM dump up to the canonical 397
(`packages/asset-extraction/src/text/build-language-entry`). It never existed as translatable prose.

## packages/languages/src/messages/compile/compile-set.ts

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
  back to projecting the glossary and name table pair and still compiles.

## packages/languages/src/messages/compile/compile-sets.ts

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

## packages/languages/src/messages/glossary/resolve-refs.ts

Replaces every `ref` token with its glossary term's value and merges the adjacent text tokens
that result. It throws when a ref points at a missing key. Text tokens are always copied, so a
later merge never appends into a token object the caller owns. Other token kinds pass through
unchanged.

## packages/languages/src/messages/layout/box-pen/

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
  Anything showing what is on screen (`packages/languages/src/messages/blocks/inherited-rows.ts`) must use this mode; anything
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
  `packages/languages/src/messages/codes/glyph.ts` answers the same question given a `LanguageConfig`; measurement holds only the
  metrics and needs the index, so it goes through the matcher.
- `applyToken` needs refs already resolved.

## packages/languages/src/messages/layout/glyph-metrics/

The measurement primitives every layout step builds on: a language's per glyph advance table, the
greedy matcher that turns authored text into glyph indices, and the advance lookup.

Matching is greedy longest match over the alphabet, because that is what the encoder does
(`encodeGreedyFromDict` in `packages/asset-extraction/src/text/dialogue-encoder` checks the whole
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

## packages/languages/src/messages/layout/layout-plan/layout-plan.ts

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

## packages/languages/src/messages/layout/measure-line/

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

## packages/languages/src/messages/layout/split-screens.ts

Cuts a token stream into the boxes a player pages through. A screen ends at a wait for button and
nowhere else. A scroll is not a cut: it shifts the box up a line and parks the pen on the last
row, so the text on either side shares one box. The engine clears nothing at a wait, so the walk
carries straight on across the cut. That is why each screen reports the rows visible while it
waits, leftovers from earlier screens included.

Trailing content after the last wait becomes a final screen with `waitsForButton: false`, and so
does a stream that never waits. A stream ending on its wait adds no such screen, because nothing
was drawn after it. For an overflow audit use `measureRows`: it reports every run the pen closed,
including ones a later run overwrote, while the rows here are the surviving visible state.

## packages/languages/src/messages/layout/types/

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

## packages/languages/src/messages/lines/advance-codes/

The three codes that shape a line (row marker, scroll and wait), read in one direction and
written back in the other. Split and join share this module so they cannot drift: whatever is
recognised as an advance here is exactly what gets written back, which is what makes an
untouched entry round trip.

A code only counts when it carries no parameter, matching `applyCmd` in `packages/languages/src/messages/layout/box-pen`: the
engine's scroll and wait take no argument, so a lookalike with a parameter is an unrelated command
and stays ordinary content. `advanceOfToken` answers `undefined` for ordinary content, which is
different from a null advance (a real answer: a line with no code of its own).

## packages/languages/src/messages/lines/advance-for-new-line.ts

The code for a line being created. Nothing else here derives an advance: `splitLines` keeps what
it read and `joinLines` writes it back, so the only place a code is invented is the moment an
author asks for a new line, and the caller says when that is. The box fills from the top: row 1,
then row 2, then row 3, and once the bottom row is taken the box has to scroll to make room. A
line added after a wait that ends a box starts the next box, so it opens at row 1 again.

## packages/languages/src/messages/lines/join-lines.ts

The exact inverse of `splitLines`. Each line contributes its own advance code, its content, then
a wait when it ends a box, and nothing else. No code is invented for a line whose `advance` is
null, and none is corrected on a line whose advance disagrees with its row. An entry that was only
read comes back out identical, so opening it in the editor cannot rewrite a translator's data. A
line that should get a derived code has to be handed one first, through `advanceForNewLine`; only
the caller knows a line is new.

## packages/languages/src/messages/lines/line-metrics.ts

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

## packages/languages/src/messages/lines/split-lines.ts

Cuts a token stream into the lines an author edits. A line is closed by whatever comes next: the
following advance code, a wait for button, or the end of the entry. So a code is always the first
thing in a line and a wait is always the last, and neither needs to sit inline in the editor as a
labelled chip.

Nothing is normalised. An advance is stored as it was read, so a row marker that disagrees with
where the line sits stays that way, and `joinLines` puts it back untouched. Making up a code for a
new line is a separate decision (`advanceForNewLine`).

Numbering follows the pen in `packages/languages/src/messages/layout/box-pen`:

- A row marker parks the pen at that row, so the line's row is the marker's.
- A scroll parks the pen on the bottom row, so a scrolled line is row 3 whatever came before it,
  including the odd case of a scroll while the pen was still on row 1, where the box shifts the
  earlier rows off the top.
- A wait starts the next box, and a box begins at row 1. The pen itself does not move on a wait,
  so a line with no code of its own is reported at row 1 by box convention. Authored data reaches
  the next box through a row marker, which decides the row by itself anyway.

A line is opened lazily: it only exists once something lands on it, so a wait followed by a row
marker gives one line and not an empty one first.

## packages/languages/src/messages/lines/types/

The line view of one dialogue entry: the editor's model, not a second layout engine. The engine
writes into a three row box and never wraps, so authored text is a stack of lines. Each one begins
with the code that put the pen there (a row marker or a scroll) and ends where the next such code
appears or at a wait for button, which a reader sees as the end of a box. Modelling that directly
gives an editor numbering and a width budget per line, the way a code editor gutters its lines.

These views are derived and read only. Every measurement comes from the shared layout walk
(`packages/languages/src/messages/layout/box-pen`), and `advance` holds the code as it was authored so the inverse can put it back
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

## packages/languages/src/messages/pack-set/empty-name-table.ts

A name table with no item or bottle names yet and English placeholder pause labels
(`dungeon-item` becomes `DUNGEON ITEM`). A later migration phase seeds real names from the game's
data zone; this never hardcodes them.

## packages/languages/src/messages/pack-set/set-from-pack.ts

Converts an extracted `LanguagePack` (`packages/asset-extraction/src/sets-types/language.type.ts`) into an editable `LanguageSet`: the
one time conversion a translation studio session runs when it opens a language that was only
ever extracted. It is pure, with no file I/O and no ROM access; the storage layer reads the pack
in and writes the set out. The pack's language code becomes both `id` and `base`, so the set
inherits its own alphabet, encoder and font unchanged until a translator forks it. `name` stays
the bare code, because the display name lookup lives in the renderer and not in shared code.

## packages/languages/src/messages/structure/apply-enter.ts

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

## packages/languages/src/messages/structure/break-line.ts

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

## packages/languages/src/messages/structure/continue-by-scrolling.ts

Keep going: the box gains one more line, reached by a scroll. That is the only choice, because a
scroll is the only way the engine makes room. The pixel buffer is cleared once per message and the
blitter draws by inverting the tiles under it, so a row written a second time inverts what is
already there and leaves the tail of the older, longer row standing. There is no fresh box to
offer, and offering one would produce corruption. The new line takes over the box's wait, so the
box still ends the way it ended: a box that waited still waits, and one that ran to the end of the
message still does.

## packages/languages/src/messages/structure/end-block-at.ts

End here: the wait goes after the caret's line. It lands at the end of that line and not at the
caret, because a box ends where a row ends; a wait dropped mid row would hold the screen with half
a sentence on it. Nothing is added or removed: the same lines come back, cut into two boxes, so
the text is untouched and only the button press is new. When the caret is already on the box's
last line, the wait this would insert is the one already there.

## packages/languages/src/messages/structure/locate.ts

Which box the caret is in, and how much room that box has left. The caret is addressed by line
across the whole entry, because that is what an editor's gutter counts and what
`DialogueLineView.index` means. Every edit needs the same three things from it: the box, where the
box starts, and how many lines it holds. The walk is done once, here, and a caret out of range
gets null and not a clamped guess.

## packages/languages/src/messages/structure/modes.ts

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

## packages/languages/src/messages/structure/next-advance.ts

The code a line gets when its position is derived, asked of the one sanctioned place that invents
codes. `advanceForNewLine` answers the per box question: row 1, then 2, then 3, and a scroll once
the bottom row is taken, restarting at row 1 after a wait. Continuous mode wants the same walk
without the restart, because the box is never cleared: the pen is still on the bottom row when the
next box opens, so a scroll is what moves the text up, and a return to row 1 would paint over a
row that still stands. That one difference is expressed by handing `advanceForNewLine` a previous
line with its wait hidden, so there is still one place where a code is invented.

## packages/languages/src/messages/structure/push-down.ts

The push: every line from an edit onward gets the code the engine needs to put it where it now
sits, and every other line stays as authored. A seed marks a line the author changed or a line
just created. From a seed the walk keeps deriving codes forward; inserting a line does
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

## packages/languages/src/messages/structure/rebuild.ts

Back to a fully derived document, through the canonical split. Every edit here works on a plain
list of lines and only sets the three authored fields: `advance`, `tokens` and `endsBox`.
Everything else a view carries is derived (index, box, row, widths). The edited list is written
back out as tokens and read again by the one walk that owns that numbering, so an edit cannot
invent a row number the layout engine disagrees with.

The round trip is exact for anything these edits produce: `joinLines` writes a line's own code,
its content, then its wait, and `splitLines` cuts on exactly those. The one shape it cannot carry
is a line with no code, no content and no wait, which has nothing to write and so nothing to read
back. That is why an edit that empties a line gives it a derived code first.

## packages/languages/src/messages/structure/reflow.ts

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

## packages/languages/src/messages/structure/row-of-advance.ts

Where the pen lands once an advance applies, by the same rule `splitLines` numbers its lines with:
a marker names its row, a scroll parks on the bottom row, and no code means the box's first row.

## packages/languages/src/messages/structure/types/

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

## packages/languages/src/messages/text/catalog/from-decoded.ts

Turns the decoder's output into catalog slots; this is how the menu and credits groups get their
contents. The decoded lines arrive as a parameter, not an import: the decoder lives in the asset
extraction pipeline, which reads a user ROM and has no business being pulled in by a model on
this side of the app. Key and limit pass through untouched, since the decoder alone knows what
the surface measured. Keys read like paths, so the last segment names the line.

## packages/languages/src/messages/text/catalog/pause-names.ts

Slots for the pause menu surfaces: the inventory item names, the bottle contents, the six panel
headings and the six ability words, 42 slots in all (23 item names, 7 bottle contents, 6 panel
headings, 6 ability words).

The first three come straight from the shipped name table, so the keys here are that table's
keys: `<record-id>-<tier>` for an item (the tier is always the last segment), the raw bottle
content value, the panel key. An override folds back onto it without a translation step. The
ability words have no data home yet (they are still an array in the drawing component), so they
are restated here: `ABILITY_WORDS` copies the hardcoded `abilityGrid` array in
`apps/desktop/src/compounds/PauseAbilitiesPanel/PauseAbilitiesPanel.tsx`, because
nothing under `packages/` may reach into `apps/`.

Every one of these surfaces draws from a fixed A to Z ramp, not the set's glyph sheet, hence
`latin-caps` throughout. The limits are proven from the drawing tables in the core: 8 glyphs over
2 lines per item, 5 glyphs over 2 lines in the ability box, and one row of the panel's inner width
(8 glyphs) for a heading. `LEVELLED_ABILITY` is the one ability the drawing code suffixes at run
time with its level.

## packages/languages/src/messages/text/catalog/world-names.ts

Slots for every named thing in the record dataset: places, rooms, pickups, chests and the
structures that hold them. They are read through the dataset facade the caller hands in, the only
door into the records, so this list follows whatever the registry holds. When the dataset is
absent the registry holds nothing, every lookup returns an empty list, and this builder yields
`[]`. That is a supported state, not an error. These names are drawn with the set's own glyph
sheet and laid out by the dialogue system, not a fixed cell surface, so they carry no length cap
of their own.

## packages/languages/src/messages/text/group-index.ts

Assembles the four groups the editor renders, in render order. This is the whole catalog, rebuilt
from the shipped data on every call and never stored. Two groups come from data this module can
reach itself. The other two are decoded from the loaded pack by the caller and handed in, because
nothing here may reach into the extraction pipeline. The record source is handed in for the same
reason in reverse. `decodedNote` is said once for each decoded group when the words came from
another region's file.

## packages/languages/src/messages/text/types/

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

## packages/languages/src/messages/tokens/parse-tokens.ts

Bracket string to token stream: the import half of the adapter between the stored dialogue dump
format (written by `formatDialogueText` in `packages/asset-extraction/src/text/dialogue-decoder`) and
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

## packages/languages/src/messages/tokens/serialize-tokens.ts

Token stream to bracket string: the export half of the adapter and the exact inverse of
`parseTokens` for every string the dialogue decoder can write. The output feeds the existing
compression path, so it must match `formatDialogueText` byte for byte: a parameter is written in
decimal and padded to at least two digits (`0` to `00`, `15` stays `15`, `255` stays `255`). A
`ref` token cannot be serialized: `resolveRefs` expands glossary references first, and reaching
one here means that step was skipped.

## packages/languages/src/messages/validate/validate-entry.ts

Predicts, without baking, whether an entry's tokens will encode without error: every `text`
token's characters must resolve against the language's alphabet, and every `ref` token's key must
resolve against the glossary. `cmd`, `break` and `var` tokens are taken as well formed by the
editor and are not checked. An `EntryIssue` is shown live in the translation editor before a bake
would fail.

The text walk matches the encoder's greedy matcher (`encodeGreedyFromDict` in
`packages/asset-extraction/src/text/dialogue-encoder`, alphabet branch): a bracketed run is matched whole against the alphabet,
and everything else one character at a time. Dictionary matching is not simulated, because every
dictionary entry is made of alphabet characters (`encodeDictionary` enforces this), so skipping it
never turns a success at bake time into a reported failure.

## packages/languages/src/messages/variables/builtin/

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

## packages/languages/src/messages/variables/find-hardcoded.ts

Where a set spells a name out instead of referencing it. A variable only earns its keep once the
lines that say it point at it: a reference follows a later rename, literal text does not. This is
the pure half of that job. It reports every run that could become a reference and says which
variable it should be, and changes nothing; applying a report is a separate, deliberate step.

Only `text` runs are searched, so a phrase broken by a control code, a line break or an existing
reference is not a match, the same rule the editor's term linking has always followed. Case policy
and its near miss reporting live in `./scan-run.ts`. The widest match wins inside one run: once a span
is claimed, a shorter overlapping phrase is not reported, so a line is never offered two readings
of the same characters. Results come in reading order.

## packages/languages/src/messages/variables/hardcoded-candidates.ts

The search list behind the hardcoded noun scan: every spelling worth looking for, paired with the
variable a line saying it should reference. The needles are the set's own variables, and only
those: a term or menu name the translator defined is the answer whenever its text turns up in a
line. Their values came out of the player's own file, the only place the game's own spellings may
live; this repository ships none of them.

Longest phrase first, one candidate per spelling. That order lets the scan claim the widest match:
a line naming a castle should offer the castle, not the wider region whose name is a prefix of it.
The first mention of a spelling wins, so an existing variable beats a proposal.

## packages/languages/src/messages/variables/name-tables-from-variables.ts

Projects a variable list back into the glossary and name table pair the current readers expect.
Engine variables are dropped: they have no literal value, and neither table ever held one. A
`bottle-7` key maps back to bottle content 7.

## packages/languages/src/messages/variables/merge-meta.ts

Carries the fields the glossary and name table pair has no room for across a rebuild. A set is still edited
through its projected glossary and name table, so the variable list is rebuilt from that pair on
every save. That rebuild makes `label` from the value and cannot know about a note the
translator attached to a menu name, so both would be lost on every save; merging the previous list
back in keeps them. Values, kinds, lock state and widths come from the rebuild, on purpose: those
follow the text, and the text is what was just edited. Only presentation is carried over, and only
for a key that still exists with the same kind.

## packages/languages/src/messages/variables/resolve.ts

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

## packages/languages/src/messages/variables/scan-run.ts

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
- Lowercasing changes the length of a few exotic characters, which would misalign the
  offsets a caller slices with. When that happens the scan reads the original text, so a wrong
  span can never be offered. The cost is that near misses go unreported for that run.

## packages/languages/src/messages/variables/types/

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
- `NameTableData` is the glossary and name table pair that every current reader
  expects. It is produced from a variable list and not stored beside it.
- `ResolveOptions.samples` are preview stand ins for the engine variables, keyed by variable key.
  A missing key falls back to the neutral worst case samples.
- `RunScan.exact` holds start offsets of exact case occurrences, the replaceable ones. `caseMiss`
  holds offsets that match only with case ignored.

## packages/languages/src/messages/variables/variable-index.ts

A key lookup over a variable list, built once per expansion pass. The first entry wins on a
duplicate key. `variablesFromNameTables` puts the engine's two entries ahead of everything else, so a
locked entry can never be shadowed by a term that shares its key. The game owns those two, and a
set cannot define them again.

## packages/languages/src/messages/variables/variables-from-name-tables.ts

The bridge between the one variable list and the two tables that came before it.
`variablesFromNameTables` folds a glossary and a name table into
one list; `nameTablesFromVariables` projects a list back into the pair, so the pause menu, the bake
step and the editor's tables keep reading what they always read. The result order is the engine's
two first (locked, so they always win a key clash), then the translator's terms, then the menu
names.

The pair round trips without loss in both directions for everything the old model could express:
a term returns as a term, a menu name returns to the slot it came from. Only the fields the old
model had no room for (`label`, `locked`, `maxGlyphs`, and a note on a menu name) are generated
again. A caller that wants to keep an edited label carries it over itself (`./merge-meta.ts`).

Key shapes: an item keeps the key it already had (`<item-record-id>-<tier>`), so nothing that
references one has to be rewritten. The other two slots had no key shape of their own, so they
take a prefix that cannot collide with an item key: `bottle-<content>` and `label-<section>`. The
reverse never guesses from the key alone; `kind` says which table an entry belongs to first.

`maxGlyphs` for a literal value counts its characters. A bracketed picture glyph spelling
therefore counts high, which keeps a fit verdict on the safe side. A picker reads the value better
than the key, so the label is the value, with the key as fallback. `withNote` adds `note` only
when there is one, so a round trip never grows the shape.

## packages/languages/src/sets/create/index.ts

- Both create paths start from an existing set on disk. A new set clones its dialogue as a translation starting point; a duplicate copies everything.
- The font pair is copied file for file, so the new set bakes without depending on the folder it came from.
- `base` is inherited from the source set's own `base`, never set to the source id. The bake step resolves the alphabet, dictionary and encoder from that value, so it has to stay a real base language code even when the source is itself custom.
- A new set starts with no variables of its own.

## packages/languages/src/sets/export-rlang.ts

- The files go out exactly as they sit in the set's folder, in a fixed order with the archive's fixed timestamp, so two exports of the same set agree byte for byte.
- Everything is DEFLATE compressed: a set is JSON plus two small font tables.

## packages/languages/src/sets/extract.ts

- Extraction itself runs in the worker. This lands its result on disk: the raw extraction payload (dialogue dump, font pair, extraction meta) plus the set files derived from it.
- A re-extract of the same code resets the set on purpose. That is the start-over-from-the-ROM action.

## packages/languages/src/sets/format-2/index.ts

- Format 2 of a stored set: one `variables.json` plus a `structure` choice, with a `format` number in the header. Format 2 is the only format: a header with any other `format` is refused, never converted.
- Rebuild on write: the set is still edited through its projected glossary and name table, so the variable list is rebuilt from that pair on every save, with the previous list merged back for the fields the pair cannot carry. A read, write, read cycle produces byte-identical files.
- Unknown header fields survive: the known keys are laid over the header read back from disk, so a field written by a newer build is kept.
- An unrecognised or absent `structure` falls back to the default instead of failing the read.

## packages/languages/src/sets/import-rlang.ts

- The set always lands under a free id of its own, so an import never writes over a set that is already there. The id aimed for is `desiredId`, or the archive's own id when absent; a taken id gets a numbered suffix.
- `set.json` is written last. Until it exists the folder is not listed as a set, so a run that dies part way leaves nothing the app would try to open.
- The written set is read back through the ordinary reader, and a set that does not open is removed again.
- Every failure is something a user did (picked the wrong file, edited one by hand), so each one throws a message written for them.
- The dialogue is checked to be a JSON array before it lands, because the reader falls back to an empty list on bad JSON.

## packages/languages/src/sets/index.ts

- `listPacks` and `getLanguage` are the extraction payload view: the extracted-language list, and the renderer store's `getLanguage`.

## packages/languages/src/sets/pack/index.ts

- The `LanguagePack` view of a folder is the raw extraction payload (`dialogue.txt`, `meta.json`, `font.bin`). Two things still need it: the read-only inspector UI, and the asset recompile, which reads those same files. An extraction keeps writing them next to the set files.

## packages/languages/src/sets/paths/index.ts

- Layout of one set under `languages/<id>/`: `set.json` (identity, provenance, format, structure), `dialogue.json`, `text.json`, `variables.json`, `font.bin` (raw 2bpp glyph sheet), `font-width.bin` (per-glyph width table).
- `text.json` holds the non-dialogue strings a translator retyped, overrides only, so a folder without it reads as nothing translated.
- The two extraction files a ROM import leaves (`dialogue.txt`, `meta.json`) are named here for the payload reader.

## packages/languages/src/sets/read-rlang-bytes.ts

- Runs the ordinary import into a throwaway in-memory store and reads the set back through the ordinary readers, so the archive is checked exactly as an install would check it.
- `font` is null when the archive carries no font.

## packages/languages/src/sets/read/index.ts

- A folder with no `set.json` is not a set, so every entry point answers null for it.
- The set meta is picked field by field, so the format bookkeeping the header also carries stays in the storage layer.
- A folder written before `text.json` existed reads as an empty object, which is exactly nothing translated yet. The catalog, not this payload, decides which slots the editor shows.

## packages/languages/src/sets/rlang-format/index.ts

- A `.rlang` file is one language set as a plain ZIP. `set.json` is entry 0, so a reader can identify a set from the head of the file, then the payload files follow in a fixed order.
- Only the files a set folder is made of travel. The ROM-extraction leftovers (`dialogue.txt`, `meta.json`) never do.
- A header opens when it is named, its base language is known, its origin is `rom` or `custom`, it has a numeric version, and its format is not newer than this build writes.

## packages/languages/src/sets/set-id/index.ts

- A set id becomes a folder name and the value the config's language key selects at boot, so it is limited to lowercase letters, digits and dashes. It must also not be taken.

## packages/languages/src/sets/types/types.type.ts

- `SetFontBytes` stays as `Uint8Array`, the FileStore's own currency, so the storage module is host-neutral. The bake step wraps the bytes for its Node-Buffer pipeline.
- `ExtractedPack` is the raw result of a ROM extraction, as the extraction worker produces it.
- `lineCount` of a summary is the number of dialogue entries the set holds.

## packages/languages/src/sets/write/index.ts

- `saveSet` overwrites the JSON payloads of the whole set and never touches the font binaries, which an extraction writes once or a create or duplicate copies. It never bumps `version`; that is the caller's call.
- The overrides file (`text.json`) stays outside the format bookkeeping on purpose: it is purely additive, so it needs no format to discriminate it, and its absence is a valid state.

## packages/languages/src/store/install/install-rlang.ts

- A `.rlang` is unpacked into a new set folder under a free id. Uninstall removes that folder.
- Rebaking the asset blob afterwards is the host's step, since the bake runs where the ROM and the assets are.

## packages/languages/src/store/manifest/facts-for/facts-for.ts

- Turns a pack's first entry into the facts an item shows, through the same guards the app uses to open each container. null means the app could not open it: the entry has the wrong name for the container, or its manifest fails that container's guard.
