# GBA ALttP supplement format

Run the GBA extractor beside the existing SNES ROM importer:

```powershell
npm run gba:extract-palace -- --rom "path/to/alttp-four-swords.gba" --out "path/to/output"
```

The command validates the unheadered US ROM SHA-256 by default. Its default ROM
location is the existing ignored `test-roms/` directory and generated diagnostics go
to the existing ignored `debug-output/gba-alttp-palace/` directory.

## Native conversion boundary

- `*.snes-tilemap.bin` contains 4096 little-endian SNES VRAM tilemap words in
  logical row-major 64x64 order. Tile, palette, priority, H-flip and V-flip occupy
  the normal SNES bit positions.
- `*.snes-4bpp` contains planar SNES 4bpp tiles, 32 bytes per 8x8 tile. Four planes
  are required because GBA Palace art uses all 16 palette indices.
- `*.bgr555` contains little-endian BGR555 colors. Both platforms use this color
  representation.
- `header.snes-native.bin` preserves the 14-byte ALttP dungeon header layout.
- `entities.snes-native.bin` preserves the sort byte, three-byte records and `FF`
  terminator consumed by the existing room entity loader.
- `secrets.snes-native.bin` preserves three-byte records and the `FFFF` terminator.
- `*.collision.bin` contains one existing ALttP collision attribute byte per map
  tile. Directional attributes include the translated SNES H/V bits.

The GBA stores baked 64x64 layers, not SNES dungeon object commands. Do not attempt
to reverse-compose them into object streams. The PC engine adapter should load these
pre-expanded SNES tilemap words into `dung_bg1`/`dung_bg2` and then use the exported
attribute maps. This is lossless and avoids inventing object combinations that never
existed in the GBA ROM.

## Package contents

`palace-assets.dat` uses the existing `AssetBuilder` container but is intentionally
separate from `zelda3_assets.dat`; the SNES-only asset signature remains unchanged.
`manifest.json` records source addresses, room IDs, sprite sheet compositions,
behavior anchors, semantic interaction cells, room-tag handlers, entity
classification, progression checks, and conversion descriptions. Per-room binaries
are included so the engine adapter can be developed and tested without parsing the
packed container. The packed supplement retains lossless GBA message bytes and a
second copy encoded by the existing US port dialogue encoder.

PNG room and collision previews are verification artifacts generated from the same
offline SNES-format binaries. They are not input to extraction and contain no data
captured from an emulator.

The production compiler entry is
`apps/desktop/electron/assets/compile-gba-alttp-assets.ts`, beside the existing SNES
`compile-rom-assets.ts`. The command under `scripts/gba-alttp-re` is only a diagnostic
CLI that expands the packed result into inspectable per-room files and previews.

`shared/asset-extraction/compile-alttp-asset-set.ts` is the source aggregator used by
the production flow. It requires the SNES base source and accepts the validated GBA
ALttP source optionally. It returns a byte-identical `base` container and, when
provided, a `gbaSupplement` container. Source-specific address mapping and decoding
remain isolated below that boundary.

## Remaining engine work

The data package is sufficient for static room reconstruction and identifies all
Palace actor and room-tag handlers. Gameplay still needs explicit C implementations
for Palace tags `0x40..0x42`, entity `0xF5`, special room actor `0xF8`, Dark Links,
and the room-conditioned variants of Helmasaur, Mothula, Arrghus and Blind. ROM
addresses and effect summaries in the manifest are porting specifications only; ARM
code cannot be consumed by the SNES-derived engine.
