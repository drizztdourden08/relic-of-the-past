<!-- @layer docs @kind doc -->
# Code notes: apps/web/src/lib

Facts about the renderer library that the code cannot say on its own. Each heading names
the source file (or folder) the note belongs to, relative to `apps/web/src/lib`.

## assets/public-asset.ts

The packaged renderer loads over `file://`, where a root-absolute path such as
`/buttons/x.svg` points at the filesystem root and fails. Vite's `BASE_URL` is `/` in dev
and `./` in the packaged build, so callers pass a root-relative path.

## crash-dump.ts

When the core crashes, the log buffer is written to `debug/crash-<stamp>.log` in the user's
data folder, so a crash report is a file to attach. Writing the dump is best effort: a
failed dump never makes a crash worse, and the in-app log still has everything.

## crossing-sections

A crossing that is not placed carries a placeholder tile: the exit table names a
destination without saying where its door is, so it belongs in a list but on no map.
Indoors a fall hole crossing is the tile the player lands on and gets its own section.
Outdoors it is the pit itself and belongs with the other ways off the screen. A map marks
crossings that are placed, available now, and not a landing.

## diagnostics

What the renderer itself can see: the graphics stack WebGL exposes, the audio device the
mixer lands on, the display the window sits on, and the attached input devices. It works on
every host, including web and mobile where there is no main process to ask; there the host
sections (system, hardware, every attached display) drop out and the renderer sections still
carry the report.

- `build-report-subject.ts`: the prefilled report subject is the version and, while a game
  runs, the screen it is on, then a colon for the person to finish the sentence.
- `collect-save-states.ts`: a debug report packages every quick slot, the 5 newest normal
  saves, the 2 newest auto saves, and one fresh live capture. The live capture writes to a
  scratch WASM slot and unlinks it at once, so packaging a report never creates a save the
  player did not ask for.
- `collect-renderer.ts`: the refresh rate probe is the only slow one (it watches real
  frames), so it runs alongside the audio probe.
- `probe-audio.ts`: the mixer runs inside the wasm module, so the probe opens a short lived
  `AudioContext` and reads what the output device imposes on any context: the sample rate the
  resampler must hit and the buffer latency behind crackle reports. Output latency reads 0
  until the graph has run, so 0 is reported as unknown.
- `probe-device.ts`: `deviceMemory` and `performance.memory` are Chromium extensions with no
  DOM typings. SDL3 claims every controller directly (the Gamepad API path is gone). The probe
  reads the device snapshot from the controller layer, not the input manager's cache (which
  exists only after the manager started) and not the reported input set (SDL emits state only
  on change, so an untouched pad would be missing). Names come from the session's
  `controller:added` cache, then the snapshot's fields. Device ids carry the vendor and
  product pair a controller mapping report needs.
- `probe-display.ts`: scale factor and colour capability decide how the pixel art scaler
  behaves, so they matter for blurry or mis-sized output reports.
- `probe-refresh-rate.ts`: measures the compositor's real frame cadence, the rate the
  emulator is paced against, which can differ from the monitor's mode (a 144 Hz panel driven
  at 60, a variable refresh panel in between). It takes the median so one hitch cannot skew
  it, ignores gaps of 100 ms or more (a throttled tab or a stalled compositor), and gives up
  after 2.5 s so a background window does not hold the copy button hostage.
- `probe-webgl.ts`: prefers WebGL2 so the limits match the game canvas, and unmasks the real
  adapter through the debug renderer extension. Browsers cap live WebGL contexts and the game
  canvas needs one, so the probe context is released at once.
- `format/`: the block is built as titled sections so a formatter can drop an empty line or
  section without the caller knowing which parts are optional. Units are compact with no
  locale separators, since the text is pasted into reports and diffed by eye. Every attached
  display is listed and then the one the window is on as the renderer measures it, because a
  mismatch between them is itself the bug in a multi monitor or mixed DPI report. Chromium
  wraps the colour space in braces, which are dropped. Chromium reports several shades of
  enabled for GPU features; only the disabled ones are listed. Host adapter facts and the
  WebGL view share the graphics section because they answer the same question from two sides.
- `session-log/`: the tap subscribes to the log bus at emit time, so lines the ring later
  evicts still reach disk, and streams them in batches to the main process sink
  `Data/debug/session.log`. It is installed once at renderer boot on every launch. A batch
  goes out after a second of quiet or at 200 lines, so logging never costs one IPC round per
  line, and a failed send drops the batch, never the app. The `core` channel carries the game
  core's stdout and stderr, so its lines are tagged `[wasm]` in the file. The lookup of
  `appendSessionLog` is guarded: a non Electron host's shim makes it a no op, and a preload
  without the channel leaves the tap uninstalled. A last flush runs on `pagehide`.
- `useAllowDebugLogging.ts`: settings are not a reactive store during gameplay, so this polls
  the live snapshot the WASM bridge keeps primed, once a second like the navigation widget.
- `useDebugText.ts`: the text is collected when the caller mounts, not on click, so no await
  sits between the user's gesture and the moment the text is ready.
- `useDebugTextBuilder.ts`: one builder backs the About page's copy button and the bug report
  form's debug block, sourced from the platform facade. `__CAP_VERSION__` is injected at
  build time for the Capacitor build only, so it is always read through `typeof`. Host
  hardware exists only behind a main process.
- `useReportContext.ts`: the running flag lives in the app lifecycle hook, not a store, so
  the game UI store's mode stands in: `title` and `loading` are what it holds before a game
  runs and while one boots. A palace index of `0xFF` means the room is not in a palace.

## dialog-texture

- Twinkle gives every cell its own period and phase from a seeded hash, never
  `Math.random`, so the flicker is stable across frames. Most of each cycle is dark and the
  cell shows for a short window, like a light coming on.
- Cells are addressed by their index in an endless grid and placed at index times pitch
  plus the slide, so a sliding field never wraps: a cell keeps its seat, scatter and phase.
- Density (0 to 100, where 100 is the pattern's natural pitch) sets the pitch, scale sets
  the cell size, and scatter (0 to 100) nudges each cell off its seat and varies its size.
  At full scatter the grid is gone. The canvas is sized in device pixels and drawn in game
  pixels.
- A row pattern spans the whole width, so the walk skips columns and scatter moves rows.

## entrance-icons

A crossing's glyph follows the detector that produced it. A crossing to the surface shows
where it comes out, a crossing into another room shows what that room is. Stair links use
the exit door icon in gold, palace toggle walk boundaries use the secret door in purple,
and a door to a header travel slot uses the portal.

## game/dialog

- `active-alphabet`: glyph ids to text for the modern font, in the active language's alphabet,
  read the way the core reads it (the `Language` key of `/zelda3.ini`, `us` by default).
  Picture glyphs keep their bracketed token name so a row renderer can draw them from the glyph
  sheet. Extra glyphs a session wrote into the font's spare slots read as their own characters
  (`extra-glyphs.ts`).
- `dialog-bridge`: a per frame read of the dialog mirror from the UI bridge's animation frame
  loop; only a changed frame reaches the store. A closed gate reads as an inactive frame, so the
  host box stands down the moment the override is refused, and stopping the bridge does the same,
  or the last frame would stay painted over what comes next. After a load restores the mirror,
  the box reads closed for one poll so every per message latch lets go, and the next poll reports
  the restored frame even when it equals the last one.
- `glyph-atlas`: the active language's dialogue font as one offscreen canvas, drawn from the
  sheet the core renders from (`WasmGetDialogFont`, 0 the tiles, 1 the width table). Glyph `c`
  sits at column `c & 15`, row `c >> 4`, in 8 by 16 cells, painted with the live CGRAM palette so
  a colour line or another box palette shows as the game shows it. Palette entry 0 is the
  transparent ground and entry 2 a letter's body, which a highlight repaints
  (`dialog_highlight.c`). Built once per font and palette, keyed by the sheet's heap address and
  size (both change with the language) and the palette words; more than eight keys means the
  sheet or palette moved on and the cache is dropped.
- `parse-dialog-state`: decodes the dialog mirror (`core/game-hooks/dialog_mirror.c`). Header,
  20 bytes: 0 active; 1 flags (bit 0 bordered, bit 1 story, bit 2 native box withheld); 2 and 3
  the top left word address; 4 render state; 5 last command; 6 choice index; 7 scroll step; 8
  and 9 message id; 10 to 12 cells per row; 13 generation; 14 the message's widest row; 15 its
  most rows; 16 and 17, 18 and 19 the text layer's signed horizontal and vertical scroll. Then
  3 rows of 40 cells of glyph, x, and width with the highlight span in the high nibble.

## game/edge-glow

A WebGL post process that fills the black bars around the game: a mirror pass reflects game
pixels into the bars, progressive Gaussian blur passes soften the reflection, and a composite
blends the sharp reflection near the edge into the blurred one further out, with animated
Voronoi noise modulating blur, saturation and opacity, plus a pixelation mask and an edge fade.
Fullscreen quads are drawn as two triangles (six vertices). Without WebGL a 2D fallback copies
the game canvas each frame and ignores every effect control, so the game still renders. A clean
frame, when given, is uploaded separately and mirrored with its blue and red channels swapped.

## game/events

The bridge for `window.__onTransitionSettled` (`GameHook_ModuleFrameEnd` in
`transition_events.c`). The core fires it once per frame on which a module or dungeon
submodule transition has just finished, gated on the Developer Tools setting; subscribing while
the setting is off is harmless, since the core never calls in. Kinds, from the dungeon
submodule that just finished (module 7 is the dungeon, 9 the overworld): `room` is an inter
room doorway (submodule 2), `quadrant` an intra room scroll (1), `doors` shutters, unlocks and
cracked walls (4, 5, 9), `stairs` inter or intra room stairs (6, 8, `0x0E`, `0x10` to `0x13`),
`entered` the player entering a gameplay module (submodule 0, in or out of a dungeon), and
`other` any remaining submodule returning to 0.

## game/observations

Every real transition leaving the current screen, taken from the crossings facade so one
producer serves the navigation widget, the simulator and the recommendations. `usableCrossings`
applies the span and plausibility filters, so a border bundle the simulator refuses is not
offered here either. Sources use the vocabulary the connection probes join on. A doorway
through an outer wall is enumerable, so a dataset without one has a gap worth proposing.
Outdoors only doors and pits are enumerable: a respawn leads nowhere, and a hole read from
indoors is where the player lands, not a way out. A screen edge scroll proves presence, never
absence, so it is graded apart (`flood`) and can back no removal. Presence only: `available` is
never consulted, since a crossing gated behind an item is still a crossing the dataset should
carry, and grading it on the loadout would make findings come and go with the inventory.

## game/player-sheet

- `draw-tiles`: everything the sprite studio draws reduces to a rectangular run of tiles taken
  from the 16 column sheet, looked up through a resolved 16 colour row, optionally flipped. The
  engine stores one copy of the art and sets flip bits in OAM, so a preview does the same.
  Palette index 0 is left untouched, not written as transparent black, so overlapping quads
  compose the way sprites do.
- `compose-frame.ts`: a pose atlas frame is up to two 16 by 16 halves, each a 2 by 2 block of
  tiles from its own sheet offset; the halves are not adjacent on the sheet, so they are
  composed. Quads are drawn in atlas order so the lower half lands over the upper, matching
  the OAM order the engine writes. The origin is passed in because quad offsets can be negative.
- `resolve-palette.ts`: builds the 16 colours the PPU would hold for an outfit and glove level,
  mirroring `PushBank` in `core/game-hooks/player_sprite.c`: entry 0 stays transparent, 1 to 15
  come from the outfit, and equipped gloves replace one entry. Each entry is packed little
  endian RGBA ready for ImageData.
- `flatten-palette`: the override layer is sparse (only edited outfits and the glove pair), so a
  colour is read from the override first and the original second. A ZSPR export and the boot
  flatten go through here. An empty override means Revert has nothing to undo; edits return a
  new override and never touch the original.
- `load-sheet`: one place picks the container from the extension. A ZSPR may take a stock
  palette for a sheet that ships tiles only; a pack carries its own palettes. The core only
  reads ZSPR (the INI names one path and `PlayerSprite_Apply` checks the magic), so a pack is
  flattened before it is staged for boot or pushed to a running game; a ZSPR passes through
  untouched.
- `delete-sprite.ts`: a profile's `linkSprite` is only a file name, so deleting the file alone
  leaves a dangling selection: the boot logs not found and falls back to the stock sheet, which
  reads as the setting changing itself. Every profile that selected it is reset, not just the
  active one, since the library is global. Only the active profile's selection is the one the
  core is wearing, so the live game returns to stock only when that profile was among them.
- `sheet-png`: the whole sheet as one PNG (16 by 56 tiles, 128 by 448 pixels), for the tile
  sheet view and the preview inside a pack. It is drawn in the green outfit, the one the game
  starts in.
- `thumbnail.ts`: the front facing standing pose is the sheet's first 2 by 3 tiles, the one pose
  addressable without the pose atlas, so the library list stays cheap.

## game/save-file

- `hook-save-bytes.ts`: the TS mirror of the hook owned save byte registry. The addresses are
  allocated in `core/game-hooks/save_bytes.h`, the single source of truth with compile time
  no overlap checks; this mirror exists so the offline save reader and the headless probes name
  the same bytes. Nothing may change here alone: `tests/randomizer/hook-save-bytes.keep.test.ts`
  parses the header and fails when the two disagree. `SAVE_BLOCK_BASE` (`0xF000`) is the base of
  the battery block the game saves and checksums; `0xF406` to `0xF4FD` is the hook layer's run.
  Owners: substitution completion bits, one per possession gated giver (`npc_overrides.c`); the
  wallet ladder rung and one empty rung flag per counted family, explosives, projectiles, meter
  (`capacity_profile.c`); one bit per palace for a dungeon's falling reward handed over, and the
  crystal bit the receipt in flight must bank, 0 for none (`prize_grants.c`); throws paid for in
  a planned pond sequence (`pond_plan.c`); throws taken at each item throwing water, in its own
  counter order (`wish_pond_plan.c`); the sword level the smiths keep while tempering, as
  `0x80 | level` (`smith_sword.c`); one byte per canonical shop slot, armed steps already bought
  (`shop_table.c`); one bit per event the game never records itself
  (`events/event_ledger.c`); how many multiworld items this file took, 16 bit little endian
  (`ap_received_index.c`); the FNV-1a hash of the multiworld room's seed name, 32 bit little
  endian, 0 for no room yet (`ap_room_hash.c`).
- `sram-slots`: ports the game's file layout and checksum (`SaveGameFile` in `messaging.c`,
  `Intro_CheckCksum` in `select_file.c`). The 8 KiB battery save holds three `0x500` byte file
  blocks at `0x000`, `0x500` and `0xA00`, each mirrored `0xF00` later; a block is valid when its
  `0x280` little endian words sum to `0x5A5A`. The primary copy is used when it checksums, else
  the backup (the game's own fallback), else the slot is empty or corrupt.
- `offline-inventory.ts`: rebuilds the 34 byte buffer `WasmGetInventoryState` fills
  (`state_queries.c`) from the slot block, so live and offline share one parser. Offsets are the
  vanilla `variables.h` addresses minus `0xF000`: `0x340` to `0x347` bow to bombos, `0x348` to
  `0x34E` ether to book (`0x34F` is the bottle cursor), `0x350` to `0x357` somaria to moon
  pearl, `0x359` to `0x35B` sword, shield, armor, `0x35C` to `0x35F` bottles, `0x374` pendants,
  `0x37A` crystals, `0x36B` heart pieces, `0x36C` health capacity. Keep in step with the C buffer.
- `offline-player-name.ts`: ports the game's decode (`Text_WritePlayerName`,
  `Text_FilterPlayerNameCharacters` in `messaging.c`): six 16 bit name screen tile words at block
  offset `0x3D9`, each folded to a dialogue font code (tiles from `0x76` are digits, shifted down
  by `0x42`; `0x5F`, `0x60`, `0x61` map to `0x08`, `0x22`, `0x3E`), then looked up in the US
  alphabet. A bracketed entry is an icon glyph with no plain text form and reads as `?`.
