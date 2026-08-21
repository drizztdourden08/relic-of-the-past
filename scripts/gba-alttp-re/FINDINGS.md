# Findings log

All findings below apply to the validated US ROM profile in `anchors.json`. A static
match establishes where bytes are stored, but not which routine consumes them.

## 2026-08-20: workspace baseline

- The local GBA fixture matches the expected 8 MiB US ROM exactly: MD5
  `3287ca66e5cc285a9fe3a922051e84c6`, game code `AZLE`, revision 0.
- The local SNES fixture matches the production extractor's US profile: SHA-1
  `6D4F10A8B10E10DBE624CB23CF03B88BB8252973`.
- All published ROM anchors are inside the image. Bytes at `0x080C2160` begin with a
  plausible Thumb function prologue (`f0 b5 ...`), but its entity-damage meaning is
  not yet locally proven.
- The 56-byte SNES `kPrizeItems` table at SNES `0x86FA72` / file offset `0x37A72`
  matches the GBA bytes at `0x0817217A` / file offset `0x17217A` exactly. This locally
  confirms the published GBA drop-table anchor and proves that at least some original
  ALttP tables were retained without transformation.

Reproduction:

```powershell
node scripts/gba-alttp-re/correlate-snes.mjs `
  --snes-offset 0x37a72 --length 56 --chunk 16 --stride 8
