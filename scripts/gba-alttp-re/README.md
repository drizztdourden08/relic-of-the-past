# ALttP GBA reverse-engineering workspace

This directory is an isolated research toolchain for the **A Link to the Past** half of
`The Legend of Zelda: A Link to the Past & Four Swords`. It does not cover the Four
Swords multiplayer game and is deliberately separate from the production SNES asset
extractor in `shared/asset-extraction`.

The intended output is semantic room, entity, text, item, and graphics data that can
eventually be translated into the existing zelda3-derived structures. ROM bytes,
emulator traces, RAM dumps, and extracted graphics must not be committed.

## ROM setup

The tools look for these ignored local fixtures by default:

```text
test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc
test-roms/Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba
```

Alternative paths can be supplied with `--gba` / `--snes`, or with
`ALTTP_GBA_ROM` / `ALTTP_SNES_ROM`. The known US GBA profile is:

```text
Size:   8,388,608 bytes
MD5:    3287ca66e5cc285a9fe3a922051e84c6
SHA256: f328f8f07d736288a00c80d31cc1630f3aa02aaf20efdcba73d31dae832b5d76
Code:   AZLE, revision 0
```

Validate before trusting any address:

```powershell
node scripts/gba-alttp-re/validate-rom.mjs
```

The validator proves the ROM revision and records bytes at each ROM anchor. It does
not prove an anchor's meaning; that requires a runtime observation. The status of
every lead is kept in `anchors.json` as `research-lead` until reproduced locally.
Static results and their reproduction commands are recorded in `FINDINGS.md`.

## Existing extraction seam

The current SNES pipeline already separates dungeon data into the concepts needed by
the port:

| Semantic concept | Current implementation |
| --- | --- |
| Room header and three object layers | `shared/asset-extraction/extraction/room-extractor.ts` |
| Object and door decoding | `shared/asset-extraction/extraction/room-object-decoder.ts` |
| Sprite spawn lists | `shared/asset-extraction/compile-dungeons.ts` |
| Secrets, chests, pits, entrances | `shared/asset-extraction/extraction/` |
| Runtime room consumption | `core/zelda3/src/dungeon.c` and `core/zelda3/src/sprite.c` |

The GBA extractor should initially emit a neutral JSON record with equivalent fields.
Only after the GBA format is understood should an adapter target the production asset
builder.

## First room-correlation experiment

Start with one unchanged ordinary room that can be entered reproducibly in both games.
Room `0x12` is only a starting candidate; confirm the active room identity at runtime
instead of assuming GBA and SNES IDs are identical.

Search the GBA ROM for the complete SNES room encoding and then for 16-byte chunks:

```powershell
node scripts/gba-alttp-re/correlate-snes.mjs --room 0x12 --chunk 16 --stride 8
```

An exact match gives a direct data anchor. Scattered chunk matches suggest copied
tables or partially transformed room data. No matches suggest compression, a changed
layout encoding, or runtime construction; proceed to tracing rather than weakening
the chunks until false positives dominate.

The initial run found no matching 16-byte windows for room `0x12`. As a control, the
same tool exactly matched all 56 bytes of the SNES prize table at `0x86FA72` to the
published GBA drop table at `0x0817217A`; see `FINDINGS.md`.

Dungeon sprite lists have now been located and retain the SNES semantic format.
Extract all 384 GBA room lists and compare the original 320 entries with SNES:

```powershell
node scripts/gba-alttp-re/extract-dungeon-sprites.mjs
```

The JSON output is written below ignored `artifacts/`. It contains decoded entity,
overlord, and death-marker records with local/world coordinates, raw bytes, ROM
pointers, and per-room SNES comparison status.

Extract all 320 dungeon secret lists and compare them with the SNES source:

```powershell
node scripts/gba-alttp-re/extract-dungeon-secrets.mjs
```

The GBA retains the SNES 3-byte secret record format and `0xFFFF` terminator. The
ignored JSON output contains decoded tile coordinates and secret type IDs.

Extract all three native 64x64 GBA background layers for the Palace room:

```powershell
node scripts/gba-alttp-re/extract-dungeon-layers.mjs --room 0x88
```

Each layer is a standard 8 KiB GBA text-background map using four 32x32 screen
blocks. The JSON converts that hardware ordering into logical rows while retaining
the exact decompressed bytes.

Validate the decoded maps against the ignored live Palace VRAM and palette capture:

```powershell
node scripts/gba-alttp-re/render-dungeon-capture.mjs
```

The renderer composites BG1, BG2, and BG3 in hardware priority order. It is a
validation oracle only; the reproducible ROM palette extraction remains separate.

Extract and render the Palace entrance statues entirely from the ROM:

```powershell
node scripts/gba-alttp-re/extract-palace-entrance.mjs --asset skull-relief --scale 4
```

This extracts one square skull wall relief by default. Pass `--asset left-statue` for
the floor-level doorway statue or `--asset entrance` for the larger diagnostic crop.
All modes decompress the required 4bpp character sheets, read palette banks 2-7 from
the ROM, and stitch room `0x88` map entries with their horizontal/vertical flip flags.
They do not read emulator memory, screenshots, or capture artifacts.
See `OFFLINE_STATUS.md` for the exact boundary between reproducible ROM-only output
and debugger validation data.

See `REAL_EXTRACTOR_PLAN.md` for the production side-by-side SNES/GBA architecture,
remaining dungeon checklist, and staged integration plan.

