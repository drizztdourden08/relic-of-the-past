# ALttP GBA supplement extractor plan

## Current answer

The ROM-only exporter now extracts all 12 Palace room IDs, all three 64x64 layers,
base collision attributes, headers and destinations, entity and secret lists,
background graphics and palettes, every referenced sprite sheet composition, Palace
OBJ palettes, all 455 decoded and port-encoded ALttP messages, save-slot sword
powers, destination candidates, semantic interaction cells, and the complete entity
and room-tag handler pointer inventories.
It translates maps and graphics to SNES-native runtime representations and produces
per-room previews plus a packed supplement without using emulator state.

Static dungeon extraction is complete. Engine integration and semantic gameplay
ports are not: Palace tags 0x40..0x42, entities 0xF5/0xF8, Dark Links, dynamic room
changes, and modified boss AI still require explicit C implementations.

The production importer should require both user-owned ROMs:

1. The SNES ROM remains the base game and is processed by the existing pipeline.
2. The GBA ROM contributes only ALttP additions and overrides.
3. Both source decoders emit shared semantic records.
4. The existing `AssetBuilder` serializes the merged result.

No ROM bytes, decompressed sheets, or generated copyrighted assets are committed.

## Architecture

Do not make the GBA reader implement the current SNES `RomData` contract. That
contract embeds LoROM addressing and bank-boundary behavior. Share a lower-level
binary reader and expose source-specific readers above it.

```text
shared/asset-extraction/
  rom/
    binary-reader.ts              # endian reads, slices, hashes
    snes-rom.ts                   # LoROM mapping and SNES validation
    gba-rom.ts                    # 0x08000000 mapping and GBA validation
  compression/
    snes-lz.ts
    gba-lz77.ts
  graphics/
    indexed-tile.ts               # format-neutral 8x8 indexed pixels
    tile-compositor.ts            # flips, palettes, multi-tile stitching
    snes-planar.ts
    gba-packed-4bpp.ts
  dungeon/
    model.ts                      # room/header/layer/entity/secret/transition IR
    snes-dungeon-source.ts
    gba-alttp-dungeon-source.ts
  sources/
    snes/                         # existing tables and source-specific extraction
    gba-alttp/                    # ALttP-only GBA tables and extraction
  compile-resources-snes.ts       # existing base build
  compile-gba-alttp-supplement.ts # additions/overrides only
  compile-resources.ts            # merge policy + existing AssetBuilder
```

The SNES and GBA room decoders must remain separate. SNES rooms contain compact
object command streams; GBA rooms contain expanded native tilemaps. They should
converge on a neutral room model or on an explicit pair of layer representations:
`objects` and `baked-tilemap`. The engine adapter must decide whether Palace rooms
can be converted safely to existing objects or require baked tilemap support.

## Extraction checklist

### Foundation

- [x] Validate the exact US GBA ROM revision by cryptographic hash.
- [x] Map GBA ROM addresses to file offsets.
- [x] Implement standard GBA LZ77 decompression with tests.
- [x] Move reusable GBA helpers from research `.mjs` files into production TypeScript.
- [x] Introduce a shared raw binary reader without changing current SNES output.
- [x] Add golden tests proving the SNES asset bundle is byte-identical after refactoring.
- [x] Define source/provenance metadata for every imported record.

### Palace room inventory and topology

- [x] Identify every Palace of the Four Sword room ID and exclude Four Swords rooms.
- [x] Export a room manifest with IDs, headers, layer pointers, entities, and secrets.
- [ ] Decode entrances, exits, doors, stairs, pits, warps, and destination quadrants.
- [x] Identify the room-tag dispatch table and exact handlers used by Palace rooms.
- [ ] Implement Palace room-tag effects in portable C and verify their dynamic changes.
- [ ] Record all state-dependent room variants, overlays, opened doors, and destroyed objects.
- [ ] Build a navigable topology graph and verify it against a completed save playthrough.

### Layout and rendering

- [x] Decode all three native 64x64 GBA background layers.
- [x] Decode tile IDs, palette banks, horizontal flips, and vertical flips.
- [x] Locate ROM-only character sheets and palettes for one Palace relief.
- [x] Decode the Palace blockset-to-character-sheet lookup and overlays.
- [x] Decode the Palace room-palette-record addressing.
- [x] Extract every referenced background/sprite sheet and BG palette.
- [ ] Determine exact BG priority/transparency rules for all Palace effects.
- [x] Emit lossless pre-expanded SNES runtime tilemaps rather than inventing SNES objects.
- [x] Render every Palace room offline from converted output.

### Collision and interaction