```

## 2026-08-20: first ordinary-room probe

SNES dungeon room `0x12` resolves through the production room pointer table to stored
address `0x0A89D3` (file offset `0x509D3`) and occupies 210 bytes through its three
object layers and door terminators.

Neither the full room nor any 16-byte window sampled every 8 bytes occurs in the GBA
ROM. This does not prove the GBA room ID differs or that every byte is compressed. It
does rule out a direct byte-for-byte copy of that SNES room payload and makes runtime
room-load tracing the next useful experiment.

Reproduction:

```powershell
node scripts/gba-alttp-re/correlate-snes.mjs --room 0x12 --chunk 16 --stride 8
```

## Next evidence needed

1. Confirm one runtime RAM lead by changing Link position and observing
   `0x030038F0` / `0x030038F4`.
2. Capture control and doorway-transition traces for the same ordinary room.
3. Dump IWRAM immediately before and after the transition and identify writes that
   populate the entity coordinate arrays near `0x03003102..0x03003132`.
4. Trace those writes back to ROM reads or a decompression destination.
5. Repeat the capture for the first Palace of the Four Sword room and compare the
   loader path and decoded state.

## 2026-08-20: Palace live-state baseline

- A full 32 KiB IWRAM capture was taken while Link was controllable inside the
  Palace of the Four Sword.
- `link_y` at `0x030038F0` changed from `0x11B8` to `0x11B6` on upward movement.
  The hardware watchpoint stopped at `0x08097A08`, immediately after
  `strh r0, [r2]` at `0x08097A04` wrote the new value.
- Controlled keyboard input moved Link to `Y=0x1188, X=0x10F8`, independently
  confirming both published coordinate fields.
- The entity region at `0x03003102..0x03003132` was populated, but individual array
  semantics still need per-entity movement or spawn observations.
- `0x030038E3` contained `0x0F` in the completed save. This is consistent with the
  published sword-piece state, but one completed-state sample is not sufficient to
  confirm its meaning.
- Runtime pointers at `0x03003D28`, `0x03003D2C`, and `0x03003D30` contained the
  published ROM addresses `0x08180CE8`, `0x08180D08`, and `0x08181448` exactly.
- Baseline and post-movement IWRAM dumps are retained under ignored `artifacts/`.

## 2026-08-20: dungeon sprite format extracted

- The current dungeon room index is a 16-bit value at `0x03002D66`; the live Palace
  room was `0x88`.
- `0x080CB5A0` indexes a 384-entry pointer table at `0x08228DF0`, initializes room
  grid offsets, and loops over records until an `0xFF` terminator.
- `0x080CB638` dispatches each record, preserving the SNES special cases for entity
  type `0xE4` and overlords with X bytes at or above `0xE0`.
- Room `0x88` points to `0x0822A7B1`. Its serialized records reproduce the live
  Palace entity types and coordinates exactly, including six type-`0xCA` entities
  followed by type `0xF5`.
- GBA room `0x12` has the exact same complete sprite list as SNES room `0x12`.
- Across all 320 SNES room IDs, 284 complete lists are byte-for-byte identical and
  36 are modified in GBA. The GBA table contains 64 additional entries, for 384
  total room IDs.
- `extract-dungeon-sprites.mjs` writes a semantic JSON representation and comparison
  report under ignored `artifacts/`; no extracted ROM data is committed.

## 2026-08-21: dungeon screen chunks under investigation

- A 320-entry pointer table at `0x0814FCC0` targets standard GBA LZ77 streams.
- Every sampled stream begins with type `0x10` and expands to exactly `0x2000` bytes.
- `0x08076D10` uses a selector lookup at `0x0814FC30`, then decompresses chunks at
  indices `base`, `base+1`, `base+8`, and `base+9` into four 8 KiB EWRAM banks.
- The live Palace selector at `0x03002BF6` was `0x5B`. The loader uses two groups of
  four chunks, including indices `base`, `base+1`, `base+8`, and `base+9`.
- These streams are copied through EWRAM into screen-map VRAM regions. Interpreting
  each 32-byte block as a 4bpp graphics tile was disproved: none of the referenced
  Palace tiles matched live VRAM, with or without SNES-planar conversion.
- The earlier graphics-chunk extractor was removed rather than preserving a false
  semantic interpretation. Exact classification remains a research lead.

## 2026-08-20: dungeon secret format extracted

- A 320-entry pointer table at `0x082264C8` targets variable-length dungeon secret
  lists.
- The record format is unchanged from SNES: a 16-bit tile position followed by an
  8-bit secret type, terminated by `0xFFFF`.
- Of 320 complete lists, 316 are byte-for-byte identical to SNES. Only rooms `0x9E`,
  `0xBD`, `0xBE`, and `0xFC` differ.
- `extract-dungeon-secrets.mjs` exports decoded coordinates, type IDs, source
  pointers, raw bytes, and SNES comparison status under ignored `artifacts/`.

## 2026-08-21: dungeon room headers extracted

- The 320-entry pointer table at `0x08164020` selects 14-byte room-header records.
- The loader at `0x08080D00` decodes the same semantic layout as the SNES header:
  packed BG2/collision/light flags, palette, blockset, enemy blockset, effect, two
  room tags, packed destination quadrants, and five destination room IDs.
- The values are GBA-native and are not byte-for-byte copies of the SNES headers.
  Numeric IDs remain explicit until their corresponding GBA lookup tables are
  correlated.
- `extract-dungeon-room.mjs` now combines this header with layers, sprites, and
  secrets for one room. Palace room `0x88` is the default target.

## 2026-08-21: dungeon room geometry extracted

- The room loader at `0x0807FF10` indexes three room-layer pointer tables at
  `0x081618D8`, `0x08161D98`, and `0x08162258`.
- Each pointer targets a GBA LZ77 stream that expands to one exact 8 KiB, 64x64
  native text-background map in four-screen-block hardware ordering.
- For live Palace room `0x88`, the decompressed layers match the existing VRAM
  capture exactly at `0x0600C000`, `0x0600A000`, and `0x0600E000` respectively.
- Palace layer pointers are `0x0836407C`, `0x082F19A4`, and `0x083AD8EC`.
- The GBA port therefore stores pre-rendered room geometry layers rather than the
  original SNES object command stream. `extract-dungeon-layers.mjs` exports both
  hardware-neutral logical cells and exact decompressed data.
- A capture-based renderer using the live VRAM and palette reconstructs the complete
  512x512 Palace chamber geometry, including walls, six pedestals, skull barrier,
  and entrance. This validates tile indices, flip bits, palette banks, transparency,
  screen-block ordering, and layer priority.
- Screen-chunk loading and room-layer loading reuse EWRAM scratch banks at
  `0x02018000..0x0201DFFF`. These buffers must not be used as long-lived graphics
  state anchors.

## 2026-08-21: first ROM-only Palace graphics extraction

- Palace entrance tile sheets are standard GBA LZ77 streams expanding to 64 packed
  4bpp tiles each. The crop uses sheets at `0x08258E38`, `0x0825E200`,
  `0x0825B264`, `0x0825D4A8`, and `0x08264CCC`.
- The GBA-exclusive central entrance tiles `136` and `137` come from decompressed
  offsets `0x100` and `0x120` in the sheet at `0x0825E200`.
- Palace background palette banks 2 through 7 are contiguous, uncompressed BGR555
  data beginning at `0x083BE558`.
- `extract-palace-entrance.mjs` composes room `0x88`, map region `(26,55)` through
  `(37,62)`, applying each map entry's tile ID, palette bank, and flip bits.
- The resulting 96x64 image is byte-for-byte pixel-identical to the corresponding
  live VRAM/PALRAM validation crop. Captures are not inputs to the extractor.

## 2026-08-20: debugger transport check

- mGBA 0.10.5's Qt GDB server accepted an ARM GDB connection on port `2345`.
- GDB read live `pc`, `sp`, `lr`, and `cpsr` registers and IWRAM successfully.
- The sampled ranges at `0x030038F0` and `0x03003100` were zero while the game was
  outside active gameplay. This confirms transport and addressability, not the
  published meanings of those fields.
- mGBA rejected the remote detach packet (`E07`); GDB `disconnect` is used instead.
- After that rejected detach, a reconnect encountered stale no-ack protocol state.
  Restarting the server between GDB clients is required for reliable captures.

## 2026-08-21: ALttP text and progression data extracted

- The pointer table contains 455 ALttP messages (`0x000..0x1C6`). Pointers are
  obfuscated big-endian relative offsets and message bytes use the same rolling
  decoder at `0x08129E0C`.
- Palace gatekeeper dialogue is at `0x1A5..0x1A6`; Riddle Quest and Hurricane Spin
  dialogue occupies `0x1A8..0x1C6`.
- The ALttP save-slot power bitmap is byte zero of each `0x500`-byte slot beginning
  at SRAM offset `0x580`. Bit `0x02` is Hurricane Spin and bit `0x01` is sword beam.
- SRAM files may reverse every eight-byte block. The production decoder accepts both
  forms and ignores erased `INIT` slots rather than interpreting `0xFF` as powers.
- The normal entity dispatch table at `0x08174148` contains 248 Thumb pointers for
  types `0x00..0xF7`; its following word for `0xF8` is zero. Palace `0xF8` records
  therefore remain special markers until their consumer is traced semantically.

## 2026-08-21: Palace room-tag dispatch and port interaction data

- The 67-entry dungeon room-tag handler table is at `0x08152AC4`. Its first 64
  entries reproduce the distinctive repeated-handler layout of the SNES-derived
  `kDungTagroutines` table, which establishes the table identity structurally.
- The three GBA additions are tag `0x40` at `0x0807B7C0`, tag `0x41` at
  `0x0807B244`, and tag `0x42` at `0x0807A088`.
- Tag `0x40` calls trigger helper `0x080CAFB4`, emits GBA sound `0x7B`, sets a room
  event state to `0x1C`, and clears its active tag slot when triggered.
- Tag `0x41` uses helper `0x0807B100`, advances a `0x13`-based room state, emits
  GBA sound `0x7B`, toggles a room-state bit, and invokes room-state rebuild helper
  `0x0807597C`.
- Tag `0x42` checks active actor/room state through helper `0x08079F90`, changes a
  transition state, and emits GBA sound `0x3B`. Names for the involved RAM fields
  remain provisional, so these effects are implementation specifications rather
  than completed C ports.
- Palace collision grids use native port behavior values for deep/shallow water,
  stairs, and all four conveyor directions. The supplement now includes semantic
  interaction records in addition to the complete raw collision grids.
- All decoded GBA ALttP messages are now emitted both losslessly and re-encoded with
  the existing US dialogue encoder. The readable conversion removes the GBA's `+`
  controller glyph marker and substitutes comma for the unsupported colon glyph.