Export a single room as one neutral semantic record:

```powershell
node scripts/gba-alttp-re/extract-dungeon-room.mjs --room 0x88
```

The combined ignored JSON includes the GBA room header, three background layers,
sprites, and secrets. Numeric effect, tag, blockset, and entity IDs are intentionally
retained until their GBA tables are named and mapped to port enums.

## Room-load tracing

Use an open-source mGBA build with debugger support. Keep all captures below
`scripts/gba-alttp-re/artifacts/`, which is ignored.

1. Load a save immediately outside the selected ordinary room.
2. Capture an idle/control trace without crossing the doorway.
3. Reload the same save and capture from just before transition until entities appear.
4. Subtract ROM program counters seen in the control capture:

```powershell
node scripts/gba-alttp-re/trace-diff.mjs `
  --baseline scripts/gba-alttp-re/artifacts/ordinary-idle.log `
  --target scripts/gba-alttp-re/artifacts/ordinary-load.log
```

The parser accepts text traces containing an eight-digit `08xxxxxx` or `09xxxxxx`
program counter. Use the highest positive deltas as Ghidra entry points, then follow
loads from Game Pak ROM and writes that populate room/entity state. Repeat for a
Palace of the Four Sword entrance room and compare the candidate call sets.

Sideway's trace-subtraction work is the source of this strategy. The initial ROM-code
leads are entity damage near `0x080C2160` and drop logic near `0x080C6A10`; neither is
assumed to be the room loader.

## RAM snapshots and watchpoints

Dump IWRAM (`0x03000000..0x03007FFF`) immediately before and after room loading. Most
emulators and debugger bridges can export this as a raw 32 KiB file.

```powershell
node scripts/gba-alttp-re/snapshot-diff.mjs `
  --before scripts/gba-alttp-re/artifacts/before-iwram.bin `
  --after scripts/gba-alttp-re/artifacts/after-iwram.bin
```

The tool annotates changes near known leads, including Link coordinates, entity
coordinate arrays, Riddle Quest state, Palace access state, sword-piece state, and
the text decoder state. Once a stable room-state region is found, add write watchpoints
and trace backward to the ROM table or decompression routine supplying it.

## Ghidra project

Create the Ghidra project outside this repository or under ignored `artifacts/`.
Import the ROM with `gba-ghidra-loader`, select ARM little-endian with Thumb support,
and preserve both ARM and Thumb entry points. Name functions only after a local trace
or cross-reference supports the name. Record confirmed addresses and evidence in
`anchors.json`.

Useful ROM leads:

| Address | Lead |
| --- | --- |
| `0x080C2160` | entity damage routine |
| `0x080C6A10` | drop selection logic |
| `0x0817217A` | drop table |
| `0x08180CE8` | text data block |
| `0x08180D08` | text pointer table |
| `0x08181448` | text base |

The translation project also identifies text runtime pointers at `0x03003D28`,
`0x03003D2C`, and `0x03003D30`. These are strong candidates for watchpoints while a
GBA-exclusive NPC line is displayed.

## Progression order

1. Validate the ROM profile and reproduce at least one published RAM anchor.
2. Correlate a normal room's SNES bytes against the GBA ROM.
3. Trace the normal room load and identify room, decompression, and entity-spawn code.
4. Express that normal room in the existing semantic room model and compare outputs.
5. Apply the decoder to the first Palace room, retaining unknown fields explicitly.
6. Move next to Palace rooms/bosses, Riddle Quest/text, Hurricane Spin/save state, and
   finally new graphics and palettes.

Run the standalone unit tests with:

```powershell
node --test scripts/gba-alttp-re/test/*.test.mjs
```

## Local toolchain

The pinned portable toolchain is installed under the ignored `toolchain/` directory.
Its versions, upstream URLs, hashes, and loader commit are recorded in
`toolchain-lock.json`.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/setup-toolchain.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/import-ghidra.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/verify-ghidra.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/debug-mgba.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/verify-mgba-gdb.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/connect-gdb.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/send-mgba-input.ps1 -Button Up -DurationMs 500
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/launch-mgba.ps1
powershell -ExecutionPolicy Bypass -File scripts/gba-alttp-re/launch-ghidra.ps1
```

After `debug-mgba.ps1` opens the Qt application, start the server from
**Tools > Start GDB server...** on port `2345`. Approve the first-run Windows Firewall
prompt only for trusted networks. See `MGBA_DEBUGGER.md` for capture instructions and
the note about the server listening on all interfaces.

`send-mgba-input.ps1` focuses the sole running mGBA process and holds one mapped
button for a bounded duration. This allows reproducible movement across a doorway
while GDB records the transition, without writing controller or game memory.

The upstream GhidraGBA release targets Ghidra 10.1 and should not be installed into
Ghidra 12.1 blindly. Its exact source revision is retained as a format reference. The
local Ghidra workflow imports the ROM with the built-in binary loader and applies our
version-controlled memory-map script instead. The headless import creates an ignored
`ghidra-projects/alttp-gba-us` project, maps GBA RAM and hardware regions, labels all
known anchors, and marks the two code leads as Thumb. Broad auto-analysis is disabled
because a GBA ROM mixes ARM code, Thumb code, compressed assets, and plain data; run
analysis on trace-confirmed functions as they are discovered.
