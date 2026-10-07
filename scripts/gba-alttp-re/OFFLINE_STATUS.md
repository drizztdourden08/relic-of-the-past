# Offline extraction boundary

The production target is a deterministic script whose only copyrighted input is the
validated GBA ROM. Emulator state is permitted only as a reverse-engineering oracle
and must never be required to reproduce exported assets.

## ROM-only and reproducible

| Data | Command | Status |
| --- | --- | --- |
| Room headers | `extract-dungeon-room.mjs` | 14-byte semantic layout decoded |
| Three room layers | `extract-dungeon-layers.mjs` | Exact 64x64 native maps decoded |
| Entity spawn lists | `extract-dungeon-sprites.mjs` | 384 lists decoded |
| Dungeon secrets | `extract-dungeon-secrets.mjs` | 320 lists decoded |
| Palace entrance graphics | `extract-palace-entrance.mjs` | ROM tile sheets, palettes, and map stitching decoded |

## Still dependent on reverse-engineering

| Data | Current state | Required completion |
| --- | --- | --- |
| General background tile selection | One Palace asset is ROM-only | Map blockset IDs to sheet tables for arbitrary rooms |
| General background palette selection | One Palace asset is ROM-only | Map room palette IDs to palette records for arbitrary rooms |
| Entity sprite pixels | Live OBJ VRAM/OAM can render them | Decode ROM sprite sheets and entity-to-sheet mapping |
| Entity palettes | Live OBJ palette can render them | Decode ROM palette selection |

`render-dungeon-capture.mjs` is explicitly a debugger-validation tool. Its output is
not an offline extraction result and must not be used by a production conversion
pipeline.

`extract-palace-entrance.mjs` is the first fully offline graphics proof. It reads
only the validated ROM and reproduces the validation crop pixel-for-pixel without
using `artifacts/`.

The pointer table at `0x0814FCC0` remains under investigation. Its decompressed
`0x2000`-byte streams are copied through EWRAM into screen-map VRAM regions; they are
not validated as standalone graphics tiles and no pixel extractor should interpret
them as such.