- `offline-progress.ts`: adapts a slot block to the same three readers the live poller feeds the
  shared sweep, so both agree on what done means. A save on disk has no loaded room, and the
  sleep check resolves through the progress indicator fallback. The event ledger sits in the same
  block, so a save answers it too. `isArmed` routes substitution: a check the placement arms
  reads the real taken bit instead of a possession proxy.
- `progress-offsets.ts`: the offline mirror of `WasmGetProgressFlags` (`state_queries.c`), each
  buffer index mapped to its byte offset inside one file block. By index: 0 progress indicator,
  1 progress flags, 2 progress indicator 3, 3 swim gear, 4 running gear, 5 catching net, 6
  reflector, 7 third medallion, 8 magic consumption scale, 9 to 11 the low bytes of room `0x109`,
  `0x123` and `0x11E` flag words, 12 the sleep step counter (live WRAM only, no offline source;
  its check falls back to index 0 through `check-facts.ts`), 13 tagalong id, 14 small key count,
  15 big key word low byte, 16 to 18 the high bytes of those three room words, 19 starting point
  id, 20 map marker state, 21, 22 and 25 the substitution completion bytes, 23 and 24 the
  explosives and projectiles tier bytes (the pond's persisted purchase level), 26 the wallet
  ladder index (0 on a vanilla file), 27 to 29 the explosives, projectiles and meter empty rung
  flags (1 while a Custom family sits below its grid), 30 throws taken out of a planned pond (0
  on a file that never met a plan; the completion fact of its prize slots). Rows from hook owned
  bytes come from `hook-save-bytes.ts`, so the table cannot drift from the registry.

## game/shadow-casting

A WebGL pipeline: a single channel heightmap rasterized on the CPU from shape elements, a shadow
pass that ray marches through it for the sun and point lights, an optional separable blur that
softens shadow edges (up to 8 px, skipped in debug mode or below 0.1 px), and a composite that
outputs the light map, which CSS `mix-blend-mode: multiply` combines with the game. The
heightmap is rebuilt every frame in viewport local space, matching the NavigationOverlay's
coordinates: the view origin is subtracted from world coordinates, and light positions are
offset the same way. The heightmap is one byte per pixel and its width need not be a multiple
of 4, so row alignment is set to 1. Inside a shape the height is hard edged and full. A shape
with 32 or more sides is treated as an ellipse, otherwise as a regular polygon with rounded
corners; freehand shapes use point in polygon tests. A light coloured `sample` takes its colour
from the game canvas at its position. Lights are capped at 16. With no screen data, or when
disabled, the canvas is cleared to fully transparent. The default viewport is 512 by 240 SNES
pixels.

## game/session-dialogue

Owns the per-session pool of pre-rendered receipt lines and pushes them into the core's live
dialogue memory. The composed blob is the active language's baked bytes verbatim (dictionary and
every baked line, class templates included) plus one compressed line per session message. It is
written to the virtual FS as `/session_dialogue.bin` and adopted by `WasmLoadSessionDialogue`
(session_dialogue.c), which returns the adopted line count, 0 when it refused and kept the baked
blob. Per-seed text never touches the shared asset blob; the baked class lines at 397 to 401 stay
the fallback for any grant without a pre-rendered line.

- A line arrives as candidates, fullest first (receipt-line.type.ts). The composer keeps the
  first one that fits the three visible rows against the language's real glyph widths.
- The pool is composed again whenever the session renders its lines again (the tracker moved a
  found or total number). The ids stay put because the count and order do. The swap is safe
  between frames because the text engine copies a line out of the blob when a message opens,
  never while it shows. Encoded lines are cached by text, so a refresh encodes only what changed.
- The pool has two parts. The arrivals come first: a fixed ring of slots for lines appended at
  runtime (an online receipt). The planned lines follow, and a set replaces them whatever their
  count, since the ring never changes size and so no set can move an arrival.
- `baseChunksOf`: a blob from an older bake stops short of the newer templates, so the ones it
  lacks are appended and the fixed template ids stay correct below the session lines. Without
  this a session line would sit at an id the core shows as a template line.
- A Language Studio set compiles under its own id. Its base encoder cannot be recovered here, so
  the class template lines stay the fallback.
- `prepareLine` makes the fitting candidate drawable (dialogue-text) and wraps it into line
  commands. A yes or no line lays its question out above its two answers (choice-message); a
  detail page opens on a key and scrolls in (page-message).
- `setSessionReceiptMessages` replaces the planned lines with any count and returns their message
  ids, or null when kept baked. Pending arrivals keep their ids and text.
- `appendSessionReceiptMessage` puts one arrival in a free ring slot and returns its id, or null
  when kept baked or while every slot is still held by a pending delivery. The id goes back
  through `releaseSessionReceiptMessage` once that delivery completes.
- `clearSessionDialogue` drops the pool and restores the baked blob (session stop).

### game/session-dialogue/active-dialogue.ts

Reads the asset blob and INI back from the running module's virtual FS and extracts, at the byte
level, what the composer needs: the active language code (INI `Language`, default `us`, the same
read the core does at boot), its packed dictionary, its per-line compressed chunks in message id
order, and its per-glyph pixel widths indexed by alphabet position. Reusing bytes means the
vanilla lines are never encoded again, so the composed blob carries them bit identical to the
bake. `dialogueIndexOf` is ZeldaSetLanguage's lookup in TS, default index 0.

### game/session-dialogue/arrival-ring

The received-item lines of a session: a fixed ring of `ARRIVAL_SLOTS` (32) slots at the front of
the pool. A slot is taken when an online receipt reaches the front of the delivery queue and
handed back once the queue reports that delivery complete, so its id is reused by a later
arrival. The pool never grows past the ring however long the session runs; only the delivery in
flight holds a slot. A free slot holds an empty line, never shown because no delivery holds its
id. `next` is where the search for a free slot starts, so a released id is the last one reused.
`takeSlot` returns null while every slot is held. A released slot keeps its line until a later
arrival takes it.

### game/session-dialogue/choice-message.ts

A yes or no question laid out the way the game's own two answer prompts are. The box shows three
rows and the choose command parks the cursor on the last two (messaging.c
RenderText_Draw_Choose2LowOr3 draws a fixed arrow over dialogue rows 1 and 2), and the engine
never waits on its own. So the answers leave one row for the question (`INLINE_QUESTION_ROWS`),
and anything longer is paged, never scrolled away: the line fills the box, the player clears it
with a key, then the two answers scroll in under the line's short prompt. That is the shape of
the game's own long prompt at the mysterious pond. Paging is the normal case: the composer keeps
the fullest wording the box can page and lays a question inline only when that wording is a
single row. The answers are indented the way the game's own two answer lines are. On a paged
question the rows it does not fill are opened empty, so the box holds three rows before the
scrolls line up, as the game's long prompt opens its third row. A question past three rows pages
at every break so none of it scrolls unread. The row above the answers is the line's own prompt
when one fits, else the last row of the question.

### game/session-dialogue/dialogue-text.ts

Any text as a message box can draw it; every composer runs its words through this. Each
character resolves to the first rule that applies:

1. Highlight markup passes through untouched (highlight-markup.ts).
2. A character the language's alphabet draws stays itself.
3. A character with an extra glyph (dialogue-charset.ts) becomes its slot token.
4. Typographic forms become their plain one: dashes a hyphen, curly quotes straight ones, the
   ellipsis three dots, any space a space.