- [x] Locate the GBA background-tile attribute/collision table.
- [x] Map GBA tile attributes to the port's collision enum.
- [x] Export semantic water, pit, stair, and conveyor interaction cells using port-native IDs.
- [ ] Verify floor, wall, ledge, doorway, and switch behavior in the integrated runtime.
- [ ] Decode room collision modes and upper/lower floor interaction.
- [ ] Decode dynamic collision changes caused by doors, switches, blocks, and defeated enemies.
- [x] Produce a collision visualization for each Palace room and layer.
- [ ] Compare one ordinary SNES/GBA room first, then validate every Palace-specific attribute.

### Entities and bosses

- [x] Decode GBA dungeon entity spawn-list records and room pointers.
- [x] Name and classify every entity type used in Palace rooms.
- [x] Correlate inherited entity IDs with existing port handlers and isolate modified/new types.
- [ ] Trace unique entity initialization, AI, damage, health, drops, and room-state effects.
- [x] Decode entity graphics-sheet composition and export referenced sheets.
- [ ] Extract unique entity animations as semantic frames, tiles, offsets, and timing.
- [ ] Reverse Dark Link variants and modified boss behavior separately from room data.
- [ ] Add deterministic behavior tests or trace-replay fixtures for each unique entity.

### Objects, rewards, and progression

- [ ] Decode Palace chests, keys, big-key rules, switches, movable blocks, and torches.
- [x] Decode the save-slot Hurricane Spin and sword-beam power bitmap.
- [ ] Identify the Four Sword/sword-piece reward state and its save flags.
- [ ] Decode Palace access requirements without importing multiplayer Four Swords logic.
- [ ] Decode Hurricane Spin acquisition, state, controls, and damage behavior.
- [ ] Map all new items and rewards into port inventory/save models.
- [ ] Specify migration/default behavior for existing port save files.

### Dialogue, NPCs, and Riddle Quest

- [x] Decode the complete GBA ALttP text pointer and byte-obfuscation format.
- [x] Extract the complete ALttP dialogue corpus with stable numeric IDs and plain-text views.
- [ ] Classify every changed pre-0x195 line against the SNES script.
- [ ] Identify new NPC spawn records, graphics, palettes, and scripts.
- [ ] Decode Riddle Quest state transitions, answers, rewards, and save bits.
- [x] Re-encode readable GBA dialogue through the existing US port dialogue encoder.

### Integration and verification

- [x] Add `loadGbaAlttpRomFromBuffer` beside the existing SNES loader.
- [x] Add `compileGbaAlttpSupplement` beside the existing SNES compiler.
- [ ] Define an explicit merge policy: append new IDs, override named records, reject collisions.
- [x] Keep the GBA ROM and supplement separate so the existing SNES-only build remains unchanged.
- [ ] Add desktop/web ROM selection and hash-validation errors only after the library API is stable.
- [ ] Verify ordinary shared rooms produce equivalent semantic data where expected.
- [ ] Add per-room manifests, image hashes, collision hashes, and entity-list golden tests.
- [ ] Run the copyright gate and confirm generated ROM-derived output stays ignored/local.

## Initial implementation plan

### Phase 1: shared primitives without behavior changes

Extract a format-neutral `BinaryReader`, indexed 8x8 tile model, tile compositor,
palette conversion, and image writer from the existing SNES code. Port the proven
GBA LZ77, packed-4bpp, map-entry, and room-header helpers to TypeScript. The existing
SNES compiler must produce a byte-identical asset file before proceeding.

### Phase 2: parallel GBA source API

Create `loadGbaAlttpRomFromBuffer` and `GbaAlttpDungeonSource`. Its first production
method should return room `0x88` as a neutral record containing header, three baked
layers, entities, secrets, referenced sheets, palettes, and provenance. Reproduce the
skull relief through shared graphics code, not a Palace-specific renderer.

### Phase 3: collision-first room proof

Use one ordinary dungeon room to correlate GBA tile attributes with known SNES/port
collision behavior. Then emit room `0x88` layout plus collision and render both
offline. This decides whether the engine can consume baked tilemaps directly or
whether a conversion layer is required.

### Phase 4: whole-Palace data extraction

Build the Palace room manifest and topology graph, generalize sheet/palette selection,
and export all layouts, collision layers, transitions, spawns, secrets, and dynamic
room metadata. Unknown fields remain numeric and provenance-tagged; they are not
silently guessed.

### Phase 5: gameplay additions

Implement unique entities and Dark Links, then rewards/save flags, Hurricane Spin,
dialogue/NPCs, and Riddle Quest. Add each category to the supplement compiler only
after its semantic model and tests are stable.

## First production milestone

The first mergeable milestone is deliberately narrow:

- Existing SNES build output remains byte-identical.
- The user can supply the validated GBA ROM as an optional second input.
- Shared TypeScript code extracts room `0x88` header, layers, entities, and secrets.
- Shared graphics code renders the skull relief from ROM-only inputs.
- A collision layer for one ordinary room and room `0x88` is exported and visualized.
- No emulator or capture artifact is needed at runtime.

That milestone proves the side-by-side architecture before unique enemy AI or engine
changes are allowed to expand the scope.