5. A compatibility or accented form becomes its base (a full width letter the letter, an
   accented letter the plain one, a ligature its letters). A Latin letter with no such base takes
   its usual spelling (`LETTERS`: ß to ss, æ to ae, ł to l).
6. With no slot left for it, a bracket becomes a parenthesis, a backslash a slash and a semicolon
   a comma (`NEAREST`).
7. A control or joining character draws nothing.
8. Anything else (another script, an emoji) is a question mark, which every alphabet draws.

Runs of spaces fold into one and the ends are trimmed. `MAX_DEPTH` (2) bounds replacement
chains: a replacement's own characters resolve once more, no further.

### game/session-dialogue/extra-glyphs

Hands the extra glyphs (extra-glyphs.data.ts) to the core, which writes them into the active
font's spare slots (core/game-hooks/dialog_extra_glyphs.c). One table entry per glyph,
`ENTRY_BYTES` (34) long: its slot, its width, then its two tiles from `TILE_OFFSET` (2). The core
keeps the copy it built while the table stays the same, so loading on every compose costs a
compare. A core without the export draws no extra glyph and the composer falls back for those
characters. `loadExtraGlyphs` returns true when the core took every one. `sessionCharset` is the
charset a session line is composed in: the alphabet and font widths plus the extra glyphs the
core took (none from a core without them). `clearExtraGlyphs` gives the font its own glyphs back
at session stop. The slots the core took are kept too (`loadedExtraGlyphs`), for the modern face
of the enhanced box, which looks a glyph code up as text (game/dialog/active-alphabet).

### game/session-dialogue/highlight-bytes

Encodes a prepared line that carries highlight markup or extra glyph tokens. The text between
them is compressed on its own, so no dictionary word reaches across one, and each becomes the
core's control bytes:

- A highlight marker (core/game-hooks/dialog_highlight.c): one byte 0x80 plus span in the US
  encoding, 0x87 then 0x50 plus span in the European one; span 0 closes, 1 is primary, 2 is
  secondary.
- An extra glyph (dialog_extra_glyphs.c): 0x83 then its slot in the US encoding, 0x87 then its
  slot in the European one.

A line with neither encodes exactly as the plain encoder makes it.

### game/session-dialogue/page-message.ts

A detail page laid out the way the game moves a long line on to its next box. The core shows a
detail page right after the receipt's own line, in the same box (receipt_pages.c joins the two).
The engine has no command that clears the box, so the page opens with a key wait, then each row
scrolls in from the bottom. Three scrolls push every row of the first page away, so a page
shorter than the box scrolls in empty rows after its own and never shares the box with the page
before it. A page past three rows waits for a key again before each further row, as a long line
does. The page keeps the fullest wording that fits the box on its own.

### game/session-dialogue/wrap-message

Message text layout. A line already made drawable is word wrapped against the real per-glyph
pixel widths into the box's line commands: `[2]` and `[3]` for rows two and three,
`[Waitkey][Scroll]` for every row past the visible three. The engine renders variable width
glyphs and never wraps on its own. The alphabet and widths are a charset's, so an extra glyph's
token measures by its slot.

- A row past the third scrolls the top row off the box, and the engine never waits on its own, so
  each of those breaks carries a `[Waitkey]` first. Without it a long line pushes its own opening
  away before it can be read, which is what the game's own long lines pause for.
- Highlight markup passes through untouched and measures zero pixels: it becomes control bytes
  the engine draws nothing for.
- `LINE_WIDTH_PX` (164) is the usable pixels per row minus a safety margin: the engine draws 21
  tiles of 8 px per row (messaging.c RenderText_Refresh) and advances the pen by each glyph's own
  width (VWF_RenderSingle), never wrapping. `VISIBLE_ROWS` (3) is the rows the box shows at once.
  `FALLBACK_WIDTH_PX` (8) is assumed for a character missing from the width table.
- A word with no letter or digit (an arrow or another lone symbol) binds to the words on both
  sides, so a range such as `0 > 99` stays on one row and no row ends or starts with the arrow.
- `fitReceiptLine` picks the fullest candidate that fits the visible rows, or the last one when
  none does.

## game/tracker/bridge

Connects the core's item and check notifications to the tracker. It installs
`window.__onItemReceived`, polls the inventory state every 2 seconds (`POLL_INTERVAL_MS`), and
polls room, overworld and progress flags for check completion beside it.

- A delivered item reaches listeners as its dataset id plus the native index the game reported.
  The name is left out on purpose: a listener that wants one looks it up from the id, so two
  consumers can never disagree about what an item is called.
- The inventory change is logged by name, so a reader can recognise what the player picked up.
- Progression events are checks, never inventory: they arrive with the rest of the completed set
  from the flag poll, which reads the same progress bytes.
- Room flags are polled alongside the inventory even when the inventory read failed; a read that
  throws means the module may not be ready yet. A zero inventory pointer skips both.
- The item callback defers its poll to the next microtask to avoid calling back into WASM while
  the callback is still on the WASM stack (it fires through EM_ASM inside, for example,
  WasmCheatGiveItem).
- A fresh game start resets the unknown items, and the first poll is forced so the tracker shows
  the current game state at once.
- `pollEventStatus` reads the live side of the reversible events beside the completed set.

## game/tracker/check-facts

Per-record native fact tests: whether a check record's own `gameId` reads as complete from the
live WASM heap. Each record is tested on its own fields, so a fact shared by two records (a boss
and its prize flip the same room bit) resolves both; no reverse lookup that could only hand back
one winner. The one fact with no record-owned address is the "out of bed" read (a direct WRAM
offset), which is what the facade's reverse index stays for.

- `CHEST_OPEN_MASKS` are the room-state slots for the bits a chest-open word can carry.
- `BED_STATE_BUFFER_INDEX` (12) is the progress buffer index that carries
  player_sleep_in_bed_state.
- `isRoomFactMet` checks a chest slot or a direct room mask bit, whichever the record carries. A
  gift giver's own room bit (`roomFlag`) is read through the room reader, so the room the player
  stands in answers from its live bits: the save block only gets them when the room is left.
- `isOverworldFactMet` reads an overworld event bit (standing items, dig spots, events).
- `isProgressFactMet` reads an NPC progress buffer bit or an event threshold.
- `isEventFactMet` reads a ledger bit (core/game-hooks/events/event_ids.h): an event the game
  never records for itself.
- `isOutOfBedFallbackMet`: a save loaded past the first gift is out of bed even if the bed state
  byte no longer says so, so the progress indicator (buffer index 0) answers too. Only for the
  record owning `BED_STATE_BUFFER_INDEX`.
- `outOfBedCheckId` resolves the out of bed check from the raw native fact, the one legitimate use
  of the reverse index left in polling.

## game/tracker/collected-checks

Checks the multiworld room holds as done while the save does not: a location collected for this
slot by `!collect`, or checked in another session of the same slot. The tracker shows them
completed, as the room does. The game's own completion flags are never written: this is the
app's view alone, and it goes with the online session. `addCollectedChecks` returns true when any
id was new. `withCollectedChecks` adds every collected check to the completed set the save shows.

## game/tracker/completed-checks-core.ts

The per-check completion sweep, shared by the live poller (flag-polling) and the offline battery
save reader (save-file/offline-progress.ts). Every check record is tested against whichever of
its own gameId fields describe a detection mode. A null reader stands for a source that is not
available (a gated live query, or the offline path's missing live WRAM byte) and skips its modes
instead of reading zeros, since zero can satisfy an equality threshold, so a made up read is not a
safe "no".

- `readEventByte` reads the event ledger bytes (WasmGetEventBytes, or the battery file's own
  copy). `inventory` is the items held, for the derived pass's held-item events; null skips them.
- A physically armed substitution row never completes off its record's possession proxy, because
  the vanilla item can arrive from anywhere in a shuffled seed. The substitution seam persists the
  real taken bit instead (progress bytes 21 and 22). Normal profiles never arm, so they keep the
  proxy.
- Armed rows answer from their own taken bit alone in the derived pass too: a fallback that reads
  the vanilla item would tick them the moment that item turned up anywhere on the seed.

## game/tracker/derived-checks.ts

The derived pass of the completion sweep: the records that are true because of other records. A
combined event names the records it is made of (`derived`), a dungeon-wide event names a dungeon
and the kinds it sums (`derivedDungeon`), and a check the game keeps no flag for answers from a
vanilla `fallback`. Records are visited in dataset order, so a combined event only names records
that come before it; one pass is enough. `armed` lists the rows a seed has armed: their own taken
bit is the only answer, never a fallback.

## game/tracker/event-status

The live side of the reversible events: for every record with a `now` condition, whether it holds
this poll. Pure over a presence snapshot, the same language the simulator reads NPC presence
with, so a status is one declarative condition on the record and nothing else. It never touches
the completed set: an event that happened stays ticked, and this only says whether it is true
right now.

## game/tracker/flag-polling

Reads WASM memory to find which checks are completed. Detection is driven by each check record's
own `gameId`, never by a name-keyed table: this module only builds the live heap readers (with
the loaded room's live bits folded into its room word) and hands them to the shared sweep
(completed-checks-core), which the offline battery save reader feeds with file-backed readers of
the same shape.

- The event ledger and the story status bytes are read guarded: a core built before them has no
  export to call.
- The bed state is also read directly, for the window before the progress buffer is filled:
  save_dung_info sits at g_ram + 0xF000 (`SAVE_DUNG_INFO_RAM`), so the base comes off the room
  pointer, and the bed state byte is at 0x37C (`BED_STATE_RAM`).
- What the online room holds as done shows as done too (collected-checks).
- `PROGRESS_BYTES`, `OW_EVENT_BYTES` and `ROOM_WORDS` are how many progress bytes, overworld event
  bytes and room words the exports expose.

## game/tracker/inventory

Reads the 39 byte buffer from WasmGetInventoryState and turns it into a set of item ids. The set
is keyed by dataset id, never by display name. Names are not unique (two records share several
of them), so a name-keyed owned set loses records by construction; ids also mean the compiler
rejects a display string mistaken for an owned item. The slot to id mapping lives in item-ids.

- `bigKeys` is one bit per dungeon, the core's own big key word. `bombCapacity` is how many bombs
  the bag holds, zero only on a file that starts without a bag. `bombsEverHeld` is true once a
  bomb has ever been held (the ledger's bit). `swordAtSmiths` is the sword the smiths keep while
  `sword` reads 255: 0x80 or level, or 0 (smith_sword.c).
- Bow slot values 1 and 2 are one rung, 3 and up is two; the byte is not a rung count here.
- While the smiths keep the sword to temper it (sprite_main.c, the tempering payment) the game
  writes level 255. Read as a level that held every sword up to Golden, which completed the
  Pyramid Fairy's Golden Sword row the moment the smith was paid. The sword is still the
  player's, since it comes back at the pickup, so a row that asks for it must not drop out and
  come back. A payment made before the level was recorded (`SWORD_KEPT_UNRECORDED`) means a sword
  went over at an unknown level.
- Bombs are spent and found again all the time. Before the first one, a rule that asks for bombs
  is not met; after it, an empty count is a refill away, so it stays met as long as the player can
  carry any. The count alone would flip a dozen rows at every last bomb.
- The mirror counts at slot value 2; value 1 is the scroll before the upgrade.
- The top flute value replaces the plain one instead of stacking on it.

## game/tracker/item-ids

Raw inventory slot values to dataset item ids, never display names. Two sources only: the game's
`Link_ReceiveItem` index resolved through the facade (the dataset owns the join), and an explicit
id for items with no receive index (pendants and crystals are SRAM bits, not pickups). Resolution
is lazy (per poll) because a published dataset bundle can replace the records.

- `LADDERS` are progression ladders as native receive indices, weakest rung first. The raw slot
  byte counts rungs held, and every rung below is held too (a top tier sword still answers "any
  sword"). Bow slot values 1 and 2 are the plain bow, 3 and up adds the silver one on top.
- `BY_VALUE` covers slots where the raw byte selects one item instead of climbing a ladder. A
  bottle's value is its contents; the slot being non-empty is handled separately (`BOTTLE_SLOT`,
  an empty bottle).
- `SIMPLE` covers plain held or not held bytes. No record expresses bomb capacity (the dataset
  only has pickups), so the standard bomb pickup stands in for "carries bombs". The same gap
  leaves `ITEM_TO_TOKEN`'s bomb key unmatched.
- `MIRROR` is held at slot value 2.
- `PENDANT_BITS` and `CRYSTAL_BITS` map SRAM bits to ids for items never granted through
  `Link_ReceiveItem`. The pendants point at item-056, 057 and 058, the trio the Pendants group and
  the sage's `presence` and `requirements` name. Bit order follows the core's own
  kDungeonCrystalPendantBit (zelda_rtl.c) read against the receive id each boss grants
  (kBossFinishedFallingItem to kFallingItem_Type): 0x04 and 0x37 green, 0x02 and 0x39 blue, 0x01
  and 0x38 red.
- `BIG_KEY_BITS`: the core keys the word by dungeon index (kUpperBitmasks: the highest bit is
  index 0), and the castle's key can land under the sewers' index or the castle's own, so both
  bits name it.
- `addLadder` adds every rung up to `held`, so a tier byte yields its whole progression.

## game/tracker/normal-placement-ref.ts

Normal's placement, built once for the session. Nothing about it varies while the app runs: every
location holds what the unmodified game puts there, and no rng is drawn. Two tracker surfaces and
the simulator's picker ask for it, so it is built on the first ask and kept.

## game/tracker/record-row-inputs

What the file's own settings hand the rows that are read from the dataset. Two shapes, both off
the placement, so the plain game and a seed are set the same way:

- Overrides, for the three rows whose requirement is a setting: what the pedestal asks for, and
  the medallion each of the two gated entrances wants. Their rules cannot be written into the
  dataset because the answer moves with the profile. Any three dungeons has no single requirement
  to name, so the pendant count stands in for it. The medallion entrance's rule is human, armed,
  and carrying what this seed asks for.
- Grants, for the two tracker switches. A door whose key is held is open, and a room you carry a
  light into is lit, so the switches hand the reader the item instead of rewriting the rule. The
  seed's own accepted lights come in this way too: the records name the Lamp, and a player seeing
  by a Fire Rod on a seed that counts one reads as seeing.

`LAMP` is the one item every unlit room record names, so granting it is what "can see" means to a
record. `LIGHT_WORLD_CLEARED` is the combined event "All Light World dungeons cleared"
(records/checks/events/world.ts, n 283). `bigKeyItemIds` is every Big Key the dataset knows.
Nothing here comes from a second rule table; before this the same four answers came out of a
resolver that also carried a copy of every location rule.

## game/tracker/tracker-count.ts

Whether a tracker row counts toward the run's check total. The roster also lists rows that are
not checks: the event records (beating Agahnim, the frog, the smiths among them) and the status
only rows. Those stay in the list, but a total is its item locations only, which is what an
Archipelago room counts for the slot.

## game/tracker/tracker-roster.ts

The rows the app lists for a run, built once and read by every surface that lists them: the
Checks widget, the randomizer page's spoiler tab and the cheat console's Checks tab. On a seed
the roster is the seed's own: every record the placement names, plus a virtual row for each
location no record covers (shelves, chiefly), plus the event rows. No event is a location of a
seed, so the two lists never share a row. Without a placement it is the dataset's own list,
which is where the fairy rungs and the intro's story beats live: real rows that were never
locations of any world.

## game/tracker/tracker-statuses

Every check's status, from one engine, for the plain game and for a seed alike. Which reading
answers a row depends on the row, never on the mode:

- A row the world holds a location for is answered by the generator, over the placement handed
  in. Normal's placement is the one where nothing moved (normal-placement.ts), so the engine
  cannot tell the two modes apart.
- A row it holds no location for is answered from the dataset's own record, against the place
  the row happens at. That is every event, because an event is a thing that happened and no
  location of any world, and the fairy rungs while no pond sells them. On a seed those rungs are
  locations, so the same rule sends them to the engine instead.

The place comes from the engine too: its reachable regions, named as dataset screens
(logic/regions/reachable-screens.ts), so there is one graph. `fired` holds locations the session
recorded as taken where no check record could see it. `smallKeyDoors` off reads every small key
door as open (world/small-keys.ts). `trackerReachableScreens` gives the screens the engine says
the player can stand on.

## game/webgl/gl-helpers

Shared WebGL helpers for every fullscreen post process pipeline (shadow casting, edge glow).
Filter and draw mode are parameters so each pipeline supplies only what differs; `label`
prefixes compile and link errors.

## game/instantiate-wasm.ts

The WASM instantiation override that avoids `WebAssembly.instantiateStreaming`. That path
crashes the Electron renderer (0xC0000005) while compiling this module, which leaves the game
black the moment it starts. It was seen both over http (dev) and file (the built app) on recent
Chromium, so the non-streaming `WebAssembly.instantiate` is always used. The background warmup
usually has the module fetched and compiled already: when a cached compiled module exists it is
instantiated straight from it, skipping fetch and compile. Otherwise the bytes are fetched (also
cached by the warmup) and compiled here.

## game/wasm-bridge

The singleton core holding the Emscripten module reference and game state, plus a re-export hub
for the per-concern bridge facades (bridge). Every other game module imports from here to reach
the running module. The bridge modules import `getModule` and `getGameState` from here and only
call them at runtime, so the re-export cycle is safe.

- `UI_STATE_BUFFER_SIZE` (133) is the size of the UI state buffer exported from C; the last byte
  in use is 132 (core/game-hooks/ui_state.c).
- `subscribeGameState` replays the current state to a new subscriber, deferred one microtask so
  the caller's unsubscribe handle is assigned before a listener that calls it runs. Without the
  replay, a subscriber that starts waiting after the status already became `running` never sees
  the transition and hangs: useAutoTest and useSimRun call waitForRunning only once
  loadProfileForGame has resolved, which itself sets the status to `running`.
- `setInput` pushes a SNES input bitmask to the running module, called by the InputManager each
  frame. It stays self-contained (no import from bridge/wasm-call) so wasm-bridge has no static
  edge into wasm-call. That edge completed a two-way cycle which, combined with lifecycle's
  dynamic import of this module, could be evaluated as a second instance under the Vite dev
  server and desync the startGame re-entry guard.
- The raw host menu commands are re-exported here, but app code goes through game/host-menu,
  which is where the takeover's wanted state and the equipped item re-assert live.

## game/wasm-warmup

Background WASM warmup in three stages: inject the Emscripten glue (defines `window.Zelda3`;
built with MODULARIZE, so nothing runs until called), fetch the .wasm bytes (streamed over http,
one IPC blob over file), then `WebAssembly.compile` into a cached module that startGame reuses
(instantiate-wasm). `warmWasmCore` runs once and reports progress. Over file the bytes come as one
IPC blob with no progress; over http with no length header the progress is indeterminate.

## hub/hub-session.ts

The Electron adapter keeps the device token in the OS keychain through IPC. A host with no
main process (web, mobile) always answers signed out. The choice is made once, on whether
`window.api` carries the hub channels.

## hub/hub-session.type.ts

`signIn` resolves once the browser confirmed, denied, or the code expired. The confirm page
opens on `site`, or on the Sanctuary when it is omitted. The account and the token are the
same either way. `subscribeDeviceCode` delivers the user code to confirm while `signIn` is
pending.

## hud/active-profile

Which profile the HUD stores read and write. The answer is tried in this order:

1. The profile the settings screen says it is editing. It is the one place that knows for
   certain, and it clears the value when it lets go.
2. The running game's profile. The bridge only knows it while a game runs, and the layout
   editor works without one.
3. The profile a launch is pinned to (`--profile`, the named instance flag), matched by id
   and then by name the way `useStartup` matches it. It comes before the app state because a
   pinned launch does not write `app.json`, so the app state names some other profile.
   Reading that one would load one profile's layouts while the screen edits another's.
4. The app state's last selected profile.

## hud/custom-glyph-store

A custom glyph pack is an override, never a replacement. It holds only the positions the
player imported and names a built-in `fallbackPack`, so a pack with four face buttons still
draws shoulders, triggers and the d-pad through the chain in `resolve-glyph.ts`. Images are
stored like user sprites: raw bytes in the platform FileStore under the profile's folder,
with a JSON manifest beside them. A stored file has no URL of its own on either host, so the
bytes are read once into an object URL and cached; `customGlyphUrl` is the synchronous
lookup a render pass needs. Files are flat, one per pack and position, so the file name is
the key.

## hud/layout-document-io

Player layouts use the same document format and the same loader (`loadLayout`) as the
built-ins in `shared/hud/layouts/built-in/`. They differ only by the `builtIn` flag. A
stored document that does not validate is refused, never repaired: it is dropped from the
list and its reasons are kept in `problems`, so a screen can say which layout is broken.
Layouts are validated on the way out too, because the editor's draft is not a document until
it passes. The store file is `hud-documents.json`, not the old flat format's
`hud-layouts.json`; nothing shipped in that format, so there is nothing to migrate. Saving
upserts by id. A fork gets a new id and records `basedOn`, which the editor's start from
list reads. An unknown id resolves to the shipped default, since a stale id in a settings
file is far likelier than a request for no interface.

## hud/slot-content.ts

Three facts meet here and nowhere else: where a control sits (the device's slot list), what
it fires (the per save assignment table), and whether the save holds that thing (the live
inventory). It is one pure function because the live HUD, the pause menu and the layout
editor (which runs with no game) all need the same answer; an earlier editor copy drifted.

- Glyphs are binding first: a slot rebound to a key draws that key's cap. The synthetic
  `DPAD` position stands for a whole control and resolves through the renderer's own table
  in `HudNodeRenderer.constants.ts`.
- Item art comes from `buildItemCells`, as in the pause grid, which covers all 24 HUD item
  ids including the two cells that share a save slot and the four bottles.
- The action button is contextual (talk, lift, open, dash), so it wears no sprite. Only the
  sword names a fixed piece of gear, drawn at the tier the save holds and always as owned.
- `items` are the 20 inventory bytes and `bottles` the 4 bottle bytes, as the core reports
  them. `packId` is the document's pack or `auto` to follow the device family.
- `filledSlots` feeds the engine's `dimWhenEmpty`, which dims a whole group at once.
- `signature` changes only when an assignment moves (swapping two items counts) or a
  different pad is plugged in, the two events the on change reveal exists for.

## input/axis-press-threshold

The single place where a raw axis reading becomes pressed, shared by live play (the SNES
bitmask, function hotkeys) and by binding capture (the raw input dispatcher). A trigger axis
(SDL's fixed `LEFT_TRIGGER` and `RIGHT_TRIGGER` indices) uses the family overridable
threshold the calibration screen shows (`shared/input/family/live-control-state.ts`,
`resolveTriggerPressThreshold`), never a second number. Any other axis, such as a stick
standing in for a direction, uses a plain deflection of 0.5. Device keys are `vid:pid` in
hex; a device whose SDL type was not recorded this session uses the generic threshold.

## input/binding-display

One source of truth for a binding's label and icon, shared by the controls editor rows, the
save state hints, `InputGlyph` and the controller overlays. A bound control always draws a
glyph: one row of bare text beside rows with art reads as broken. Device art is preferred
and comes through `icon`, but it is missing when the pad is unplugged or its family has no
picture for that control, and an axis never stored an icon because its glyph depends on which
end of the stick is meant. So the generic fallbacks are keyed off the binding's own shape,
and only `none` draws nothing.

## input/controller-card-info.ts

Name and family come from the SDL driven resolver (`resolve-device.ts`), never from a hand
written database. `sdlType` is carried for the controls screen's apply console defaults drag
and drop, which resolves the defaults through the family layer.

## input/controller-device-groups.ts

Groups the snapshot by vendor and product id, so an adapter that presents one entry per port
renders as one group with a port list. The main process suffixes `#N` to the device key of the
second and later devices sharing a vid:pid (`sdl3-device-key.ts`); that is read back to number
ports. Unclaimed listed devices sharing a vid:pid never get a suffix (only SDL claimed devices
go through the assigner), so arrival order is the fallback. A blank product name falls back to
the first group member that has one.

## input/controller-devices-store

Thin wrappers for the SDL3 device list IPC: the ready and unavailable snapshot, rescan, and
the user mapping database. They sit beside `controllers-store` (the cross platform
`ControllerHost` port) because this surface is desktop only and has no port yet.
`window.api` is always present (the real preload, or a generated no op shim). `listHidDevices`
is the raw HID enumeration, independent of SDL claim state.

## input/controller-family-cache

The SDL gamepad type of every controller seen this session, seeded from the snapshot and kept
live by `controller:devices` and `controller:added` (`seed-device-cache.ts`). Family display
metadata (icons, labels, console defaults) is keyed by this type, so this is the only way to
resolve it for a saved binding or a drag payload whose device is unplugged. Recording starts
once at module load and is never torn down; the cache outlives any screen.

## input/controller-hold-store

Drops SDL's exclusive claim so a raw HID open can succeed (the diagnostics byte capture), and
restores it afterwards so normal joystick input comes back. Desktop only.

## input/controller-input-store.ts

Holds each pad's button and axis state, calibration and the diagnostic log the InputTester
reads. Decoding belongs to the SDL3 native transport.

- `getDevicesThatHaveReported` is not the connected set: SDL emits state only on change, so an
  untouched connected pad never appears. Connection state is the device snapshot
  (`InputManager.hidDeviceCache`, status `ready`).
- `handleRawReport` takes one HID report while a diagnostic raw capture is open
  (`native-capture-store.ts`). Only one capture runs at a time, keyed by vendor and product,
  so the `vid:pid` device key is rebuilt here.
- `rawSticks` are the raw 12 bit stick values `[lx, ly, rx, ry]` before calibration, for the
  calibration UI; `rawBytes` are the report bytes for the debug UI.
- The store is exposed as `window.__controllerInputStore`.

## input/controller-name-cache

Names for every controller seen this session, seeded from the snapshot and kept live by
`controller:added`. An event only listener never learns the name of a device connected before
it subscribed, since that device announces itself once. The OS product string is no
substitute: devices reached over a raw USB interface report it empty, which is how a pad
shows as "Unknown Controller". Names are keyed by device key and by vendor and product, since
a caller with a raw device list has ids but no device key. Blank names are ignored so a later
real one is not shadowed. Recording starts at module load and only listens.

## input/controllers-store

The facade for haptics and decoded controller state (the `ControllerHost` port) and for
calibration (FileStore). Raw HID enumerate, read and write have no desktop implementation any
more, because SDL3 claims every controller.

## input/device-detector

SDL3 is the only controller transport on every platform (the Gamepad API path is gone), so a
device is an SDL entry or the keyboard, and there is no activation step. The keyboard's
`sdlType` of `keyboard` is not a real SDL type but a stable sentinel, so the apply defaults
drag can tell it from a gamepad. Mice, trackpads and touchpads are filtered out by name.

## input/device-scoped-map

A binding lookup keyed by the device that created it, then by the binding key (a button
index, or `axisIndex:direction`), so a binding recorded on one pad never fires from another
pad with the same index. A binding with no source device (console default presets never stamp
one) is filed under `ANY_DEVICE` (`*`) and matches every gamepad.

## input/frame-router.ts

Where one frame of input goes. The first question is whether the host owns the pause menu,
not which scheme is active: while it does, the native Start branch that would close the menu
lives inside the function the host's hold returns from, so only a menu verb read here can
close it. Routing on the scheme first made Classic plus Enhanced a soft lock. Routes, in
order:

1. Menu open, any scheme. The frame is read as functions, turned into rising edge events for
   the menu, and the core gets a zero mask: the core keeps the last mask it was handed, so not
   calling would leave the player walking under the menu. Contract section 11 shares a button
   between a menu verb and a gameplay slot, so slots parked under a verb the menu consumes are
   named and their edges dropped; otherwise changing screen would also assign what the cursor
   is on. With no lens at all (an unassigned profile) the core is still zeroed. The edge
   baseline is last frame's read, except on the frame after a handover (`edgeBaseline`), so a
   button held from the press that opened the menu does not rise again. The shadowed slots are
   recomputed per menu frame; caching would add one more thing to invalidate on a rebind.
2. Modern, menu closed. The frame is remapped to a console mask, and if a pressed slot holds
   an item the save actually has, the equipped item register is written first. The core reads
   the register on the frame Y is pressed, so writing it after the mask would fire the
   previous item once on every switch. An active item of 0 means leave the core's own item
   alone; it is not an item id.
3. Classic, menu closed. The console mappings become a bitmask that still goes through the
   strategy table, because `mapOnSelect` is a real setting and its swap lives there.

The fallback lens is the profile's core verbs alone, which every profile carries (contract
section 5). Its slots are empty, since under classic a slot is not something the player can
fire.

## input/function-actions.ts

Shortcut and cheat bindings fire callbacks on rising edges from keyboard and gamepad. Saved
mappings are merged with the defaults so a newly added action always has a binding. Gamepad
maps are scoped by owning device. `clearHeld` releases every held action, so a hold style
action (turbo) is let go even when its release is lost while input is suppressed mid hold.

## input/haptic-bridge

Connects the game core's haptic events (`window.__onHapticEvent`) to controller vibration.
Overlapping events are coalesced into one active envelope so the HID worker (a synchronous
open, write and close per request) is not flooded: with the motor off the event is sent at
once, a stronger event interrupts, and a same or weaker one is dropped while the motor runs.
About 20 ms is added for the worker's own overhead.

- One switch per profile (`GameSettings.hapticsEnabled`). When on, targeting narrows to the
  profile's own mapped devices, read fresh on every send so a profile switch or rebind
  applies at once.
- Connection comes from the device snapshot, because SDL emits state only on change. Sending
  is deliberately not gated on `hasRumble`: SDL can under report it, and a silent native no
  op is safer than a false flag silencing the feature.
- The family strength curve, the user amplification override and a minimum duration floor
  are resolved from the SDL type recorded at connect, and combined in
  `vibration-shaping.ts`.
- `previewHapticPattern` fires one pattern at one device, bypassing the mixer, cooldown and
  targeting (a calibration screen test must always fire), with the same scaling and shaping
  as gameplay so the felt strength matches.
- The platform's device vibrate buzzes a phone; it does nothing on desktop.
- In dev builds a once a second console line counts core hooks, events, dispatches and
  merges.

## input/input-manager

The renderer input engine. Its fields are public so the helper files can operate on the
instance. Lifecycle: create, `start`, `stop`, `start` again.

- `profiles` holds every saved input profile so the profile cycle shortcut can switch the
  active one during play. `allowed` lists the devices the active profile's map references;
  the input gate lets only those through.
- Input is eligible while the window has focus. An automated launch never shows its window,
  so `hasFocus` stays false and synthesized input would go nowhere; there is no person to
  protect, so the gate does not apply there.
- Connected pads come from the device snapshot, not from reported input: SDL emits state only
  on change, so an untouched pad would be invisible and could hold a disconnect pause open.
- Escape is never game or function input; the app level menu toggle owns it. Ctrl and Cmd
  chords (copy, paste, select all) are never game input either, so copying selected log text
  works; the modifier key's own keydown still routes in case it is mapped.
- On start, a mapped pad that sends data again resumes a disconnect pause. A device poll every
  two seconds is the safety net for a reconnect that fired no event; it only resumes, never
  re-pauses, so a manual resume of an absent pad stays resumed.
- Raw HID bytes flow only while a raw capture is open (the calibration wizard), so staying
  subscribed is harmless. Controller names and SDL types are announced once at connect, so
  their caches start here, not in whichever screen imports them.
- The scheme bindings are rebuilt when the snapshot arrives, because it comes after the
  profile is set; otherwise a pad profile keeps the null bindings it had on the frame it was
  applied and the modern scheme never engages.
- Cycling the active profile changes the mapped device set, so presence is re-evaluated:
  pause if the new profile's pad is absent, resume if present.
- `cheat-health` heals to the capacity the player has earned: the core clamps the request to
  the heart capacity, so asking for the ceiling (160, twenty hearts) never raises it.
  `cheat-max-health` is the separate action that also raises the capacity.
  `cheat-ignore-collision` toggles and shares its state with the Cheats widget switch.
  Every `cheat-*` action is rebindable under Settings, Controls, Cheats (issue 130).
- Debug capture is an ordinary rebindable function action, never a hard coded key.
- Turbo is a hold: the rising edge engages it, the falling edge lets go. The setting is checked
  on press, and the core also refuses to leave real time while its speed is 100. A hold can
  lose its release (input suppressed under a menu, focus lost mid hold), so both paths release
  turbo explicitly.
- The manager is exposed as `window.__inputManager`.

## input/item-ownership

Does the live save hold this item? The scheme layer is pure and has no inventory, and
assignments are stored per profile, not per save, so a fresh file inherits buttons pointing at
items it never found. Pressing one used to park the equipped item register on an item the
save does not have, while the pause menu refused that same cell. The answer is
`buildItemCells`' own `owned` flag, the same function the pause grid and `planAssignment` use,
so the press and the menu cannot drift. It lives in the input layer because the router is the
only place holding both the pressed slot and the live state. The UI store publishes a new
inventory object on most frames, so identity is useless as a memo key; the 24 bytes are
compared instead and the cells rebuilt only when the inventory moved. Item ids are 1 to 24.

## input/migrate-profiles

The door every stored input profile comes through, and the only place a slot list written
before contract section 19 (position derived ids such as `slot:NORTH`) becomes numbered
slots. Profiles are read as `unknown` and cast; without the migration a stale list would pass
as the new shape with every `index` undefined. It fails loudly: a shape it cannot read throws,
and the profile is dropped from the session, not half loaded, so nothing overwrites the file
and the assignments can still be recovered. An empty list would look like "never made any",
which is the silent loss the rule prevents. One unreadable profile does not cost the others.

## input/native-capture-store

Wrappers for the SDL3 diagnostic capture IPC: raw HID bytes and joystick level button, axis
and hat samples, keyed to whichever capture the gamepad diagnostics wizard has open. Desktop
only.

## input/pause-manager.ts

Pause state for a controller disconnect or a manual toggle. It only emits events; audio is
handled by subscribers. `connectedKeys` is passed in, not read from the device cache, which
lags a disconnect by a refresh cycle. A disconnect pause resumes only once every mapped device
is back, so an unrelated controller cannot dismiss the overlay, and a manual pause is never
touched by presence checks.

## input/polling-engine.ts

Computes the SNES bitmask each frame from keyboard state and HID state. Keyboard keys count
only when the active profile binds the keyboard, and only devices in the profile's map
contribute.

## input/process-controller-state.ts

SDL3 controller intake. The native addon already decodes and factory calibrates reports into
normalized values, so the old per device HID parser is bypassed. Trigger calibration applies
here, on the normalized 0 to 1 range of the trigger axes (from `LEFT_TRIGGER` on); sticks
arrive normalized to -1 to 1.

## input/profile-devices

The whitelist the input engine gates on: a keyboard when the map has keyboard bindings, and
gamepads whose vid:pid appears in the map or as the assigned device. A connected but
unmapped controller contributes nothing. Keys are lowercase, four hex digits each.

## input/profile-utils

`resolveIconByVidPid` resolves a saved binding's icon through the family layer. The device
need not be connected, only its SDL type from this session's family cache; a live SDL type
fills in when the cache has no record (a device that connected before the cache listened). It
builds the synthetic profile that assumes every position is present, so a binding index always
lands on the same slot whatever a live unit has. A trigger axis shows its own glyph; a stick
axis shares one base key between X and Y, so the binding's axis and direction pick one of the
four pushed glyphs.

## input/raw-input-dispatcher.ts

Rising edge events for any key, button or axis on any device, for the rebinding UI and the
input tester. Keyboard presses call `emit` directly.

## input/resolve-bindings

A profile resolved into the two lenses the router reads. The modern lens maps physical
controls to assignable slots and only the modern scheme uses it; a pad profile whose pad is not
connected and has no stored record resolves to null, so a disconnect means no slots, not
phantom ones. The core lens is the ten verbs, four of them the menu's, and it exists under both
schemes (contract section 5), because the pause menu can be open under classic and its verbs
are the only way out. The modern lens is built on the core lens, so a core and a slot list can
never disagree about who owns the d-pad. Core resolution order: `profile.core` (where a core
rebind lands), then the modern block's copy, then the device defaults. The slot list is the
player's, stored on the profile (contract section 19); `effectiveModernBindings` falls back to
the device prefill only for a profile never edited.

## input/resolve-device.ts

The single resolver both the calibration cards and the controls screen use. SDL's own
`hasButton`, `hasAxis` and `buttonLabels` decide what exists; the family layer only decides
labels and icons. No preset and no device database is consulted, so the screens cannot
disagree. An unavailable entry was never opened by SDL and resolves to an empty control list.

## input/resolved-axis-groups.ts

Pairs stick axes by position name (`LEFT_X` with `LEFT_Y`), not array order, so a device
reporting one axis of a pair does not misalign the rest. `basePrefix` is the icon key both
axes share; feed it with the live x and y to `resolveStickDirectionIcon`.

## input/scheme-runtime

Everything the per frame router needs about the active scheme, in one mutable object. The
scheme, the bindings and the per save assignments change at different times (profile,
settings, pause menu), but polling runs sixty times a second and must not ask any of them, so
they are pushed here.

- `menuSink` is the routing switch: while open, the pause menu owns input and receives rising
  edges; the store that owns the menu opens and closes it.
- `core` holds the ten core verbs under either scheme, which is what makes the menu answerable
  to a classic profile or to a modern one whose pad is missing. `mapOnSelect` is classic only
  (the map opens on Select instead of X) and is carried so the remap is called uniformly.
- Edge baseline: normally last frame's read, but after a handover (menu open or close, a scheme
  change, a rebuild of the bindings) it is seeded from the current read, never cleared. A
  cleared mask claims everything was up, so the button still held would rise as a fresh press:
  the press that opened the menu would close it again, and leaving the menu would hand the game
  a phantom press. Clearing made a normal press on pause a soft lock.
- `onSchemeBindings` fires at once with the current value, because bindings resolve at boot,
  before the modules that care are loaded. The renderer draws the button cluster from the
  resolved bindings, not the profile, since a profile never opened in the controls screen has
  no `modern` block.
- Resolutions are compared by serialized value: the device snapshot is re-taken on a timer and
  every resolution is a fresh object, so identity would reset the edge source under a held
  button and redraw the cluster each second. The core lens is compared on its own, since it can
  move while the modern lens does not.
- The input sample includes only allowed devices, like the classic path. The trigger threshold
  is the first allowed pad's, since a mixed pad session shares one reading.

## input/seed-device-cache.ts

Seeds a per device cache from the controller snapshot, then keeps it live with
`controller:devices` and `controller:added`. Three caches once listened to
`controller:added` alone and never recorded a device connected before they subscribed. Snapshot
entries and added events both satisfy `DeviceSnapshotFields`; `remember` decides whether an
entry carries enough to record.

## input/snes-button-glyph.ts

The picture and name of whatever input a SNES button is bound to: keycaps for a keyboard
profile, the pad's own face buttons for a controller profile, resolved like the Controls
screen's rows. An unbound button falls back to the SNES button's own picture.

## input/useControllerDevices.ts

Device list state for both input diagnostic screens. A rescan stays pending until the next
snapshot arrives or three seconds pass, so a rescan click never looks like it did nothing.
There is no loading flag: the main process serves `controller:list` from a cache it keeps
current (`sdl3-source.ts`), so the first fetch resolves in well under a millisecond.

## input/vibration

A transport free vibration call. SDL3 batches frame writes through the main process worker for
every gamepad; the Gamepad API vibration path is gone. Default intensity is 0.7.

## instance

The renderer's view of the named instance flags (`--instance`, `--profile`), forwarded by the
preload as `api.instance`. A named instance is an automated launch running beside the user's
own app: it is marked on screen and boots into its own profile, and it must not write files
every launch shares (see `setLastProfile` in `storage/profile-store.ts`). Values are read at
call time, never cached; `window.api` is installed before render. `isAutomationLaunch` is
true for any automated launch, named or not. Such a run must not change which profile opens
by default (`app.json`) or where the window sits, and gating on it means a run that forgot
`--instance` still cannot damage the user's setup.

## log-bus

- The ring keeps 1000 entries, enough for a whole randomizer session start burst (a full
  plan application logs about 500 entries).
- A listener that throws is skipped so it cannot break the bus.
- Every entry is mirrored to the native console, unconditionally, so the main process file
  logger (`apps/desktop/electron/lib/dev-file-logger.ts`) captures the channels. It used to
  depend on `import.meta.env.DEV`, which is fixed at build time, while the file logger
  attaches on `is.dev` at run time; an unpackaged run of a production bundle then wrote no
  channel lines, the one case a crash log is for.
- WebAssembly `RuntimeError`s are left to the lifecycle crash handler and never logged by the
  global handler: they would flood during the game loop.
- `window.__logEntries` and `window.__logSubscribe` are exposed for Playwright and devtools.
  A burst safe capture needs a listener, since the ring drops old entries.

## msu/build-channels

Turns a pack manifest into the four channels the engine drives. Music comes from `tracks`,
the other three from `sounds`; a pack with no sounds gets three empty channels. Music and the
ambient bed follow the music volume and the effect channels follow SFX; the bed has its own
group so a storm can sit under quiet music. Each channel keeps 48 decoded programs: music
tracks are minutes of PCM, so a handful covers area churn, while effects are short and a
channel may cycle through dozens in a fight, so keeping more beats decoding a bonk per hit.
Effects have no per trigger callback, since logging every trigger would bury every other
diagnostic; the channel's `report()` is how the studio watches them. Music restarts on a
repeat: the game's own repeats are filtered before they arrive, and the one that does arrive
follows a fade to zero and is meant to bring the music back.

## msu/channel

One replaceable sound chip channel, in the two behaviours the game needs. Music and the
ambient bed are stateful (a new id replaces the old and has a position worth resuming); the
two effect channels are additive (a new id layers over what is sounding, nothing resumes).
The engine holds four channels and never asks which is which.

## msu/channels/active-layers

Builds, reads and tears down the layers of one sounding program: a gain at the layer's
volume, a scheduler for its play mode, and a voice factory bound to that gain.

- `chance` absent or at least 100 always sounds (every layer authored before the field
  existed). Every roll goes to the debug bus, because a lost roll starts nothing and the bus
  is its only record. A thinned layer is skipped outright, not started silent, so it holds no
  voice or timer and never shows as sounding.
- The chain is volume, then the layer's effects, then the channel. Effects sit on the layer
  because the chain is where one recording becomes its indoor or distant version.
- The loop start applies only to a single file layer; a pool restarts every file from its
  top. The exporter follows the same rule, so a pack sounds the same either way.
- The resume callback gives a music layer its resume snapshot and an additive layer the file
  picked for this trigger; the file count is what decoded, possibly fewer than authored.
- A set is finished when nothing is audible and nothing is scheduled. A random or interval
  layer between events reports a countdown, so it is never swept mid cycle.

## msu/channels/additive-channel.ts

Every trigger layers over what is already sounding, as the two effect channels do: each
trigger gets its own voices and gain path, so ten hits in a row are ten overlapping sounds.
Reusing the stateful behaviour would make rapid effects clip each other mid sample. Nothing is
resumable; a save has no half a bonk to return to.

- At most 16 trigger sets sound at once per channel. The sound chip had eight voices for
  everything, so a real pack never comes close; the cap is for a long file authored onto a
  rapid fire id, which would otherwise stack a set every frame. Over the cap the oldest set
  goes, since the newest is the one the player just caused.
- The game's pan bits arrive on the channel write: `0x80` left, `0x40` right, anything else
  centred. Only additive channels honour pan; a bed re-panned mid loop would need its graph
  rebuilt. A centred trigger feeds the channel gain directly.
- Only a stop bumps the generation, so a decode still in flight cannot spawn after teardown.
- Finished sets are swept before counting, so the cap counts what is audible. The report
  describes the newest set, the sound that just landed.

## msu/channels/channel.type.ts

- `fadeNode` is the gain the game's own volume transitions act on. Only music is ever sent
  one; the others hold it at full so every channel has the same three stage gain chain.
- `restartOnRepeat`: off, selecting the id already playing is a no op (the chip's behaviour
  for a port rewritten with its own value, which the ambient bed needs); on, it restarts,
  which music needs after a fade to zero.
- `resumeEnabled` is read per selection, so a mid session toggle applies at once.
- Programs sharing a `group` hand playback across on a switch (`MsuSoundDef.syncGroup`).

## msu/channels/stateful-channel.ts

A new id replaces what is playing (music, the ambient bed). A generation guard stops a slow
decode from resurrecting a superseded id. The position is captured on the way out, so leaving
an area remembers where its audio was, and the gain returns to full the moment something
starts. Id 0, or an unauthored id, means silence.

- A repeat of the playing id is a no op unless `restartOnRepeat`: the game rewrites the ambient
  id on every screen transition, so otherwise the rain would restart at every edge. Music's
  only repeat follows a fade to zero, and only a fresh start brings its gain back. A repeat of
  the id still decoding is absorbed the same way, since the game writes ambient ids in bursts
  and a second write would supersede the first start and the position it carried.
- When the outgoing and incoming ids share a sync group, layers are matched by what they play
  (files and mode), not by id, and a matched layer continues from its exact position, pending
  timer included, so a storm crossing a doorway keeps its rain and its next thunder. This
  continuity outranks the resume setting.
- Positions are always recorded; the resume setting only decides whether re-entry uses them.
  `forget` clears them without touching what is sounding.
- The studio polls `report` so a random scheduler's wait shows as a wait, not an unexplained
  silence.

## msu/channels/trigger-pool.ts

Which file each layer of an additive channel uses for this trigger. A sword swing authored
with four recordings should sound like four recordings. The variation belongs to the trigger,
not the play mode, so it is chosen here and handed to the scheduler as the starting file; the
continuous modes already draw from their own pool. A file is drawn from every file except the
one the layer just used, since the same sample twice reads as broken variation. It is
deliberately unseeded; only the exporter, which must produce the same bytes twice, needs a
seed.

## msu/debug-bus

The engine's own diagnostic feed for decisions no live report can show. A channel report
says what is sounding and the core's sound trace says what the game raised; the chance roll
sits between them, and a layer that lost its roll appears in neither. Without this feed a 10%
thunder looks like a broken one. It lives outside React and is always on: publishing to
nobody costs nothing, and a bad listener never breaks playback. A roll event names the
channel, the program (track number or sound id), the layer and its odds (1 to 100).

## msu/decode

- `decode-audio-file`: three paths, picked from the file's leading bytes, not its name.
  MSU-1 `.pcm` is raw samples converted here (with a loop point in its header); `.opuz` is
  Opus in the decompilation's own container, repackaged as Ogg so the browser can decode it
  (with a loop point too); everything else goes to the browser's decoder (wav, mp3, ogg,
  flac, opus). An AudioBuffer keeps its own sample rate and the graph resamples to the
  device rate, so the C player's bug of 48 kHz audio playing fast cannot happen here.
  `decodeAudioData` detaches the buffer it gets, so it is handed a copy; the caller's bytes
  may be a view into an array we do not own. `loopSample` is in samples at the buffer's rate.
- `decode-opuz.ts`: `.opuz` is played by repackaging, not by decoding ourselves. Its payload
  is ordinary Opus and Chromium has a decoder that only lacks this container, so each range's
  packets are wrapped in an in memory Ogg stream. Each range is its own stream because a range
  is a seek, and the decoder must start clean, as the C player reset its decoder before every
  seek. Dropped samples are trimmed here, not declared as pre-skip, so trimming happens once.
  Ranges are laid end to end into one buffer, which turns the container's jump back into a
  plain loop point. Decoding uses a private 48 kHz context so no resampling shifts sample
  counts.
- `ogg-crc32.ts`: Ogg's CRC-32 shares only the polynomial (`0x04c11db7`) with the zip and PNG
  CRC: it reflects neither input nor result, starts from zero and applies no final xor. A
  stock CRC gives a number a demuxer silently rejects, and the stream decodes to nothing. The
  checksum covers the whole page with its own four bytes set to zero.
- `ogg-opus.ts`: wraps bare Opus packets in an Ogg stream so the browser can decode them, with
  no codec, library or wasm. The layout follows RFC 7845: `OpusHead` alone on the first page,
  `OpusTags` alone on the second, then audio. A page states its length as lacing bytes (255
  per full 255 bytes, then the remainder, so an exact multiple needs a trailing zero) and
  holds at most 255 of them. Packets are at most 1276 bytes and never split across pages.
  Granule positions count 48 kHz samples from the start, and the last page must be flagged end
  of stream or a demuxer keeps waiting. The head uses output gain 0 and channel mapping family
  0 (mono or plain stereo); the tags packet has no user comments.
- `opus-packets.ts`: a packet's length comes from its TOC byte: mode and bandwidth in the top
  five bits, frame count in the bottom two (code 3 puts the count in the next byte). Frame
  sizes are 10, 20, 40, 60 ms for speech configs (0 to 11), 10 and 20 ms for hybrid (12 to
  15), and 2.5, 5, 10, 20 ms for music configs, all in 48 kHz samples.
- `parse-msu1`: the MSU-1 `.pcm` container is the 4 byte "MSU1" magic, a 32 bit little endian
  loop point in samples, then interleaved signed 16 bit little endian stereo at 44100 Hz. Every
  MSU-1 emulator and flash cart reads it, so it is what we parse on import and write on
  export. A loop point past the end resets to 0.
- `parse-opuz`: the upstream `.opuz` container, built so a player can seek to the loop point
  without decoding from the top. All fields are little endian. `+0` u32 magic "OPUZ"; `+4` u32
  unused here (the sibling `.pcm` keeps its loop point there); from `+8` a range table of ten
  byte records: u32 file offset of the range's packet stream, u32 samples to play, u16 flags
  (bits 0 to 13 samples to drop first, bit 14 looping restarts here, bit 15 after this range
  jump back to the bit 14 range). A record without bit 15 continues at the next record; an
  offset of zero ends playback. Ranges may overlap, because the loop range starts a little
  ahead of the loop point and its drop covers the difference, which lets the decoder resume
  without a seam. A packet stream is u16 framing (bits 0 to 14 length, at most 1275; bit 15
  means the first byte was left out and is `0xFC`) then the packet. `0xFC` is fullband stereo
  in 20 ms frames, which nearly every music packet uses. Audio is always 48 kHz stereo.

## msu/engine.ts

The single entry point for replacement audio; nothing above it touches an audio node. The
gain chain, innermost first: per layer volume, the game's own fades, the volume group (music
and ambient follow the music slider, effects the SFX one), then the shared output. The stages
are separate so a fade cannot clobber a user setting and the reverse.

- The ambient bed has its own volume group: it is neither music nor a one shot, and the
  setting exists to hold a storm under a quiet piece.
- The game's music control byte: below `0xF0` selects a track (0 is silence), `0xF1` to `0xF3`
  are volume transitions, and the rest of `0xF0` and up only concerns the sound chip.
- A track faded to silence is still active in the graph, but reporting it as playing would make
  the game skip the re-select that brings the sound back, so a faded track answers not playing.
- The title reset runs before the select, so the track this event starts begins fresh.
- Track ids are remapped (deluxe packs) before comparing, so two areas sharing one vanilla
  byte compare as different music where the pack differs.
- Game sounds arrive on channel index 0 (ambient), 1 (sfx1) or 2 (sfx2); only claimed ids
  arrive.
- A save's audio snapshot holds music plus the bed; effects have no position. On restore an
  `ambient` of `undefined` comes from a snapshot taken before beds were resumable and leaves
  the bed alone, while `null` means the save had none.

## msu/export

- `dedupe-files.ts`: packs collect byte identical duplicates (a `wind.flac` copied per area, a
  silent stub under a dozen names); storing one copy is free and on a gigabyte pack decides
  whether it can be shared at all. The map covers every referenced name, so a manifest rewrite
  maps each reference unconditionally. A missing file aborts the export with its name, rather
  than producing a pack that fails on import.
- `export-msu1`: a plain MSU-1 set for other players, named per the SD2SNES convention
  (`<base>.msu` plus `<base>-<track>.pcm`), which snes9x 1.55 and up, bsnes and higan, the
  FXPak and MiSTer all look for. The `.msu` file is an empty marker. Layers cannot survive (MSU-1
  is one stream), so every track is flattened first. A track whose files are all missing is
  skipped, since a header only `.pcm` would play silence. Entries are stored, not deflated: PCM
  barely compresses and a set is gigabytes. The stem becomes a filename, so path characters are
  removed. One decode per distinct filename per track.
- `export-msul`: `.msul` is our own container and the only format that keeps a pack whole
  (layers, play modes, volumes, loop points, metadata). It is a plain ZIP under another
  extension, so a user can rename it and read `pack.json`. `pack.json` is the first entry (a
  reader identifies a pack from the head of the file) and the only deflated one; audio is
  stored. Every file in the pack folder is stored, wired or not, since an export that followed
  references alone once left an unwired bed behind. Referenced names come first so dedupe keeps
  a wired file under its own name and drops the unwired copy. The manifest is serialized by hand
  so `modifiedAt` is not restamped; export must be reproducible. The rewritten manifest's
  `files` is the archive's own inventory. A later pass may transcode per layer Opus presets
  between dedupe and entry building; dedupe has to stay ahead of it so identical sources encode
  once.
- `fade-envelope`: the same envelope `voice.ts` gives a live voice, duplicated on purpose because
  the two run on different clocks (live starts at `currentTime`, offline at a computed time). Any
  change to the voice envelope must be mirrored here or an export stops sounding like its
  preview. A fade out never starts before the rise finishes. No fade means no gain node.
- `flatten-track`: MSU-1 is one stream on one track register, so export mixes the layers
  offline at 44100 Hz; layering survives only in `.msul`. Every random choice comes from a PRNG
  seeded by the track number, so two exports of the same pack are byte identical. The loop
  point is normally 0: the render window is one pass of the loop layer. The exception is a track
  whose body is a single file with its own loop point (every classic pack track): that layer
  renders as one pass and its loop point goes into the header, so the player does the
  intro then loop natively. Other layers in the intro region are heard only on the first pass,
  which suits a sting and thins an ambient layer. A crossfaded loop layer exports with loop point
  0, since live crossfading restarts each pass from the top by hand; every crossfade inside the
  cycle is reproduced and the wrap from the last frame to frame 0 is a hard cut, the same seam a
  zero crossfade pack has. Fading the ends would dip at every loop, and folding the tail into
  the head only works for a sequential pool.
- `layer-window`: the loop layer's pass is the loop period; other modes are placed inside it. A
  track with no loop layer uses the longest span any layer occupies. The render is capped at
  ten minutes because a manifest is user authored. Crossfades are floored at zero and otherwise
  taken as written (the editor's ceiling is not re-applied, or a render would stop matching its
  preview), and clamped per file to half its length like the live scheduler. A crossfaded cycle
  is shorter than the sum of its files by one window per file. The dominant loop layer is the
  longest one, the only one whose loop point can survive the flatten.
- `place-source`: the primitive every export mode schedules through. A fading source gets its
  own gain node, like a live voice. At most 4096 sources per layer, so a zero gap cannot spin
  forever. `singlePass` plays the pool once for the layer whose loop point is carried into the
  header.
- `prng`: mulberry32, because `Math.random` cannot be used on the export path. One stream per
  layer is derived from the track seed, so adding a layer or changing a file count does not
  shift the choices of the layers beside it.
- `remap-manifest`: the half of dedupe that is easy to get wrong. There are exactly two
  reference sites, a layer's `files` and the cover image. Layers live in both the music slots
  and the sound channels, so the walk goes through `mapLayers`; an export that listed only the
  tracks once shipped a bed naming a file that was never written. An unmapped name keeps itself.
- `schedule-layer.ts`: unrolls each live scheduler's rules into start calls. `random` waits a
  gap before its first event, like the live one; the gap is drawn either way so
  `waitForCompletion` changes only spacing, not the sequence of choices; waiting for completion
  measures the gap from the end of the sound. `interval` walks its offsets as a cycle as long as
  the last offset, each offset using the file at its position; offsets all at zero fire once.
- `schedule-loop`: without a crossfade, passes butt together and a single file repeats from its
  own loop point (a manifest loop point is in 44100 Hz samples whatever the file's rate); a
  pool restarts each file from its top. With a crossfade, a pass starts one window before the
  previous ends and rises while that one falls; the outgoing fade lasts the outgoing file's
  window and the rise the incoming file's; every pass starts at the top of its file; the opening
  pass does not rise. Random order never repeats a file twice running.
- `write-pcm`: the inverse of `parse-msu1`. The loop point is in frames (a left and right pair),
  not bytes. Always stereo (mono is duplicated, wider keeps the first two) and always 44100 Hz.
  Samples are clamped before scaling by 32768, since a hot mix would otherwise wrap into the
  opposite polarity as a click. A loop point past the end is clamped.

## msu/fade

The game asks for volume transitions with three control bytes, not a level: `0xF1` fades out,
`0xF2` ducks to a low level, `0xF3` returns to full. Each has its own speed, a per frame step
out of 256 at 60 frames a second, converted to a ramp duration so a fade takes the same wall
time as on hardware. A starting track returns to full at the fastest step (24).

## msu/layer-effects

Every effect is one or more biquad filters, the whole vocabulary the manifest allows, so it
plays the same everywhere and can be flattened into an export. The three band EQ is a low shelf
at 250 Hz, a peak at 1 kHz (Q 0.7, about an octave and a half) and a high shelf at 4 kHz. An
empty chain is no nodes at all.

## msu/schedulers

The strategy seam for layer playback: each play mode is one scheduler, and `create-scheduler`
is the one place modes map to behaviour.

- `once`: plays one file and stops; a finished one shot resumes from the start, not its tail.
- `loop`: one file loops on itself; several play in order or shuffled, never the same file twice
  running. `single` ignores any crossfade. With a crossfade the passes are chained by hand
  (each fades out over its last window while the next rises), giving up gapless native looping,
  so a zero crossfade keeps the simpler path. Repeats start at the loop point, since the intro
  plays once. The position readout follows the newest voice, and the reported loop point is the
  scheduler's own, since a crossfaded buffer does not loop.
- `random`: fire, wait a random gap, fire again. The gap is measured from the start of a sound by
  default (long sounds overlap) or from its end with `waitForCompletion`. Resume keeps only the
  remaining gap, so the next event is not bunched against the previous one. While waiting for a
  sound to finish there is no countdown to show.
- `interval`: fires at fixed offsets from the track start (a thunderclap eight seconds in),
  repeating as a cycle once the last offset passes; wrapping gives a gap of cycle minus previous
  plus next. The offsets are sorted and deduplicated because order is meaning. With one file per
  offset each offset gets its own sound. Resume re-enters the cycle at the same point.
- `LayerContext.loopSeconds` is where each repeat starts, from the manifest or the file, and is
  zero unless the layer has exactly one file, matching the exporter.

## msu/sound-claim

Which sound ids a pack claims on a channel, as the 64 bit mask the core wants. The core reports
only a sound whose bit is set, so the mask decides whether the app replaces an effect or the
chip plays it. It travels as two unsigned 32 bit halves because that is what a `ccall` can
carry; bit 31 makes a JS int negative, so each half is converted to uint32. Ids outside 0 to 63
are dropped, never wrapped, so a typo claims nothing. Channels are in the core's index order:
ambient, sfx1, sfx2. Only sounds that author at least one layer are claimed.

## msu/title-reset

Replacement audio goes back to nothing at the title. Resume positions carried across runs would
start the opening in the middle of itself. The game ends a run by reloading the sound chip's
song bank, which stops the chip's ambience without raising the no bed id, so a storm would keep
raining over the title. Reaching a title module is the one unambiguous signal that no run is in
progress, and save and quit, a game over and a hard reset all arrive there. The modules are the
core's own dispatch order (`kMainRouting`), the same set `game/ui-bridge-parser.ts` reads as the
title UI mode: intro (0), file select (1), copy file (2), kill file (3), name file (4) and the
attract demo (20). Music is not silenced: every path to the title fades it out first
(`Death_Func31` and `FadeMusicAndResetSRAMMirror` write the fade byte the same frame), so a cut
would replace that fade with a click. Silencing happens once on the way in; forgetting
positions happens on every title event, since the title loops into its demo and back.

## msu/track-loader.ts

Audio is decoded per id, on demand: a real pack is over a gigabyte of PCM and only a few ids
sound at a time. Decoded audio is cached so re-entering an area or repeating an effect does not
decode twice, capped so a long session cannot grow without bound. One loader per channel, so a
busy effect channel cannot evict the music. A layer whose files all failed is dropped rather
than left to play silence.

## msu/voice.ts

One sounding buffer that can report its position, which Web Audio does not expose; that read is
what makes resume possible. A voice asked to fade gets its own gain node, so two passes of a
loop can move in opposite directions without touching the layer's volume. The manifest's loop
point overrides the file's: it is what gives a `.wav` or `.mp3` the intro then loop structure
only an MSU-1 header can carry. It is in seconds, because a manifest loop point is defined at
44100 Hz while a `.pcm` header's is in the file's rate; the caller converts. An MSU-1 loop point
is normally not zero (an intro plays once, a body repeats), so the position jumping back there is
the file working as authored.

## randomizer-placement-io

Typed wrapper around `profiles/<id>/randomizer.json`. The placement is written under a schema
stamp and read back only under that same stamp; a file under any other stamp reads as
absent, so the caller generates a fresh seed. There is no migration and no key map: the
stamp is bumped whenever the placement's shape or its location keys change.

## sanctuary/github-handle.ts

The linked GitHub login is the one identity a filed issue mentions.

## sprites/apply-sprites-for-rom.ts

The enhanced HUD reads sprites from the shared base, so the base must always track the ROM
in use. A set that was already available and is rewritten moves the revision, because the
extraction clears the folder before writing it again and every URL on screen fails for the
duration. Only the ROM still active gets its flag refreshed, so a profile switch during an
extraction cannot let the old ROM's result overwrite the new one. One log line per run names
the base, the verdict and the file count, so a listing stuck on placeholders can be
diagnosed from `session.log`.

## sprites/ensure-sprites-extracted.ts

Extraction runs at most once per ROM per session. Concurrent callers (startup, profile
select, boot) share the in-flight promise, and a finished run, successful or not, is not
repeated on the next profile switch. The manual buttons keep their own path.

## sprites/sprite-rom.ts

With no active profile (a first run, a missing pinned profile, the profile creation form), a
ROM that is ready to play stands in, so views that draw item art do not show placeholders
over a set that is on disk.

## sprites/useSpriteRevision.ts

Sprite URLs carry the revision. A view that memoizes them recomputes when the revision moves,
or it keeps serving the URLs that failed while the folder was being written.

## storage

Each store binds a library in `shared/storage/` to the platform FileStore and mirrors the
old `window.api` method names, so call sites swap one for one and persistence runs per OS
through the platform layer.

## storage/assets-store

The `.dat` is checked and loaded over FileStore and extracted in a Web Worker: ROMs and
language sets are read here, the worker bakes them, and the base blob plus one sidecar per
optional cartridge are written back. The base and each supplement are separate files, so
rebuilding the base never destroys a supplement; they are joined only when loading, because
the core expects a single buffer. The bake pulls in the whole dialogue compression path,
which belongs off the UI thread.

- A missing blob is not stale. The missing file path already recompiles; staleness only
  concerns a blob that exists but predates the current bake format (`bake-version.ts`).
- A supplement whose cartridge is gone must not linger as a stale sidecar.
- After a bake, anything already running booted with the previous blob and is now behind,
  so the game assets store is told.
- `recompileAll` rebuilds every ROM that already has a cached `.dat`, after a language set
  changes.

## storage/audio-probe.ts

ffprobe is a native process and only runs in the main process. On a host without that IPC
surface (mobile, browser) the probe resolves null, which callers already treat as nothing
knowable, so no caller needs a host check.

## storage/extraction-client.ts

One Web Worker per job.

## storage/import-progress-bus

Import runs in the renderer over FileStore, so progress is published on this bus, never as a
main process IPC event. `useImportProgress` subscribes to it.

## storage/languages-store

- Saving, creating and duplicating a set all rebake every blob, which is expensive, so
  callers debounce edits.
- `getLanguageSetFont` returns the set's glyph tiles plus its per glyph advance table and
  never rebakes, so a preview can ask freely. `exportLanguageSet` packs the set folder as
  `.rlang` and never rebakes either.

## storage/link-sprites-store

Validation is per container: a ZSPR by its magic, a sprite pack by being a readable zip with a
manifest, so a mislabelled file is rejected on import, not at boot. `writeLinkSprite`
overwrites in place for the studio's save and skips the rename that import applies.

## storage/menu-text-store.ts

The menu, credits and closing caption bodies are decoded on demand from the player's own
ROM. They are not in a language pack (the extractor copies their bytes undecoded) and are
game derived text, so they may never be committed. Results are cached per language because
reaching them means reading a whole ROM. The set's own language is preferred, but another
region's ROM still shows a translator what each slot holds, and the answering language
travels with the result. A ROM the pipeline cannot read is skipped. No matching ROM is an
ordinary state, not a failure.

## storage/msu-store

- `listMsuPackEntries` lists every file in the pack folder except the manifest; this is what
  an export stores.
- The audio probe is passed to the metadata read unconditionally. It answers null when no
  decoder is installed, so the encoded rows stay unfilled.
- `canTrashMsuPack` is true when a deleted pack goes to the system recycle bin and false when
  it is removed for good.
- The import result type comes from `msu-contract`, so the renderer cannot fall behind what
  an import reports.

## storage/profile-store

`app.json` decides which profile opens by default and is shared by every launch. Loading a
profile for play writes it on each run, so `setLastProfile` does nothing on any automated
launch, named instance or not; otherwise the user's next normal launch would resume an
automated run's profile. The gate sits at this single seam so no call site can forget it.
`updateActiveInputProfileId` merges the active input profile id into the config without
clobbering other settings, for the profile cycle shortcut outside the settings screen.

## storage/roms-store

Import runs in the renderer (pick or download, unzip or raw, then FileStore) and reports on
the import progress bus. Every import names its kind. The base cartridge boots the game; a
supplement only adds to one, is digest checked before it is written, and never replaces a
file already there.

## storage/saves-store

Every save state leaves through one of the four writers (quick state, normal save, its
overwrite, auto save), so the version and format stamp is applied there and not at each call
site. SRAM is excluded: it is the game's own save file and has nothing to do with snapshot
layout. Screenshots come back as base64 strings.

## storage/sprites-store

The sprite base URL comes from the platform (`app-sprite://` or `convertFileSrc`). A build
without sprite definitions extracts nothing and can never call a set stale. The staleness
rule itself lives in the shared store (`sprites.isStale`); this side only supplies what this
build emits. The capacity, gear, quiver, pool and shop price symbol reads return the binary
from the ROM's extracted set, or null before it exists.

## storage/ui-views

The single boundary for durable view state, keyed and app level, not per profile (see
`shared/ipc/ui-views-contract.ts`). Nothing else touches `window.api.uiViews`; a composite
that wants persistence goes through `useViewState`. The whole map loads once and is cached,
every mutation rewrites the whole map, and writes are fire and forget: a failed write logs and
is dropped. Rapid saves collapse into one write about 400 ms later. A save before the map has
loaded waits for the load first, because writing early would clobber every other
collection's saved layout with a file holding only this key. Entries that are not well formed
snapshots are dropped on load.

## storage/widget-prefs

What a widget's content remembers (tab, filter, view mode), as opposed to its frame. Values
are `unknown` on purpose: each widget owns its keys and shapes, and the bargain is that a
value survives a JSON round trip. Prefs come from untrusted JSON, so a wrong shaped file is
dropped, a version mismatch fails by design (bump the version to discard stale prefs, never
migrate), and one malformed widget entry is dropped without taking its neighbours. Known
keys: `tab` (cheats, live data inspector), `viewMode` (checks, inventory), `grouping` and
`filter` (checks), `mode` (navigation). Widget ids match `WIDGET_DEFINITIONS`.

## storage/widget-state

The single boundary for a profile's widgets: the layout the Widget composite writes and the
per widget prefs. Both live in `profiles/<id>/tracker.json`, so one cache and one debounced
write serve both and neither clobbers the other. The blob loads once per profile, every
mutation rewrites the cached whole, and rapid writes coalesce. `flushWidgetBlob` exists
because a debounce nobody forces drops whatever the user did just before the window closed.
Loading a second profile flushes the first one's pending write first. A patch before the file
is known reads first, or it would write a blob holding only that key. Before this existed a
drag wrote the whole file on every mouse move and overlapping read modify writes lost data.

## store/store-site

The Hookshop origin is a placeholder until the store's domain exists. The main process names
the same origin for the store API in `electron/hub/endpoints.ts`. The media bucket is
private: store-api signs every picture it returns and puts the link in `url`, valid for two
hours. Without one the tab draws the kind's icon.

## tracker-state-io

Typed wrapper around the per profile tracker state IPC, so presentational tiers never touch
`window.api` directly.
