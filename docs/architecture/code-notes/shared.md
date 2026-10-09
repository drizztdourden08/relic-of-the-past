<!-- @layer docs @kind doc -->
# Code notes: shared

Facts about the code in `shared/` (outside `shared/game` and `shared/randomizer`) that the code cannot say by itself: ROM and file formats, protocol rules, game mechanics, and why an odd line has to stay. Each heading names a file or a folder, by its path under `shared/`.

## Asset extraction

### asset-extraction/asset-builder/asset-builder.ts

- `serialize` writes the `zelda3_assets.dat` format: a 16-byte signature, a SHA-256 hash of the NUL-separated entry names, 32 reserved bytes, the entry count and the name block length, the entry sizes, the names, then each payload aligned to 4 bytes.
- The reserved bytes carry the bake-format stamp (see bake-version), so a cached blob from an older bake pipeline is detected at load time.
- `addInt8` writes into a scratch buffer it then discards. The writes still throw on a value outside the signed byte range, so the loop acts as a range check.

### asset-extraction/bake-version/bake-version.constants.ts

- The container header is 16 signature bytes and a 32-byte key hash, then 32 bytes of zero padding before the entry count.
- The core's `LoadAssets` (`core/wasm-build/emscripten_io.c`) validates only the first 48 bytes and reads the entry table from byte 80. Bytes 48 to 79 are free host metadata.
- The key hash tracks entry names only. A bake that changes what an existing entry contains (for example, appending dialogue template lines) produces a byte-identical header. The stamp closes that gap: a cached blob whose version differs from `CURRENT_BAKE_VERSION` is recompiled at profile load, the same as a missing blob.
- Blobs baked before stamping existed read as version 0, because the pad is zeroed.
- `HEADER_MIN_BYTES` is the smallest valid container: 88 bytes of signature, hash, pad, count and name block length.
- Bump `CURRENT_BAKE_VERSION` on any bake-output change the key hash cannot see. History:
  - v1: receipt-message template lines appended after the vanilla dialogue lines (`build-language-entry.ts`, `buildLangData`).
  - v2: one more template line after those, the archery host's refusal (`randomizer-templates.ts`, shown by `core/game-hooks/archery_host.c`).
  - v3: eight more after that, a shelf's refusal per non-rupee currency (`randomizer-templates.ts`, shown by `core/game-hooks/shop_refusal.c`).
  - v4: one more after those, a shelf's thanks over a purchase's hold-up (`randomizer-templates.ts`, shown by `core/game-hooks/shop_overrides.c`).

### asset-extraction/compile-alttp-asset-set.ts

- The SNES ROM is the authoritative base and compiles the same as it always did, so nothing here changes its bytes.
- Optional cartridges contribute separate, self-describing containers, stored as their own files and joined only at load.
- Each optional source has its own error boundary. An unreadable or unrecognised extra cartridge degrades to "no supplement", never to "no game". A single shared try block once let a bad optional ROM fail the whole compile and leave the user with no assets at all.

### asset-extraction/compile-dialogue.ts

- Packs the US ROM dialogue plus any extra language packs into the parallel `kDialogue`, `kDialogueFont` and `kDialogueMap` arrays. The game picks one at startup through the INI `Language` key.
- US is always index 0. Extras follow in the order given.

### asset-extraction/compile-dungeons/build-default-and-overlay-rooms.ts

- The entrance tables are built first because their order must match the C asset order in `assets.h`.

### asset-extraction/compile-dungeons/build-dungeon-rooms.ts

- The chest table at SNES `0x81e96e` holds 168 records of 3 bytes: a room word, then the item. Bit 15 of the room word marks a big chest.
- The table at `0x80990c` lists the 57 rooms whose pits hurt the player.

### asset-extraction/compile-dungeons/build-entrance-data.ts

- Set 0 is the overworld entrance table and set 1 the starting points. The port appends its own records to set 0 only.

### asset-extraction/compile-overworld/build-overworld-tables.ts

- Area tables are written through `awrite`, which fills all four screens of a large area.
- Fall holes are sorted by entrance id, and each position is re-encoded from the ROM's form.
- Secrets are read for area heads only.

### asset-extraction/compile-resources-gba-alttp/assert-travel-stays-in-dungeon.ts

- A staircase or a hole sends the player to whatever room its header slot names, with no check that the room belongs to this dungeon. A misread destination teleports the player somewhere unrelated instead of failing.
- A fixed-width read of the variable-length header once produced exactly that: short records took the next room's bytes, and two thirds of the slots named a room outside the dungeon. Most often that was room 0, which the cartridge means as "unused" and the engine reads as the base game's final boss room.
- A slot the cartridge never stored reads as zero and is never reached, because the room has no such staircase. Every slot that carries a destination must name one of the dungeon's rooms, so anything else is a reader bug and is raised, never rewritten to fit.

### asset-extraction/compile-resources-gba-alttp/compile-gba-alttp-supplement.ts

- `assertBlocksetIdentity` fails the supplement, never the base game, if the blockset stops being a base-game one.
- The cartridge names its enemy sheets in the base game's own numbering. That was verified against the three blocksets the base table also defines, where the two quartets match. So what ships is the composition alone; the pixels are already in the base cartridge. `assertEnemySheetNumbering` fails the build when that stops holding.
- One builder per manifest entry, keyed by the asset's name. The manifest decides call order, so inserting or reordering an asset means editing `asset-manifest.ts` only.
- `kGbaPalaceCameraBounds` is empty on purpose. Hardware pans these rooms in full, and the grey backdrop beyond the walls is real map content. The pin machinery stays for a future room that measures as clamped on hardware.

### asset-extraction/compile-resources-gba-alttp/compile-resources-gba-alttp.constants.ts

- `BASE_ENTITY_TYPE_COUNT`: entity types the base engine has a handler for. The port added four of its own beyond this (a gatekeeper, two quest actors and a marker). Dispatch is an indirect call through a fixed table, so handing one to the engine does not spawn a wrong enemy: it crashes. They are dropped until they have implementations.
- `HEADER_LIGHTS_OUT`: bit 0 of the first header byte, which the base game reads as "this room starts unlit". The cartridge sets it on five of these rooms, including the dungeon's central hub (the room seven others lead back into, described by guides as a large lit room with four doorways). Passed through, that room renders pitch black, so the base game's reading of the bit is wrong here. It is cleared until understood. The dungeon has dark rooms of its own, which will need the bit back under whatever the real condition turns out to be.
- `EFFECT_BYTE`: header byte 4 is the layer effect, and the engine's dispatch table defines eight (`ENGINE_EFFECT_COUNT`). `ENGINE_EFFECT_FLOWING_WATER` is the engine's flowing-water layer effect; a hook gives it this dungeon's direction.
- `FIRST_TRAVEL_BYTE` to `LAST_TRAVEL_BYTE`: header bytes 9 to 13 hold where a hole drops to, then the four staircase destinations.
- `UNUSED_DESTINATION`: a slot the cartridge trimmed away. No such exit exists in the room.
- `OCCLUDER_TOP_LAYER`: the cells the port occludes with sprites move onto this layer, which the loader composites onto BG1 with the priority bit. BG1 is the only background that renders above the player's sprite priority indoors; high-priority BG2 does not.

### asset-extraction/compile-resources-gba-alttp/native-header-bytes.ts

- The port stores its own blockset id in the theme byte, which the engine reads as `aux_tile_theme_index` and loads graphics from. The blockset is a base-game blockset (see `blockset-identity.ts`), so writing its native index makes the engine load the right sheets by itself.
- The cartridge uses layer-effect values past the engine's eight for effects of its own. Its effect 8 is the water rooms: measured on hardware, those rooms alpha-blend the middle layer half over the floor. This engine's translucent designation 4 renders the same thing (the lower layer blends half with the sub-screen upper layer), so effect 8 maps onto it. Every other room gets designation 3 (opaque upper layer), and other unknown effects become "none" until measured.

### asset-extraction/compile-resources-gba-alttp/room-major-layer-buffers.ts

- One buffer per layer per room, room-major, because the C side indexes them as `room * 3 + layer`.

### asset-extraction/compile-resources-gba-alttp/room-palette-record.ts

- Palette ids past the base dungeon-palette table read as empty from the fixed base address. A room whose extracted record is mostly zero borrows the palette of the first room with a complete record, so every emitted record is usable.
- Those rooms keep their real palette id in the header for the day the extended entries are captured from hardware.

### asset-extraction/compile-resources.ts

- The final pipeline stage: assembles every game asset into `zelda3_assets.dat`. Ported from upstream's `compile_resources.py`.
- The call order is the asset order of the blob and must not change.
- Dialogue needs language extraction and the sound banks need the music compiler; `skipDialogue` and `skipMusic` leave them out. `extraLanguages` are baked after US, which is index 0.

### asset-extraction/compression/brr-codec/index.ts

- BRR (Bit Rate Reduction) is the SNES DSP sample format. Ported from upstream `util.py` (`decode_brr` and `encode_brr_generic`).
- The output must be bit-exact for game audio fidelity.
- The four filters match the Python `kBrrFilters` table.

### asset-extraction/compression/lz-decompress/decompress.ts

- SNES LZ decompression, the 7-mode format the game uses for compressed assets. Ported from upstream `util.py` `decomp()`; the output must be byte-identical.
- Command byte: when the top 3 bits are not `0b111`, the command is bits 7 to 5 and the length is bits 4 to 0, plus 1. When they are `0b111`, the command is `(byte << 3) & 0xE0` and the length is `((byte & 3) << 8 | next) + 1`. `0xFF` ends the stream.
- Commands: `0x00` copies N literal bytes from the stream; `0x20` repeats one byte N times; `0x40` alternates 2 bytes for N bytes; `0x60` starts at a byte and adds 1 for each copy; `0x80`, `0xA0` and `0xC0` copy N bytes from earlier in the output, at an offset read from the stream (big-endian by default).
- The reader crosses SNES banks the same way as the Python `Reader` class. With the return-length overload the result is `[data, compressedLength]`.

### asset-extraction/dat-container/index.ts

- A read-only view over a serialized `zelda3_assets.dat` blob, the exact inverse of `AssetBuilder.serialize()`. It uses plain `Uint8Array` and no `Buffer`, so it runs in the renderer and in Node.
- Layout: a 48-byte signature, 32 reserved bytes, a u32 asset count, a u32 name block length, then `count * 4` asset sizes, the NUL-separated name list, and each asset's bytes aligned to 4.
- `datAssetNames` returns null when the blob is not an assets file. `findDatAsset` returns a subarray view into the blob.
- `dat-reader` reads the same format; the two overlap.

### asset-extraction/dat-reader/index.ts

- Reads one named entry out of a compiled assets blob, the inverse of `AssetBuilder.serialize()`.
- Layout: a 16-byte signature and a 32-byte key hash, 32 bytes of padding, then the entry count and the length of the name block (`COUNT_AT` is byte 80, `HEADER_BYTES` is 88). After that come the entry sizes as u32s, the NUL-separated names, and the payloads in the same order, each aligned to the next 4-byte boundary of the file.
- A caller can pull one asset without re-running extraction from a ROM. The studio needs the stock player tiles and gear palette, and the blob is already cached.

### asset-extraction/data/constants.ts

Named ROM addresses used by asset extraction, which replace magic numbers from the Python code.

- `ADDR_HUD_PALETTE`: 16 sub-palettes of 4 colours (64 words).
- `ADDR_SPRITE_PALETTE_MAIN`: main sprite palettes 1 to 4, 4 times 15 colours (120 words).
- `ADDR_SPRITE_PALETTE_AUX1`: auxiliary sprite palette data (168 words).
- `ADDR_SPRITE_PALETTE_AUX3`: auxiliary sprite palette 3, for palette 0 (84 words).
- `ADDR_SWORD_PALETTE`: 4 swords of 3 colours (12 words).
- `ADDR_SHIELD_PALETTE`: 3 shields of 4 colours (12 words).
- `ADDR_ARMOR_PALETTE`: the player's armour palette (Green Mail is armour 0, 15 colours).
- `ADDR_DUNGEON_BG_MAIN`: indoor background palettes, 90 words per set (6 rows of 15 colours).
- `ADDR_OVERWORLD_BG_MAIN`: outdoor background main palettes, 35 words per mode (5 rows of 7 colours).
- `ADDR_OVERWORLD_BG_AUX12`: outdoor background auxiliary palettes, 21 words per index (3 rows of 7 colours).
- `ADDR_OVERWORLD_BG_AUX3`: outdoor third auxiliary palette, 7 words per index (one row).

### asset-extraction/data/tables.ts

- Game data tables ported from upstream's `tables.py`. Only the tables the port needs so far are here.
- `kCompSpritePtrs`: SNES addresses of the LZ-compressed sprite sheet tileset data. The first 12 sheets are stored uncompressed.
- `kCompBgPtrs`: SNES addresses of the compressed background tilesets.

### asset-extraction/extensions/second-cartridge-animated-tiles/second-cartridge-animated-tiles.data.ts

- The engine animates a fixed window of background tiles by holding three frames in memory and uploading one each time the animation advances. This dungeon reuses that window, so its own frames must occupy it or the base game's water animation overwrites the art the rooms reference.
- Only one of the three frames is in the cartridge's static tile sheet, so these bytes are the live tile memory of the running cartridge, read in a water room, in the order it cycles them.
- Layout: three frames, each 32 tiles of native GBA 4bpp, starting at tile 0x1b0.

### asset-extraction/extensions/second-cartridge-attrs/entrance-chamber-overlay.ts

- The entrance chamber (room 0x88): columns 19 and 44 on rows 4 to 61 are side walls the collision conversion leaves walkable, and columns 31 and 32 on rows 59 to 63 are the south exit's doorway stripe.

### asset-extraction/extensions/second-cartridge-attrs/hub-overlay.ts

- The hub (room 0x78): its north wall door art has no door record and no room behind it, so walking the passage would edge-transition into the sealed void. Rows 4 to 6, columns 30 to 33 close the alcove at the wall line.

### asset-extraction/extensions/second-cartridge-attrs/ledge-overlay.ts

- Ledge cells are written on both layers because a swimmer reads the lower one: the engine moves the player there the moment all four of its probes read deep water. The room's two levels are kept in step anyway, so this is a second guard.

### asset-extraction/extensions/second-cartridge-attrs/second-cartridge-attrs.constants.ts

- The attribute overlay is a set of per-cell corrections applied after a room's collision installs. The port's collision arrays are the source of truth, but exit doorways need the native doorway stripe value the exit tables key on, and some cells the collision conversion gets wrong (the entrance chamber's side wall columns) need explicit correction.
- Overlay record format: layer byte, cell low byte, cell high byte, attribute byte. Tile override record format: tile number as a 16-bit little-endian word, then the attribute byte.
- Walls use attribute 0x01, not 0x02: the engine's simplified sprite tile table treats 0x02 as passable, so a 0x02 wall blocks the player but lets most enemies walk through it.
- 0x0a is the engine's short water ladder: a water cell the player can climb out onto.
- Tiles 0x1b6 to 0x1b9 are the water surface tiles the cartridge animates. Every cell drawn with one is deep water; without that the surface is plain floor and the room's current has nothing to carry.

### asset-extraction/extensions/second-cartridge-attrs/second-cartridge-attrs.data.ts

- Wall art tiles: the port redrew these ids as wall crenellation, but their vanilla attributes (which the engine's per-tile table still carries outside the aux region) are walkable. They were measured as pass-through gaps in the hub's and chamber's outer walls. The overrides apply to attributes_for_tile for every bank room.
- Water rim tiles: the base game's table calls these four a ledge. Swimming into a ledge hops the player out of the water wherever he touches it, which against a wall lands him out of bounds. They are the pool's rim, so they are wall. Making them walkable was tried and is worse: it opens the whole rim and a swimmer can push onto the floor.
- Water ledges: indoors there is no general way out of deep water. The engine's probe reports a normal tile for plain floor only outdoors, so the hop out is driven by the short water ladder (or a staircase) only.
- A vertical move probes three points across the player's 16-pixel width (+0, +8, +15), and all three must read the ladder, so a pair of cells lets the hop fire only on an exact 8-pixel alignment. The ledge pairs plus one cell of margin either side give a landing window the player can hit.
- Room 0xdd has two ledges, both at a staircase: the pool's south bank and the foot of the north stair. The columns are the port's own: its collision array marks each run's two ends with a code of its own (cols 47 to 50 south, 41 to 44 north). Only the middle pair of each run is the way up; the ends are the stair's own sides and are closed as rim.

### asset-extraction/extensions/second-cartridge-bank/second-cartridge-bank.constants.ts

- The extra dungeon's rooms live in one full high-byte page of the room grid, ids 0x200 to 0x2FF.
- The engine's world is one flat 16-wide grid where doors and edges are id arithmetic with no ownership, so a dungeon that shares ids with the base game shares its neighbours too.
- The engine writes every staircase and hole destination into the room index's low byte, so the high byte acts as a bank. A base that is a multiple of 0x100 keeps every such write inside the bank. Any other base straddles pages: measured with base 0x140, a hub staircase went to 0x1E9 instead of 0x229.
- All cartridge room ids are below 0x100, so every room keeps its original relative geometry.

### asset-extraction/extensions/second-cartridge-doors/second-cartridge-doors.constants.ts

- The room grid is 16 rooms wide, so a direction moves the room id by -16, 16, -1 or 1 (north, south, west, east).
- Door types 6, 10, 12, 14, 16 and 18 leave for the overworld; their destination comes from the exit table, so the adjacency rule does not apply to them.

### asset-extraction/extensions/second-cartridge-doors/second-cartridge-doors.data.ts

- A door is not part of a room's tilemap. The engine reaches doors past a marker in the room's object stream and reads them as two-byte records, and drawing one is what registers it: the tilemap address, type and slot, direction and the doorway's transit attribute all come from that pass. The cartridge ships its rooms pre-expanded, so the records were baked away and every room came out sealed.
- The records were recovered by enumerating every type, position and direction the engine's door drawer can draw and matching each against the room's baked maps. A record is listed when every cell it writes is already present exactly as the engine would write it. The results agree across room boundaries (each north door is answered by a south door in the room above), which is the check that this is recovery and not pattern matching.
- Word layout, as the engine decodes it: type in the high byte, position in bits 4 to 7, direction in bits 0 to 1 (0 north, 1 south, 2 west, 3 east).
- Records are only ever appended, never inserted: slots are handed out in list order, and anything ahead of a teleport record renumbers it out from under the teleport handling.
- Room 0x78 (hub): the east record was missed by the match; walking the room on hardware showed an exit there onto 0x79, whose own west door at the same height the match did find. An earlier east record 0x0023 (position 2) sat mid-room because the centre platform's frame art matched as a door. The west record is a teleport door: type 0x10's attribute becomes the 0x89 transit family on a west or east door, and the engine reads the destination from the header's third staircase slot. The hub's west exit leads to the west chamber, whose east door is the same type reading the fourth slot for the way back. There is no north record: the top-centre is the staircase to the east wing, and a door drawn there would overwrite the staircase's slot attribute with its transit strip.
- Rooms 0x79, 0xbd and 0xfc each end with a north edge record that answers the south edge door of the room above (0x69, 0xad and 0xec). Without it the transition started and found nothing to arrive at. These are plain doors: a shutter needs a tag in this room to reopen it, and none of the three has one.
- Room 0xcd: the south record at position 8 is the room's own south edge. Positions 0 to 2 are the inner wall between the room's two halves. Without the edge record the water room's north door starts a transition, finds nothing, and aborts partway with the scroll left mid-move. The art is the port's own shutter, which this engine's door drawer cannot reproduce, so the record is reasoned from geometry. It is a shutter, like the same edge in the dungeon's three other arenas; all four rooms carry the boss tag pair. Shutting the player in is safe only because that tag pair is remapped to open on a cleared room (GbaAlttp_FilterRoomTags), since the crystal it otherwise waits on never comes in this dungeon.
- Room 0xdd: the north record at position 2 is read off the room's art: the opening sits at columns 46 to 49 on rows 4 to 6, where the engine places that position. Position 8 puts the door mid-room, in the water.

### asset-extraction/extensions/second-cartridge-doors/stays-in-dungeon.ts

- A plain door has no destination of its own: the engine walks to the neighbouring room by arithmetic on the room id. The dungeon's twelve rooms are scattered across the grid, so some recovered records point at whatever the base game has next door. Those are dropped: some are shapes that matched a door pattern without being one, the rest are exits the cartridge reaches by stairs and holes, which carry their destination in the room header.

### asset-extraction/extensions/second-cartridge-links/append-extra-entrance.ts

- Every geometry field is derived from the room's place in the 16x20 room grid. Checked against two base-game entrances into full-size rooms: id 19 into room 0xf8 (row 15, column 8) and id 9 into room 0x84 (row 8, column 4) both reproduce from these formulas.
- `quadrant1` is read as `quadrant_fullsize_x = value >> 4, quadrant_fullsize_y = value & 0xf`. A room declared not full size horizontally is treated as two 256px pages, so the background scrolls past the room's edge and wraps; a wrong value here caused the camera drift.
- The blockset field is read by the engine as main_tile_theme_index. The palace field makes it a real dungeon (map screen, HUD slots, banked keys).
- Room bounds are high bytes the engine shifts back up: y first, then x, each pair one quadrant's low and high edge in half-room units.

### asset-extraction/extensions/second-cartridge-links/append-extra-exit.ts

- The exit is cloned from the Pyramid's exit and shifted east by the same distance as the opening, so scroll, camera and door fields stay coherent with each other.
- The load offset is shifted because the engine recomputes the map16 load column from it (`(off - 0x10 & 0x3e) >> 1`). Cloning it unshifted loads the Pyramid's column of tiles at the new position and the screen comes back as garbage.

### asset-extraction/extensions/second-cartridge-links/second-cartridge-links.constants.ts

- Entering and leaving a place is table driven: kOverworld_Entrance_Area, Pos and Id map an overworld cell to an entrance id; kEntranceData maps that id to room, player, camera, scroll, bounds and music; kExitData maps a dungeon room to where the player reappears outside. One record in each makes entry, exit, music, tagalong checks, the mirror and save-and-quit work with no code aware of the dungeon.
- The overworld and exit records are cloned from the base game's Pyramid opening and shifted, so their opaque fields (map16 load offsets, the two unknown scroll deltas, door settings) stay as the original had them.
- The records are appended unconditionally. The base blob stays identical whether or not a supplement is compiled, and they are unreachable without it: the entrance is only usable once the overworld opening is drawn, which only happens while the supplement is loaded.
- The Pyramid opening is overworld cell column 14, row 27 on area 0x5b; the extra dungeon's opening is drawn on the same row at column 43. A cell is 16 pixels wide, and an entrance position is a cell index doubled.
- Room 0x10 is the room the Pyramid opening leads to; the cloned exit record is keyed on it.
- The base game ships 133 entrance records, so the next free id is 133. The count is asserted at append time so a changed base table fails the build.
- A room spans 0x200 by 0x200 pixels and the grid is 16 rooms wide. Quadrant value 0x22 means both axes are full size (one viewport, no page split); 0x02 puts the player in the left half, lower vertical quadrant.

### asset-extraction/extensions/second-cartridge-map/second-cartridge-map.constants.ts

- `cur_palace_index_x2` carries the whole dungeon identity: the map screen refuses to open on 0xff, the HUD hides the map, compass and big key slots on it, and keys are only banked per dungeon for a real index. The base game ships fourteen dungeons, so this one is the fifteenth.
- The engine stores this field doubled. The base table holds 0, 2, up to 26 for its fourteen dungeons and -1 for a cave, and every table is reached by shifting it back down. Storing the plain index would land on an existing dungeon.
- Placeholder content: the two appended map records are a copy of palace 2, a single-floor dungeon, so the map screen opens and behaves, but the floor plan drawn is not this dungeon's yet. Authoring the real one needs the layout and tile byte format decoded (a byte per grid slot, 0xf for empty, plus one tile byte per occupied slot).
- The append asserts the base record count so the appended entry lands at the index the entrance record names.

### asset-extraction/extensions/second-cartridge-occluders.ts

- The port anchors an entity at each standing lamp's base (entity type 202 in this dungeon), and its handler draws the lamp head as a sprite above the player, because GBA tilemaps have no per-tile priority bit.
- This engine has a per-tile priority bit. The head cells are already in the baked bottom layer, so they get the SNES priority bit at extraction.
- The head is the two rows above the anchor, two columns wide, measured against the baked footprint.

### asset-extraction/extensions/second-cartridge-palette.ts

- A room header's second byte is a palette id that the engine reads as an index into its own table of sprite and aux palette sets. The port's own id means nothing there, so the header is rewritten to name an entry appended to that table for this dungeon. The engine's palette load then runs unmodified.
- The base game's palette set table ships 41 entries; this dungeon's entry is appended after them.
- The background colours still come from the cartridge, one record per room.

### asset-extraction/extensions/second-cartridge-palettes/second-cartridge-palettes.data.ts

- The extended palette ids index past the cartridge's palette table, so their records cannot be extracted from ROM. Each entry is the live palette RAM of the running cartridge, read in the room that uses the id: background rows 2 to 7, sixteen BGR555 colours per row, the same six-row block a room palette record carries.
- Palette 0x29 was captured standing in the water room (room 0xdd). Row 7 carries the water surface blues.
- The object palette rows come from the same capture: a row number then sixteen colours, which the engine writes into the matching sprite palette row.

### asset-extraction/extensions/second-cartridge-stair-slots.ts

- A staircase's destination is the header slot named by the slot attribute the engine derives for it. That attribute depends on the order stair objects register across the engine's stair buckets, which the baked maps do not record.
- These values were measured on original hardware with a memory tracer attached: each staircase was walked, and the arrival room identifies the slot because the header's destinations are known to be correct.
- Each requirement names the centre of the attribute grid region where the engine writes the slot attribute, and the exact value: low two bits are the slot, bit two is the direction family. 0x30 plus slot walks up on arrival, 0x34 plus slot walks down.
- The solver searches stair variants and orderings until the engine's own derivation, replayed over the candidate stream, produces these values. A room absent here keeps the art-driven solve.
- Hub (room 0x78): north-west and north-east lead to the antechamber (header slots 0 and 1), north-centre leads to the east wing (slot 3), and all three walk the player down. Slot 2 is the west wall's teleport door, so the room's fourth staircase (bottom-centre) consumes it.

### asset-extraction/extensions/second-cartridge-tiles/second-cartridge-tiles.constants.ts

- A map16 cell is a 2x2 block of 8x8 tiles. Bit 13 of each map8 word says the tile draws in front of the player.
- The wall the extra dungeon's opening is cut into has no foreground-priority variant of its own course. Borrowing the base game's opening cells drew a different course of brick, so the two rows above the doorway came out in the wrong colour.
- The two appended cells copy the wall cells' tile numbers, palette and flips and only add the priority bit, so the wall is pixel-identical with the option on or off; the player now passes behind it.
- The ids are positional. The base game ships 3752 map16 cells and the length is asserted, so the appended cells land at the index the C side draws.
- The twins are appended unconditionally, like the entrance records: the base blob keeps the same shape whether or not a supplement is compiled, and nothing reaches these ids without one.

### asset-extraction/extensions/second-cartridge-torches.ts

- A torch is not part of a room's picture. The engine registers torches from a table of room, positions, terminator entries, and that table also stores which torches are burning (the high bit of the position word).
- The cartridge ships this table as the base game's, word for word, with its own dungeon's entries appended past the point the base game stops scanning. The base game's copy at SNES 0x84f36a (144 words) is matched in the cartridge to find it; no stored offset is used.
- 64 bytes of the table are unique in an 8MB cartridge and short enough to survive an edit to it. The 256-word read limit is a ceiling; the table ends long before.
- Entries run until one names no room, which is how the cartridge closes the table. Rooms the dungeon does not own are dropped, so nothing unexpected in the tail reaches the engine's table.

### asset-extraction/graphics/oklab/index.ts

- sRGB to OKLab (Bjorn Ottosson, 2020): a colour space where equal distances look about equally different, and where lightness (L) and colourfulness (chroma, the length of a and b) are separate axes. A plain RGB distance has neither property: it can call a mid grey closer to a mid green than to a dark grey.
- An `Oklab` value is `[L, a, b]`: L runs from 0 (black) to 1 (white), and a and b are near 0 for a grey.
- `chromaOf` is 0 for a grey and about 0.1 to 0.3 for a saturated hue.

### asset-extraction/graphics/palette/index.ts

- SNES colour format: `0bBBBBBGGGGGRRRRR`, a 15-bit little-endian word. Each 5-bit component (0 to 31) is scaled to 8 bits (0 to 255).
- `RGBA` is `[r, g, b, a]`, each 0 to 255.

### asset-extraction/graphics/png-writer.ts

- `ImageBuffer` is an RGBA buffer (4 bytes per pixel, row-major) for compositing tiles before PNG export through pngjs. It replaces the PIL `Image` of the Python tools.
- `putPixel` and `getPixel` do not check coordinates, for speed.
- `paste` copies only pixels with alpha above 0. `flipX`, `flipY` and `scale` (nearest neighbour, integer factor) return a new buffer.

### asset-extraction/graphics/stripe-image.ts

- The game's stripe image format (`HandleStripes14` in `core/zelda3/src/nmi.c`): runs of VRAM words, each copied or repeated, across the tilemap or down it, ending at a byte with the top bit set. The title screen and the story intro both upload their pictures this way.
- `applyStripes` writes the stripe list at a SNES address into a word-addressed VRAM array. It returns the address just past the terminator, where a list stored back to back with it begins.

### asset-extraction/graphics/svg-pixel-art/index.ts

- Reads the one SVG dialect the project's own drawings use: a `viewBox` sized in pixels and a flat list of `<rect>` elements with integer geometry and hex fills (`#rgb` or `#rrggbb`, always opaque).
- Anything else in the document is ignored, so a drawing tool's extra attributes do no harm. No XML library is used; the shape is narrow enough for two regular expressions.

### asset-extraction/index.ts

- Reads a user ROM and writes the asset blob the game core loads.
- It is a TypeScript port of the upstream Python tools, so end users need no Python runtime.

### asset-extraction/item-sprites/art-badge.ts

- `art-badge` is the multiworld pool icon path: the base is a game's icon and the badge is the Archipelago mark, so the drawings stay unbadged and usable on their own.
- It stays separate from `upgrade-composite` although both stamp a badge, because the colour rules differ. An upgrade composite also reaches a binary drawn with one fixed sprite palette row; an art badge only becomes a PNG and keeps any colour the artist chose.

### asset-extraction/item-sprites/art-picture.ts

- A drawing is parsed into the same ImageBuffer a ROM decoded sprite produces, so it can stand as a sprite of its own or as the base of a composite.

### asset-extraction/item-sprites/art/art-library.ts

- The SVG text is inlined at bundle time through `?raw` imports, so the same table serves Electron main, the renderer and the extraction Worker with no file access at runtime.
- A drawing used by the `art` method only becomes a PNG for the app's own surfaces, written as 8 bit truecolour with alpha, so it may carry any colours.
- A drawing used by `upgrade-composite`, as the base or as the badge, also reaches a binary the core draws with one fixed sprite palette row, where every opaque pixel snaps to the nearest colour of that row. Those drawings are kept inside that row on purpose.
- The shop price symbols (`currency-*.svg`) are `art` sprites that also reach such a binary, so they are drawn in that row too.
- The pool icons (`pool/*.svg`) are free colour `art-badge` drawings that only become PNGs, one per game a multiworld pool may hold. The Archipelago badge beside them is never a sprite of its own.
- The definition schema lists a separate set of names per method, so a free colour drawing cannot reach the quantized path by accident.

### asset-extraction/item-sprites/badge-stamp.ts

- The badge is anchored to the bottom right corner of the base. Its opaque pixels overwrite the base and its transparent pixels leave the base untouched.

### asset-extraction/item-sprites/base-resolver.type.ts

- A derived sprite (composite or recolour) gets its base through the caller, which turns another definition's file name into that definition's extracted picture. The derived sprite never knows how its base was decoded.

### asset-extraction/item-sprites/bg-palettes/dungeon-bg-palette.ts

- Indoors, one 90 word set gives rows 2 to 7 their full 15 colours.

### asset-extraction/item-sprites/bg-palettes/overworld-bg-palette.ts

- A background sheet is stored 3bpp (eight pixel values). The loader widens it to 4bpp into either the lower half of a row (values 1 to 7) or the upper half (values 9 to 15), depending on the VRAM slot the sheet was loaded into, so the two halves come from different ROM tables.
- Outdoors: rows 2 to 6 take their lower half from the main table (one 35 word set per palette mode), row 7 takes its lower half from the third auxiliary table, and the upper halves come from the shared auxiliary table, rows 2 to 4 from `aux1` and rows 5 to 7 from `aux2`.
- Pixel value 0 is never written because it is the backdrop showing through, so every row keeps a transparent entry there.

### asset-extraction/item-sprites/bg-tile-decoder/extract-bg-tile.ts

- A map screen draws from eight compressed 3bpp background sheets of 64 tiles each, loaded into VRAM in a fixed slot order. Sheet index n backs tile numbers n*64 and up.
- A tilemap word holds the tile number across all eight sheets in bits 0 to 9 (so `number >> 6` picks the sheet), the palette row in bits 10 to 12, a horizontal flip in bit 14 and a vertical flip in bit 15.
- Four words in reading order (top left, top right, bottom left, bottom right) make one 16x16 ground block.
- `upper` names the sheets whose values were widened into the upper half of their palette row (see `bg-palettes`).

### asset-extraction/item-sprites/capacity-icons/capacity-icons.constants.ts

- The four upgrade composites are quantized to one sprite palette row and encoded as 128 B per icon, 512 B in all, written as `capacity-icons.4bpp`. The core copies one over the receipt decode slot and draws the receipt with that row (`core/game-hooks/upgrade_icon.c`), so no palette is written.
- `CAPACITY_ICON_FAMILIES` is in the core's order: explosives, projectiles, meter, wallet.
- `CAPACITY_ICON_PALETTE_ROW` is mirrored by `ICON_PALETTE_ROW` in `core/game-hooks/upgrade_icon.c`. Change both together.
- Row 4 is used because it holds the badge's green, the jar's blue and the bomb's greys. Row 2, the refill receipts' row, has no green and turned the badge orange.
- `EXTRACTION_FORMAT_VERSION` is the hand bumped half of the extraction version. Bump it whenever a decoder, a composite or a converter changes the bytes it writes while the definitions and drawings stay the same.
- Version history: 1 presence only sets before any stamp; 2 capacity icons on row 4 (were row 2); 3 gear pictures added; 4 quiver picture added; 5 shop price symbols added; 6 multiworld pool icons added; 7 pool icons quantized by OKLab with greys to greys (was plain RGB); 8 pool icons quantized to their own 15 colour palette carried after them (was row 4).

### asset-extraction/item-sprites/currency-symbols/currency-symbols.constants.ts

- A randomized shelf may charge arrows, bombs, hearts or a bottled item, and the price is bare digits. The nine currency drawings are reduced to one sprite palette row and encoded as the two 4bpp tiles of a 16x8 strip, 64 B each, 576 B in all, written as `currency-symbols.4bpp`. The core lends each shown symbol a tile row of the substituted sprite pool and draws it beside the digits (`core/game-hooks/shop_symbols.c`).
- `CURRENCY_SYMBOL_PALETTE_ROW` is mirrored by `SYMBOL_PALETTE_ROW` in `core/game-hooks/shop_symbols.c`. Change both together.
- `CURRENCY_SYMBOL_FILES` is mirrored by the symbol ids in `shop_symbols.c`: the first four are the currency tags, and the five bottled ones follow the bottle slot values (3 red, 4 green, 5 blue, 6 fairy, 7 bee).
- Row 4 is the only main sprite row whose colours are identical in both world halves, and the drawings were made from it.
- The arrow, bomb and heart are traced from the HUD counters and carry that palette's colours. The HUD grey has no grey in row 4 and would snap to its light green, so it becomes white first, which keeps the arrow's fletching readable.
- An 8 px wide drawing fills the left tile and leaves the right one blank; the core reads the width from that.

### asset-extraction/item-sprites/dialogue-glyph-decoder/extract-dialogue-glyph.ts

- The dialogue font is 256 tiles of 8x8 2bpp. One character is two stacked tiles (8x16), so the tiles pair up into 128 addressable characters. For character c the top tile is `(c >> 4) * 32 + (c & 15)` and the bottom tile is 16 further.
- The colour is a reconstruction, not ROM data: `GLYPH_RAMP` is shared with every live redraw so a cut file and a redraw cannot drift apart.
- `glyphRight` pairs the right half of a two half picture, giving one 16x16 image.

### asset-extraction/item-sprites/drop-tables.ts

- The drop lookup tables are ported from upstream `extract-item-sprites.py`. `kDecodeTab` is the receipt decode table, reused by the big key drop.

### asset-extraction/item-sprites/extract-items/extract-items.constants.ts

- The `art` method needs no ROM at all: the drawing is the sprite, for an item the game never had a picture for, so it works the same whatever ROM is loaded. `art-badge` is likewise ROM free.
- A composite builds on another definition by file name through `ctx.resolveFile`; a definition that loops back on itself throws.

### asset-extraction/item-sprites/extract-items/extract-sprite-buffers.ts

- The extraction core is pure (no fs), so it runs in the renderer, the extraction Worker and Node. File writing and ROM loading from a path live in `extract-items-node.ts`.
- The stamp buffer goes first and names the definitions and code the set comes from, so a set whose files are all present but whose bytes predate the current code is refreshed.
- Each picture is scaled 2x for its PNG (16x16 becomes 32x32).
- The in-game binaries are added whenever the set defines every picture they are built from.

### asset-extraction/item-sprites/extraction-stamp/extraction-version-of.ts

- Presence alone cannot tell a set built by older code from a current one, because every file is there and only the bytes differ. The stamp names what produced the set so the staleness check can refresh it.
- The version has two parts. The hash covers every input the code sees at runtime (the definitions and the drawings), so a changed recipe or SVG refreshes the set with no manual bump. The format number covers the decoders and converters, which change bytes without changing a definition.
- The drawings are hashed in name order so the hash does not depend on the table's key order.

### asset-extraction/item-sprites/extraction-stamp/fnv1a.ts

- FNV-1a 32 bit: stable across runs and hosts, dependency free and synchronous so it runs inside the pure extraction core. It is not a security hash; a collision only means one skipped refresh.

### asset-extraction/item-sprites/fixed-row-tiles/encode-icon.ts

- A 16x16 picture becomes the four SNES 4bpp tiles of the core's animated tile decode slot at 0xBD40, in the slot's own order: top left, top right, bottom left, bottom right, 32 B each (see `core/game-hooks/decode_slot.h`).
- Each tile is planar: planes 0 and 1 interleaved per row, then planes 2 and 3.
- The core copies the tiles over the decode slot and forces the draw's OAM palette row to the row they were quantized to, so nothing writes CGRAM and the picture cannot pick up whatever the row happens to hold.

### asset-extraction/item-sprites/fixed-row-tiles/quantize-icon.ts

- Index 0 is transparent. Every opaque pixel snaps to the nearest of the row's colours 1 to 15 by squared RGB distance.
- The returned error is the mean squared RGB distance per opaque pixel, a measure of how well the row fits the picture.

### asset-extraction/item-sprites/foreign-icon-palette.ts

- The palette is picked from the icons' pixels. The core shows the icons against a private palette bank of these colours (`foreign_icon_bank.c`).
- Fixed entries come first: black, white, every tone all the icons share (the outline, and the Archipelago badge's colours, so the badge reads the same on every icon), and every grey covering at least an eighth of one icon (the fused shadow's two greys).
- The remaining entries come from a weighted k-medoids over the other tones, measured in OKLab with lightness at half weight, as the matcher measures them. Seeds are picked farthest first: each takes the tone the entries so far serve worst, weighted by area. A medoid is a real tone of the art, so every entry is a colour an icon actually uses.
- A grey and a colour never serve each other, so their distance is infinite.
- Every entry is snapped to SNES 15 bit colour. Index 0 is transparent; entries run greys dark to light, then colours by hue.

### asset-extraction/item-sprites/foreign-icons/foreign-icons.constants.ts

- The multiworld pool icons are drawn by the core over the hold up of another player's item. Each pool picture is quantized to the icons' own 15 colour palette and encoded as 128 B, in `FOREIGN_ICON_FILES` order, followed by the palette: 16 little endian SNES words, the first one 0 (transparent). The file is `foreign-icons.4bpp`.
- The core shows picture n for foreign icon id 0xB0 + n (`core/game-hooks/foreign_icon.c`), so `FOREIGN_ICON_FILES` is the id table: append, never reorder.
- The core resolves the icon's pixels against the palette in a private bank, so no sprite row of the game has to fit art drawn for other games.
- `FOREIGN_ICON_PALETTE_ROW` is the row the icon's OAM entry names. The colours come from the private bank, so the row only decides colour math (rows 4 to 7 take it, as every receipt does). It is mirrored by `FOREIGN_ICON_PALETTE_ROW` in `core/game-hooks/foreign_icon.c`. Change both together.

### asset-extraction/item-sprites/gear-icons/gear-icons.constants.ts

- The eight gear receipts (four blades, three shields, and the duplicate blade id the opening scene uses) are the only receipt ids drawn with sprite palette row 5 (`kWishPond2_OamFlags`). Row 5's entries 9 to 15 are loaded from the player's own blade and shield level, and `AncillaAdd_ItemReceipt` reloads them for the item being granted.
- That is right for the hold up and wrong elsewhere: a shelf, a drop or a standing pickup draws the item in whatever gear the player carries, and three shelves offering three blades look the same because they share one picture (gfx 0x18).
- Each picture is extracted with its own row 5 variant (`PAL5_CONFIG`), quantized to one always resident row and written as `gear-icons.4bpp`, 128 B per id, 1024 B in all. The core copies the tiles over the slot after a world draw decoded the art there and forces that draw's palette row (`core/game-hooks/gear_icon.c`). The hold up is left alone.
- Row 4 is the best fit of the four candidates by mean squared error per opaque pixel (worst id 4119, mean 2066, against 5778, 5434 and 16859 worst for rows 1, 2 and 3). It is also the only main sprite row whose colours are identical in both world halves. Rows 1 to 3 change with `Palette_Load_SpriteMain`'s world offset, and rows 0 and 5 to 7 are area or equipment palettes that are not always resident.
- `GEAR_ICON_PALETTE_ROW` is mirrored by `GEAR_PALETTE_ROW` in `core/game-hooks/gear_icon.c`. `GEAR_RECEIPT_IDS` is mirrored by `kGearReceiptIds` there. Change both together.
- `GEAR_RECEIPT_IDS` is every id whose `kWishPond2_OamFlags` entry is row 5, which is the set in `PAL5_CONFIG`. `GEAR_ICON_FILES` is in the same order.
- A narrow receipt (`kReceiveItem_Tab1` is 0) is two stacked 8x8 tiles drawn from the slot's left column. The extracted picture centres it in a 16x16 frame, so its pixels sit `NARROW_INSET` (4) columns right of where the slot wants them.

### asset-extraction/item-sprites/hud-decoder/decode-hud-tile.ts

- HUD item tile ids hold the tile number in bits 0 to 9, the palette index in bits 10 to 12, a horizontal flip in bit 14 and a vertical flip in bit 15.
- The tiles live in three compressed sheets (106, 107, 105 in that order), 128 tiles each, 16 bytes per tile in 2bpp.

### asset-extraction/item-sprites/palette-swap/extract-palette-swap.ts

- A palette swap derives a gem of a colour the game never drew from one it did, keeping the tile art and the outline.
- Colours match the decoded RGBA exactly. A `from` colour the base does not hold is treated as a typo in the definition and throws.

### asset-extraction/item-sprites/perceptual-match/match-tones.ts

- Colours are matched by how they look (OKLab), for pictures drawn with colours the row does not hold.
- A grey only becomes one of the row's greys, matched by lightness. When several greys of the picture land on one entry and the next darker grey entry is unused, the darkest of them moves down to it, so a picture drawn in three greys keeps an outline against its body.
- A colour only becomes one of the row's colours, matched by OKLab distance with lightness at half weight, so the hue decides first. When two areas land on one entry, the one closest to it in lightness keeps it and the other moves to the nearest entry on its own side in lightness within `SPREAD_LIMIT`, so two shades of one hue (a gold shield and its pale cross) stay apart.
- A tone of `SPECK_PIXELS` or fewer pixels (the badge's specks) never takes or loses an entry; it shares its nearest one.
- An equal colour held twice in the row resolves to its lowest index.
- `NEUTRAL_CHROMA` is the OKLab chroma below which a colour reads as grey. The pool art's warm outline is 0.002.

### asset-extraction/item-sprites/perceptual-quantize.ts

- This quantizes the multiworld pool icons to one fixed row by how the colours look. The colour choice is made per picture by `matchTones`. Index 0 is transparent.

### asset-extraction/item-sprites/quiver-icon/quiver-icon.constants.ts

- Under the retro bow the quiver is handed over as the single arrow receipt, so the game's own art for it is an arrow, on the shop shelf and in the hold up.
- The app's `quiver.png` drawing (`art/quiver.svg`) is reduced to one sprite palette row and written as `quiver-icon.4bpp`, 128 B. The core copies it over the slot wherever that receipt's art was decoded and draws with that row (`core/game-hooks/retro_quiver_icon.c`). The extracted PNG keeps every colour.
- Row 4 fits the drawing's browns and gold best by mean squared error per opaque pixel (1705, against 1801, 1850 and 1896 for rows 3, 1 and 2), and its colours are identical in both world halves.
- `QUIVER_ICON_PALETTE_ROW` is mirrored by `QUIVER_PALETTE_ROW` in `core/game-hooks/retro_quiver_icon.c`. Change both together.

### asset-extraction/item-sprites/receipt-decoder/extract-receipt.ts

- Receipt sheets are 0x5A (base) plus one of 0x5B, 0x5C or 0x5D, picked by the graphics sheet number.
- An OAM flags entry of 0xFF falls back to sprite palette row 5, the row filled from the player's sword and shield.
- The crystal (receipt 32) uses palette row 6 with a fixed blue gradient in entries 9 to 15. The gradient is a reconstruction, not ROM data.

### asset-extraction/item-sprites/receipt-palettes/load-sprite-palettes.ts

- Rows 1 to 4 are the main sprite palettes, 15 colours each.
- Rows 5 and 6 take their lower half from the first auxiliary table. Row 6's upper half (entries 9 to 15) is row 6 of `kPalette_MiscSprite`, the light world outdoor default.
- Row 5's entries 9 to 11 are the sword colours and 12 to 15 the shield colours.
- Row 0 comes from the third auxiliary table.
- Row 7 is the player's armour palette, loaded as the Green Mail (armour 0).

### asset-extraction/item-sprites/receipt-tables.ts

- The decode tables for the receipt (item hold up) sprites are ported from upstream `extract-item-sprites.py`.
- `PAL5_CONFIG` holds the receipt ids drawn with sprite palette row 5 and the sword and shield level whose colours fill that row for them.

### asset-extraction/item-sprites/write-and-prune.ts

- Writing no PNG means the definitions were absent, never that every file on disk went stale, so pruning is skipped then. Pruning against an empty set would empty the whole folder.
- Only PNGs are pruned; the stamp and the icon binaries beside them stay.
- A missing output folder on the first run is tolerated during pruning.

### asset-extraction/music/compile-music.ts

- Compiles the extracted music text back into an SPC sound bank image. Ported from upstream's `compile_music.py`.
- `produceLoadableSeq` turns the sparse SPC memory into the loadable sequence: runs of a u16 length and a u16 target address followed by the bytes, ended by a zero length.

### asset-extraction/music/dump-brr-info.ts

- Dumps the BRR samples and builds `music_info.yaml` (samples, instruments, note gate and volume tables, sound effect instruments).
- Samples 10 and 20 are duplicates of 9 and 19 (`kDupSamples`, also in `compile-music.ts`).

### asset-extraction/music/extract-music.ts

- Loads the SPC sound banks from the ROM, decodes songs, phrases, patterns and sound effects, and produces their text plus the sample output. Ported from upstream's `extract_music.py`.

### asset-extraction/music/music-serializer.ts

- Writes compiled music entities into the SPC memory layout. In a sound effect line, a rest or tie (`.`) needs no extra byte.

### asset-extraction/music/sound-bank-context.ts

- Holds the SPC memory state while decoding, and decodes song, phrase and pattern structures from it.

### asset-extraction/music/spc-command-tables.data.ts

- The SPC command tables shared by extraction and compilation. Command `0xe0 + n` is effect `n`, which takes `kEffectByteLength[n]` argument bytes. Notes 72 and 73 are `-+-` and `---`.

### asset-extraction/packed-bytes/index.ts

- A `Buffer`-free reader and writer for the packed-array format the core parses with `FindIndexInMemblk` (`util.c`): count minus 1 offsets relative to the end of the offset table, the concatenated parts, then a u16 trailer holding count minus 1 (16-bit offsets) or 8192 plus count minus 1 (32-bit offsets).
- `packPackedBytes` matches `packArrays` in `asset-builder` byte for byte, with the same width rule: 16-bit while every offset fits and the count allows. `unpackPackedBytes` is its inverse.

### asset-extraction/rom/load-rom-file.ts

- Node-only ROM loading from a file path. It is kept apart from `rom-loader` so the browser and Worker asset pipeline (`loadRomFromBuffer`) carries no `fs` import.
- `load-gba-rom-file.ts` is the same for the GBA cartridge.

### asset-extraction/rom/reader.ts

- A sequential byte reader that advances across SNES banks. It replaces the Python `Reader` class and the `get_byte` callback pattern. Words and 24-bit values are little-endian.

### asset-extraction/rom/rom-loader/load-rom-from-buffer.ts

- Loads a ROM with SHA-1 validation and version detection, and returns a `RomData` (dependency injected, no global state).
- A 512-byte SMC header is stripped when present. The Swedish translation is identified by hash with a length of `0x10083b`, and then carries a second 512-byte header that is also stripped.

### asset-extraction/rom/rom-types/rom-types.type.ts

- `RomData` is the dependency every extraction function receives. It replaces the Python global `ROM` singleton.
- `bytes` is the raw ROM with the header stripped. Every getter takes a SNES address; words and 24-bit values are little-endian.
- `getBytes` and `getWords` handle bank boundaries.
- `RomHashTable` maps an uppercase hex SHA-1 to the ROM identification.

### asset-extraction/sources/gba-alttp/asset-manifest.ts

- This manifest is the single source of truth for the order of the GBA supplement's assets. The C engine reads the container positionally: an index means the Nth `assets.add*` call and nothing more.
- The TS compiler (`compile-resources-gba-alttp.ts`) iterates the manifest to decide call order, and `npm run generate:gba-asset-index` reads it to emit `core/game-hooks/gba_asset_index.generated.h`, a C enum in the same order. Adding, removing or reordering an entry here moves both sides together.
- `name` is the exact string passed to `assets.add*`. It also feeds the container's key signature hash, so it must stay stable for an asset once shipped.
- The generator script imports this file directly with Node type stripping, so it must keep its path and must not gain a runtime import (type-only imports are erased and are fine).

### asset-extraction/sources/gba-alttp/blockset-identity/blockset-identity.constants.ts

- The extra dungeon's background blockset is a base-game blockset. Measured against the base cartridge: the eight 64-tile sheets are packs 0, 1, 17, 12, 14, 37, 27 and 15, which is what the engine composes from main theme 9 plus aux theme 9. 453 of the 512 tiles are byte-identical to those packs in planes 0 to 2, and five of the eight sheets match 64 out of 64.
- MAIN_TILE_THEME is main_tile_theme_index, carried by the entrance record's blockset field. AUX_TILE_THEME is aux_tile_theme_index, carried by the room header's third byte.
- The identity gives tile ids: the room maps address the base game's tiles by the base game's numbers, which makes derived collision and rebuilt object streams possible. It does not give the pixels. The base game stores background art as 3bpp and synthesises the fourth plane on load (zero for some VRAM slots, the OR of the other three for others). The port stores real 4bpp and re-encoded three sheets to carry their colour in the palette. So the sheet is still uploaded whole; the theme indices cover everything the engine derives from a blockset.
- assertBlocksetIdentity guards that claim: below 440 matching tiles the build fails, so rooms whose ids mean something else never ship.

### asset-extraction/sources/gba-alttp/dungeon-source/parse-room-header.ts

- Only the stored bytes of a header belong to the room; the trimmed tail is zero, not the next room's header.

### asset-extraction/sources/gba-alttp/dungeon-source/parse-room-layer.ts

- Dungeon graphics are assembled from 64-tile sheets whose collision meanings share one 128-entry attribute bank, selected by the room's blockset.
- A room layer is a 64x64 map stored as four 32x32 GBA screen blocks.

### asset-extraction/sources/gba-alttp/graphics-source/graphics-source.constants.ts

- The sprite sheet pointer table is at 0x0822b324, four entries higher than it first appears. Reading from 0x0822b314 returns the art of the sheet four ids lower, which made the cartridge's ids look renumbered. They are not: its quartets match the base game's for every blockset the base table also defines.
- The animated background slots 6 and 7 take tiles 32 to 47 of the sheets at 0x08276ff0 and 0x08276c38, placed at tiles 432 and 448 of the palace sheet.

### asset-extraction/sources/gba-alttp/header-record-length/header-record-lengths.ts

- The cartridge stores the fourteen-byte room header with its trailing zero bytes trimmed, and the pointer table records where one record ends and the next begins.
- The first seven bytes are always present. The rest (the quadrant nibbles, the hole destination and the four staircase destinations) are stored only up to the last non-zero byte, so records are seven, ten, eleven, twelve, thirteen or fourteen bytes long.
- Reading a fixed fourteen bytes walks off the end of every short record and picks up the next room's header as this room's travel destinations, which silently rewrites where a staircase leads. Lengths are recovered by sorting the pointer table and measuring the gap to the next record.
- Rooms may share one record (the table holds duplicate pointers), so the gap is measured to the next distinct address.

### asset-extraction/sources/gba-alttp/room-records/parse-entities.ts

- An entity list starts with a sort mode byte, then three-byte records (y, x, type), terminated by 0xff. Lists are stored per room behind their own pointer table.
- Type 0xe4 with y 0xfd or 0xfe is a death marker, not an entity.
- An x byte of 0xe0 or more marks an overlord.

### asset-extraction/sources/gba-alttp/room-records/parse-secrets.ts

- A secret record is a two-byte tilemap position and an item byte, terminated by 0xffff. Secret lists are stored per room behind their own pointer table.

### asset-extraction/sources/gba-alttp/sprite-sheet-identity/sprite-sheet-identity.constants.ts

- The cartridge's enemy sheets are the base game's, under the same numbering. For blocksets 21, 25 and 26, which both tables define, the cartridge's quartet is byte-identical to the base game's.
- Uploading the sheets' pixels is the wrong fix: enemies draw from tile numbers baked into the engine's sprite code, which assume the base game's sheet in each slot. What the cartridge contributes is the composition for the blocksets the base table leaves empty, which is most of this dungeon's.
- BASE_SHEET_DELTA is 0 and kept named so a future divergence has somewhere to go. Sheet id 0xff is a slot the cartridge leaves to whatever was already loaded.
- Base game sprite sheets below index 12 are stored raw; the rest are compressed. A base sheet is 64 tiles of 24-byte 3bpp, 0x600 bytes.
- compareSpriteSheets checks every referenced sheet against its base sheet so a wrong pointer table or delta cannot ship unnoticed; the caller decides what to do with an imperfect match.

### asset-extraction/sources/gba-alttp/tile-shape-matches.ts

- A base game 3bpp tile is planes 0 and 1 interleaved (16 bytes), then plane 2 (8 bytes). A 4bpp tile is 32 bytes with plane 2 starting at byte 16 interleaved with plane 3. A tile's shape matches when planes 0 to 2 are equal.

### asset-extraction/sources/optional-sources.ts

- Every optional cartridge that can add to the base game, in the order their containers are appended at load time. The engine sniffs containers positionally, so this order is part of the on-disk contract: append new sources, never reorder.
- Each optional source owns both halves of its job: deciding whether the user supplied it (compile returns null when its ROM is absent) and compiling it. Adding a source is a registry entry, not another branch in the compiler.

### asset-extraction/sources/source-ids.ts

- This module has no runtime imports on purpose. The storage layer needs to know which sidecar files can exist, and importing that from the source registry would pull the whole extraction pipeline into every renderer module that touches asset storage.
- Append only. The engine reads containers positionally, so the order of the ids is an on-disk contract.

### asset-extraction/sources/source.type.ts

- The base cartridge is required: if it fails to compile there is no game, so it throws. Every other source is optional and must never take the base down with it, so an optional source reports failure as data.

### asset-extraction/story-intro/extract-legend/extract-legend.constants.ts

- The four pictures of the story intro: the legend told over the polka-dot backdrop before the attract sequence moves on to the world map.
- Each picture is a stripe list (`kAttract_Legendgraphics_0` to `3`, stored back to back from `ADDR_LEGEND_STRIPES`) that the NMI writes into the BG3 tilemap. Each list starts where the one before it ends.
- The pictures are drawn from the 2bpp sheet `Attract_LoadBG3GFX` uploads: sheet `0x67` (`LEGEND_SHEET`), copied as-is to BG3 characters `0x100` to `0x17f`.
- They use HUD palette row 5. `hud_palette` 1 is the second 32-colour block of `kHudPalData` (`HUD_PALETTE_BLOCK`).
- `UNWRITTEN` marks the tilemap cells no stripe wrote, so each picture is cut to exactly its own cells.

### asset-extraction/text/build-language-entry/build-lang-data.ts

- The randomizer template lines are appended after the canonical vanilla lines at bake time only. dialogue.txt, meta.json and the Language Studio all keep seeing 397 lines. The core addresses the templates as fixed message ids (kReceiptMsg_* in core/game-hooks/game_hooks.h), so the vanilla count must be exact before appending.

### asset-extraction/text/build-language-entry/build-language-entry.constants.ts

- The core's kDialogue, kDialogueFont and kDialogueMap are parallel arrays; index 0 is the US ROM and extras follow. ZeldaSetLanguage(code) looks the code up in kDialogueMap and pulls dialogue and font by the stored index. Ported from upstream's compile_resources.py print_dialogue().
- The US ROM omits one control string. It is inserted at index 4 so a 396-string ROM reaches the canonical 397.
- Dialogue map flags: bit 0 is the new format, bit 1 means no US ROM match.

### asset-extraction/text/data/font-data.ts

- Each language stores its 8x8 2bpp glyph tiles and a per-glyph width table at language-specific ROM addresses. Every dialogue font is 256 tiles of 16 bytes.
- The official EU ROMs (de, fr, fr-c) keep their font in a different bank than the US ROM; the translation hacks reuse the US font slot but vary the glyph count.
- tileAddr is the SNES address of the glyph sheet, widthAddr the SNES address of the width table, widthCount the number of glyphs in the width table (the language's effective alphabet size). Ported from upstream's sprite_sheets.py kFontTypes.

### asset-extraction/text/data/glyph-ramp.ts

- The colour ramp the dialogue face is drawn with. It is not ROM data: the font stores two bitplanes and the engine paints it over whatever palette the text box has loaded, so these four values reconstruct the on-screen look.
- Index 0 is background (transparent), 1 the dark blue edge, 2 the mid highlight, 3 the white fill. The values are SNES 5-bit colours expanded to 8-bit.
- It lives on its own so the extraction that cuts characters to files and the editor that redraws them from a pack's font agree.

### asset-extraction/text/data/language-data/language-data.data.ts

- Language definitions for the game's text compression and decompression, one config per language, ported from upstream's text_compression.py.

### asset-extraction/text/data/randomizer-templates/randomizer-templates.data.ts

- Randomizer template lines are appended after the 397 canonical vanilla dialogue lines at bake time (build-language-entry), never persisted into a pack's dialogue.txt, so every language entry gains them on its next compile whenever the pack was extracted.
- The order is a frozen contract with the C side: `kReceiptMsg_*` and `kRandomizerMsg_*` in `core/game-hooks/game_hooks.h` index these lines as dialogue message id 397 plus position. Append new templates at the end only, and bump CURRENT_BAKE_VERSION (bake-version.ts) so cached blobs are recompiled.
- The game's text engine has no runtime string substitution (only the player name and preloaded digit commands), so these are fixed context-class lines, not per-item text.
- The character set is restricted to letters, digits, space and `.,!?`, the intersection of every language's alphabet, so the fallback text encodes under every encoder. `[1]`, `[2]` and `[3]` select the box's three lines and are commands both encoders share, so a line long enough to wrap says where it breaks.
- Lines in order: generic (an overridden chest with no richer class), progressive (one tier of a multi-tier family), dungeon item (key, big key, palace bitmask trio), delivered (granted by the delivery queue), online (sent by another player in a shared game); then the archery host refusing a fee for a game that could not be played (archery_host.c); then shelves refusing a price the player cannot pay, one line per non-rupee currency (shop_refusal.c), where the five bottled ones follow the bottle slot values the game stores, 3 to 7, so the core indexes them by the value a bottle price demands; then a shelf's thanks over the hold-up of what was bought (shop_overrides.c), which names nothing because the item is already in the player's hands.
- TEMPLATE_TRANSLATIONS holds per-language translations keyed by language code, each in the same order and length as the fallback list. None exist yet; a translated language adds its entry and the bake picks it up.

### asset-extraction/text/dialogue-decoder/decode-strings-with-config.ts

- Ported from upstream's text_compression.py decode_strings_generic(). Byte 0x7f ends a message.
- The pt translation tolerates the eight bytes after its bank switch byte, and its decode stops after 397 messages.

### asset-extraction/text/dialogue-encoder/cmd-info.ts

- The command table for the new encoder format (pt and the EU ROMs).

### asset-extraction/text/dialogue-encoder/compress-strings.ts

- Ported from upstream's text_compression.py compress_strings() and its encoders. Compression is greedy: a dictionary match first (looked up by first character), then a bracketed command or a bracketed alphabet entry, then a plain alphabet character.

### asset-extraction/text/menu-text/charset/charset.constants.ts

- The ending renderer never stores characters. Every text byte indexes a 160-word tile table in ROM (`kEnding_MapData`, SNES 0x8EB038), which fixes the alphabet:
  - 0 to 25: small 8x8 A to Z, first palette
  - 26 to 51: the same glyphs, second palette
  - 52 to 55: small punctuation: comma, apostrophe, hyphen, period
  - 56 to 81: the same glyphs, third palette
  - 82: small mid-height dot (the one used for an ellipsis)
  - 83 to 92: large 8x16 digits 0 to 9, upper half
  - 93 to 118: large 8x16 A to Z, upper half
  - 119 and 120: large apostrophe and exclamation mark, upper half
  - 121 to 158: the lower halves of 83 to 120, same order (index plus 38)
  - 159: blank
- A large character costs two entries and occupies two tile rows: upper halves on one row, lower halves on the next. Both decoders collapse such a pair into one line.
- The five punctuation glyphs carry no name in ROM. They were identified by drawing the tiles they point at (0xe5, 0xf5, 0xf3, 0xf4 and 0xd6 of the 8x8 font sheet) and matching the shapes against the dialogue font's comma, apostrophe, hyphen and period.

### asset-extraction/text/menu-text/decode-captions.ts

- Captions on the sixteen closing scenes. `kEnding0_Offs` (SNES 0x8EC2E1, 17 words) brackets each scene's slice of `kEnding0_Data` (0x8EBF4C, 917 bytes). A slice is a run of records shaped vram address word, control word, character indexes; the character count is `((control >> 9) & 0x7f) + 1`. Records use the credits' 160-entry character set.
- Each scene has a caption in the small 8x8 font and a place name in the large 8x16 font. The large one costs two records (upper halves, then lower halves, at two tilemap addresses), so the upper record is dropped and the lower one is emitted as `location`. Small font records are emitted as `title`. Extra records of a role are suffixed `-2`, `-3`; only scene 2 does this, opening with a stray one-character record before its caption.
- Every record writes horizontally into a 32x32 tilemap, so every caption gets a 32-tile row positioned by its start column. The record's own length is not a ceiling, since the offset table lets a record be repacked to any size.

### asset-extraction/text/menu-text/decode-credits.ts

- `kEnding_Credits_Offs` (SNES 0x8EB93D, 394 words) gives, for each of the 394 scroll rows, a byte offset into `kEnding_Credits_Text` (0x8EB178, 1989 bytes). A row is either the single byte 0xFF (nothing on the row) or a record of start column, byte count, character indexes. The count is a DMA byte count: the renderer uploads one 16-bit tile per character, so a row holds `(count + 1) >> 1` characters. Records are packed back to back and several rows share an offset, so the offset table is the only reliable way in.
- A large 8x16 character spans two scroll rows. A row of only upper halves is dropped and the following row emitted, because the lower row carries the whole line: on the play count rows it also carries a small font prefix that never appears on the upper row.
- The renderer walks a 32x32 tilemap (advancing 0x20 words per row and wrapping every 0x400), so a row is 32 tiles wide and a line is centred by its own start column. The play count table at the end is the exception: the renderer writes three digits at column 0x19 of the same row, so those lines get 25 tiles. Both numbers come from the renderer.
- COUNTER_SCROLL_Y lists the scroll positions at which the renderer also draws a play counter, from its own table. Halving gives the row index; the row after each one is part of the same two-row band and gets a counter too.

### asset-extraction/text/menu-text/decode-stripe-text.ts

- The file select and name entry screens are four prebuilt tilemap uploads in ROM (SNES 0xCE7BF, 0xCE2A8, 0xCE63C, 0xCE456, in screen order), each a chain of stripe runs shaped address hi, address lo, control hi, control lo, payload, closed by a byte with bit 7 set. The control word carries the payload length in its low 14 bits (length plus 1 bytes) and a fixed source flag at 0x4000 (the payload is one word repeated). A listed payload is a run of tilemap words, two bytes each.
- The letters are the dialogue font in its 8x16 arrangement: the tile for character code `c` is `(c & 0x70) * 2 + (c & 0xf)`, with the lower half 0x10 later. Reading a run inverts that and looks the code up in the language's alphabet. Runs of only lower halves repeat the row above and are dropped; runs whose tiles fall outside the 256-tile sheet are frame art and are dropped too.
- A few codes past the end of the alphabet table are supplied in EXTRA_GLYPHS (the sheet has more glyphs than the compressor can encode). Code 0x5f is a narrow bar the roll uses as capital I and the on-screen keyboard reuses as lowercase l; it is read as I.
- A run's tile count, read from the control word, is the room the screen gives that line.

### asset-extraction/text/menu-text/menu-text.type.ts

- Every menu, credits and caption decoder returns the same shape. The three bodies of text live in three different ROM formats, but an editor wants the same three things from each: a stable key (for example `credits.row-041`, `caption.scene-03.title`, `menu.copy-player`), the readable English line, and how much room the screen gives it (for the editor's fit meter).

### asset-extraction/text/parse-dialogue-text/parse-dialogue-text.ts

- Parses a stored dialogue.txt dump (the inverse of formatDialogueText) back into lines. Each line is `N: <content>`; content never contains a newline because control codes are bracketed (for example `[Scroll]`), so a plain line split is safe.
- dialogueTexts returns only the content strings, ordered by id, ready to feed back to compressStrings.

### asset-extraction/title-screen/extract-title/extract-title-part.ts

- The pictures of the finished title screen, each cropped to what it draws: the logo (BG1), the Master Sword (ten intro sprites at rest), the triforce behind the logo (three copies of the polyhedral engine's triangle) and the lake with the castle behind them all (BG2).
- The backdrop shows through the background's own colour-0 pixels, so the background picture is made opaque over palette entry 0.

### asset-extraction/title-screen/title-palette.ts

- The title screen's CGRAM once every fade has finished: the palette the intro fades toward (aux_palette_buffer), which the main palette equals from then on. The backdrop (entry 0) is black, as Palette_BgAndFixedColor_Black leaves it.

### asset-extraction/title-screen/title-render/render-bg-screen.ts

- Draws the first 32x32 screen of a background layer from its tilemap, as the PPU would draw it unscrolled. Colour 0 stays transparent.

### asset-extraction/title-screen/title-render/render-sprites.ts

- Draws 16x16 sprites from a name table, on one OBJ palette row, onto a 256x256 canvas. Colour 0 stays transparent.

### asset-extraction/title-screen/title-tables.ts

- Where the title screen's pictures come from, resolved from the game's own setup (Intro_InitializeMemory_darken, Overworld_LoadAllPalettes and the intro sword in core/zelda3/src). The title loads main tileset 35, aux tileset 81 and sprite tileset 125; the sheet ids are those rows read out, so no tileset table is needed.
- A sheet slot is one 3bpp sheet expanded into 64 4bpp tiles at a VRAM word address. When `high` is set the fourth bitplane is the OR of the other three (Do3To4High), otherwise zero.
- TITLE_BG_SLOTS hold the background character data for BG1 (logo) and BG2 (lake and castle), VRAM 0x2000 to 0x3fff.
- 0x5000 is the second OBJ name table (OBSEL 2); the intro sword's sprite sheet (50) is expanded there.
- 0x0cdd6d is the stripe list the NMI uploads when the logo appears (kBgTilemap_0). Tile 0x1ec is what EraseTileMaps_normal fills both tilemaps with before the stripes land.
- Tilemap VRAM word address per layer: BG1 at 0x1000 (BG1SC 0x13), BG2 at 0x0000 (BG2SC 0x03).
- A palette load copies `rows` rows of `count` colours from `rom` (table address plus index times stride) into CGRAM starting at word `dst`. The loads are Overworld_LoadAllPalettes with the title's indices (mode 5, aux 3/3/0, sp0l 11), plus LoadTriforceSpritePalette, which copies kPolyhedralPalette into OBJ palette 5.
- The sword at rest comes from Intro_PeriodicSwordAndIntroFlash. Its attribute byte (0x21) selects OBJ palette 0, which is CGRAM row 8.
- The triforce is the polyhedral engine's one 64x64 triangle, drawn as three 4x4 grids of 16x16 sprites where the pieces land (kIntroSprite0_XLimit and YLimit), the right-hand one mirrored (kIntroTriforceOam_Left and Right). It uses OBJ palette 5 (CGRAM row 13) from the second name table. Its bitmap sits at VRAM 0x5800.

### asset-extraction/title-screen/title-vram.ts

- Rebuilds the part of VRAM the finished title screen draws from: background and sprite character data, the triforce bitmap and the two tilemaps the stripe list writes. Word addressed like the PPU (0x8000 words). A 64x64 tilemap is four 32x32 screens (0x1000 words).
- expand3bpp follows Do3To4High and Do3To4Low: 24-byte 3bpp tiles into 16-word 4bpp tiles.
- The triforce is no sheet: the polyhedral engine draws it, and at rest its frame never changes, so it is rendered once.

### asset-extraction/title-screen/triforce/poly-model/poly-model.constants.ts

- The triforce model is read from bank 09 of the ROM: the tables poly.c carries as kPoly1_Vtx, kPoly1_Polys and kPolySinCos.
- Each face is its vertex count, that many vertex indices, then a colour byte the engine ignores.
- The sine table is signed; cosine is the same table 64 entries on.
- The rest pose is both angles zero, the distance term (poly_config1) run down to zero, and the picture centred at (32, 32) of its 64x64 bitmap (Intro_InitGfx_Helper, Intro_RunStep).

### asset-extraction/title-screen/triforce/poly-raster.ts

- Port of the polyhedral engine's face filler (Polyhedral_DrawFace and its helpers in core/zelda3/src/poly.c), kept to the same integer widths so its edges land on the same pixels. It writes 4bpp sprite tiles into a WRAM-shaped buffer at 0xe800, the block the NMI copies to VRAM 0x5800.
- leftMask and rightMask are the span masks of the left and right partial bytes of a line, doubled for two bitplanes. planesOf is kPoly_RasterColors: every bitplane byte full where the colour has that bit set.
- nextEdge is Polyhedral_SetLeft and SetRight: find the next vertex down this side; true ends the face.
- drawFace fills one convex face given as poly_xy_coords (count times 2, then x, y pairs).

### asset-extraction/title-screen/triforce/poly-render.ts

- One frame of the polyhedral engine (Poly_RunFrame in core/zelda3/src/poly.c): rotate and project the vertices, then fill every face that faces the camera. The integer widths follow the original because they decide where the edges land. Returns the 0x800-byte tile block the NMI copies to VRAM 0x5800.
- divide is Poly_Divide: a signed numerator over an unsigned divisor, both halved until the divisor fits a byte.
- projectVertices is Polyhedral_OperateRotation; the model's x and z trade places.
- crossProduct is Polyhedral_CalculateCrossProduct: positive when the face turns toward the camera.
- shadeOf is Polyhedral_SetForegroundColor for this model at distance 0: brighter the more face-on.

## Config

### config/port-slot.ts

Which port slot a checkout runs in. Node only: the dev server configs and scripts read it, the renderer never does. `ROTP_PORT_SLOT` wins when set; otherwise the `.rotp-port-slot` file at the checkout root, written once when a worktree is created; otherwise slot 0, the main checkout. The env name and the file name are in `port-slot.constants.ts`.

### config/ports.constants.ts

The project's fixed block of local ports, and the one place a port number is written. The block starts at 1991, the year the game was released. Each role sits at a fixed offset from the base, and a checkout with port slot N shifts the whole block by 10 x N, so two checkouts never serve on the same port. The main checkout is slot 0.

Roles:

- `renderer`: the app's renderer dev server (electron-vite dev).
- `catalogue`: a component catalogue. None exists today; the offset stays reserved.
- `site`: the Sanctuary website dev server.
- `siteApi`: the Sanctuary API, run locally by the functions framework.
- `static`: a static file server, for install manifests and previews.
- `mgbaTracer`: the mGBA Lua socket tracer that reads the second cartridge live.

`ARCHIPELAGO_DEFAULT_PORT` is not part of the block. It belongs to the multiworld protocol.

`portFor` (`config/port-for.ts`) turns a role and a slot into the port. `cloud-functions/sanctuary-api/dev-server.mjs` runs as plain Node, so it loads `port-for.ts` and `port-slot.ts` through tsx's `require` (`tsx/cjs/api`), which resolves their extensionless sibling imports the way the bundler does.

## Credits

### credits/

The project credits. Keep them in step with `CREDITS.md` at the repository root.

## Display

### display/refresh-rate/

`GAME_HZ` is the frame rate the core runs at (NTSC, 60.0988). The refresh rate arithmetic (whether a display rate is a whole multiple of 60, the synced rate options, which reading to trust) comes from the Brock display module (`@drizztdourden08/brock-display`).

### display/turbo-speed/

The turbo speed ladder. The upstream desktop build ran 16x while its key was held, which is unplayable: text and menus fly past before they can be read. This ladder climbs from 1.25x to a 10x ceiling, with steps widening as they go so the slider feels even.

`DEFAULT_TURBO_SPEED` is fast enough to matter and slow enough to still read dialog. `turboSpeedIndex` snaps an unknown stored value to the nearest rung. `turboSpeedAt` clamps to the ladder. `turboSpeedPercent` is the whole percent value the core takes, snapped to the ladder so an odd stored value never leaks through.

## Features

### features/feature-registry/

The registry lists every feature that departs from vanilla, one data file per settings group, joined in a fixed order by `features.data.ts`. `FEATURES_BY_ID` indexes the joined list.

The 42 split bug fix toggles come from `bundle-fixes.generated.ts`, written by `scripts/build/gen-bundle-flags.mjs` from `scripts/build/bundle-settings.json`, so they stay in step with the C gate sites.

The rendering dependency chain is: extended rendering, then linear world tilemap, then ultrawide or tall. Camera lock needs extended rendering, and smooth transitions need camera lock.

Hiding the native HUD is not a registry feature. It runs through `g_hud_hide_mask` via `WasmSetHudHidden` and follows the HUD style setting, so it owns no features0 bit.

`offscreenAI` is a three way setting, but a registry entry carries one bit. The entry is the idle bit, the default. Paused maps to the older `kFeatures0_PauseOffscreenAI` bit, and vanilla sets neither. See `offscreenAiMode` in `apps/desktop/src/lib/game/settings.ts`.

`allowDiving` is not a Vanilla Safe casualty on purpose. It rides with the extra dungeon, which is added content and not a parity question, and the room it exists for cannot be crossed without it.

The two bug fix bundle masters (`miscBugFixes`, `gameChangingBugFixes`) have no active C read site. Their behaviour moved to the features1 and features2 split gates.

`developerToolsEnabled` only observes, but its hook is compiled into the vendored `misc.c`. Touching vendored code is the line Vanilla Safe draws, so it counts as parity affecting.

`devNavigationData` is dead under Vanilla Safe anyway, since it requires developer tools, which are masked. It is flagged so it sits under the same lock and does not look toggleable next to a locked control.

`trackerEnabled` is a player feature, not a developer one: the checks tracker polls inventory and save flags out of the running game. It sits with the player toggles for that reason.

### features/feature.type.ts

One `FeatureDef` per toggle that departs from vanilla zelda3. The C flag, the INI key, the TS flag map, the settings UI and the dependency rules all derive from these entries.

`FeatureKind` says how the engine enforces a feature:

- `features0-bit`: a bit in `enhanced_features0`, or in a later gate word once a word is full.
- `render-geometry`: a `g_config` value such as `extended_aspect_ratio`, applied at restart.
- `ppu-render-flag`: a bit in `ppu->renderFlags`.
- `host-event`: a gated host callback, haptics for example.
- `cheat`: a cheat that is neutral by default.
- `dev`: developer only, compiled out of a release.

`FeatureOrigin` names who introduced the change. A `snesrev` feature is already gated upstream and the app only exposes it. A `relic` feature is this project's own.

Field meanings:

- `userMessage`: the settings copy shown to the player, with its requirements and any parity disclaimer.
- `bundleOrigin`: for a split bug fix, the snesrev bundle it came from. An unset toggle follows its bundle switch.
- `flag`: the C symbol that gates it, for example `kFeatures0_CameraLockToViewport`. Absent for render geometry and cheats.
- `word`: the gate word holding the bit. 0 is `enhanced_features0`, 1 is features1, 2 is features2 (split bug fixes).
- `bit`: the bit value (`1 << n`) inside its word. The registry owns the allocation.
- `requires`: hard dependencies. The resolver turns the feature off unless every one of them is on.
- `suggests`: soft companions the suggestion card offers when the feature is turned on, without forcing them.
- `affectsVanillaParity`: true when the feature shifts render output or RAM. It gets the parity disclaimer and Vanilla Safe forces it off.
- `live`: false when the feature needs a restart to take effect.

### features/gba-differences.data.ts

A read only catalogue of everything the Game Boy Advance release changes. It is `@kind data`, which is why the game's own proper names are allowed in it while code, labels and comments elsewhere stay neutral.

`evidence` records how far the project got: `extracted` means the project's own tooling pulled it from the cartridge and can cite an address or a table; `documented` means it is well attested but not yet reproduced locally.

### features/hud-style/

The HUD style is the one choice the player makes. Everything the control scheme used to ask separately derives from it here.

- `vanilla` is the game's own HUD, drawn by the core.
- `enhanced` has the app draw the HUD and own the pause menu.
- `modern` is everything Enhanced does, plus the modern control scheme.

The values are the words shown on screen. `enhanced` was once stored as `extended`; `mergeSettings` migrates that old spelling on every read and is the only place that knows about it.

`hostDrawnHud` answers whether the app draws the HUD and owns the pause menu, which is true for every style but the original. `controlSchemeOf` is all that the old `GameSettings.controlScheme` setting used to store: the scheme is never stored, it is what the Modern style means.

### features/msu-auto-config/

Works out the technical side of a music pack from the pack itself. Each pack shape (standard or extended numbering, PCM or Opus, the layered format) has exactly one correct format, sample rate and channel count, and a wrong one is audible. Auto reads them off the files; Manual overrides them.

`MsuPackProfile` fields:

- `isDeluxe`: the pack carries tracks past the vanilla music slots, so the extended remap applies.
- `hasOpuz`: the pack holds Opus audio, which is 48 kHz where raw PCM is 44.1 kHz.
- `isLayered`: the pack carries a `pack.json`, so slots can stack scheduled layers. This decides how playback works (the other two only describe the audio), so it is the reported format. It comes from the manifest existing, which the caller has already looked up.

`DEFAULT_BUFFER` is a middle ground between latency and stability. It is a trait of the host, not of the pack.

`modeForPack` picks the format matching a pack's shape. A layered pack reports as `msul` whatever its audio is, because the manifest governs playback; track numbering is carried separately. `isDeluxeMode` is true for the modes that use the extended per area and per entrance numbering. `requiredSampleRate` is null when there is no single answer: MSU off, or a layered pack whose files are resampled anyway.

`resolveAudioConfig` in Auto derives everything: the mode from the pack shape, the rate from its audio format, stereo (MSU always is), and the buffer at a safe default since it depends on the machine. Manual passes the player's values through, wrong combinations included, and `detectMsuMismatch` warns about them (the old C player only reported this on stderr). Vanilla Safe suppresses replacement music entirely.

`resolveMsuPlayback` reads `isDeluxe` off the pack's own track numbers when it has them: a layered pack reports as `msul` but can still hold the extended slots, and dropping the remap would silence them.

### features/resolve-features/

`resolveFeatures` prunes a requested set to a consistent one: a feature stays on only while every id in its `requires` is on. It runs to a fixpoint, since turning one off can invalidate a dependent. Ids with no registry entry pass through untouched, so a newer id never breaks an older registry. `autoDisabled` records what was pruned and which requirements were missing, so the UI can explain the change.

`requirementClosure` lists every transitive requirement that turning a feature on would also need, limited to those not already on. It feeds the "this will also turn on" confirmation. `suggestionsFor` lists the soft companions to offer, never force, when a feature is newly turned on.

The shipping settings screen still cascades inline in its own view code; this resolver is the general replacement and is read by the registry tests and by `resolveGates`.

### features/resolve-gates.ts

The Vanilla Safe entry point of the resolver. With `vanillaSafe` on, every requested id whose entry has `affectsVanillaParity: true` is stripped first, with no exemptions, and the requires fixpoint then removes their dependents too, so no second list is needed. Ids with no registry entry are left alone, the same contract as `resolveFeatures`.

This is the TS settings pipeline. The C side mirror that cannot be bypassed is `SyncGateWords` in `zelda_rtl.c` (`kGateWordParityMask`).

### features/vanilla-safe-settings/

Settings that Vanilla Safe already neutralizes at runtime but that own no `FeatureDef`. The settings lock reads `affectsVanillaParity` off the registry, which only covers gate word bits. Without this list those controls stayed enabled while doing nothing.

Membership is a claim about runtime behaviour: a key belongs here only once something forces it off. `newRenderer` is absent on purpose, since it is a pure engine swap that stays on. Host side preferences (volumes, saves, window, scaling) never reach the emulated game and are absent too.

Why each group is locked:

- `cheatsEnabled`: gate word 3 drops every cheat bit under Vanilla Safe (`buildFeatureWord3`).
- The MSU keys (`enableMSU`, `resumeMSU`, `resetMSUAtTitle`, `packReplaceAmbient`, `packReplaceSfx`): `serializeToIni` writes MSU off and withholds the pack path.
- `linkSprite`: `serializeToIni` withholds `LinkGraphics`, and the override bit is masked.
- The HUD keys (`hudMode` through `hudCountdownStyle`): the `HudOverride` bit is masked, so the native HUD returns and every style option describes an overlay that is no longer drawn.
- `modernScheme`: the `ModernControls` bit is stripped from word 2, so the core keeps its own equipped item register and the slot assignments drive nothing. The scheme has no key of its own any more; it derives from `hudStyle`, which is also locked.
- `enhancedMode7`, `noSpriteLimits`: renderer effects that visibly differ from the cartridge, hand gated in `buildPpuFlags`.
- `hideSpaceBeyondWalls`: `pushLiveSettings` withholds the request under Vanilla Safe.
- `dialogSpeed`, `dialogHoldSpeed`, `dialogHoldToAccelerate`, `dialogFillOnB`, `dialogTypewriter`: the `DialogControls` bit is masked out of gate word 3, so the core plays text at the game's own speed.
- `dialogBox` and the dialog look keys after it: the enhanced dialog box rides the same `HudOverride` bit as the custom HUD, so the native box comes back.
- `hudHighlightPrimary`, `hudHighlightSecondary`: gate word 3 drops the receipt messages bit, so no line carries the highlights.

Haptic settings are nested, so they arrive as dotted keys (`haptics.swordSwing`). The whole haptics group counts as locked: its master flag is stripped from features0 and again by the C side parity mask, so every per event toggle under it is inert.

## Hub (shared accounts)

### hub/api-contract/

The account routes every site serves, and the helpers each site's own route table is built with. A path segment starting with `:` is a parameter, which `formatPath` fills. The API's router and the site's client both read these tables, so a route exists in one place. `formatPath` URL encodes each value and throws when a segment has no value, so a missing id fails before the request leaves.

### hub/device-types/

A signed in app instance. The desktop app signs in through the device code flow and keeps an opaque Bearer token; only its sha256 is stored (`tokenHash`), and the token is shown once. `label` reads like "Windows · DESKTOP-4F2" and comes from the app at confirm time.

### hub/group-types/

Groups decide what a signed in person can do. A group names, per site, the permissions its members hold; a person's rights on a site are the union of their groups' permissions for that site. A group can be linked to a Discord role, which puts everyone holding the role in it (refreshed at sign in and re-check), and an admin can also add people by hand.

- `GroupRights`: permission names per site, as each site's `RightsModel` spells them.
- `Rights`: what one caller may do on one site, the union of their groups, or everything for an admin.
- `DiscordRole`: one role of the Discord server, as the group editor offers it. `color` is RGB as a number, 0 when the role has no colour. `position` is Discord's own order, highest first when sorted descending.
- `DEFAULT_GROUP_ID` is seeded from the old contributor role and sees everything, so nobody lost access when groups arrived.

### hub/limits/

The sizes, counts and lifetimes every site, its API and the app agree on: multipart parts, signed URL lifetimes, sessions and device codes. A site adds its own caps on top in its own limits table.

- `partBytes`: size of one multipart part. `partsPerSign`: part URLs signed per request.
- `partUrlSeconds`: lifetime of a presigned part PUT. `previewUrlSeconds`: lifetime of a presigned view link, long enough to watch a video through. `downloadUrlSeconds`: lifetime of a presigned download GET.
- `noteMaxChars`: length of a file or grant note.
- `deviceCodeTtlMs`: how long a device user code stays valid. `devicePollMs`: the interval between two device polls from the app.
- `sessionDays`: the session cookie lifetime.

### hub/providers/

The identity providers a person signs in to the shared accounts with. An identity id is `${provider}:${subject}`, so this list is also the prefix vocabulary of every identity.

### hub/rights-model.type.ts

What one site lets a group grant: its permission names, the words the group editor shows for each (`labels`), and the one line summary the groups list prints (`describe`). Each site ships one; the hub resolves a caller's rights against the model of the site being called.

### hub/rights.ts

The one question every rights check asks: does this caller hold this permission on the site being called. An admin holds every one; no rights holds none.

### hub/schemas/

Request body schemas. `common` holds the field schemas several bodies share, so a cap is stated once: free tags (lowercase, no spaces, at most `MAX_TAGS`, deduplicated), the one line note (at most `HUB_LIMITS.noteMaxChars`, trimmed), the app version a record relates to (null when it relates to none), and ids (Firestore doc ids and multipart ids: short, printable, no slashes).

`account-schemas` covers saved views (`PUT /me/views/:id`, the snapshot opaque here), the device code flow (`POST /device/begin`, `/device/confirm`, `/device/poll`) and the admin grant and revoke (`POST /admin/grant/:userId`, `/admin/revoke/:userId`). The view surface is a name each site checks against its own list. The user code is normalised to upper case with its dash, the shape the site shows, so a code typed by hand still matches.

`group-schemas` covers groups and memberships. A group's rights name permissions per site; the shape is checked here, and each API checks its own site's names against its model. A site left out of the rights grants nothing there. A Discord role id is a snowflake, digits only. `POST /groups` creates, `PATCH /groups/:id` changes at least one field, and `PUT /admin/users/:userId/groups` replaces the person's manual groups.

### hub/site-types/

The sites that stand on the shared accounts, and how each lets a signed in person in. An approval site runs the access chain; an open site lets anyone signed in through. What a person holds on one site is their `SiteAccess` record for it: the access check plus when the person first came to the site. `SiteUser` is a user as one site's API answers `GET /me`: the account plus that site's record under `access`, null when the person never signed in there. A released app reads `user.access`, so the field stays.

### hub/types/

Identity and access records of the shared accounts: the user, the provider identities bound to it, the manual access grant and the per user saved views. Device records live in `device-types`, groups in `group-types`.

- `AccessSource`: which rule of the access chain matched. `none` goes with the pending state, `open` with an open site. `checkedAt` is the epoch ms of the last run of the chain.
- `HubUser.id` is the Firestore doc id, never a provider id. `displayName` comes from the first identity and is editable. `sites` holds one record per site the person signed in to. `groupIds` are groups an admin set by hand and never change on their own; `roleGroupIds` come from the Discord roles held at the last sign in or re-check. Bumping `sessionVersion` signs the user out everywhere.
- `Identity.id` is `${provider}:${subject}`, so a provider account binds to one user only. `subject` is the Discord user id, GitHub user id or Google sub. `handle` is a username, login or email, for display only.
- `AccessGrant` is one user granted by hand from the admin queue; `by` is the granting admin's user id.
- `SavedView` is a named FilterBar and DataTable arrangement, per user and per surface. The surface is a name each site checks against its own list. The snapshot is the renderer's `ViewSnapshot` (columns, sort, group by, filters); it stays `unknown` here because `shared/` never imports the renderer design system, and the site and the API narrow it at the edge.

### hub/upload/run-multipart/

The part loop of one multipart upload the server has already opened: sign the missing parts in batches of `HUB_LIMITS.partsPerSign`, PUT each batch in parallel with up to `PART_TRIES` tries per part, then complete with every ETag in part order. `done` holds the parts already in the bucket (empty for a fresh upload, read back from the server for a resumed one) and gains each part as it lands; it maps part number to ETag. A failure throws and leaves the record open, so the caller decides between resuming and aborting. The caller supplies the record's steps and the PUT, so any site and the app run the same loop.

- `BegunMultipart` is an open multipart record: its part layout and the steps bound to it. `sign` takes `partsDone`, the count of parts already up, which the record keeps. `abort` drops the record, which aborts the upload. `listParts` reads the parts the bucket already holds, for a resume.
- `Sliceable` is anything cut into parts by byte range: a browser File or Blob, or a Node buffer wrapper.
- `onProgress` receives the total bytes in the bucket so far, parts already up included. `onPartsUp` runs once every part is up, right before complete.
- `keptParts` keeps only the listed parts a resumed upload may reuse: the right number and the right size. Anything else goes up again.

### hub/upload/uploaded-part.type.ts

`UploadedPart` is one part the bucket already holds for an open multipart upload, as a resumed upload reads it. `UploadedParts` is what a site's parts route answers: every part of the upload already in the bucket.

### hub/upload/with-retry.ts

Runs a step up to `tries` times, waiting longer after each failure (from `RETRY_BASE_MS`, times `RETRY_FACTOR` each time). A cancelled run (its signal aborted) stops at once and throws the cancel, so a cancel is never retried.

## HUD

### hud/data/compile-expr/compile-expr.constants.ts

- `MAX_EXPR_LENGTH` caps the source before it reaches the recursive descent parser. Every level of nesting costs at least two characters, so the cap keeps deeply nested parentheses from exhausting the call stack. Real HUD formulas are well under 100 characters.
- `REFUSED_FUNCTIONS` is exported so the editor's error table can pin the same list.

### hud/data/compile-expr/compile-expr.ts

A source is parsed once and cached by its exact text. Once a document has loaded the engine only calls `evaluate`, never `parse`; the cache is what makes that true. `compileExprCacheSize` exists for tests that prove the cache works.

### hud/data/compile-expr/compile-fresh.ts

The parser is expr-eval, cut down to arithmetic over a fixed scope.

- `assignment`, `fndef`, `in` and `array` are switched off. The shipped `parser.d.ts` has no `array` key, but the compiled parser reads it at runtime (`isOperatorEnabled('[')`), which is why `HardenedOperators` adds it to the type.
- `concatenate` is switched off as a correctness fix. In expr-eval `||` joins strings and the logical or is spelled `or`, so `life_current || 0` used to parse, produce the string "110" from 11 and 0, and come back as the number 110 with no error. `&&` fails loudly on its own.
- `random()` is refused after the parse, by asking `symbols()` whether it was named. expr-eval cannot drop a single function, and deleting it from `parser.functions` would only turn it into an unknown name that fails at evaluate time. A layout that re-rolls every frame cannot be previewed, diffed or reproduced.
- The scope is a plain object of numbers, so member access has nothing to reach through even with `allowMemberAccess` at its default.
- expr-eval parse errors read `parse error [1:20]`: the first number is always line 1, the second is the column.
- Nothing here throws into the caller: parse and evaluate failures both come back as values.

### hud/data/expand-limits.constants.ts

The two limits on `repeat` and `switch` expansion live in `data/` because both the engine (`engine/expand.ts`) and the validator (`layouts/validate-expand-budget.ts`) need them, and the validator must not depend on the engine.

- `MAX_REPEAT_COUNT` (200) caps one repeat's resolved count at runtime. It sits above every real use: twenty heart containers, the widest keyboard glyph pack's 107 positions, any slot list.
- `MAX_EXPANDED_NODES` (5000) caps a whole document's worst case node count, checked statically at load and again at runtime while `expand` unrolls. The built-ins place well under a hundred nodes; nested repeats of 200 by 200 are the shape it catches.

### hud/data/resolve-value/resolve-value.ts

This is the one seam between an expression result and every consumer (a size, a repeat count, an opacity).

- A result outside plus or minus 1,000,000 folds to that bound. The bound is far above every legitimate value (SNES pixel sizes, item counts, slot numbers) and stops `1/0` from becoming a repeat count of Infinity.
- `NaN`, a compile failure and an evaluate failure all fold to 0, the same safe empty answer a zero size or a zero count gives.
- Negative results are not clamped: edges and animation offsets are negative on purpose. A caller that means a count (a `repeat`) applies the floor itself.
- A value that is neither a number nor `{ from: 'data', expr }` folds to 0 so a malformed document never throws into the layout pass. A grid `gap: { x, y }` left on a flex container once reached `compileExpr(undefined)` and crashed the editor. The validator reports bad shapes.

### hud/data/variables/hud-data-scope.ts

`slotCount` is the size of the slot map the caller already holds, passed in so this file adds no plumbing. `countdown` is optional: a caller without one (the pause menu's copy of the map) reads it idle, and an idle countdown reads 0 on all three names.

### hud/data/variables/suggest-variable-name.ts

Backs the "did you mean" hint on an unknown variable error. It only offers a name within a small edit distance; otherwise it suggests nothing.

### hud/data/variables/variables.data.ts

The one flat table every HUD expression evaluates against, so the editor's variable picker lists itself from this file. Names follow `<thing>_current` / `<thing>_max`, and each maps to a field the HUD already reads. A layout observes the game and never changes it. `index`, `count` and `item` are not table entries: they only have a value inside a `repeat`.

### hud/data/variables/variables.type.ts

`HudVitalsSource` names the fields of the renderer's `HudVitalsContent` structurally, because `shared/` is the dependency leaf and cannot import from `apps/desktop/src`. A real `HudVitalsContent` satisfies it with no adapter, and `tsc` catches any drift.

### hud/engine/bake-values/bake-gate.ts

A bare gate expression (`animation[].when`, `transition.when`) is evaluated now against the repeat instance's own scope and replaced with the string "1" or "0", so it still means the same thing when read later against the global scope.

### hud/engine/bake-values/bake-node.ts

Baking a repeat instance's fields here, once, is a smaller change than teaching every downstream reader (resolve-box, measure, place-flow, place-grid, the renderer's style resolution) to look up a scope per node. Resolving now against the scope that `measure` and `place` would use later in the same frame gives the identical number. Only `Value` and `Extent` fields are touched. `margin` and `padding` are plain numbers and never bindable.

### hud/engine/engine.type.ts

- `MeasureContext` carries the facts only the runtime knows, so the engine stays pure and one function serves the live HUD and the editor preview. Anything the engine has to ask for belongs here; anything it can work out belongs in the document.
- `hearts` is the number of heart containers owned; the life block adds a row per ten. Absent means the full twenty, the size the layout reserves.
- `filledSlots` lists slots that hold an assignment. An absent slot still draws, dimmed and empty.
- `scope` is the data table every bound value resolves against. Absent reads as an empty table: literals still resolve and expressions fold to their default.
- `PlacedNode` lists containers beside leaves because the editor selects and drags them; parents come before children. `rect` is in SNES px, absolute in the view, and for an element it is the contained content box. `scale` is SNES px per intrinsic px for an element, and the factor its children are laid out at for a container. `opacity` and `dimmed` are inherited from every ancestor.

### hud/engine/expand.ts

Turns the dynamic tree into a static one once per frame, before measuring. `measure` and `place` never see `repeat` or `switch`.

- A repeat vanishes: its N copies are spliced into the parent's children at the repeat's position, so the parent row's own wrap and gap apply across the copies.
- Ids stay unique: a switch keeps the winning branch's id, and each repeat copy suffixes `#<index>` onto its root id.
- A dynamic node's own box properties (scale, margin, style) are dropped, because neither kind draws a box of its own.
- Inside a repeat every bound field is baked to a literal (`bake-values`), because `index`, `count` and `item` only exist in the per pass scope, never in the document's global scope. Outside a repeat nothing is baked.
- The budget is hard: one repeat is capped at `MAX_REPEAT_COUNT`, and a running total stops at `MAX_EXPANDED_NODES`, on top of the static load time check in `validate-expand-budget.ts`.
- The screen is a container by construction, and a container always expands to exactly one container, so `expand` takes and returns one.

### hud/engine/flow/flow-gaps.ts

A container has two gaps. `x` is always horizontal and `y` always vertical, so a row separates items by `x` and wrapped lines by `y`, and a column does the reverse. Items are spaced by the main gap, lines are stacked by the cross gap.

### hud/engine/flow/to-lines.ts

The flow is shared by both passes: `measure` asks for the lines of an unbounded container, `place` for the lines of the real box, so the size a parent reserved and the arrangement a child drew cannot disagree. Everything is main and cross axis; a column is a row turned ninety degrees. Without `wrap` there is exactly one line however long it is, so an overflowing row stays visible. `EPSILON` is rounding slack so a child that fits exactly is never wrapped by a float error.

### hud/engine/grid-cells/assign-cells.ts

- Cell assignment never depends on how much room the grid was given, so the unbounded measure pass and the placement pass agree on which child goes where.
- An explicit cell is never refused for being taken. Every overlay is a grid whose children name the same cell, so the occupied set is one way: explicit placements write it, and only auto flow reads it.
- `place.column` and `place.row` must be given together; a partial placement auto flows.

### hud/engine/grid-cells/in-order.ts

`order`, then document order. One rule for both engines: it is the auto flow visiting order and the paint order of co placed children (the item sprite over the glyph it sits on).

### hud/engine/grid-cells/natural-per-track.ts

An `auto` track is sized to the largest outer size (box plus margins, negatives included) among the span 1 items that start in it. Spanning items do not contribute; CSS Grid's spanning distribution is not implemented. Margins count because a cell must hold them, and a negative margin is how a sprite hangs outside its group without widening it.

### hud/engine/grid-cells/size-tracks.ts

`fill` tracks share what is left after every fixed and `auto` track and every gap. In the unbounded measure pass a `fill` track measures 0, the same reading a `fill` child gets in the flex engine.

### hud/engine/grid-cells/tracks-of.ts

When `container.rows` is omitted, rows are implicit: as many `auto` tracks as the assignment needs.

### hud/engine/intrinsic-size/aspect-of.ts

Aspect is derived from the intrinsic size and never stored. A size with no height (a spacer) answers 1.

### hud/engine/intrinsic-size/intrinsic-size.ts

- Every size is measured off what the renderer's compound draws, never off the sprite the element is named after.
- `TILE` (16) is the tile pair glyphs and item sprites are drawn from.
- A heart shape draws at 8 by 8 SNES px whatever its fill (`HudHeart.constants.ts`).
- A sprite's explicit `box` is a stored document's override; without it the sprite manifest's declared box wins over the 16 by 16 fallback.
- A countdown always measures the full pie; one that is not running is invisible and never measured (`resolve-box`).
- `repeat` and `switch` never reach this switch after `expand`, but they answer an empty size so measuring a raw document does not throw.

### hud/engine/layout/layout-hud-bands.ts

The document has one tree: the old nine anchored regions became the screen's direct children (a 3 by 3 grid). The screen's rectangle is the view. A screen whose `visible` is false hides the whole HUD. Bands exist because the pause menu re-pins whichever band holds the button map. Bands are read off `place`'s output (parents first, depth first): a band starts at one of the expanded screen's child ids. A grid child cannot be placed on its own because its cell is sized against its siblings. The function is pure: same document, view and context give the same pixels in the HUD and the editor.

### hud/engine/measure/measure-box.ts

Pass one, bottom up. An element wants its intrinsic size, a container wants its children plus padding, both times the node's `scale`. An explicit pixel size overrides that. `pct` and `fill` need a parent and resolve in `place` or `place-grid`; until then the node measures at its natural size. The result is in the parent's coordinates and clamped by `min` and `max`. Nothing here reads a view, so the same subtree measures the same wherever it ends up.

### hud/engine/motion-easing/easing-fn.ts

Easing is evaluated in JS because `motion` samples a keyframe value at an arbitrary instant. The four named curves use the CSS spec's `cubic-bezier` control points, solved by bisection on X then evaluated on Y, the way a browser does. Bisection is enough because every named curve is monotonic in X; 20 steps is far finer than a pixel. `steps(n)` is jump end, the CSS default: held at 0 through the first 1/n, landing on 1 only at t = 1. An unknown name reads as linear.

### hud/engine/motion/cycle-position.ts

`none` clamps at the end, `loop` wraps, `ping-pong` reflects. Before the delay has elapsed the position is 0 (the rest pose), so an animation whose gate just turned true does not flash to a mid track value.

### hud/engine/motion/motion.constants.ts

`width` and `height` can reflow a sibling under a flex or grid parent. The renderer applies every sampled value as a transform or filter on the already placed box and never re-measures, so the other six properties cannot move a sibling. `validate-motion-warnings.ts` warns an author who animates width or height.

### hud/engine/motion/sample-animation.ts

Motion is a pure function of a clock the caller owns (`HudNodeMotion` in the renderer). `elapsedMs` is one shared clock since the surface mounted; each animation reads its own position through `delay`, which is the whole staggering mechanism. Gating with `when` never resets an animation; it samples wherever the shared clock is. `undefined` means the gate is false and the caller draws the unanimated value.

### hud/engine/motion/sample-keyframes.ts

`t` is a fraction of the track, not wall time. Values clamp at the ends and are eased per span; a keyframe's own easing overrides the animation default for that span only.

### hud/engine/place-flow.ts

- Works in the container's own authored units and converts to view pixels once through `unit`, so a subtree can be drawn at another size with no number in it changing.
- `fill` resolves before wrapping. The main axis fill placeholder stays unclamped until `shareRemaining` writes the real share and clamps it; the cross axis is clamped immediately.
- Leftover main axis space is shared equally among fill children, each share clamped to its own `min` and `max`.
- `stretch` reads as `start` in a flex line; nothing stretches a flex child.
- `between` puts free space only between pairs, `around` gives each child free/n split half on each side, `evenly` makes n+1 equal gaps. A single child falls back to `start` under all three. An overflowing line keeps a negative free space and is drawn overflowing.
- A zero width or zero height child leaves the flow with no gap held open. The magic bar relies on this: at `magic_current == 0` its bound width is 0 and the bar is gone.

### hud/engine/place-grid/child-boxes-grid.ts

- `alignSelf` overrides both `justifyItems` and `alignItems` for one child, and `justifySelf` takes the inline axis back on its own (the screen's top centre child is `center` across and `start` down). Unset resolves to `stretch`, the one place that word has meaning.
- Children are placed in `order` then document order, which is the paint order of co-placed children.
- A zero sized child is dropped, the same rule as the flex engine.

### hud/engine/place-grid/grid-cell-rects.ts

The drop indicator geometry comes from the solved tracks, so an empty column still has a rectangle. `implicit` marks the one extra row past the last declared one: a grid grows rows and never columns, so that row is a drop target and a new column never is.

### hud/engine/place-grid/solve-grid.ts

One solve feeds both the child boxes and the editor's drop indicator cells, so the cell an author aims at is the cell a child lands in. Cell assignment and track sizing do not depend on whether the pass is bounded.

### hud/engine/place/is-dimmed.ts

A node is dimmed when it names slots in `dimWhenEmpty` and none of them is filled. A node that names none is only dimmed by an ancestor.

### hud/engine/place/place.ts

Pass two, top down. A node gets the box its parent gave it and returns itself and everything under it, parents first. An element is contained, never stretched: its intrinsic aspect is fitted in the box and centred, which is why `HudElement.fit` has one legal value. Dimming and opacity both descend the tree. `unit` is view pixels per authored pixel in the parent, the product of every ancestor's scale.

### hud/engine/resolve-box/clamp-to-box.ts

`min` and `max` clamp a resolved size however it was reached (fixed, `pct`, `auto` or `fill`). An unset bound means no floor or ceiling, never zero.

### hud/engine/resolve-box/resolve-gap.ts

One gap resolver serves both engines: `x` is horizontal and `y` vertical, and `flowGaps` turns them into main and cross for a flex row or column.

### hud/engine/resolve-box/resolve-opacity.ts

Opacity is clamped to 0..1 at runtime because a bound expression is not statically checked the way a literal is (`validate-box.ts`).

### hud/engine/resolve-box/resolve-visible.ts

A countdown with nothing counting (`countdown_active` is 0) is treated like `visible: false`: it leaves the flow under both engines. A bound `visible` is truthy when non-zero.

### hud/engine/resolve-extent.ts

Shared by the flex flow, grid tracks and a region's root. `fill` survives as a marker because it can only be answered once every fixed sibling is known. A bare expression extent is `px` shorthand.

### hud/engine/resolve-text/snap-game-font-size.ts

The ALttP Dialogue face has a 16 px em box (`--game-cell-h` in `game-text.css`) and only looks right at whole multiples of it.

### hud/engine/resolve-text/stem-for-sprite-char.ts

The digit set has no letters, matching `HudNumber`.

### hud/engine/resolve-text/text-intrinsic-size.ts

The text size is an estimate: there is no DOM or canvas here. It is shared with the renderer's `HudText` compound so the string and per character geometry never drift. A sprite face uses one 8 px tile per character (the `HudNumber` digit tile and `PauseText`'s glyph size), and `&` spans two tiles in the pause letters set. Real fonts use a 0.6 advance and 1.2 line height ratio; "contain, centred" absorbs the mismatch.

### hud/layouts/built-in-layouts/built-in-layouts.constants.ts

The shipped arrangements are JSON documents read through the same `loadLayout` a player's layout uses, so "built in" is a label and not a second authoring path. Each is validated as the module loads, so a broken built-in fails the build at first import. They are the only copy of the shipped arrangements.

### hud/layouts/chrome-reserve.constants.ts

The numbers both the HUD layout and the enhanced pause menu chrome answer to. The two layers draw over the same play field and cannot see each other's rectangles, so anything they must agree on lives here. The pause tab strip once sat against a vitals block measured by hand; when the block grew a row the strip stayed put and the consumable counts printed across the screen names.

- `HUD_EDGE_INSET` (8) is what a fixed element or strip keeps clear of the play field border.
- `PAUSE_LEGEND_HEIGHT` (16) is the legend strip along the bottom, the height `PauseNavLegend` draws at. In 224 line mode the menu panels reach y 200 and the strip starts at 208, leaving 8 px that no 16 px element fits in. So a bottom left element sits in the strip, on its plate, flush with the bottom edge. Measured from the bottom this holds at 224 and 240 lines alike.
- `PAUSE_LEGEND_LEFT_RESERVE` is what the legend keeps clear at its left end so the wallet and the strip share a row. The measured collision was 36 px of x overlap and 6 of y between the wallet and the leftmost legend glyph. Wallet at 8 inset plus 48 wide covers x 8..56; the reserve is 8 + 48 + 8 = 64; on the narrowest 398 px field (16:9 at 224 lines) the strip gets 334 px for its centred pairs. 48 is the four digit wallet (16 px icon plus four 8 px digits); at three digits it is 40. The widest legend is 326 px (five pairs at their longest words on a pad with a four glyph d-pad), which puts its leftmost glyph at 68, twelve px clear of the wallet.

### hud/layouts/convert-engine.ts

Switching a container between flex and grid as a patch. The editor applies edits through `patchNode`, which shallow merges, so a freshly built flex container laid over a grid left `columns`, `rows`, `justifyItems` and `alignItems` behind (unsaveable) and once left a grid's `gap: { x, y }` where flex read a single value, crashing the editor. The patch names every key the other engine owns as `undefined`, which is how `patchNode` drops a key. Since §57 `gap` and `guide` are shared by both engines and pass straight through. Children are left alone: `place` and `justifySelf` are legal on any box and unread under flex, so a flip and back restores the arrangement. The shape survives where it cheaply can: a one column grid becomes a flex column, a flex row of N children becomes N columns, and columns are never fewer than the furthest cell a child names. A switch to the current engine returns `null` so a click on the lit button writes nothing.

### hud/layouts/device-layout.constants.ts

Which shipped layout a freshly dropped device starts wearing. A control scheme names its HUD layout (`ModernBindings.layoutId`), and a scheme just prefilled from a device has to name something. It is only a prefill: the controls screen's picker and the editor's "save a copy" change it, and nothing re-derives it. Both device kinds start on the same layout because the shipped set differs by screen position, not by device. The table exists so a device specific layout only changes this file.

### hud/layouts/element-sizes/element-sizes.constants.ts

Natural (unscaled) sizes in SNES pixels, measured off what the renderer's compound draws, never off the sprite the element is named after. These are the data behind `engine/intrinsic-size`.

- The life block is hearts only. It used to include 9 px for the console's LIFE caption; the enhanced style has no caption, `HudLife` draws it only for the vanilla top bar and the pause status panel, and neither is placed from here.
- `LIFE_SIZE` reserves two heart rows, the usual twenty containers and the tallest the block gets. `lifeSize` gives one row per ten containers.
- `MAGIC_SIZE` is 80 by 16: a 5:1 bar in a 1 px frame, exactly as wide as a full heart row so the two share a left edge. It is the meter at full, not a function of current magic, so neighbouring elements never shuffle when a spell is cast. `HudMagicBar` draws a shorter bar inside the same box.
- `CONSUMABLES_SIZE` is three icon plus digits rows: a 12 px icon gutter, a 2 px gap and two digit tiles across, three 8 px rows down. The key row is reserved even when the game hides the counter.
- `COUNTDOWN_SIZE` is 44 by 44, the pixel pie's own grid (`HudPixelPie` `GRID_SIZE`), one cell per game pixel. The smooth pie draws about 44.4 (`countdownSize(1)`); the renderer centres it across this box and keeps its top edge so both discs share a centre and bottom line. `tests/hud/hud-countdown-node.keep.test.ts` pins the two numbers against each other because `shared/` cannot import them.
- What life, magic and consumables occupy together is derived in `vitals-reserve`, never written down here.

### hud/layouts/geometry.type.ts

`Size` and `Rect` are in SNES pixels. The renderer multiplies by its own display scale; this layer never does.

### hud/layouts/grid-track-edits/child-after.ts

A `place` drops every `undefined` key after an edit, because `{ colSpan: undefined }` is not what a document says when a span is gone and a validator walking keys would see it.

### hud/layouts/grid-track-edits/edit-grid-tracks.ts

A track edit is a document rule (§50): adding, inserting, removing or moving a track changes what every child's `place` means, so the remap lives beside the document types. Nothing is refused because a child is in the way; the children follow:

- Remove: later children shift one toward it; a child whose origin was in it lands on the track before (or after when there is none); a span covering it shrinks by one.
- Insert: children at or after the point shift away; a span straddling the point grows by one.
- Move: the origin rides with its track, and the displaced neighbour shifts; it is the track list's own permutation read backwards.
- `append` and `size` never change an address, so children are returned untouched. `size` writes one extent over a selected range.
- The result is always in range: `place.column`/`place.row` is at least 1 and no span reaches past the last track. `validateLayout` and `place-grid` rely on this. `columns` never empties; a `remove` that would empty it is a no op.

### hud/layouts/grid-track-edits/tracks-on.ts

`rows` may be omitted (implicit `auto` rows), so the axis is materialised out to what the children already reach before an edit, which makes an implicit row seen in the lattice a real track.

### hud/layouts/load-layout/load-layout.type.ts

`warnings` carries the non blocking reflow notes from `validate-motion-warnings` and only rides along on success.

### hud/layouts/load-layout/try-load-layout.ts

One reader for built-in and custom layouts; nothing downstream can tell them apart except the `builtIn` label. Every value is migrated before validation, in this order: `migrate-screen` folds a pre-§42 `regions[]` into the screen, turns every `stack` into a one cell grid and splits a pre-§57 flex `gap: n` into `{ x: n, y: n }`; then `migrate-legacy-vitals` replaces the four deleted opaque kinds with their preset subtrees. `loadLayout` throws; `tryLoadLayout` returns the errors for the two callers that can do better (the editor shows them, the profile store falls back to the default).

### hud/layouts/migrate-gap.ts

The §57 rewrite: a flex container's single `gap` becomes the `{ x, y }` pair a grid always had. It runs once on load on the raw value; no alias survives, so a stored document opens correctly and is saved in the new shape. It is pixel identical because the flow engine already spent the one number on both the main axis and the wrapped line gap. A bound gap copies the same expression to both axes. A grid, or a gap that already names `x` or `y`, is untouched, so re-running it is a no op and it can run on every load with no version flag. A bound `Value` is a record too, which is why only a record naming `x` or `y` counts as a pair.

### hud/layouts/migrate-legacy-vitals.ts

Replaces the four opaque element kinds phase 5 deleted (`life`, `magic`, `consumables`, `wallet`) with their preset subtrees, once, before validation. No alias survives, so there are never two ways to draw a heart. The node's own box properties (a player's `scale` or `margin`) are carried onto the replacement root; its `element` is not. `consumables` was three counters (bomb, arrow, key) in a column with no gap, the same way the built-ins assemble those presets. It runs on the raw value and leaves malformed neighbours for the validator. It runs after `migrate-screen`, so there is one tree to walk.

### hud/layouts/migrate-screen.ts

The §42 rewrite, run once on load before validation. No alias survives for `regions` or `direction: 'stack'`.

- A `stack` becomes a one cell grid with every child at (1,1). `justify` and `align` become `justifyItems` and `alignItems`; a `between` justify becomes `start` because nothing distributes at one origin. A stack ignored `place`, so children are pinned to (1,1) outright, and a `stretch` alignSelf (read as start by a stack, as fill by a grid) is rewritten to `start`. A stack drops its gap.
- `regions[]` becomes `screen.children`. The nine anchors were a 3 by 3 grid, so the screen gets `SCREEN_GRID` with `[auto, fill, auto]` tracks each way: the middle track takes the free space and the outer bands hug the edges. Every shipped screen was a stack, so the template replaces that placeholder wholesale.
- Alignment is written per child because the root default (`start`) can only say one thing and the nine anchors need three per axis: `alignSelf` when the block band is not `start`, and `justifySelf` when the inline band then disagrees.
- A centred band spans all three tracks on that axis, which makes the migration exact: `anchorRect` centred a region in the whole view, and a child centred in the middle track alone would drift by half the difference between the outer bands. A spanning child adds nothing to an `auto` track's size, so the outer bands still hug their content. A span starts at track 1, because `column: 2, colSpan: 3` would run off a three track template.
- A child the screen already held flowed in the whole screen box, so it spans all nine cells, and regions are appended after it so a backdrop still draws underneath, the order `layoutHud` used before.
- The flex `gap` split from `migrate-gap` rides along on the same walk.

### hud/layouts/validate-box/extent-at.ts

A bare expression object is `px` shorthand (`hud-node.ts`). A bare number is not offered the same shorthand, so the check looks for the expression shape specifically.

### hud/layouts/validate-box/validate-box.constants.ts

`$comment` is the one key reserved for documentation inside a document; every other unknown key is treated as a typo.

### hud/layouts/validate-box/validate-box.ts

Layout documents are hand editable files (the player's and the built-ins), so a bad value is reported and the document refused; a layout that draws four of five elements is worse than one that names the wrong line. Every checker takes its path so messages name the exact field. Bindable fields (`scale`, `opacity`, `size`, `min`, `max`) go through `validateValue`: a literal passes, an expression is parsed and its variables checked. Negative margins and padding are legal; that is how art overhangs. `insideRepeat` is forwarded to every value check so fields under a repeat may name `index`, `count` and `item`.

### hud/layouts/validate-button-node.ts

`idle` is the only required button state; others fall back to it at render time (`HudButton`). The glyph position rule duplicates `validate-node`'s instead of importing it because `validate-node` imports this file.

### hud/layouts/validate-container/container-common.ts

A gap axis is a `Value` and never negative. `x` is always horizontal and `y` always vertical, so a document never has to say which engine it was authored for.

### hud/layouts/validate-container/validate-flex-container.ts

There are two flex directions, not three: `stack` is rewritten into a one cell grid on load (`migrate-screen`), so it never reaches the validator. Since §57 `gap` and `guide` belong to any container: both engines take `gap: { x?, y? }` (a pre-§57 `gap: 4` is rewritten on load) and both take a `guide` because the editor draws either engine's arrangement over the preview.

### hud/layouts/validate-countdown-node.ts

`countdown` has one optional field, the pie variant. Absent means the profile's own setting (`hud-countdown.ts`). `COUNTDOWN_VARIANTS` lists `setting` first, then the setting's two ids in its own order.

### hud/layouts/validate-dynamic-node/expr-at.ts

`when` and `item` are bare expression strings. They are wrapped as `{ from: 'data', expr }` and passed to `validateValue` to reuse its parse and variable check; only the issues matter.

### hud/layouts/validate-dynamic-node/repeat-spec.ts

`repeat` and `switch` validators take `validateNode` as a parameter because `validate-node` imports them, so importing back would cycle. A repeat's `count` is checked in the scope the repeat sits in; `item` and `child` are checked with `insideRepeat` forced true because they read the repeat's own per pass scope.

### hud/layouts/validate-expand-budget.ts

A static worst case node count, priced at the least favourable answer at every dynamic point: a repeat at `MAX_REPEAT_COUNT` (a literal count is priced exactly, clamped like the runtime floor) and a switch at its most expensive branch. It never resolves an expression or reads a save, so a document that could draw an unbounded tree is refused before it is saved.

### hud/layouts/validate-layout.ts

A bad document fails loudly and never half draws: every problem is collected with its path, and the result is rebuilt from understood values only. The screen is always exactly the view, so `SCREEN_LOCKED` keys (size, min, max, margin, scale, place, order, alignSelf, justifySelf, dimWhenEmpty) are refused by name. Its engine is not locked: since §42 `layout`, `direction`, `columns` and `rows` are the author's to set. The worst case node count is priced across the whole document, matching the single runtime counter in `expand`, because two subtrees each near the limit still add up past what a frame should draw. Warnings do not block a load.

### hud/layouts/validate-motion-warnings/collect-reflow-warnings.ts

The reflow rule as data a panel can render: an animated `width` or `height` inside a flow container may reflow siblings, so the validator emits a non blocking warning. It is a static walk of the pre expansion tree, correct because a container's `direction` and `layout` are fixed at author time, and `repeat` and `switch` are transparent: their instances inherit the parent of the dynamic node.

### hud/layouts/validate-motion-warnings/is-overlay.ts

An overlay reflows nobody: every child sits in one cell. It used to be `direction: 'stack'` and is now recognised by shape (a grid whose children all name the same cell), so a hand authored overlay in any cell gets the same reading.

### hud/layouts/validate-motion/gate-at.ts

A bare `when` is an expression string, the same shape a switch case's `when` is, checked by wrapping it for `validateValue`. `extraNames` lets `transition.when`'s `delta` pass.

### hud/layouts/validate-motion/validate-motion.constants.ts

`steps(n)` requires n of 1 or more; `steps(0)` has nothing to step between.

### hud/layouts/validate-motion/validate-transition.ts

An empty `properties` list is allowed on a transition (not on enter or exit): `transition` holds value transitions and arrive or leave motion, so an enter only transition (a fade in when a repeat produces the node) is legitimate. Phase 10 of the inspector review made that authorable. An object holding nothing at all is still refused.

### hud/layouts/validate-node.ts

- A node is rebuilt, not cast: only understood keys survive, so nothing can be smuggled into the engine. An unknown key is an error because in a hand edited file `gapp: 4` is a typo.
- A glyph names a position or a slot, never both. `position` draws one control whatever is bound to it; `DPAD` is the synthetic name for the shared cross because no device reports the whole d-pad. `slot` draws the glyph of whatever slot N is bound to.
- A container picks its engine by `layout`: absent or `flex` goes to the flex validator, `grid` to the grid validator.
- `insideRepeat` threads down every call and flips to true only under a repeat's `child`.
- A sprite's `box` is a plain `{ w, h }`, not a value pair, because it names the asset's shape.
- A slot bound button derives its `dimWhenEmpty` from `bind.index` instead of having one authored. A verb bound button is a core control and never counts as empty.

### hud/layouts/validate-placement/place-at.ts

`place` is a grid cell reference. It is not checked against a flex parent; whether it applies is `place-grid`'s question.

### hud/layouts/validate-style/paint-at.ts

`Paint` is checked here because every colour shaped field is a style property. `required` is set by border, shadow, outline and tint (a colour is mandatory there); `background` is the only caller that lets it be absent. A gradient's `angle` is its one bindable number.

### hud/layouts/validate-value.ts

A `Value` is a finite number or `{ from: 'data', expr }` whose expression parses and names only known variables (plus `index`, `count`, `item` inside a repeat). Failures carry the field path, the parse column when expr-eval reports one, and a "did you mean" for a near miss. `undefined` means not authored and is not an issue, so callers can pass optional fields unconditionally.

### hud/layouts/validate-value.type.ts

`extraNames` lists names known only at one call site: `transition.when`'s `delta`, which means nothing anywhere else and so is neither a table entry nor a scope extra.

### hud/layouts/vitals-reserve/shipped-vitals.constants.ts

The shipped block is `{ x: 8, y: 6, w: 116, h: 38 }`: life 8..88 x 6..22, magic 8..88 x 28..44, counts beside them at 94..124 x 6..30. The pause menu panels start at y 56, so the bottom edge at 44 leaves twelve px clear. That is why the counts sit in a second column: stacked as a third row they would reach y 74, eighteen px past the panels' origin.

### hud/layouts/vitals-reserve/vitals-reserve.constants.ts

`REFERENCE_VIEW` is 16:9 at 224 lines (398 by 224), the narrowest display a host drawn style allows. The vitals are top left anchored in every shipped layout, so it only matters if a layout ever anchors them to an edge that moves with the display.

### hud/layouts/vitals-reserve/vitals-reserve.ts

The rectangle the shipped vitals occupy, measured by running the same layout pass the renderer runs over `built-in/default.json`, so it moves when that document is re-authored. Hand copied literals once disagreed (96x40 in one file, 96x49 in another). The vitals band is found by what it draws (the band holding a heart shape), never by a node id. It is measured at the full heart count, because a reserve taken at the current save's count breaks at the eleventh container. The `hearts` preset's repeat count reads `life_max` from the data scope, so the full block is measured by passing `life_max` = hearts x 8 (eighths per heart).

### hud/presets/instantiate-preset.ts

A preset is a starting point, not a component instance. `instantiatePreset` returns a fresh copy with every id rekeyed (the original id plus a short `newId` suffix), so two inserts never collide and editing one copy never reaches another or the template. An unknown id returns `null` so the toolbar never has to trust a stale list.

### hud/presets/presets.constants.ts

The eight prebuilt subtrees a HUD document can start from. Each is an ordinary `HudNode` JSON file, validated as the module loads, so a preset that stopped being a valid subtree fails at first import.

### hud/presets/presets.type.ts

`icon` is a single glyph, matching the toolbar's icon only convention.

## Input

### input/axis-end-label.ts

- The axis label names the whole axis, so the two ends would read the same without the sign. The minus is U+2212, the same "label sign" shape the saved-binding icon lookup produces.

### input/build-console-defaults.ts

- The drag-and-drop "apply this device" flow takes its defaults only from here. Only an sdlType is known, never a live device, so every position the family has a default for gets a binding whether the physical unit has it or not.
- Movement comes out on both the left stick and the d-pad. One SNES button may carry several mappings: the renderer files button bindings by index and axis bindings by "axisIndex:direction" in two separate maps, and computeBitmask ORs every hit into the frame mask, so two mappings for one SNES button both press it.
- The stick mappings are emitted first. The controls screen shows one row per SNES button and picks the first mapping that names it, so the row reads "Left Stick Y -" and not "D-Pad Up".
- Axis mappings carry no stored icon. A family declares one base key per stick, shared by X and Y, so a stored key could only be the neutral pose. With the icon null, the controls screen resolves the glyph from the binding's axis and direction at render time (resolveIconByVidPid, then resolveStickDirectionIcon). A binding with no source device falls back to directional generic art (AXIS_FALLBACK in binding-display.ts).
- Button labels ride on the binding; without one, a binding falls back to "Button 3".

### input/data/haptics/build-segments.ts

- Intensity guide: 0.10 to 0.20 very faint (ambient), 0.20 to 0.35 faint (footsteps, small clicks), 0.35 to 0.55 medium (sword swing, item use), 0.55 to 0.75 strong (damage, hammer, explosions), 0.75 to 1.00 heavy (death, boss defeat, quake).
- The global intensity slider scales every value.

### input/data/haptics/combat.data.ts

- dashStep has no cooldown because the polling interval paces it, and it is exempt from the minimum-duration floor because it fires about 8 times a second.

### input/data/haptics/haptic-pattern.type.ts

- gapMs is the gap between segments (default 0). delayMs is a delay before the pattern starts, for animation or sound sync (default 0). cooldownMs is the minimum time between repeats (0 means no limit).

### input/device-profile/device-profile.constants.ts

- AXIS_ID_ALIAS gives the axis ids the calibration wizard groups sticks and triggers by (its STICK_IDS and TRIGGER_IDS), stable whatever SDL calls the positions.
- ALL_BUTTONS and ALL_AXES back the synthetic full-capability profile for a device known only by sdlType (a disconnected saved binding, or the wizard's manual family picker).

### input/device-profile/device-profile.type.ts

- DeviceProfileAxis.icon is the family's base icon key; a stick's X and Y share one key, and resolveStickDirectionIcon turns it into a direction glyph. A trigger's icon is its own glyph.

### input/device-profile/profile-from-controls.ts

- AXIS_ORDER in sdl-capabilities only assigns 'stick' or 'trigger' to an axis control, which is why the axis category narrows safely.

### input/family/family-registry/find-family.ts

- Every SdlGamepadType is claimed by exactly one built-in family (generic claims 'standard' and 'unknown'), so the 'unknown' and EMPTY_FAMILY fallbacks only guard an out-of-order lookup.

### input/family/family.type.ts

- The family model only says what to SHOW for a control SDL already reported. Whether a control exists is SDL's answer alone. Every field is keyed by SDL's positional names.
- AxisConsoleDefault exists because an axis has two ends that default to two different console buttons. Either end may be left out.
- deviceName is a display-only rename of SDL's reported name.
- consoleDefaults and axisConsoleDefaults are used only when a preset or drag and drop is applied on the controls screen. Detection, calibration and diagnostics never read them.
- Movement defaults to the left stick on every gamepad through generic's axisConsoleDefaults; generic is the last link of every family's chain. The d-pad console defaults stay as movement's second binding.
- triggerPressThreshold is how far a trigger reported as an axis must travel to count as pressed for a button-style highlight. A digital-only trigger has no threshold. Default is DEFAULT_TRIGGER_PRESS_THRESHOLD.
- shapeVibration maps a 0 to 1 pattern intensity to the motor magnitude a family plays. It touches strength only, never duration. Identity when unset.
- minDurationMs is the shortest total duration a family's motor needs to spin up and be felt. Shorter patterns are stretched up to it; longer ones and intensity are untouched. A pattern opts out with HapticPatternEntry.minDurationExempt.
- ResolvedControl.pressThreshold is set only for an axis in the 'trigger' category.

### input/family/gamecube.family.ts

- Measured from a real pad (057e:2073, sdlType 'gamecube'): 16 buttons (four face, GUIDE, START, both shoulders, d-pad, MISC1 to MISC4) and 6 axes including the triggers. No BACK and no stick clicks.
- RIGHT_SHOULDER is the Z button. MISC1 is Capture, MISC2 the C button. MISC3 and MISC4 are the digital clicks at the bottom of the L and R triggers' analog travel, so they reuse the trigger glyphs.
- SDL labels EAST as X and WEST as B correctly; only the glyphs were crossed, so the icons pair each position with its own art.
- gc_button_c.svg on disk is the C stick artwork despite its name. The round C button glyph is gc_button_chat.svg.
- SNES L and R default to the trigger clicks (MISC3, MISC4), not the shoulders, because RIGHT_SHOULDER is Z. Z stays unbound.
- A licensed wireless GameCube style pad uses an ERM motor with spin-up lag (unlike the Switch Pro's near-instant LRA), so short bursts are stretched to 90 ms (minDurationMs).

### input/family/generic.family.ts

- Generic is the Null Object of the family layer: the fallback for 'standard' (a device the platform already normalizes) and 'unknown' (one SDL cannot classify), and the last link of every other family's chain. It covers every position so nothing reaches a bare positional name or an empty icon.
- Its consoleDefaults are also read as a position to console button layout by the built-in glyph packs; dropping the d-pad entries would strip the d-pad glyphs from the Console and Keyboard packs.
- axisConsoleDefaults is movement's default for every gamepad family. SDL normalizes the left stick to LEFT_X and LEFT_Y on every pad. SDL's Y axis points down, so '-' is up and '+' is down.

### input/family/index.ts

- Import the family layer through this barrel. Families now register through family-registry.constants.ts, so a deep import also sees a full registry.

### input/family/live-control-state.constants.ts

- DEFAULT_TRIGGER_PRESS_THRESHOLD is high on purpose: a trigger reads as pressed only near the end of its travel, the same feel the Standard Gamepad API gives a trigger button.

### input/family/live-control-state.ts

- A trigger SDL reports as an axis takes both value and pressed from the analog reading. A control SDL reports only as a button has pressed straight from the button state and a value of 0 or 1.

### input/family/nintendo.family.ts

- Covers the Switch Pro Controller and the three Joy-Con reports (left, right, paired).
- Face button labels are set here because buttonIcons already commits to the layout (EAST is A and draws switch_button_a.svg). Readers with no live device (a saved binding for an unplugged pad, buildConsoleDefaultMappings, buildDeviceProfileFromSdlType) would otherwise show generic's "Button 2 (East)" beside the A glyph. A family's own name wins over SDL's live label (resolveButtonLabelSpecific). The d-pad stays with generic, which matches what the pad prints.
- Each stick shares one base icon key for X and Y; direction glyphs and the neutral pose come from resolveStickDirectionIcon at render time.
- The d-pad consoleDefaults are movement's second binding; they also feed the glyph pack layout.

### input/family/playstation.family.ts

- Covers PS3, PS4 and PS5 reports (DualShock 4, DualSense, DualSense Edge).
- Face labels are set for the same reason as the Nintendo family (EAST draws playstation_button_circle.svg). D-pad and shoulders come from the chain.

### input/family/resolve-display/index.ts

- Every lookup walks device override, then family, then generic, and returns the first defined answer for one field (chain of responsibility).

### input/family/resolve-display/resolve-button-label-specific.ts

- Generic is left out on purpose. SDL's own per-device label must win over generic's filler text but never over a family's own label; resolveDeviceControls slots the live label in at that point.

### input/family/sdl-capabilities.ts

- Only positions SDL reported present appear. Display order: face, d-pad, shoulders (with grip paddles), stick clicks, system buttons, sticks, triggers. Category comes from the position, never from a family.
- Button label order: override or family, then SDL's live label, then generic's filler, then the positional name. Icons have no live source, so they use the flat override, family, generic chain.
- Only a trigger axis carries a press threshold; a stick axis has no pressed reading.

### input/family/sdl-capabilities.type.ts

- hasButton and buttonLabels are indexed by the SDL button enum; hasAxis by the SDL axis enum (length 6).

### input/family/stick-direction-icon.ts

- A family declares one base icon key per stick, shared by X and Y; the neutral pose is the base key itself. The calibration card and every other stick drawing use this one inference.
- STICK_DIRECTION_DEADZONE is how far off center an axis must sit to count as deflected.

### input/family/vibration-shaping.ts

- Every send-to-controller path goes through applyVibrationShaping, so amplitude and duration are decided only here: family curve, then the per-device multiplier, then the minimum-duration floor.
- The floor stretches only the last segment.
- A rhythmic pattern (the per-step dash pulse) opts out of the floor, since stretching every repeat would blur distinct taps into one buzz.

### input/family/xbox-shape-vibration.ts

- Xbox dual rumble is a linear ERM magnitude that barely moves below about 0.25, unlike Switch HD rumble. The curve lifts every non-zero intensity onto a 0.3 floor with a 0.85 gain so short combat pulses land. Strength only.

### input/family/xbox.family.ts

- Covers Xbox 360 and Xbox One reports; Series X|S, Elite and Adaptive report as one of those two.
- Face labels are set because SOUTH draws xbox_button_a.svg. D-pad and shoulders come from generic, whose "D-Pad Up" and "Left Bumper" match the pad.

### input/glyphs/built-in-packs/built-in-packs.data.ts

- GENERIC_PACK_ART is about artwork, not the device. An unrecognized pad can stack four controls on one side (bumper, trigger, two paddles) and the generic family names them with two keys, which a labelled binding row can live with and a bare cluster chip cannot. Same silhouette down a side, solid then filled then outline for depth, and paddles take a third silhouette so a grip never reads as a trigger.

### input/glyphs/built-in-packs/index.ts

- A pack is a family's own icon table with keys resolved to asset paths, so it cannot drift from the family. The generic pack is the one exception (GENERIC_PACK_ART).
- 'snes' draws the console's own art, placed through generic's console defaults. 'keyboard' places the keyboard preset's keys on the positions their console button occupies. Both are keyed by SDL position like every other pack.
- Icon keys with no artwork on disk are dropped so the fallback chain answers for them.

### input/glyphs/glyph-asset-paths/glyph-files.data.ts

- Paths are root-relative ('buttons/xbox/...') and never go through the renderer's publicAsset helper, because this layer is shared with the Node side, which has no import.meta.env. The renderer prefixes them.
- A key with no artwork is absent; the generic pack covers every position.
- 'ps-share' points at the Create art because the current PlayStation pad prints its Share button as "Create".
- Generic triggers come in three silhouettes with solid, filled and outline variants for the glyph pack (see built-in-packs.data.ts).

### input/glyphs/keyboard-glyph-path.ts

- Letters, digits and function keys map mechanically (KeyW is keyboard_w.svg); only named keys need the table. An unmapped code returns null and the caller falls back to text.

### input/glyphs/resolve-glyph.ts

- Chain, first answer wins: the chosen pack, then the fallbacks it names (cycle safe), then the device family's pack, then the generic pack.
- Pack id 'auto' means the device's own family and is the default. Choosing a pack is an override, so a custom pack that draws only four face buttons still shows correct shoulders from the family pack.
- Null at the end means no artwork anywhere; the caller falls back to the control's label.

### input/glyphs/slot-glyph.ts

- A slot's binding is asked before its position: a slot at EAST bound to a key draws the key cap, not pad art for a button that does nothing.
- The keyboard branch matters: a cluster skips a chip with no glyph, so without it a keyboard player sees an empty corner.

### input/haptic-events/get-item-pattern-id.ts

- The boomerang returns no pattern because its catch has its own event (BOOMERANG_CATCH). The mirror returns none because its warp is an environmental event.

### input/haptic-events/haptic-events.constants.ts

- HapticEventType must match the C enum in haptic_events.c.
- EnvironmentalEvent values are the param when the event type is ENVIRONMENTAL.
- HapticItemId values come from the game's item switch in player.c.

### input/haptics-rumble-strength/index.ts

- A per-device multiplier layered on top of a family's strength curve, for a controller that still feels weak after shaping. Neutral at 1.
- Persisted per device in shared/storage/rumble-strength.ts and cached in memory so a dispatch never waits on disk.
- applyRumbleStrength clamps to the transport's 0 to 1 range. Values loaded from disk are clamped too.

### input/haptics/index.ts

- Maps game events to vibration patterns and handles dispatch, cooldowns, delays and settings gating.
- getHapticIntensityScale exists so a preview of an authored pattern plays exactly as a live game event would (previewHapticPattern in the haptic bridge).
- DASH_PULSE_INTERVAL_MS (125) is about 8 Hz.

### input/keyboard-default.ts

- SDL never enumerates a keyboard, so the keyboard default is hand-authored and is not derived from the family layer.
- `scripts/parallel/provision-profile.mjs` loads this file by its exact path through Node type stripping and a data URL, so it must keep its path and hold no runtime import.

### input/scheme/binding-pressed.ts

- The pure half of the renderer's per-frame polling: raw state is a parameter, so the scheme layer stays testable and free of app imports. The caller passes only the pads the active profile allows; a binding is down when any of them has it down.
- Thresholds mirror the renderer's axis-press rules: a trigger axis counts only near the end of its travel, any other axis at plain deflection.

### input/scheme/core-positions/core-positions.ts

- Only the six gameplay verbs (movement, pause, map) claim a position, because they are live during play. The four menu verbs claim nothing: they answer only while the pause menu is open and the menu owns input then, so confirm can share the action's button. menu-shadowed-slots keeps a menu press from also firing the slot underneath.
- Prev and next screen default to the shoulders, which are not slot candidates; confirm and cancel default to EAST and SOUTH, shared with slots.

### input/scheme/core-positions/position-of-binding.ts

- A gamepad button binding claims its position. A gamepad axis binding claims one only when the axis is a trigger, because a trigger is one physical control whether read as axis or button. A stick axis claims nothing, which is how moving on the stick frees all four d-pad buttons for slots. Keyboard and unbound verbs claim nothing.

### input/scheme/default-modern-bindings/binding-for-position.ts

- The `kind` check on both branches keeps a device whose family describes a position as the other shape from producing a binding the poll loop would read off the wrong array.

### input/scheme/default-modern-bindings/index.ts

- Gamepad: movement on the left stick, pause on START, map on BACK, menu verbs where a system menu puts them. A verb whose position the pad does not report stays unbound. Everything left becomes a slot.
- Movement is on the stick only, unlike the classic defaults (stick and d-pad). Under modern, the prefill skips whatever a gameplay verb answers to, so binding the d-pad too would spend four slots. The stick claims no position, which leaves the d-pad in the list.
- Prev and next screen sit on the shoulders. Confirm and cancel stay on EAST and SOUTH, sharing two prefilled slots while the menu is open.
- Keyboard: each core verb takes the key bound to the console button it corresponds to (KEYBOARD_CORE_SOURCE), and every remaining preset key becomes a slot.
- SDL's Y axis points down, so '-' is up and '+' is down.

### input/scheme/default-modern-bindings/keyboard-slots.ts

- Keyboard slots carry no SDL position, so the cluster draws them from their binding (a key cap).
- Every free preset key becomes a slot; there is no cap and no category filter, since a keyboard has no face buttons to count. Only the six gameplay verbs take a key out; the four menu verbs share.

### input/scheme/derive-slots/default-slot-list.ts

- The prefill written once when a controller is dropped on a scheme. Afterwards the list is the player's own (see slot-list) and nothing re-derives it.
- No cap and no category filter: every pressable control can back a slot.
- Two subtractions remain, for the prefill only: the gameplay verbs' positions, and 'system' buttons (Start, Back, Guide, Touchpad, MISC), which belong to the host. Both are defaults; a player can still add a slot on Start.

### input/scheme/derive-slots/slot-for-control.ts

- A trigger reported as an axis backs a slot as a '+' deflection of that axis.

### input/scheme/effective-slots/effective-modern-bindings.ts

- layoutId is passed through, not defaulted: "this scheme names no layout" is a real answer, and the shipped default is the HUD's business.

### input/scheme/effective-slots/effective-slots.ts

- The stored list is the truth: prefilled once from the device and read back as written, so added slots survive and removed ones stay removed.
- Order of answers: stored slots renumbered; the keyboard preset for an unedited keyboard profile; the live control list for an unedited gamepad profile; otherwise nothing, since inventing controls for a gamepad profile with no stored list and no pad would be wrong.
- Binding a gameplay verb onto a slot's control no longer hides the slot; both fire and both rows show, so the player sees the clash.
- Renumbering on read is idempotent for a contiguous list and repairs a list written by an older build or edited by hand.

### input/scheme/function-mask/read-function-mask.ts

- Reads one frame as functions, one step before the SNES bitmask: directions stay directions, menu verbs stay themselves, and every non-core control is reported as the slot number that is down. Turning that into a mask is the remap step, which differs per scheme.
- `dpad` holds SNES direction bits ready to OR into a mask; `slots` lists slot numbers in slot order.

### input/scheme/menu-edges.ts

- Rising edges only: a held button is one event.
- Emission order is fixed (move, confirm, cancel, prevScreen, nextScreen, pause, slot) so the cursor moves before what lands on it is confirmed, and pause, which can close the menu, comes after verbs that assume it is open.
- Shadowed slots are dropped: a button the menu consumes as a verb would otherwise also rise as a slot and reassign items while the player navigates the menu.

### input/scheme/menu-shadowed-slots.ts

- The shadowed set depends on the bindings, not the frame; a FunctionMask cannot tell that confirm and slot 4 are one key.
- Shadowing verbs are every verb the open menu consumes: the four directions, pause and the four menu verbs. Map is excluded because nothing in the menu reads it.

### input/scheme/migrate-slots/index.ts

- A pre-numbering profile stores slots by SDL position ids (`slot:NORTH`, `slot:DPAD_UP`, `slot:kb:KeyF`) and an assignment table keyed by those ids. This converts both to numbers once, on read.
- A pre-numbering list was written in device order (SDL reports SOUTH first), so it is sorted into the prefill order first, which puts NORTH on slot 1 as shipped layouts expect. A list that already carries numbers is the player's and is never re-sorted, which keeps the migration idempotent.
- An assignment whose slot is missing from the list gets a slot rebuilt from its old id, recovering assignments that an older cap left stranded on shoulders, triggers, paddles and stick clicks.
- Unreadable stored shapes throw SlotMigrationError with the offending value, because silently dropping assignments is the one outcome the player cannot detect or undo. The caller decides whether that is a bad file or a bad build.

### input/scheme/migrate-slots/old-ids-of.ts

- Old ids are rebuilt from position and keyboard code, and also read from the slot. The slot list and the assignment table live in two files migrated at different times, so the table must still match after the list has dropped its ids. This keeps migrateScheme idempotent and order-free.
- When two slots claim the same id, the first in list order keeps it.

### input/scheme/prefill-order/in-prefill-order.ts

- The canonical slot order: north, west, east, south face buttons, then d-pad up, left, right, down. Layouts and schemes join only by slot number, so any other order draws the right shape with the wrong letters.
- Used by the prefill (driver report order is not guaranteed) and by the migration of pre-numbering lists. Unranked positions keep their reported order after the ranked ones.

### input/scheme/prefill-order/is-legacy-slot-list.ts

- A list is pre-numbering when no entry carries a positive integer `index`.

### input/scheme/remap-classic.ts

- Classic passes the mask the profile's own SNES mappings produced straight through and never drives the equipped-item register (activeItem stays 0).
- mapOnSelect swaps the X and Select bits: Select opens the map and X the save prompt. It is a swap, not a copy, because leaving both on X would make the save prompt unreachable.

### input/scheme/remap-for-scheme.ts

- Strategy table: adding a scheme is a new STRATEGIES entry. Both inputs are always supplied because the active scheme can change between frames: classicMask from the polling engine, pressed from the function read.

### input/scheme/remap-modern.ts

- Movement maps to the direction bits, pause to Start, map to X (the modern scheme never uses the secondary-slot map variant), a 'sword' slot to B, an 'action' slot to A, an 'item' slot to Y plus its HUD item id as activeItem.
- The core has one equipped-item register, so the host sets it to the pressed slot's item and presses Y; any number of item slots work with no new console buttons.
- When several item slots are down, the first owned one in slot order wins; Y is pressed once.
- An item the save does not hold is inert (no register write and no Y). Assignments are per profile, so a fresh save inherits buttons for items it has never found. Ownership is a predicate because this file has no inventory; frame-router.ts holds the live save.

### input/scheme/remap.type.ts

- ControlSchemeId mirrors the settings field of the same name, declared here so the scheme layer never reaches into the settings type.
- activeItem is a HUD item id from 1 to 24, or 0 to leave the core's equipped item alone.

### input/scheme/same-control.ts

- Sameness matches isBindingDown: a key by code (modifiers ignored), a pad button by index, an axis by index and direction.

### input/scheme/slot-list/index.ts

- A slot is a number. The list is ordered, open-ended and built by the player; nothing here consults the device.
- An empty slot is still a slot: clearing a binding keeps the number, and only removeSlot takes one out.
- Removing closes the gap, so every edit returns a renumber map. The assignment table is keyed by number and must move through remapAssignments, or every item below the gap re-points one button up. A number absent from the map was removed along with its assignment.
- Slot numbers are 1-based because they are shown to the player as "Slot 1". slotName is the one spelling for the controls screen, the layout editor and absent-assignment notices.

### input/scheme/slot-list/set-slot-binding.ts

- Rebinding keeps the slot number, so the slot's item and HUD place stay put. Position and icon move with the binding when known and are cleared otherwise, so old pad art never stays on a slot that now reads a key.

### input/sdl-buttons/sdl-buttons.data.ts

- Button indices are positional. SOUTH is the bottom face button and EAST the right one on every pad, whatever letter the vendor prints on it. One vendor labels the bottom button A, another B; binding by position lands both right.
- Presets index into the positional button array the native layer emits. An older scheme used bare numbers from two sources (browser gamepad order and per-device byte layout), which meant different buttons once the source changed.
- Triggers are analog and arrive as axes (SDL_AXIS), never as SDL_BUTTON entries.
- SDL_GAMEPAD_TYPES lists the families SDL itself reports.

### input/vibration-segment.type.ts

- `intensity` runs from 0.0 to 1.0.

## IPC

### ipc/api.type.ts

`IpcApi` is the renderer facing `window.api` surface, derived from the channel contracts and the join maps. Flat invoke, send and event methods carry exactly their contract signature. Nested namespaces and the few helpers that are not IPC are spelled out.

`ExtrasApi` holds the process flags and pure renderer helpers exposed on `window.api`:

- `os` is `process.platform` on Electron (`win32`, `darwin` or `linux`).
- `startup` holds the test and automation start flags (see the Electron `window/startup-config.ts`). `automation` is true for any automated launch and makes it read only for shared configuration. `muted` and `sound` are the launch's audio intent, applied through the app's own mute control; both directions are explicit so neither depends on the profile's stored volume. `autoStart` boots the game and stops at its title screen, with no save state involved.
- `instance` is the named instance identity (see the Electron `instance/instance-config.ts`). Both fields are null on a normal launch; `name` marks the window and `profile` is the profile to boot into.

### ipc/controller-contract/

The one controller channel that is RotP's own: `controller:write-debug-capture` writes an input calibration debug capture into `userData/Data/debug` and returns the full path. Every other controller channel, and the device, capture and calibration types, come from the Brock input module (`input:*`, types from `@drizztdourden08/brock-input`).

### ipc/event-contract.type.ts

Event channels, main to renderer: `webContents.send` paired with `ipcRenderer.on`. Each value is the listener signature; the `onX(cb)` subscribers and the main process `emit` derive from it.

`ImportProgress` reports a data import (ROM, MSU, language, sprites). `id` is the correlation key: the pack name, the language code or the ROM stem. `loaded` is bytes downloaded, or the item index while copying or extracting; `total` is the content length or the item count. `message` is a readable label or the error text.

- `msu:optimize:progress` sends one report per file, for the measuring pass and the converting pass alike. While a file converts it also carries `fileFraction`, read from the encoder's own progress lines.

Opened files and install links, the sign in's user code, Hookshop install progress and every controller event come from Brock and its modules (`onOpen`, the secrets, catalog and input modules), not from this contract.

### ipc/ffmpeg-contract.type.ts

The one RotP ffmpeg channel: probe one media file. State and install come from the Brock tools module (`tools:state`, `tools:install`, with progress in its job dialog). `ffmpeg:probeAudio` takes a POSIX path relative to the Data root and is null when the tool is absent or the probe failed.

### ipc/hub-contract.type.ts

The shared account channels: sign out and the signed in identity. One device token serves every site's API. The device code sign in itself, with its user code and cancel, runs on the Brock secrets module's sign-in driver.

- `HubMe`: the signed in identity as the account card shows it, null when no device token is held. `deviceLabel` is this device's label as the API recorded it at confirm time.
- `hub:signOut` cancels any sign in still waiting and drops the device token. The device row on the site stays until it is revoked there.
- `hub:me` is null when no token is held, or when the API no longer accepts it (the token is dropped then).

### ipc/invoke-contract.type.ts

Request and response channels: `ipcRenderer.invoke` paired with `ipcMain.handle`. `InvokeContract` is the one source of truth for every invoke channel's signature; the preload and the main process handlers are checked against it. It joins one interface per domain (host, profile data, dev tools, screen editor, controller, language, MSU, ffmpeg, Sanctuary, account, Hookshop), each split out to keep files short.

### ipc/invoke/

- `host-invoke-contract.type.ts`: the user data path, the host hardware and OS readout for the About page, the Data location with reveal and per domain usage, the generic file store (POSIX paths relative to the Data root), window queries and dialogs. The WASM core bytes come from the Brock port kit and the refresh rate from the Brock display module.
- `profile-data-invoke-contract.type.ts`: profiles, per profile config, sessions and the tracker, input profiles, sprites. ROMs, assets and saves are read and written over the file store, and calibration belongs to the Brock input module.
- `dev-tools-invoke-contract.type.ts`: review data, the Data Inspector view state, the recommendation store, test automation, debug dumps, the simulator run log (a detailed JSONL sink), shadow casting, and the debug capture sessions.
  - The view state (`uiViews:*`) is one whole file at app level, not per profile, and the renderer repo debounces it.
  - The recommendation store keeps one file per collection (`Data/recommendations/<kind>.json`). The collection lives in the main process: folding a pass and recording a verdict are read, modify, write over a whole file, and an IPC round trip in between would let two callers interleave.
  - A debug capture recording finalizes the moment it stops: raw frames, the position timeline and an ffmpeg encoded video land in their own folder under `debug-captures/<profileId>/` at once, never deferred to packaging. `debug-capture:listSessions` lists every recorded session for the picker (`BugReportDialog`) and never changes anything on disk; `debug-capture:deleteSession` deletes one. The report zip itself is built by the bug report transport in the main process (`apps/desktop/electron/sanctuary/bug-report/`), with no channel of its own.
- `screen-editor-invoke-contract.type.ts`: the dev only screen editor. Record payloads carry no id and no source text: the main process allocates the id and serializes with the dataset's own emitter. The six collections added after the record facade share one generic payload trio. `writeCheckRecord` has its suffix because the older text based `writeCheck` still has callers. Area and location already mint through `allocateGeography` (a display name, not a whole record), so they only gain write and delete.

### ipc/language-contract.type.ts

Channels for translation data. Two generations coexist on purpose. The legacy channels (`languages:list` through `languages:getLanguage`) read the extracted payload a ROM import writes, for the read only inspector. The set channels read and write the editable model in `shared/storage/languages`, for the editor and the asset bake; every set write starts an asset recompile so the change reaches the blob the core reads at boot.

### ipc/maps/

The only join tables between the renderer's friendly `window.api` method names and the namespaced IPC channels. Every value is checked with `satisfies` to be a real channel, and the friendly API types derive from these tables (see `api.type.ts`), so a method's signature is never written twice. Nested namespaces (shadowCasting, screenEditor) are wired explicitly in the preload. The rows for the sites on the shared accounts (account sign in, the Sanctuary, the Hookshop) live in `site-maps.data.ts` and are spread into the invoke and event tables, which stay the one join the preload and `window.api` read.

### ipc/msu-contract/

The MSU channels: import, pack listing, pack editing (the `.msul` manifest and per file operations), normalising a pack to one audio format, and the per save music resume sidecars (`{save}.msu.json`, beside the save).

- `MsuResult.skippedNested`: audio the archive kept below the pack's own level, meaning alternates and extras, not tracks. `skippedDuplicate`: audio dropped because an earlier file already claimed its track number.
- `MsuFileEntry` is one audio file in a pack, and also the shape of `msu:getPackFiles`.
- `msu:readMsulFile` reads a `.msul` the app was opened with and rejects any other extension.
- `msu:listAudioFiles` lists every audio file in the pack whatever its name. A layered pack's files are named freely, so `msu:getTrackList` (numbered MSU tracks only) cannot see them.
- `msu:readManifest` is null for a classic pack (no manifest) and for a manifest version this build cannot read.
- `msu:createPack` rejects when the pack already exists, never merging into it.
- `msu:optimize:analyze` measures every candidate by encoding a slice of it, so nothing is written yet. One encoder run per file, reported on `msu:optimize:progress`.
- `msu:optimize:run` moves repeat points into the manifest first, then encodes and points the manifest at the new names. Originals are kept; removing them is a separate action.

### ipc/recommendation-contract.type.ts

Wire types for the recommendation store's three channels. The engine's own shapes are the domain model (`shared/game/recommendations`) and IPC carries them unchanged, so this file only re-exports them. Everything crossing here is plain data by construction: a detector may not hold a module handle or a wasm pointer, which is what makes a pass structured cloneable without a translation layer.

### ipc/sanctuary-contract.type.ts

The Sanctuary channels. Signing in belongs to the shared account (`hub-contract.type.ts`), and a report with its debug zip is sent by the main process transport behind Brock's bug report dialog, not over a channel here.

`SanctuarySubmitInput` files a report with no attachment; a report that could not be filed answers with `error` alone. `SanctuaryReportSnapshot` is what the renderer sends when the bug report dialog opens: the report context, the active profile and a live save state, which only the renderer can read.

### ipc/screen-editor-contract/

The dev editor's write contract. Its types enforce two rules:

1. A caller never supplies an id for a new record. Create payloads carry the record without its id, and the main process allocates the next free `<kind>-NNN`. `Allocated<T>` is nominal (branded by `allocatedBrand`), so an id invented in the renderer has nowhere to go.
2. A caller never supplies record text. The main process serializes the record with the dataset's own emitter, so the shape on disk is whatever the record interface says.

- `AllocateGeographyArgs`: new geography. The name is for display only; the id comes back allocated.
- `AllocateTagArgs`: a new vocabulary term. The caller supplies only the key (`namespace:value`) and the collections it belongs on. The levels are split from the key, labels default to its parts (`label` to the second level, `namespaceLabel` to the first), and the id comes back allocated. A key without a separator is rejected, since it has no namespace and no place in the hierarchy.
- `WriteScreenArgs` inserts a new screen (`replaceId: null`) or rewrites one in place. `filePath` is relative to `shared/game/data/`; `record-file-targets.ts` derives it from ids.
- `WriteConnectionPairArgs` mints a new crossing with no existing partner (see `pendingPartnerId` in `data/connections/pending-partner.ts`). Both halves are allocated on one `withAllocatedIds` turn and written before either id is observable, so no `toConnectionId` can name a partner that was never written. The halves often sit on different screens, hence two file targets.
- `WriteTagArgs`, `WriteItemGroupArgs`, `WriteEnumerationArgs` relabel or reshape an entry already on file. There is no insert variant: new entries go through their allocate channel, and these only replace an id the renderer already has open.
- `DeleteTagArgs`, `DeleteRecordArgs` and the other delete payloads are the delete guard's actual delete step, once the caller has confirmed it.
- `AllocateItemGroupArgs`: `ITEM_GROUP_IDS` still names the seven groups that predate this path, but it is no longer a ceiling; the id comes back allocated like any new record.
- `AllocateEnumerationArgs`: a new closed set label row. The category names the group it joins.
- `AllocateRecordArgs`, `AllocateRecordResult`, `WriteRecordArgs` are the payloads every later collection shares. Screen, connection, tag and item group predate the record facade and carry something kind specific; the six that came after are record in, id back, so they share one generic trio. The same two rules hold: `Unnumbered<T>` is all a caller may send for something new, `Allocated<T>` is all that comes back.

### ipc/send-contract.type.ts

Fire and forget channels, renderer to main: `ipcRenderer.send` paired with `ipcMain.on`. The one source of truth for each send channel's argument signature.

- `window:shellReady`: the UI shell has settled and painted, so the main window may be revealed.
- `debug:appendSessionLog`: batched, preformatted renderer log lines for `Data/debug/session.log`.

### ipc/store-contract.type.ts

The one Hookshop channel of RotP's own. The catalogue, installs, updates, uninstalls, progress and install links run on the Brock catalog module (`window.api.catalog`).

- `StoreResult`: the call answers with its data or why not. `signedOut` is set when no device token is held or the API refused it, so the view can show the sign in card.
- `StoreDuplicateResult`: the editable copy's kind and its pack folder, sprite file name or set id.
- `store:duplicate` copies an installed item to a free new name the player can edit, crediting the original in the copy's `basedOn`. It is refused, with the reason, when the licence does not allow copies.

### ipc/ui-views-contract.type.ts

The durable view state store's wire payload: one whole file map keyed by `ViewKey` (`surface:collection`), loaded and saved as one unit. The main process treats every entry as opaque JSON and never reshapes it, because the real shape (`ViewSnapshot`) belongs to the renderer's design system data layer and `shared/` never depends on renderer code. The renderer's `lib/storage/ui-views.ts` validates each entry against `ViewSnapshot` before trusting it.

## Platform

### platform/detect-host.ts

Host detection reads runtime globals only. The Capacitor global is probed without importing `@capacitor/core`, so this file stays free of that dependency.

### platform/factory.type.ts

An Abstract Factory contract. Each host (Electron, Capacitor, web) implements one `PlatformFactory` that builds a consistent family of capability adapters. Ports are added as they are carved out of the legacy `window.api` surface.

### platform/is-primary-modifier.ts

Every desktop convention the app borrows spells the primary modifier two ways: `Ctrl` on Windows and Linux, `Cmd` on macOS. The old inline idiom `(e.ctrlKey || e.metaKey)` worked on both but could not say which key it meant, and a gesture that asks per frame whether the primary modifier is held (the HUD editor's reparent and nudge split) needs one predicate.

It is a predicate over an event, not a hook or a store read, so the same answer serves a React `onKeyDown`, a `document` listener and a `pointermove` inside a drag. `os` comes from `Platform.info.os`, which the facade resolves once at start up; there is no second detection.

Unknown is not Windows. The web host reports `os: 'unknown'` (a browser has no `process.platform`), and guessing `Ctrl` there would break the app in Safari on a Mac. With no OS known, either key counts, which matches the old inline idiom.

Not for game input. The input code, `BindingListener` and the shadow editor overlay read raw keys on purpose: a rebind screen must capture the left Control key as itself, and normalising modifiers there would make two physical keys indistinguishable.

`ModifierFlags` is structural (a `KeyboardEvent`, `PointerEvent`, `MouseEvent` or a React wrapper of one), so nothing has to import a DOM lib type. `USES_META` lists the Apple platforms, where `Cmd` is primary and `Ctrl` means something else (historically a right click). `primaryModifierLabel` makes the same decision for the printed label, so a hint never disagrees with the key that works.

### platform/mem-file-store.ts

A `FileStore` held in memory, with bytes, text and a modification time. Tests use it as a disk, and the pack viewers use it to run a file bound reader over bytes that never touch one.

### platform/platform-info.type.ts

The platform model has two independent axes, the host shell and the OS, plus derived capability flags. Application code branches on a capability (`caps.windowChrome`), never on a host or OS name.

- `windowChrome`: custom title bar with minimize, maximize and close.
- `nativeHid`: raw HID enumerate, read and write. Controllers themselves come from the Brock input module on every host, through SDL3's already decoded state.
- `touchControls`: the host needs an on screen virtual gamepad.
- `customProtocol`: `app-sprite://` style asset serving.
- `selfUpdate`: the host can install updates itself.
- `nativeFileDialog`: an OS open dialog, against a document picker.
- `revealDataFolder`: the host can open the data folder in an OS file manager.
- `hapticFeedback`: controller rumble or device vibration is available.

### platform/ports/device.type.ts

Device lifecycle concerns with no desktop equivalent: keeping the screen awake during gameplay (`keepAwake`, released by `allowSleep`), device haptics (the phone buzzing, distinct from controller rumble, a no-op where unavailable), and `onAppPause` for backgrounding (save on background, as the desktop saves on close). Electron does nothing here; Capacitor uses the KeepAwake, Haptics and App plugins.

`onBackButton` intercepts Android back so the app handles it and does not navigate away. The edge says which side a back swipe came from (`right` for a button press or no gesture). A no-op where there is no back action.

### platform/ports/file-picker.type.ts

Gets a file's bytes in from the OS and hands bytes back out. Electron uses its native dialogs, Capacitor a picker plugin and a share sheet, the web an `<input>` and a download link. `saveFile` reports a cancelled dialog as `saved: false` with no error, because the player declining is an ordinary outcome. `name` in the request is the suggested file name with extension; `extensions` are the dialog filter, without leading dots. `name` in the result says where it went, when the host can tell; `error` is set only for a real failure.

### platform/ports/file-store.type.ts

The per OS storage backend. Paths are POSIX, relative to the platform's Data root. Electron backs it with Node fs under userData, Capacitor with the Filesystem plugin (app private `Directory.Data`). Domain logic (profiles, config, saves) sits on top, so it runs everywhere.

- `mtimeMs`: last modified time in epoch milliseconds, 0 when unavailable.
- `list`: immediate child names, an empty list when the folder is missing.
- `remove`: recursive, a no-op when missing.
- `trash`: moves to the OS recycle bin so a regretted delete can be undone. Only where the OS has one (the desktop app); callers fall back to `remove`.
- `mkdir`: recursive.

### platform/ports/storage.type.ts

Where the app's data lives on this platform, a per domain usage summary, and (desktop only) revealing the folder in the OS file manager. Backed by IPC on Electron and the Filesystem plugin on Capacitor.

- `path`: the absolute Data root on this platform. `osLabel` reads like "Windows (AppData)". `canReveal` mirrors the `revealDataFolder` capability.
- `count`: entries in the domain (profiles, ROMs, packs, sprite sets, languages). `bytes`: disk usage.
- `reveal` does nothing when the host cannot reveal. `revealProfile` resolves false when the host cannot reveal or the folder could not be opened, so a caller can tell the player.
- `spritesBaseUrl`: the base URL for a ROM's extracted sprites (`app-sprite://` on Electron, `Capacitor.convertFileSrc` on mobile). It ends with `/`, and is empty when unavailable.

### platform/ports/window-controls.type.ts

The first carved capability. It covers the window surface the title bar uses: minimize, maximize, close, fullscreen, always on top, plus the maximized and fullscreen state and their change events. Electron fulfils it through `window.api`; mobile hosts return no-ops.

### platform/resolve-platform.ts

The platform facade and composition root. `resolvePlatform` is the single Strategy selection point: it detects the host once, builds that host's factory, and assembles the facade the app consumes. The facade does not expose the legacy `window.api` on purpose; call sites not yet ported keep using it directly.

## Sanctuary

### sanctuary/api-contract.ts

- The Sanctuary's own routes: files, their versions, reports and the report sweep. The account routes it also serves are `HUB_ROUTES` in shared/hub.

### sanctuary/file-types/file-types.constants.ts

- Each file type is one rail entry. Files carry a static type plus free tags, and content is managed by filtering, not by folders.
- `FILE_TYPE_SHELF_LABELS` is the shelf wording used by the tabs, the search groups and the group editor. It is plural where the type label is singular.

### sanctuary/file-types/file-types.type.ts

- `FileUpload` is the multipart upload in flight and is cleared at complete. `partsDone` counts the parts the uploader reported with its last batch (0 at begin). `updatedAt` is when it last asked for part URLs.
- A `FileVersion` is one upload of a file, kept forever unless the owner or an admin deletes it. Versions are never reordered or renumbered. `n` runs 1, 2, 3 and `SanctuaryFile.currentVersion` holds the `n` of the version in use, which lists, downloads and search read.
- `FileVersion.key` is `files/<id>` for v1 of a file uploaded before versions existed, and `files/<id>/v<n>` otherwise.
- `FileVersion.name` is the uploaded file's own name and may differ from the file's display name. `FileVersion.note` says what changed in one line and is empty for v1.
- `SanctuaryFile.tags` are free and lowercase. The FilterBar array kit filters on them.
- `SanctuaryFile.version` is the app version the file relates to, when it does. It is not the file's own version history.
- `SanctuaryFile.name`, `bytes`, `sha256` and `contentType` mirror the current version. `sha256` is computed by the client, recorded at begin and shown in the UI.
- `SanctuaryFile.versions` is ordered oldest first. `SanctuaryFile.note` is one line of at most `LIMITS.noteMaxChars`.
- `SanctuaryFile.expiresAt` is optional. The bucket lifecycle rule deletes the object after it.

### sanctuary/limits.ts

- One table holds every size, count and lifetime that the Sanctuary site, its API and the app agree on: the shared account limits plus the caps on files and reports. A cap raised on the server is raised in the upload loop and in the schemas in the same commit.
- `fileBytes` is the largest shared file and `reportBytes` the largest report zip, both in bytes.
- `extendDays` is the number of days one Extend click adds to a report. `extendMaxDays` is how far past its issue's close a report can be extended.
- `anonymousReportsPer10Min` is the number of anonymous reports accepted from one IP in a ten minute window.

### sanctuary/report-types/report-types.type.ts

- A report is a GitHub issue plus an optional zip in the bucket.
- `ReportContents` holds counts from the zip manifest, shown on the row.
- `Report.id` is the app's 12 character id, kept unchanged so old issue bodies still resolve.
- `Report.reporter` is null for an anonymous report. `contactEmail` is set on anonymous reports only and is visible to admins only.
- `Report.screenId` is the game screen id at submit time, when the game was running.
- `Report.zip` is null until the upload completes, or when nothing was attached. `legacy` marks reports migrated from the old bucket.
- `Report.expiresAt` is set by the sweep once the issue closes. `extendedUntil` is moved by the Extend button: 30 days per click, at most a year past the close. The sweep honours the later of the two.
- `SubmitReportRequest.contactEmail` is required by the API when no caller identity is present.
- `SubmitReportResult.uploadUrl` is a presigned PUT for the zip, present when an attachment was declared.

### sanctuary/sanctuary-rights/sanctuary-rights.constants.ts

- A group can be granted one permission per file type (the shelves it sees and uploads to) and the Reports page. Filing a report from the app is never gated.
- The API and the site ask the same functions, so a shelf the site hides is also refused by the API.

### sanctuary/sanctuary-rights/visible-file-types.ts

- The file types the caller sees and uploads to, in the rail's order. An admin sees every type.

### sanctuary/schemas/file-schemas/index.ts

- Request bodies of the file routes. `createFileSchema` parses POST /files. `signPartsSchema` parses POST /files/:id/parts and POST /files/:id/versions/:n/parts. `completeFileSchema` parses POST /files/:id/complete. `patchFileSchema` parses PATCH /files/:id, where every field is optional and at least one must be present. `beginVersionSchema` parses POST /files/:id/versions.
- Sizes and counts come from `LIMITS`, so the API rejects what the upload loop would never send.
- A version upload declares the same facts as a new file (name, size, hash, content type) plus what changed.
- `partsDone` in a sign parts body is how many parts the uploader already has up.

### sanctuary/schemas/report-schemas/index.ts

- `submitReportSchema` parses POST /reports and mirrors `SubmitReportRequest` field for field.
- `controllerReportSchema` keeps the shape of `ControllerReportPayload`. Every field is preformatted text from the app.
- `extendReportSchema` parses POST /reports/:id/extend, which carries no fields because the id is in the path.

### sanctuary/view-surfaces.ts

- The Sanctuary keeps one saved view surface per list page. The API refuses any surface name outside this list.

## Storage

### storage/archive-write.ts

- Entries are stored without compression (STORE) by default. Gigabytes of Opus or raw PCM do not deflate, so compressing costs minutes and saves nothing. Text entries such as a manifest pass `store: false` and get DEFLATE.
- Entries keep their given order and one fixed timestamp. Two exports of the same pack are byte-identical, and a reader can sniff the first entry (a manifest, when it is put first).
- `ZIP_FIXED_DATE` is 1980-01-01, the earliest instant a ZIP timestamp can hold. Any fixed date would do.
- `createFolders` is off because folder entries would be written ahead of their contents and break the first-entry sniffing.
- Entry names use forward slashes for folders, as the ZIP format expects.

### storage/archive/is-zip.ts

- Only the two bytes `PK` (0x50 0x4b) are checked. That covers a normal archive (`PK\x03\x04`) and an empty one (`PK\x05\x06`).

### storage/assets/check.ts

- A missing base means extract. A supplement ROM with no sidecar yet also means extract, which is what makes importing the second cartridge later rebuild the blob on its own.

### storage/assets/index.ts

- The base blob and each supplement are stored as separate files and joined into one buffer only when loading. The engine wants one buffer with the supplement appended, but storing it that way would let a base-only rebuild silently delete the supplement. Separate files with separate lifetimes mean a rebuild cannot erase the other half.
- The compile itself runs in a renderer Worker (Node-Buffer pipeline). This folder only does the FileStore I/O.

### storage/assets/read-language-sets.ts

- Reads the edited set files, so a translator's saved changes are what lands in the blob. A folder missing the set payload or its font pair is skipped as incomplete.
- Compiling the sets is the caller's job (`compileSets`), because that runs off this thread in the renderer.

### storage/assets/remove-sidecar.ts

- Used when the source ROM of a sidecar is gone, so a stale supplement never outlives its cartridge.

### storage/duplicate/duplicate-language.ts

- Rebaking the asset blob after a duplicate is the host's step, the same as after an install.

### storage/duplicate/duplicate-msu.ts

- A pack with no manifest gets the synthesized one the player already plays it with.
- The manifest is written last, so a copy that stops part way reads as a classic pack, never a broken layered one.

### storage/duplicate/duplicate-sprite.ts

- Only the manifest entry changes. The tiles and the preview go across as they are, so no canvas is needed and this runs on any host.

### storage/duplicate/duplicate.type.ts

- A duplicate copies an installed item to a free new name, stamps `basedOn` into the copy's own metadata, and writes nothing into the original.

### storage/hash.ts

- Uses Web Crypto so it works in the renderer and in a Worker on every platform.

### storage/id.ts

- Eight characters matches the id length of the desktop stores.

### storage/languages/create/index.ts

- Both create paths start from an existing set on disk. A new set clones its dialogue as a translation starting point; a duplicate copies everything.
- The font pair is copied file for file, so the new set bakes without depending on the folder it came from.
- `base` is inherited from the source set's own `base`, never set to the source id. The bake step resolves the alphabet, dictionary and encoder from that value, so it has to stay a real base language code even when the source is itself custom.
- A new set starts with no variables of its own.

### storage/languages/export-rlang.ts

- The files go out exactly as they sit in the set's folder, in a fixed order with the archive's fixed timestamp, so two exports of the same set agree byte for byte.
- Everything is DEFLATE compressed: a set is JSON plus two small font tables.

### storage/languages/extract.ts

- Extraction itself runs in the worker. This lands its result on disk: the raw legacy payload (dialogue dump, font pair, extraction meta) plus the set files derived from it.
- A re-extract of the same code resets the set on purpose. That is the start-over-from-the-ROM action.

### storage/languages/format-2/index.ts

- Format 2 of a stored set: one `variables.json` plus a `structure` choice, with a `format` number in the header. A folder without `variables.json` reads as no variables; an older format is a clean break.
- Rebuild on write: the set is still edited through its projected glossary and name table, so the variable list is rebuilt from that pair on every save, with the previous list merged back for the fields the pair cannot carry. A read, write, read cycle produces byte-identical files.
- Unknown header fields survive: the known keys are laid over the header read back from disk, so a field written by a newer build is kept.
- A header with no `format` is format 1.
- An unrecognised or absent `structure` falls back to the default instead of failing the read.

### storage/languages/import-rlang.ts

- The set always lands under a free id of its own, so an import never writes over a set that is already there. The id aimed for is `desiredId`, or the archive's own id when absent; a taken id gets a numbered suffix.
- `set.json` is written last. Until it exists the folder is not listed as a set, so a run that dies part way leaves nothing the app would try to open.
- The written set is read back through the ordinary reader, and a set that does not open is removed again.
- Every failure is something a user did (picked the wrong file, edited one by hand), so each one throws a message written for them.
- The dialogue is checked to be a JSON array before it lands, because the reader falls back to an empty list on bad JSON.

### storage/languages/index.ts

- `listPacks` and `getLanguage` are the legacy extraction payload view: the extracted-language list, and the renderer store's `getLanguage`.

### storage/languages/migrate.ts

- Upgrade on read: a folder holding only the legacy extraction payload (`dialogue.txt`, no `set.json`) is converted to a set the first time it is listed or opened.
- The new files are written beside the old ones and nothing is deleted, so a rollback keeps working and the asset recompile still finds what it reads.
- Idempotent: the presence of `set.json` ends it, so a second pass is one `exists` check and never overwrites edited content.
- Returns true when the folder holds a set after the call, migrated or already one.

### storage/languages/pack/index.ts

- The legacy `LanguagePack` view of a folder is the raw extraction payload (`dialogue.txt`, `meta.json`, `font.bin`). Two things still need it: the read-only inspector UI, and the asset recompile, which reads those same files. An extraction keeps writing them next to the set files.

### storage/languages/paths/index.ts

- Layout of one set under `languages/<id>/`: `set.json` (identity, provenance, format, structure), `dialogue.json`, `text.json`, `variables.json` (format 2 onward), `glossary.json` and `names.json` (format 1 only), `font.bin` (raw 2bpp glyph sheet), `font-width.bin` (per-glyph width table).
- `text.json` holds the non-dialogue strings a translator retyped, overrides only, so a folder without it reads as nothing translated.
- The format 1 payloads are read when `set.json` carries no `format`, and never written or deleted after that. The header's `format` is the only discriminator.
- The two legacy files a ROM extraction leaves (`dialogue.txt`, `meta.json`) are named here for the migration and the compatibility reader.

### storage/languages/read-rlang-bytes.ts

- Runs the ordinary import into a throwaway in-memory store and reads the set back through the ordinary readers, so the archive is checked and upgraded exactly as an install would do it.
- `font` is null when the archive carries no font.

### storage/languages/read/index.ts

- Every entry point migrates a legacy folder first, so a caller never sees the old layout, and the content half is upgraded to the current set format on the way past.
- The set meta is picked field by field, so the format bookkeeping the header also carries stays in the storage layer.
- A folder written before `text.json` existed reads as an empty object, which is exactly nothing translated yet. The catalog, not this payload, decides which slots the editor shows.

### storage/languages/rlang-format/index.ts

- A `.rlang` file is one language set as a plain ZIP. `set.json` is entry 0, so a reader can identify a set from the head of the file, then the payload files follow in a fixed order.
- Only the files a set folder is made of travel. The ROM-extraction leftovers (`dialogue.txt`, `meta.json`) never do.
- A header opens when it is named, its base language is known, its origin is `rom` or `custom`, it has a numeric version, and its format is not newer than this build writes.

### storage/languages/set-id/index.ts

- A set id becomes a folder name and the value the config's language key selects at boot, so it is limited to lowercase letters, digits and dashes. It must also not be taken.

### storage/languages/types/types.type.ts

- `SetFontBytes` stays as `Uint8Array`, the FileStore's own currency, so the storage module is host-neutral. The bake step wraps the bytes for its Node-Buffer pipeline.
- `ExtractedPack` is the raw result of a ROM extraction, as the extraction worker produces it.
- `lineCount` of a summary is the number of dialogue entries the set holds.

### storage/languages/write/index.ts

- `saveSet` overwrites the JSON payloads of the whole set and never touches the font binaries, which an extraction writes once or a create or duplicate copies. It never bumps `version`; that is the caller's call.
- The overrides file (`text.json`) stays outside the format bookkeeping on purpose: it is purely additive, so it needs no format to discriminate it, and its absence is a valid state.

### storage/link-sprites/link-sprites/index.ts

- The custom player sprite library is one global, profile-independent folder, `link-sprites/`, under the Data root. A profile's `linkSprite` setting selects one file by name, and the renderer stages the chosen file for the core at boot.
- Two containers live side by side: `.zspr`, which other tools produce, and `.rsp`, ours.
- File names become path segments, so every name from outside passes through `safeFileName` before it is joined. `writeLinkSprite` writes under the name as given, so callers pass a name that went through it.
- `freeSpriteName` adds a numbered suffix until the name is free, so nothing is overwritten.

### storage/link-sprites/parse-rsp/index.ts

- The write side, which renders the courtesy PNG, stays in the renderer (`apps/desktop/src/lib/game/rsp.ts`). Reading needs no canvas, so it lives here for every host: the renderer, Electron main and the store.
- The ZIP local file header check is cheap enough to run before handing bytes to JSZip.

### storage/link-sprites/rsp.type.ts

- The Relic Sprite Pack is a zip holding a manifest and the raw tiles. It exists for the one thing ZSPR cannot do: keep the original palette and the edits as separate layers, so reverting still works after a file is closed and reopened, and an export can choose which layer to bake.
- It also carries palettes the core does not consume yet, so the data survives a round trip. `electro` is outfit index 4, the flash palette (`PlayerSprite_Apply` stops at four outfits). The sword and shield palettes are loaded from their own assets, untouched by any sheet.
- `source` records what a sheet was derived from.

### storage/msu-classic-manifest/index.ts

- A classic MSU-1 pack (bare `<n>.pcm` files, no manifest) is presented as a manifest with one layer per track, so the engine has a single shape to play.
- Looping follows the game's own table: a fanfare must not repeat. A repeating slot uses order `single`, one file repeating at its own loop point; `sequential` would describe a pool of files that is not there.
- Packs in the wild contain two files claiming the same number (`3.pcm` beside `themename-3.pcm`), and MSU-1 only opens one. The canonical `<n>.<ext>` wins, otherwise the first name alphabetically.
- A manifest describes only the authored slots. The remaining numbered files fill the gaps, otherwise adding layers to one slot would silence the rest of the pack.

### storage/msu-edit/index.ts

- The text helpers (parse, serialize, new) are pure, so the main-process handlers, which speak Node fs, share the same format and validation.
- The on-disk form has `modifiedAt` stamped, a 2-space indent and a trailing newline.
- `parseManifest` returns null for missing text, malformed JSON, or a version this build does not know.
- A pack's name is its folder. The name inside its manifest follows the folder on every read and write, so a renamed pack, its export and its store install carry the same name.
- The inventory is taken from the folder at write time, never from the caller: a manifest held in memory only knows the files it was read with.
- FileStore has no move, so a rename copies every entry across and drops the old folder, then rewrites the manifest so its name follows the new folder.

### storage/msu-inventory/index.ts

- The inventory is every regular file in the pack folder except the manifest, sorted by name so two saves of the same folder produce the same text. Packs hold more than the wiring (alternates, an unwired bed, a cover), and an export that followed references alone would leave those behind.
- The inventory is written into the manifest on every save, an archive carries exactly that list, and an import can report which files did not make it.

### storage/msu-layer-edit/index.ts

- Both halves of a manifest carry layers (music slots and sound channels), and the same file can belong to both. `mapLayers` is the one walk over both, and the manifest is rebuilt whole so a channel a transform does not touch is still copied.
- Lives in shared because the renderer re-points a manifest when a file is renamed by hand, and the main process does it when a file's format changes.
- Names match case-insensitively: a hand-written manifest can spell a name in a case the disk does not and still play on a case-insensitive filesystem.
- A loop sample read from a file header is written only into layers that do not declare one; an explicit `loopSample` is the pack author's decision. A layer over several files holds one repeat point, so the first file to declare one wins. That is a limit of the format.

### storage/msu-paths/index.ts

- Pack and file names come from user input (imported archives, the pack editor), so every name that becomes a path segment is checked for traversal.
- `AUDIO_EXTENSIONS` are the two MSU formats plus browser-playable audio.
- The track-number pattern is built from `AUDIO_EXTENSIONS` on purpose. A classic pack has no manifest, so the file name does the wiring, and the set of formats accepted as audio must be the set a track number can be read from. Hardcoding `(pcm|opuz)` once made a converted `foo-2.flac` stop being track 2.

### storage/msu-resume/index.ts

- The music resume state is a sidecar, `{save}.msu.json`, next to the save it belongs to, because quick slots have no manifest. This fits all three save kinds.
- The save owns its lifetime: the save stores clear it whenever that save is written or deleted, so a caller persisting a new snapshot writes it after the save bytes.

### storage/msu-superseded/index.ts

- A file is superseded when the pack also holds its stem in the target format, whichever way round the two arrived. There is no record of a past conversion. The same rule decides what the files list offers to throw out and where a reference moves, so the two cannot disagree.
- Stems match case-insensitively, for the same reason as layer names.
- The main process reconciles the manifest once the last converted file lands, and the renderer moves every reference before an original is deleted, so removal never silences a slot.
- A reference to a file no longer on disk still moves if its stem is there. Two references landing on the same file collapse to one.
- `withSupersededRepointed` returns the same object when nothing moved, so a caller can skip the write.

### storage/msu/base-metadata.ts

- An MSU-1 `.pcm` is raw samples at a fixed rate and channel count, so its duration and bit rate follow from the byte count. For an encoded file the figures live inside the codec, so they stay null unless a probe supplies them, never guessed.

### storage/msu/index.ts

- Layout: `msu/<pack>/<track>.{pcm,opuz,msu}`. This folder is the one import site for the whole MSU storage surface, so it re-exports the edit half.
- A layered pack's file names are arbitrary (`wind-loop.flac`), so the numbered track list cannot see them; `listAudioFiles` lists every audio file.
- `deletePack` moves the pack to the recycle bin where the platform has one, so it can be put back.

### storage/msu/pack-file-metadata.ts

- The base pass is arithmetic on the directory listing, which keeps a multi-gigabyte pack affordable. The probe is optional and only asked about encoded files.
- `.opuz` is a custom wrapper no decoder reads, so it is not probed.
- A probe is a process launch and a converted pack has about a hundred files. One at a time was too slow and a hundred at once fight for the disk, hence four in flight.
- The loop point is not read here. It sits in the first eight bytes, but a FileStore reads whole files, so a listing would pull the entire pack through memory.

### storage/msu/read-msu1-loop-sample.ts

- An MSU-1 file starts with a four-byte magic, followed by the loop sample as a little-endian uint32 at offset 4. Returns null for any other format and for an invalid MSU-1 file.

### storage/msul/import-msul.ts

- Reads a `.msul` pack back into a manifest and its files, the exact inverse of `apps/desktop/src/lib/msu/export/export-msul`, so a pack exported and imported again is the pack you started with.
- Every failure is something a user did (wrong file, hand-edited manifest, a pack from a newer build), so each throws a message written for them. The validation is spelled out here because `parseManifest` collapses every cause into null and could only give one generic message.
- `files` holds every non-manifest entry, in archive order.

### storage/msul/install-msul-pack/index.ts

- A pack arrives three ways: dropped into the Data Manager, opened from the desktop through the file association, or installed from the store. All three give the same result, and the pack always lands in a folder of its own, never over an existing one.
- The manifest is written last: a run that dies part way through the audio leaves a classic, still playable pack, not a layered one whose layers name files that never arrived. That write re-stamps the inventory from the folder.
- Entry names are flattened to a bare file name, because a manifest can only name a file inside its own pack.
- `ownName` is the folder name the pack asked for; `pack` differs from it only when that name was taken.
- `missingFiles` lists files the manifest names but the archive lacks. It is always empty for a pack exported before the manifest carried an inventory.

### storage/msul/install-msul-pack/sanitize-pack-name.ts

- Pack names become folder names, so characters a folder name cannot hold are stripped, including the control characters 0x00 to 0x1f. The pattern holds those bytes literally and must stay as written.

### storage/profile-data/index.ts

- Paths and format match the Electron handlers: `profiles/<id>/{sessions,tracker,randomizer,input-profiles}.json`.

### storage/profile-patch.ts

- A key that is absent leaves the field alone, null clears it, a value sets it. A clear written as `undefined` could not be told from absent once the patch crossed a process boundary.
- The randomizer config is frozen except for its connection. The profile is mutated and returned; the call throws when the connection part is refused.

### storage/profiles/index.ts

- The on-disk layout (`app.json` at the root, `profiles/<id>/{profile.json,config.json,saves/}`) and the 2-space JSON match the original Electron stores, so existing desktop data is read unchanged.
- Profile updates are a whitelist: of `randomizer`, only the connection is patchable. A refused patch throws before anything is written.

### storage/randomizer-connection-patch.ts

- The only edit a randomizer profile allows after creation is the connection of an online profile. A patch naming any other key (the seed, the options, a pinned setting) is refused whole, so nothing that shaped the seed can drift.

### storage/rom-kinds/index.ts

- A base ROM boots the game; a supplement only adds to one. Explicit kinds replaced scanning the ROM folder for the first `.gba` file, where a stray or wrong-revision file was adopted and then failed deep inside the asset compile.
- `label` is neutral: the cartridge's own title is data, never a UI literal.
- `pickExtensions` carry no leading dots.
- An empty `accepts` list means no digest gate. The base cartridge is validated by the extractor's own multi-region SHA-1 profiles, so hashing it here would reject the regional ROMs the pipeline supports.

### storage/roms/index.ts

- Every import names its kind, and kind and digest are settled at import, where the user can still be told which file was refused and why.
- `ROM_PICK_EXTENSIONS` serves call sites that only ever meant the base cartridge.
- Deleting a base cartridge takes its blob, its sidecars and its profiles with it. Deleting a supplement drops only the sidecars it produced; the base game is untouched, which is the point of the two being separate files.
- An import never overwrites: an existing destination is reported as `alreadyExists` and the bytes on disk stay as they are.

### storage/save-manifest.ts

- Each entry is a `{id}.sav` and an optional `{id}.png` tracked in `manifest.json`, shared by normal and auto saves.
- Writing over a save removes its music resume sidecar, because the position belonged to the state that was there before. A caller with a fresh snapshot writes it after this call.
- `valid` returns the manifest entries whose `.sav` still exists, newest first.

### storage/save-paths/index.ts

- Quick slots are bare `save{N}.sav` with no manifest; normal and auto saves are `{id}.sav` tracked in `manifest.json`. Anything stored per save therefore keys off a file name stem, not a manifest entry.

### storage/saves/index.ts

- Named and auto saves under `profiles/<id>/saves/` (`normal/` and `auto/`, each with its manifest), plus the quick slot listing. SRAM (`sram.dat`, kept once as `sram.bak`) and the quick slots themselves (`quick/save{N}.sav` and `.png`) are written by the Brock port kit (`@drizztdourden08/brock-port-kit`) in the same layout.

### storage/sprite-manifest-digest/index.ts

- The renderer (over its FileStore) and the main process (`electron/sprites/extraction-state.ts`, over fs) both ask whether a ROM's sprites are complete and have to agree, so the expected file list and the fingerprint are defined once here.
- The fingerprint is FNV-1a, not a real hash. This code runs in the renderer, the mobile host and Node, so `node:crypto` is not available, and nothing here is adversarial.
- The file count is carried next to the hash, so a 32-bit collision would also have to land on the same number of sprites to go unnoticed.
- The names are sorted before hashing, so a reordered manifest is the same manifest.

### storage/sprites/index.ts

- Layout: `sprites/<romStem>/*.png`, the in-game binaries beside them, and the debug and review JSON at the Data root.
- `check` measures the folder against the manifest, not a file count. Counting kept a folder extracted before a sprite joined the manifest complete forever, so the new picture never appeared and the HUD drew a broken image.
- A finished extraction leaves a receipt naming the manifest digest it ran against. A receipt for the current manifest is taken at its word, so a definition the ROM cannot satisfy does not trigger a re-extract on every launch. Adding, renaming or removing a definition changes the digest, and the folder is then compared name by name. A folder with no receipt falls straight to that comparison.
- An empty or absent folder is never complete, receipt or not.
- The receipt's `count` is diagnostic only, never a gate.
- `writeSprites` clears the stale set first and writes the receipt after the files, so a failed write never leaves a receipt claiming a finished run.
- The in-game binary readers return null when the set predates that binary. The stamp reader returns null before the set carried a stamp.
- `isStale`: a set holding none of the expected files is not stale; that is the never-extracted case, which the caller answers by extracting. A set is stale when an expected file is absent while others are there, or the stamp is missing or names another version (the definitions, a drawing or the decoders changed).

## Store (Hookshop)

### store/api-contract.ts

- The store's own routes. The account routes it also serves (sign in, me, devices, views) are `HUB_ROUTES` in shared/hub.
- store-api's router, the store site and the app all read this table, so a route exists in one place.

### store/api-types/api-types.type.ts

- One answer type per route in `STORE_ROUTES`. store-api returns them, and the store site and the app read them.
- Items come back projected: only the author, reviewers and admins see pending versions, reviewers and review notes.
- `ItemResponse.myRating` is the caller's own stars, null when they have not rated it. `installed` says whether the caller has installed it at least once, which rating requires.
- `UploadedPartsResponse` answers GET /items/:id/versions/:n/parts: the parts of an uploading version already in the bucket, for a resumed upload.
- `DownloadResponse.license` is a licence id from shared/store/licenses.
- `ReviewEntry.submittedAt` is when it was sent for review or, for a version not sent yet, when its upload started. For a version, `downloadUrl` is a short lived link to the upload under incoming/, so the reviewer can test it.
- `UnsubmittedResponse` answers GET /review/unsubmitted: the ready versions no author has sent for review yet, oldest first.
- `PackLinkResponse` is an inline signed link to a version's pack, read in parts. GET /review/:itemId/:target/pack answers it for the review page, and GET /items/:id/pack for the live version on the item page. `expiresAt` is when the link stops working, in epoch ms.
- `ItemChangeResponse` is the item after a listing edit, an abort, a submit, a withdraw, a delete, a review decision, an unlist or a relist, projected like `ItemResponse.item`.
- `FeaturedResponse` answers PUT /home/featured with the featured row as stored, first to last. `WelcomeResponse` answers PUT /home/welcome. `BanResponse` answers POST /users/:userId/ban with how many of the user's items were unlisted.
- `DailyJobResponse` answers POST /jobs/daily. `recounted` counts items whose installs30d changed. `prunedDays` counts per day counters dropped for falling out of the window. `droppedUploads` lists versions whose upload was started and never finished, now deleted. `expiredFiles` lists rejected and ready versions whose file was kept its full time and is now removed. `staleWaiting` lists versions waiting so long their upload will soon leave incoming/.

### store/based-on/based-on.type.ts

- The credit a copy of an installed item keeps to the original: which store item, its name, its author's display name, its licence and the version it was copied from. Every pack format carries it the same way, as an optional `basedOn` in its own metadata.
- `license` is a licence id from shared/store/licenses.

### store/containers/containers.constants.ts

- The store carries three containers, one per kind. Each keeps its manifest as its first archive entry, so the API and the app can identify a pack from the head of the file.
- `CONTAINER_MANIFEST` holds the name entry 0 must carry.

### store/deep-link/deep-link.constants.ts

- The install link is `relic-of-the-past://install/<docId>` with an optional `?v=<n>`. The link type is the app's name, since browsers show it when they ask to open the app. `INSTALL_SCHEME` is also listed in `brock.config.ts` `protocols`.
- Claiming the scheme and parsing a link that arrives from the OS belong to the Brock catalog module (`linkScheme` in the Hookshop config); this folder keeps the scheme and the link format.
- The item id follows Firestore's document id rules, narrowed to the characters an id this store creates can hold: letters, digits, `_` and `-`, at most 128, never `__...__`.
- `InstallLink.version` is a specific version's `n`; null installs the live version.

### store/home-types/home-types.type.ts

- The home page is a welcome message the feature permission edits, then the featured row and three shelves built from the catalogue.
- `HomeSettings` is one document, and the welcome is markdown.
- `ItemCardView` holds what a card on a shelf needs and nothing a player may not see. `color` is the item's own colour as `#rrggbb`. `banner` is shown only in the featured row. `semver` is the live version's semver, null before the first approval. `ratingAverage` is a plain average, null with no ratings.

### store/install/install-msul.ts

- Music packs install through the Data Manager's own `.msul` install, into a new folder under `msu/` named after the pack itself. Uninstall removes that folder.
- After an update removed the version before it, the new folder moves back to the pack's own name, so updates never pile up "(2)" suffixes.

### store/install/install-rlang.ts

- A `.rlang` is unpacked into a new set folder under a free id. Uninstall removes that folder.
- Rebaking the asset blob afterwards is the host's step, since the bake runs where the ROM and the assets are.

### store/install/install-rsp.ts

- A character sprite is one `.rsp` file in the sprite library, under a name no other file has, so a store install never replaces a sprite the player made. Uninstall removes that one file.
- `settleName` moves the file to the sprite's own name once that name is free, after an update.

### store/install/installer.type.ts

- One installer per container, all working on the FileStore port alone, so the same code runs in Electron main and on Android. Each uninstall removes exactly what its install wrote, found again by `installedName`.
- `InstallProgress.total` is null while a download does not know its size yet.
- `InstallOutcome.installedName` is the music pack folder, the sprite file name, or the language set id. `ownName` is the name the pack gives itself, as a folder or file name. It differs from `installedName` only when that name was taken, as it is during an update while the old copy is still there.
- `settleName` moves an installed pack to its own name once that name is free, as it is after an update removed the version before it, and returns the name it ends under. It is absent where there is nothing to move: a language set keeps its id.

### store/install/select-installer.ts

- Callers never branch on the container themselves; they ask for the installer.

### store/installed-types/installed-types.type.ts

- What the app installed from the store is the Brock catalog module's installed record, written by the main process. The record makes uninstall and update exact, because `installedName` is the one thing an installer wrote.
- `InstalledRecordView` is the shape of one catalog record as RotP reads it. `packOfRecord` turns it into an `InstalledPack`, or null when its kind and container do not match or its origin or semver is missing, so a damaged record never reaches an editor.
- `InstalledOrigin` is the listing an install came from, as the download grant named it.
- `InstalledPack.version` is the version's `n`, compared with the item's liveVersion to offer an update. `installedName` is the music pack folder, the sprite file name, or the language set id.

### store/item-color/item-color.constants.ts

- An item's own colour is its card's border, and the stripes and glow of its placeholder while it has no picture. `DEFAULT_ITEM_COLOR` is the store's gold, used until the author picks one.

### store/keys/keys.constants.ts

- The store bucket layout. This folder is the only place a key is spelled.
  - `incoming/<itemId>/v<n>/<slug>-<semver>.<ext>`: every upload lands here.
  - `packs/<kind folder>/<itemId>/v<n>/<slug>-<semver>.<ext>`: approved copies, what players get.
  - `media/<itemId>/<card|banner>-<sha8>.webp`: pictures, a new key per picture.
- The file name in a key is the slug and version, so the bucket reads like a catalogue and a download saves under a sensible name.
- `itemFolders` lists the folders an item owns under packs/ and media/, removed when the item is deleted.
- Players are only ever handed download URLs for keys under packs/, which `isPackKey` checks.

### store/licenses/licenses.constants.ts

- The licences an author can publish under, read by the store's Publish form and by the app.
- `allowsCopies` says whether a player may make a copy of an installed item and change it. Every licence but "All rights reserved" does. An id the table does not know allows nothing.

### store/limits.ts

- Every cap the store site, the store API and the app agree on. One table, so a cap raised on the server is raised in the upload form and in the install check in the same commit.
- `packBytes` is the largest pack per kind, in bytes. A full MSU-1 soundtrack runs past 1.5 GB; sprites and text stay small.
- `card` is every item's 16:9 card: exact size, webp, at most that many bytes. `banner` is the optional 3:1 banner used when an item is featured.
- `downloadsPerDay` and `downloadBytesPerDay` cap what one player may download in a day (a few full music packs). `packPreviewsPerDay` caps the pack preview links one player may open in a day, for the Contents tab of an item page.
- `manifestHeadBytes` is how much is read from the head of an upload to find its manifest; a larger first entry is refused. `manifestBytes` is the largest manifest once inflated; a first entry claiming more is refused before inflating.
- `itemsPageSize` is the number of items per catalogue page. `featuredMax` is the most items the featured row holds. `homeCacheMs` is how long the built home page is served from cache. `popularWindowDays` is the window Popular counts installs over.
- `incomingKeepDays` is how long an upload stays under incoming/ before the bucket lifecycle clears it. `rejectedKeepDays` is how long a rejected version keeps its file so the author can resubmit it, counted from the rejection. `readyKeepDays` is how long a ready version never sent for review keeps its file, counted from the start of its upload.
- `filesKept` is how many approved files an item keeps, newest first; older approved versions lose theirs. Music keeps the live one and the one before, because a music pack is large.

### store/manifest/facts-for/facts-for.ts

- Turns a pack's first entry into the facts an item shows, through the same guards the app uses to open each container. null means the app could not open it: the entry has the wrong name for the container, or its manifest fails that container's guard.

### store/manifest/inflate-raw.ts

- Inflates one raw DEFLATE stream through the platform's DecompressionStream, which Node, Electron and every current browser provide, so no library travels with it.
- Reading stops as soon as the output passes `maxBytes`, so a small entry cannot expand without bound. The result is null when the stream is damaged or grows past `maxBytes`.

### store/manifest/range-reader.type.ts

- Random access to one pack file, so a reader can take the parts it needs without holding the whole file. A local pack answers from its bytes; a pack in the store answers with ranged requests to a signed link.
- `bytes` is the total size of the pack file.

### store/manifest/read-first-entry/read-first-entry.ts

- Reads entry 0 of a pack from the head of its bytes and parses it as JSON. Every container the store carries keeps its manifest there, so the API can check an upload from a ranged read of its first bytes, and the app can check a download before unpacking it.
- A `truncated` failure carries the byte count the entry needs, so a caller holding only the head can fetch that much and try again.
- `FirstEntry.manifest` is the text parsed as JSON, not yet checked against any container's shape.

### store/manifest/zip-directory/entry-data.ts

- A stored entry may be cut to its first `maxBytes`, so a long track can be previewed without reading it all. A deflated entry is always inflated whole, then cut.

### store/manifest/zip-directory/read-zip-directory.ts

- Lists a ZIP from its central directory using ranged reads only. A large pack is never held whole: the listing costs the tail of the file plus the directory, and an entry costs its own local header and data.
- End record layout, little endian: signature 50 4B 05 06, disk numbers, entry counts, the directory's size and offset, then a comment of up to 65535 bytes. That is why the search covers the last 65557 bytes. Directory records are 46 fixed bytes, then name, extra and comment. Every ZIP signature opens with the bytes 50 4B.
- ZIP64 and encrypted entries are refused: no pack the app writes uses either.
- A range read that answers with anything but the bytes asked for is an error, never a guess.

### store/manifest/zip-local-header/local-data-offset.ts

- Where an entry's data starts, counted from the start of its local header, or null when `head` does not open with one. The fixed 30 bytes are enough because they hold the name and extra lengths. The extra in the local header can differ from the one in the central directory.

### store/manifest/zip-local-header/read-local-header.ts

- Parses the local file header at offset 0 of a ZIP: the first entry's name, how it is stored, and where its data sits. Only the fixed 30 byte header and the name are read, so a few kilobytes from the head of a pack are enough.
- Layout, little endian: signature 50 4B 03 04, version, flags, method, time, date, CRC-32, compressed size, uncompressed size, name length, extra length, then the name and the extra.
- Method 0 is STORE and method 8 is DEFLATE.
- `streamed` covers the two layouts that keep the sizes out of the local header: a data descriptor after the data, and ZIP64. The app's own exports use neither.

### store/rating-types/rating-types.type.ts

- A player rates an item at most once, only after installing it, and never their own item. Ratings and installs are both keyed `<itemId>_<userId>`.
- An `Install` is recorded by the download route, and a rating needs one. `version` is the `n` of the version last downloaded.

### store/review-types/review-types.type.ts

- Every version and every listing edit carries a review record. The reviewer and the note are shown to the author, reviewers and admins only; the API strips them for anyone else.
- A version's life: uploading, then ready until the author sends it, then waiting in the queue, then approved or rejected. Deleted is reachable from most states and is final. The moves between states are `VERSION_FLOW`.
- A listing edit waits, then is approved or rejected, or withdrawn when a newer edit replaces it.
- `Review.submittedAt` is when the author sent it for review, null while it has not been sent. `by` is the reviewer who decided. `note` is the reviewer's note to the author and is required to reject.
- `ReviewDecision` is what a reviewer can decide on a waiting version or listing edit.

### store/schemas/index.ts

- One schema per POST, PUT or PATCH in `STORE_ROUTES`. store-api parses every body through them, and the site can check a form with the same schema before sending it. Caps come from `STORE_LIMITS` and `HUB_LIMITS`, so the API refuses what the forms would never send.
- Route per schema: `itemCreateSchema` POST /items. `mediaUploadSchema` POST /items/:id/media, with the size held to the cap of the picture's role. `listingPatchSchema` POST /items/:id/listing, every field optional and at least one present. `versionBeginSchema` POST /items/:id/versions. `signPartsSchema` POST /items/:id/versions/:n/parts. `versionCompleteSchema` POST /items/:id/versions/:n/complete. `downloadSchema` POST /items/:id/download. `ratingSchema` PUT /items/:id/rating. `reviewDecideSchema` POST /review/:itemId/:target. `featuredSchema` PUT /home/featured. `welcomeSchema` PUT /home/welcome.
- `mediaRefSchema` is a picture the author uploaded through POST /items/:id/media; the API checks it is there.
- In a version begin body the size is held to the item's kind by the API, which also numbers the version. In a sign parts body `partsDone` is how many parts the uploader already has up.
- A download body with no version means the live one. A rejection says why in its note. The featured row is ordered first to last. The welcome is markdown.

### store/store-permissions/store-permissions.constants.ts

- What a group can be granted on the store. Admins hold both permissions.
- The shape matches a site's rights model minus its site id, so the hub's RightsModel wraps it as is. `describe` gives the one line summary the groups list shows.

### store/store-rights/store-rights.constants.ts

- The store's rights model: the permissions a group can grant on the store. The group editor shows them beside the Sanctuary's, and store-api resolves a caller's rights through it.

### store/types/types.type.ts

- An item is one listing with its version history. Every version and every listing change goes through review before players see it. The store API, the store site and the app share these records.
- `StoreKind` decides where an item installs. `Container` is the file format a version ships in, one per kind.
- `Person` is a signed in account as the store shows it, the same shape as the Sanctuary's `FileOwner`.
- `MediaRef` is a picture under the bucket's media/ prefix, with its size so a page can reserve the space. The bucket is private: the API adds a signed `url` to every picture it answers with and never stores one.
- `KindFacts` is what a version's manifest says, read when its upload completes and shown on the item. For music, `trackCount` is the music slots the pack fills, `soundCount` the game sounds it replaces across every channel, `fileCount` the files the manifest lists when it carries an inventory, and `deluxe` is true when it fills a slot in the Deluxe range.
- `FileRemoval` records when a version's file left the bucket and why. `by` names who deleted it, or is null for the store's own jobs.
- `StoreVersion.semver` must increase from one version to the next. `facts` is null when the manifest could not be read. `packKey` is the key under packs/ once approved, null before that. `removed` is set once the file is gone from the bucket; the row stays as a trace.
- `Listing` is the text and pictures a player reads before installing. `summary` is one line, shown on cards. `color` is the card border and placeholder colour as `#rrggbb` (see item-color).
- `ListingEdit` is a change to a published listing, reviewed like a version. A draft changes directly.
- `ItemStats.installs30d` counts installs over the last 30 days, recounted by the daily job. `ratingHist` counts 1 to 5 star ratings, index 0 holding the ones. `score` is the weighted average used for Top rated.
- `StoreItem.versions` is ordered oldest first. `liveVersion` is the `n` of the approved version installs receive.

### store/version-flow/file-expires-at.ts

- When the daily job removes the file of a rejected or ready version, or null when it keeps it. A rejected file counts from the rejection, a ready one from the start of its upload.

### store/version-flow/version-flow.constants.ts

- The one table of what a version may go through: for each state, the actions it allows, the state each leads to, and who may take it. store-api guards its routes with it and the store site shows only the buttons it allows, so the site never offers what the API refuses.
- An actor is the author of the item, or a holder of the store's review permission.
- A refusal is `state` when the state has no such move, `actor` when the caller may not take it, and `file` when the file is gone. `NEEDS_FILE` lists the actions that hand the file to a reviewer or to players, so the file must still be there.
- `IN_FLIGHT` lists the states that hold the item's one version in progress; a new version waits until none is left. `isInFlight` also requires the file to still be there.
- `actionsFor` returns the actions in the table's order.

## Types

### types/audio-probe/audio-probe.type.ts

- What a decoder can report about one audio file. Every field is nullable because the probe is optional: without a decoder nothing is knowable for an encoded file, and nulls are never guessed.
- Units: `durationSeconds` in seconds, `sampleRate` in Hz, `bitRate` in bits per second.
- `AudioProbe` takes a POSIX path relative to the Data root. It resolves null whenever nothing can be read (no decoder, not a media file, probe failed), so an absent probe and a failed one look alike.

### types/controls/bindings/bindings.type.ts

- `DeviceFamily` selects the controller icon set.
- `InputApi` says which API a controller uses for button and axis reading. `hid` is decoded state through SDL3, for every gamepad on every platform that has SDL3 (desktop only; see the platform hosts). `webapi` is the keyboard's own DOM key events.
- `KeyboardBinding.code` is a `KeyboardEvent.code` such as `KeyZ` or `ArrowUp`; `label` is a display override such as `Z`.
- `GamepadButtonBinding.index` is a Standard Gamepad button index (0 to 16). `GamepadAxisBinding.axisIndex` runs 0 to 3.
- `ButtonIcon.key` is an icon id such as `xbox-a`, `ps-cross`, `switch-b`. `path` is the asset path, or null until icons are provided. `label` is the text fallback.
- `ButtonMapping.icon` null means no icon is shown and the layout is unchanged. `sourceVid` and `sourcePid` are the VID and PID of the device that created the binding, used for icon resolution.

### types/controls/devices/devices.type.ts

- `InputProfile` is persisted per profile. `isDefault` marks a factory preset (not deletable) as opposed to a user created one.
- `InputProfile.modern` holds the modern scheme bindings (core verbs plus one slot per remaining control). It is absent on a profile that predates the modern scheme; build one with defaultModernBindings (shared/input/scheme).
- `InputProfile.core` holds the ten never assignable verbs, on a classic profile too, because the enhanced pause menu is driven by them under both schemes. On a modern profile it mirrors `modern.core`.
- `DetectedDevice` is a device seen at runtime and is not persisted. `id` is a unique runtime id such as `gamepad-0` or `keyboard-0`. `rawId` is the `Gamepad.id` string or `Standard Keyboard`. `displayName` is the resolved name, such as `Xbox Series X|S Controller`.
- `DetectedDevice.sdlType` is SDL's own gamepad type (SdlGamepadType in packages/game-data/src/sdl-buttons), kept a plain string so this file does not depend on shared/input. The keyboard entry uses the sentinel `keyboard`, never null.
- `connected` is HID level presence. `activated` means the Web Gamepad API is active (a button was pressed at least once). `inputApi` is the API this controller uses for input reading.
- `hasRumble` and `hasGyro` are real capabilities reported by SDL3 (the input module's `onAdded`); false, not unknown, when the device was not detected through that surface.
- `AssignedDevice` is persisted with the profile. `DevicePreset` ships with the app; its `vendorIds` and `productIds` are lowercase hex strings it matches, and `buttonIcons` is the icon set for the device family.

### types/controls/functions/functions.constants.ts

- Function actions are shortcuts and cheats.
- Every default mapping is unbound (`{ type: 'none' }`) on purpose. The project no longer inherits snesrev's legacy defaults, so every binding is user assigned through the controls UI. This also removes a real collision: cheat-health used to default to KeyW, the same key the keyboard gameplay preset assigns to the SNES Y button.
- `toggle-debug-capture` is the only default that ships bound (Tab). The debug report tool is off by default (`allowDebugLogging`), so it costs a normal player nothing, and a contributor who turns it on gets a working shortcut at once. It can be rebound or cleared like any other entry.

### types/controls/scheme/scheme.type.ts

- Binding model for the modern control scheme, in two separate halves. `CoreBindings` holds the ten verbs that are never assignable: the four directions, pause, map and the four menu verbs. They exist under both schemes, because the enhanced pause menu is driven the same way either way.
- `ModernSlot[]` is an ordered, open ended list the player builds. What a slot does is a separate, per save decision (`ModernScheme.assignments`), so rebinding a slot never disturbs what it was assigned, and assigning never disturbs what physically fires it.
- A slot is a number. `index` is 1, 2, 3 and so on, 1-based and contiguous, and it is the whole identity: never derived from the device or from a button position. The control scheme says what slot 3 is bound to and the HUD layout says where slot 3 is drawn; they are joined by that number only, so either side can be re-authored without disturbing the other. Rebinding slot 3 from B to X changes what slot 3 is while the item on it and its place in the HUD stay put.
- This reverses the position derived ids of contract section 11 (`slot:NORTH`) and the face and d-pad only cap of section 15 (see section 19): numbering survives a rebind just as directly and carries no cap, so a thirty button pad is thirty slots and a keyboard is as many as the player adds.
- `position` and `icon` are display only: which glyph to draw and which device's artwork to draw it from. Absent `position` draws from the binding. `binding` is what the player physically presses. The two need not describe the same device: a slot may draw as the NORTH button while reading the `W` key.
- An empty slot (`binding` of `{ type: 'none' }`) still exists and keeps its number, because that is how a player sees there is a free button to fill.
- `SlotAssignment` with `hudItem` uses a core new style HUD item id, 1 to 24.
- The slot list length is the player's choice, never a function of the device.
- `ModernBindings.layoutId` is the HUD layout this scheme wears. It lives here, not in a global HUD setting, because switching the active control profile from keyboard to pad swaps the slot list, the assignments and the HUD layout together in one step. It is prefilled when a controller is dropped and editable afterwards. Two schemes naming the same id share one layout, so editing it edits both, and duplicate layout in the editor is how one forks. Absent means the shipped default, so an old profile needs no migration.
- `ModernScheme.assignments` is a per save table keyed by slot number. A slot with no entry is unassigned; an empty table is the valid default.

### types/controls/snes/snes.constants.ts

- `SNES_BUTTON_BITS` are the bitmask positions matching `g_input1_state` in emscripten_main.c.
- `SNES_BUTTON_LABELS` are the button names in the Nintendo layout. `SNES_ACTION_LABELS` say what each button does in game.

### types/debug-report/debug-report.type.ts

- Types for the debug report tool (Contributor tab, gated by `GameSettings.allowDebugLogging`).
- `DebugCaptureSnapshot` is one sample of where Link and the game were, taken while capture is running. `session` numbers the start and stop cycle it belongs to (1, 2, ...), so several recordings in one report stay distinguishable.
- `DebugCaptureScreenshot` is one frame grabbed alongside a snapshot, only while capture is running.
- `DebugCaptureFinalizeInput` is what the renderer hands off the moment a recording stops: the raw frames and the position timeline for that one session, keyed by `sessionKey` (its own folder under `debug-captures/<profileId>/`). Finalizing writes both to disk and encodes them into a video at once; packaging a report never waits on this, it zips whatever session folders exist.
- `DebugCaptureSessionSummary` is one recorded capture session as the picker lists it. `sentAt` comes from the profile's capture manifest, not the session folder (see capture-manifest.ts). `previewKind: 'images'` (no ffmpeg, PNG fallback) carries every packaged frame in `previewFrameUrls` so the picker can cycle through them as a fake video.
- The report zip (saves, profile files, logs and capture sessions) is built and uploaded by the bug report transport in the main process (`apps/desktop/electron/sanctuary/bug-report/`), so no report shape crosses IPC.

### types/diagnostics/diagnostics.type.ts

- The host hardware and OS readout behind the debug info block, collected in the main process (none of it is reachable from the renderer sandbox).
- It is kept free of anything identifying (host name, user name, file path) because it is meant to be pasted into a public bug report.
- `DisplayDiagnostics.bounds` is the logical (DIP) bounds in the virtual desktop, as the window manager sees them. `nativeSize` is the logical size multiplied by the scale factor.
- `GpuDiagnostics.features` maps each feature to its acceleration status (`enabled`, `disabled_software`, ...).
- `OsDiagnostics.version` is the human readable OS name, such as the edition string on Windows.

### types/ffmpeg-tool/ffmpeg-tool.constants.ts

- `FFMPEG_TOOL_ID` is the id ffmpeg is registered under in the Brock tools module, shared so the main process and the renderer name the same tool. ffmpeg is not bundled: it is fetched on request into the app's data root, so a user who never asks never downloads 140 MB.

### types/game-event.type.ts

- `GameEvent` is an event emitted by the game core.

### types/github-issue/github-issue.type.ts

- `detectedName` is the best display name resolved for the device: a hand-coded preset, the SDL name, or "Unrecognized controller".
- `sdlMatch` is the closest SDL_GameControllerDB entry for this VID:PID, or null if none exists.
- `inputApi` is the resolved input path: `hid` or `webapi`, or `unknown` if nothing matched.
- `hidReport` is the raw HID device identity plus a recent raw report log, as preformatted text.
- `calibrationMap` is the HidControllerMap JSON produced by the wizard step, as preformatted text.
- `positionalCapture` holds one record per control asked for during positional capture: the label the user was shown against the position SDL reported. Preformatted JSON, absent when that step was skipped.
- `diagnosticsReport` is the device identity and capability report as SDL saw it, preformatted JSON.

### types/hud/glyph-pack/glyph-pack.type.ts

- A glyph pack maps SDL's positional control names to the artwork drawn for them. Keying by position (never by a printed letter) lets one pack serve every device family without claiming a control exists.

### types/hud/hud-button/hud-button.type.ts

- `button` draws a control's face, with a face per state. It replaces the old `glyph` element as a control's picture. `{ type: 'slot', index }` (the item sprite a slot holds) is a separate object placed wherever the author likes; binding both by the same numbered slot is what makes that free.
- A bind names which control, not which device. `verb` is one of the six core actions every scheme has; `slot` is whatever slot N fires, and N is never capped or checked against a real device (a keyboard has 107 glyphs, and a layout may name a slot nothing is plugged into).
- A face is a picture the author chose, not an auto resolved binding. `image` is the author's art; `glyph` names a pack and a position the way the `glyph` element does, picked visually from the same grid. The glyph is a plain string (an SDL position or `DPAD`, as `HudGlyphPosition`) so this file never imports the recursive node union back; the validator checks it against the same set.
- `idle` is the only state every button must have. A missing state falls back to `idle`. `unassigned` (drawn when the bound slot fires nothing right now) supersedes the old `dimWhenEmpty` flag for a button: it can be a different picture, not only a dimmer one.

### types/hud/hud-countdown/hud-countdown.type.ts

- `countdown` is the HUD timer the digging game and the Super Bomb share: a pie that loses a slice per share of the time, with the seconds drawn on it. The renderer reuses the `HudCountdown` compound the Original style draws (`HudView`'s `HudCountdownSlot`); this leaf only says where it goes (section 62).
- It draws only while the game counts down. While `countdown_active` reads 0 the node is not visible, exactly as `visible: false` is, so it leaves the flow and takes no space (`resolve-box.ts::resolveVisible`). That is the kind's own rule, not something an author binds.
- `variant` picks the pie. Absent or `setting` follows the profile's `hudCountdownStyle`; one of the setting's own ids pins the node to that pie. Variant ids are named exactly as the setting names them.

### types/hud/hud-layout/hud-layout.type.ts

- The layout document is what a built in JSON file holds and what the editor saves; only the `builtIn` flag tells them apart.
- A layout is one tree hanging off the screen. It used to be two positioning systems: a `screen` container and a `regions[]` array of nine named anchors, which were a 3x3 grid wearing nine words (`top-left` is cell (1,1) hugging start and start, `center` is (2,2), `bottom-right` is (3,3) hugging end and end). Section 42 folded them in: the screen is a grid and a former region is an ordinary child with a `place`. A child of a grid can be in any cell of any template, can span, and can share a cell. Moving the wallet is picking a cell.
- Anchoring happens once, at the screen, and everything below is in the flow, so a layout never grows an absolute escape hatch halfway down. The numbers inside it are distances and relationships, not screen coordinates, which is what lets one document read correctly at 16:9, 21:9 and in 240 line mode.
- `HudScreenRoot` is the document's one root and the only node whose size is not a question. It is an ordinary `HudContainer` with the same decoration and choice of engine, held apart only because its rectangle is not authored: it is always exactly the view. So `size`, `min`, `max`, `margin`, `scale` and the child placement fields are refused on it by `validate-layout.ts`. Locking that in the validator and not in the type is deliberate: a hand edited file gets the same named error as any other bad field, not a silently ignored key.
- The screen's engine, columns and rows are the author's (section 42, reversing section 38.4). The default template is `[auto, fill, auto]` each way, the middle track eating the free space so the outer bands hug the edges, which is exactly the nine anchors. Its `padding` is the one inset every child sits inside, so a safe area margin is one number in one place.
- `HudClusterReveal` says when the button map is on screen during play. It is a property of the whole map, since showing only while something has just changed is a statement about a group of controls over time, which no single box can make.
- `glyphPack` and `inGameplay` are the two display fields that outlived the old `HudButtonsOptions`. `shape`, `rowOrder` and `spriteOffset` were cluster geometry that the tree now authors directly.
- `basedOn` is the layout this one was forked from, for the editor's start from list.
- `glyphPack` is which pack every glyph in the layout draws from, or `auto` to follow the device family (default `auto`); a glyph element's own `pack` wins over it. It cannot live only on nodes because the pause menu's nav legend draws glyphs that belong to no node, from the same pack the button map uses.
- `inGameplay` defaults to `always`.
- `screen` is required: a layout with no screen has nowhere to draw, and `migrate-screen.ts` gives one to every document written before section 42, including those that only had `regions[]`.

### types/hud/hud-motion/hud-motion.type.ts

- `animation` and `transition` are two property sections any node may carry (phase 6 of the HUD data binding plan).
- An animation runs on its own clock. Gated by an expression (`when`, absent means always, evaluated truthy when non zero like a switch case and never parsed as a `Value`), it samples a `keyframes` track over `duration` and `delay` in ms, repeating per `loop`. `steps(n)` turns a `property: 'x'` animation over a clipped box into a frame exact sprite sheet flipbook, which unlike a GIF can be paused with the game, staggered per repeat index (`delay: 'index * 80'`, see `tests/hud/hud-motion.keep.test.ts`), or driven by data.
- A transition fires when a bound value changes, a different clock. Picking up an arrow eases the counter's own properties. `enter` and `exit` apply the same idea to a node appearing or disappearing (a repeat gaining or losing an instance), since a changed value has no meaning for a node that did not exist a frame ago.
- The reflow rule (see `REFLOW_PROPERTIES` in `shared/hud/engine/motion.ts` and `shared/hud/layouts/validate-motion-warnings.ts`): `scale`, `opacity`, `x`, `y`, `rotate` and `tint` are drawn after placement and cannot move a sibling, because the renderer applies them as a transform, filter or opacity overlay on the node's own placed box. `width` and `height` are allowed but flagged inside a flow container (flex or grid), since a pulsing width that shoves the magic bar every frame makes a HUD that will not sit still.
- `HudEasing` is one of five named curves or `steps(n)` for an integer n of 1 or more. The exact shape is checked at validation (`validate-motion.ts`); the type does not pretend a template literal can check an author typed string.
- A keyframe's `at` is a 0 to 1 fraction of the animation's `duration`, never wall clock time. A keyframe's `easing` overrides the animation's easing for the span leading into that keyframe only.
- An animation needs at least two keyframes.
- Enter and exit properties are narrower than value transition properties: a node arriving or leaving reads only as a fade, a scale, or a small position settle, never a colour swap.
- `HudTransition.when` has one extra name available: `delta`, the signed change in whichever property changed (see `transitionDelta` in motion.ts). Only ease increases is `delta > 0`.

### types/hud/hud-node/hud-box.type.ts

- The recursive HUD document model has one node type with two shapes. A container has children and lays them out; an element draws one thing and has an intrinsic size. Both carry the same box properties, so a container can be sized, moved and scaled like a leaf and the editor needs one inspector.
- The aspect ratio is load bearing. An element is never stretched: `contain` is the only fit, so a larger box letterboxes the content and a smaller one scales it down. No engine code path writes a width and a height independently.
- Two ways to change a size. `scale` multiplies a node's own coordinate system (content, padding, gaps, everything below) by one factor; it is how a subtree grows or shrinks (the compact preset is the baseline at 0.75) and what a ratio locked resize handle writes. `size` sets the box: for an element the content is contained inside it; for a container it is the field its children flow in, so spare main axis space feeds `justify` and `fill`, and spare cross axis space feeds `align`. Children are never stretched to fill it, because flex has no stretch alignment; a grid's `alignItems` is the one place stretch is real, since a grid cell is a real box with no content to letterbox against.
- Bindable boxes (phase 2 of the HUD data binding plan): `size`, `scale`, `opacity`, either axis of a container's `gap`, and `visible` take a `Value`. The engine resolves each before measuring (`shared/hud/engine/measure.ts`, `place.ts`), so a document with no bound values measures as it always has. `visible` keeps its boolean shorthand and gains the `Value` form, truthy when non zero.
- Numbers are SNES pixels in the coordinate system of the node's parent. The renderer multiplies by its own display scale; nothing in this model knows about screen pixels.
- `Extent`: `auto` is intrinsic; `fill` takes the remaining main axis space (in a grid, the remaining track space); `pct` is measured against the parent's content box on the same axis. A bare expression is `px` shorthand: `{ from: 'data', expr }` alone means `{ px: { from: 'data', expr } }`. A bare number is not offered that shorthand (`{ w: 40 }` stays refused, see validate-box.ts's test), because it cannot be told apart from forgetting the `px` wrapper.
- `Edges` may be negative: that is how a sprite hangs outside the box it belongs to, which is what the cluster's radial item offsets are.
- `HudPlace` is where a grid parent places the child. It is ignored under a flex parent but still round trips, so a node moved between flex and grid parents keeps it. It is 1-based; absent means auto placed in document order. Two children may name the same cell: that is how every overlay is written (section 42), so an explicit place is never refused for being taken, and only auto flow skips an occupied cell. Co-placed children paint in `order`, then document order.
- `HudAlignSelf` overrides the parent's item alignment for one child: a flex line's cross axis, or both grid axes at once. `justifySelf` (grid only) overrides the inline axis on its own and wins over `alignSelf` there, which a cell whose two bands disagree needs (the screen's top centre band is `center` across and `start` down). Under flex it is ignored, since the main axis is the container's to distribute.
- `HudBox.id` is stable, editor assigned and unique within the document.
- `min` and `max` are a floor and a ceiling on the resolved size, whatever `size` says, for every extent kind. They keep a `fill` child from collapsing to nothing or growing without bound.
- `scale` defaults to 1. `opacity` is 0.2 to 1, multiplied down the subtree.
- `visible` defaults to true. An invisible node leaves the flow entirely: a hole where an element used to be was a defect of the flat model. The `Value` form resolves truthy when non zero, so hiding the arrow counter while there are none is `{ from: 'data', expr: 'arrow_current > 0' }`.
- `dimWhenEmpty` draws the node dimmed while none of the listed slots holds an assignment. One number for a face button; all four for the d-pad's shared cross. The engine only resolves the flag; the renderer decides what dimmed looks like.
- `order` is the paint order tiebreak within the parent, default 0. Higher draws later (on top) and is visited later by a grid's auto flow.
- `style` is CSS grade decoration (see hud-style). `animation` is self clocked motion gated per entry; `transition` eases the node's own bound properties when they change, plus its own enter and exit (see hud-motion).

### types/hud/hud-node/hud-container.type.ts

- Every container has two gaps. `x` is always horizontal and `y` always vertical, whatever the engine or direction (CSS `column-gap` and `row-gap`), which is why the panel can label them with arrows. A flex row separates items by `x` and wrapped lines by `y`; a flex column does the reverse. A grid separates columns by `x` and rows by `y`. The flow engine used to spend one number on both (section 57), which is why a flex `gap: n` migrates to `{ x: n, y: n }` and lays out the same.
- `HudGuide` is a container's own overlay colour, editor only and never drawn by the game, so the editor can tell nested containers apart. `show` is written so stored documents stay valid and is read by nothing (section 55).
- `HudContainerBase` is what is true of any container whichever engine it picks: it holds children, separates them on two axes, and the editor may draw it.
- Flex `direction` is two values, not three: an overlay is a grid whose children share one cell (section 42), which is what `direction: 'stack'` used to pretend not to be.
- Flex `justify` has three positions and three distributions. `between` puts free space only between children, `around` gives each child an equal share with half of it at either end, `evenly` makes every gap equal including the two ends. All three degrade to `start` on a line holding one child.
- Flex `align` has no `stretch`. An element is never stretched under this engine, so a cross axis stretch would do nothing; `place-flow.ts` reads a stray one as `start`.
- `HudFlexContainer` is the flow engine that ships today. `layout` is optional and defaults to it, so existing documents need no key.
- `HudGridContainer` is the second placement engine: two axes, position driven. `columns` needs at least one track; each may be `auto` (sized to its widest or tallest cell), `fill` (shares remaining track space), `{ px }` or `{ pct }`. Omitted `rows` means as many implicit `auto` rows as the auto flow needs.

### types/hud/hud-node/hud-element.type.ts

- `DPAD` is a synthetic glyph position. A pack is keyed by SDL position, and the whole d-pad is not a position any device reports, so `DPAD` names the one cross that stands for all four directions. It resolves to the group artwork, as `group-glyph-art.ts` does.
- A glyph names either a fixed `position` (a picture of one control, whatever is bound to it) or a `slot` (the glyph of whatever slot N is bound to right now, the binding first rule a chip follows). Never both.
- `repeat` draws its one child N times, handing each pass a scoped `index` (0 to count minus 1), `count` (the repeat's resolved count) and `item`, the number from the parent, such as how full one heart is. `item` is a bare expression, not a `Value`, since it has no meaning outside the child. There is no second repeat mode: a repeat of a `sprite` is what used to be repeat sprite, and a repeat of a `switch` is repeat dynamic object.
- `switch` draws the `node` of the first case whose `when` evaluates truthy (non zero), or `otherwise` when none do, or nothing. The order of cases is the logic, which is why it is an array and not a map.
- A sprite's `box` is an explicit override of its natural size in SNES px, a stored document's escape hatch. The real default lives in the sprite manifest (`boxForExtract` in sprite-box.ts, keyed by `file` in `SPRITE_BOX_BY_FILE`), derived from the extraction recipe: a strip extracted HUD icon (bomb and arrow counters) is 16x8, a single tile one (key counter) is 8x8, and 16x16 is the fallback. `intrinsic-size.ts` reads `box ?? SPRITE_BOX_BY_FILE[file] ?? 16x16`.
- `HudElement.fit` has one mode, `contain`, named so the JSON says it.

### types/hud/hud-shape/hud-shape.type.ts

- `shape` is a small vector picture with a fractional fill, added in phase 5 of the HUD data binding plan. The shipped enhanced HUD draws a heart as a curved SVG silhouette (`HudHeart`), clipped at an arbitrary fraction of its width and tinted on its rim, highlight and shaded flank by the armour tier. `HudBoxStyle.tint` cannot produce this, because a CSS or SVG filter tints a raster image's pixels and here the picture is the curve itself.
- `HudMeter` (the magic bar) is a rounded bar whose length is the value, split into banded sheens for the half magic upgrade. The plain one band case is reproducible in the style system, but the two band split is a second, separately lit region, which `shape` draws.
- There are two named pictures, not a general vector facility, the same restraint hud-text uses for its two faces. Both keep the artwork, palette and thresholds of the compounds they replace; see `HudShape` for the drawing.
- `fill` is 0 to 1. A heart's fill quantises at render time when the heart mode setting is `original`; a magic bar reads it continuously, as `HudMagicBar` did.
- `armor` (heart only) is the armour tier 0 to 2, tinting rim, highlight and shaded flank as `HudHeart`'s tint tiers do. Absent reads 0.
- `bands` (magic bar only) is 1 (default, plain) or 2 for the half magic upgrade's two stacked bands, each with its own sheen.

### types/hud/hud-style/hud-style.type.ts

- Every CSS grade decoration a node's box may carry (phase 4 of the HUD data binding plan). Every numeric field is a `Value`, so a border width or a shadow blur reads from the data scope like `size` or `opacity`. Colour fields are `Paint`.
- An outline is not a border. A border traces the box; `outline` traces the ink of whatever the node draws, a ring around a transparent sprite's silhouette, which a CSS border cannot do because it does not know where the alpha is. It is drawn as stacked filters and its width is capped (see the renderer).
- `guide` is not part of the style: it lives on `HudContainerBase` (section 57) because it is editor only metadata about a container's overlay colour that the game never draws.
- `HudBorder.sides` absent means every side.
- `HudRadius` is one value for all four corners, or one per corner in the CSS `border-radius` order: top left, top right, bottom right, bottom left.
- `HudTint.mode` defaults to `multiply`. `amount` is 0 to 1, how much of the tint lands, default 1.
- `HudBoxStyle.clip` defaults to false and clips the node's children to its box.

### types/hud/hud-text/hud-text.type.ts

- `text` is a string or a number, drawn in the game's extracted glyph sprites or a real font. A counter is this with a numeric `value`; the toolbar's Counter button inserts one already set to digits and zero padding.
- Two faces. `sprite` draws the HUD's extracted glyph sets (`fonts` sprite category), pixel exact and limited to the characters the game has. `font` draws a real face: the bundled pixel recreation (`game`, `--font-game` in `game-font.css`) or the app's UI sans or mono. There is no library of other fonts.
- `format` is meaningful only when `value` resolves to a number; a bare string value ignores it.
- Sprite sets: `hud-digits` is the HUD's own digits (`font-digit-N`, no letters), `pause-letters` is the pause menu's alphanumeric set (letters, digits, space, `&`). Never both, because they are two different extracted sheets.
- The `game` family (ALttP Dialogue) is a pixel face that only looks right at a whole multiple of its 16px design size (`--game-cell-h` in `game-text.css`), so the renderer snaps `size` for it (see `resolve-text.ts`).
- The `.game-text` rule (white fill, blue edge, shadow ring) is the default when a `game` font face carries no `stroke`.
- `tracking` is extra letter spacing in SNES px. The sprite face ignores it, since fixed width tiles have no tracking to add.

### types/hud/hud-value/hud-value.type.ts

- `Value` is what every bindable number in the HUD document becomes: a plain literal (the common case, a bare number in JSON), or an expression read from the live variable table (`shared/hud/data/variables.ts`) through `shared/hud/data/resolve-value.ts`. The property panel writes the expression form the moment a variable or formula is picked.
- `Paint` is a fill: a flat colour, a gradient, or a tiled or stretched image. The styling phase (hud-style) is its only consumer. Both types are pure data shapes; nothing here parses or resolves.
- A `GradientStop` is a position 0 to 1 and the colour at it.

### types/language/language.type.ts

- Language pack types are shared by the extraction pipeline, the Electron language store and the renderer's language inspector.
- `code` is a language code such as `fr`, `de` or `fr-c`.
- `glyphCount` is the number of glyphs in the font's width table, the effective alphabet size.
- `encoder` is the text compression format the language uses.
- `flags`: bit 0 means the new dialogue map format, bit 1 means no US ROM match.
- `source` is a human description of the ROM the pack was extracted from.
- `DialogueLine.id` is 1-based. `content` keeps bracketed control tokens such as `[Scroll]` and `[Name]`.
- `LanguageFont.tiles` holds raw 2bpp glyph sheet bytes (256 tiles of 16 bytes). `glyphCount` is how many glyphs of the sheet to display.

### types/msu-manifest/msu-manifest.constants.ts

- The game's own music slots run 1 to 34, every song id the engine has. Slot 15 is listed but no code path ever requests it. 35 and 36 are not slots: they are the gap before the Deluxe range, and listing up to the Deluxe threshold once made the studio show slots the game cannot play.
- `DELUXE_TRACK_THRESHOLD` (37): track numbers at or above it are the Deluxe only range (per area and per interior tracks). It is used to recognise a Deluxe pack, not to count vanilla slots.
- `SOUND_ID_COUNT` (64) is the ids a sound channel can carry, 0 included. The port value keeps its top two bits for pan, leaving six for the id, so this is a hardware property, not a count of existing sounds.
- `MAX_CROSSFADE_SECONDS` is the longest crossfade a loop may use.

### types/msu-manifest/msu-manifest.type.ts

- The MSU-Layered (`.msul`) pack format. A pack folder may carry a `pack.json` manifest describing layered audio. Packs without one are classic (plain `<n>.pcm` or `<n>.opuz` files), which the engine turns into a single looping layer per track so one playback path serves both.
- MSU-1 cannot represent layers (single audio stream, one track register), so layering is this project's extension. The `.msul` container keeps it, and MSU-1 export flattens it.
- Play modes: `once` plays through once and stops. `loop` plays continuously; with several files, in order or shuffled. `random` fires a single file at a random gap forever (wind, distant thunder). `interval` fires at fixed offsets from the moment the track started.
- Loop `order`: `sequential` and `random` move between files; `single` repeats one track at its own loop point with no crossfade, which is what MSU-1 does.
- `crossfadeSeconds` (0 to 10) overlaps one pass with the next: the outgoing fades out while the incoming fades in. 0 or absent keeps a hard cut.
- `waitForCompletion` true measures the random gap from when the sound finishes, so one plays at a time. False or absent measures from when it started, so sounds may overlap (deliberate when layering several gusts).
- Effects are applied in order after the layer's own volume and before it joins the channel. They are limited to what one biquad filter can do, so they play the same everywhere and can be flattened into an export. Motivating case: one rain recording heard outdoors and, low passed, indoors through walls. `lowpass` muffles (behind a wall, under water), `highpass` thins (distant, through a speaker), `eq` is three bands of shelf and peak gain in dB, where 0 on all three is a no op.
- `MsuLayer.files` with more than one entry is a pool the play mode draws from. Absent or empty `effects` plays the files as they are.
- `volume` is 0 to 100, relative to the profile's music volume.
- `chance` is 1 to 100, rolled each time the layer starts: a per trigger chance on a one shot, a per bed decision on a bed. It exists because the game raises some effects on a fixed frame cycle (the storm's thunder), which a real recording turns into a metronome. Absent means 100.
- `loopSample` is the loop restart point in samples at 44100 Hz, the MSU-1 loop point field on export. Undefined means the beginning.
- Sound channels are the game's non-music sound chip channels, each with its own id space. `ambient` is the looping bed (rain, falls, hum); `sfx1` and `sfx2` are the one shot effect channels.
- `MsuSoundDef` replaces one game sound, keyed by the id the game raises. It uses the music track layer shape, so every play mode, crossfade and volume applies.
- `syncGroup`: sounds sharing a group hand playback across when one replaces the other. A layer whose files and play mode match one of the outgoing sound carries on from the same position; anything that does not match (effects, volume, an extra layer) still changes. Case in mind: the same storm indoors and outdoors, where a doorway changes how the rain sounds, never where it is.
- `MsuTrackDef.trackNum` is the game's music slot, same numbering as `<n>.pcm`; 37 and up is the Deluxe range.
- `MsuPackMeta.cover` is the filename of a cover image inside the pack. `basedOn` is set on a copy of a pack installed from the Hookshop and names the original it credits.
- `MsuPackManifest.version` is bumped only on a breaking change; readers reject versions they do not know.
- `sounds` lists the sounds the pack replaces, per channel. Absent or empty means every sound keeps playing from the chip.
- `files` lists every file the pack folder holds except the manifest, sorted by name, wired or not. It is stamped from the folder on every save, so it is a record, not a claim; an exported archive carries this exact list.
- `LayerResume` is where one layer was when playback stopped. `fileIndex` indexes the layer's `files` for multi file modes. `nextEventInSeconds` is the time left on a pending random or interval event, or null when nothing is scheduled.
- `MsuResumeState` is a whole track's playback position, embedded in save state metadata. `layers` is keyed by layer id, so adding or removing a layer cannot corrupt an old snapshot. `ambient` is the replaced ambient bed playing alongside; only continuous channels are restored, since a one shot has no position.

### types/msu-optimize/msu-optimize.constants.ts

- FLAC is the target because it is lossless, so no candidate loses a generation.

### types/msu-optimize/msu-optimize.type.ts

- Optimizing normalises a pack to one audio format. Every audio file is a candidate, compressed ones included: an mp3 is decoded once and stored exactly (lossless but bigger, shown as a negative saving). A file already in the target format is not a candidate, and neither is an original a previous run already converted.
- Only a file no probe can read (a custom wrapper, a corrupt file) is excluded, through `excludedBecause`.
- The estimate is measured, never a flat ratio: FLAC on 16-bit stereo lands anywhere from 40% to 70% depending on the material. A short slice (`OPTIMIZE_SLICE_SECONDS`) is really encoded and the ratio scaled up.
- `estimatedBytes` is null when nothing could be measured (excluded, or unknown duration). A value bigger than `currentBytes` is normal for a compressed source.
- `carryLoopSample` is the repeat point to move into the manifest before the file's format changes. It lives in the MSU-1 header and dies with the container, so a run writes it into the layer's `loopSample` first; an intro then loop track that loses it repeats from zero.
- `alreadyTargetCount` counts files already held in the target format (the file itself, or a converted copy beside it), so the preview can say the pack is part way there.
- `OptimizeProgress.index` is the 1-based position of the file being worked on.
- `OptimizeConversion.outputName` keeps the same stem in the target format, suffixed if that name was taken. `bytes` is the size it really came out at.
- `loopPointsCarried` counts repeat points written into the manifest before the first encode ran.

### types/msu1-format/msu1-format.constants.ts

- The MSU-1 `.pcm` container is shared because both sides read its header: the renderer decodes the audio, and the main process reads the loop point from the first eight bytes.
- Rate and channel count are fixed by the format: 44100 Hz, 16-bit signed, stereo, little endian, left channel first. That is why they are constants and not fields.
- One frame is a left and right pair of int16.

### types/profile/profile.type.ts

- `ProfileRandomizerConfig` is recorded on a profile at creation time. The seed, options and any settings it pins are frozen from then on. Only the connection (server, slot, password, DeathLink, tracking) can change afterwards, through a `RandomizerConnectionPatch`, so a wrong password never strands a run.
- `options` is the full frozen catalog snapshot (schema `ap-options-v2`). Readers go through normalizeRandomizerOptions (shared/randomizer/options-snapshot.ts), which lays it over the catalog baselines.
- `trackOtherPlayers` opens a tracker connection per other player for their checks count; it is on unless false.
- `frozenSettings` are settings pinned by the randomizer; the settings UI locks these keys.
- `deliverable` holds the npc, pond and world spots the capability probes proved deliverable at creation (online mode), so the player file randomizes the same spots a local seed does. A profile from before this field keeps those spots vanilla.
- `Profile.language` is a language code such as `en`, `de`, `fr`. `msuPack` is the MSU pack directory name.
- `Profile.automation` marks a profile created by `wt new` for a named instance, not a person, so it is safe to prune.
- `Profile.randomizer` is set at creation; only its connection is patched afterwards.
- `CreateProfileOptions` is accepted by every createProfile implementation (shared store, IPC, renderer). `initialConfig` holds the config values a creation form preset seeds the profile with, freely editable after.
- `CreateProfileResult` is the outcome of the app level create flow, surfaced to the creation form.
- `ProfilePatch` has three cases per field: an absent key leaves the field alone, null clears it, a value sets it. Clearing used to be written as `undefined`, which cannot be told apart from absent once the patch has crossed a process boundary, so choosing None for a pack or a language kept whatever was assigned.
- `randomizerConnection` is an online profile's connection; any other randomizer key is refused. In `RandomizerConnectionPatch`, an empty or null password clears it.

### types/saves/saves.type.ts

- Quick save slots run 0 to 11.
- `autoSaveIntervalSeconds` ranges 60 to 1800, default 300. `autoSaveMaxEntries` ranges 1 to 20, default 5.

### types/settings/aspect-settings.type.ts

- `extendedRendering` is the master gate. Off: the engine always runs 4:3 vanilla and no sub settings appear in the UI. On: the aspect ratio selector and all extended rendering options become available.
- `aspectRatio`: `auto` is the current app viewport (notch aware); `screen` is the full device screen; a preset (`4:3` through `32:9`) is fixed; `custom` uses `customAspectW` and `customAspectH`. It is re-resolved on every game start, and applied only when `extendedRendering` is on; otherwise the engine receives 4:3. A custom width or height of 0 means auto detect from the screen.
- `widescreenSprites` extends sprite spawn and despawn ranges so enemies and objects revealed by the wider view behave correctly. Default on; only relevant when wide.
- `widescreenVisualFixes` applies the widescreen graphics corrections (edges and sprites that assume a 4:3 screen). Default on; only relevant when wide.
- `linearWorldTilemap` uses a clamped linear BG fetch in place of the wrapping 512px SNES tilemap, which prevents tile garbage at edges in wide views. Required for any ratio above about 19:9. Memory cost: one world tile buffer per BG layer. Default true (auto enabled with extended rendering).
- `ultrawideRendering` unlocks ratios above 19:9 up to 32:9 (the engine's full 1024px budget). Requires `linearWorldTilemap`. Default true when the linear tilemap is on.
- `tallRendering` allows ratios taller than 4:3 (extra rows above and below the game image). It is symmetric with wide rendering but independent: a ratio can be both wide and tall. Default false.
- `cameraLockToViewport` locks the overworld camera to the wide or tall view so its edges stop at the area boundary (no out of area black band); Link still walks to the screen edge. Off is the original 224x256 camera.
- `smoothTransitions` pans through area transitions using a 2 area world tilemap in place of the wrapping 512px tilemap, which removes the wrapped edge slice at screen seams. Requires `cameraLockToViewport`.
- `widescreenPlayArea` extends hazards, spawns and clear room checks to the whole wide or tall view. Off means the extra width is scenery only. It changes gameplay; default off.
- `offscreenAI` sets how sprites in the wide or tall extra band behave before reaching the stock 4:3 screen: `idle` (move and animate but cannot act on the player), `vanilla` (full behaviour, matches the original) or `paused` (frozen). Default `idle`.

### types/settings/audio-settings.type.ts

- `masterVolume`, `musicVolume`, `sfxVolume` and `ambientVolume` range 0 to 100.
- `perGroupVolume` is the explicit opt in for the per group (music and SFX) DSP mix. Off gives the bit identical stock audio mix and the Music and SFX sliders are inert; on makes them take effect. Master volume is unaffected either way.
- `ambientVolume` and `ambientMuted` govern the replacement ambient bed only. The sound chip cannot split its ambience out of its mix, so they govern replacement audio, which is where a bed loud enough to fight the music comes from.
- `msuConfigMode`: `auto` (default) derives `enableMSU`, `audioFreq` and `audioChannels` from the assigned pack's contents (shared/features/msu-auto-config.ts), not user edited. `manual` leaves the three free form.
- `enableMSU` names the pack format. `msul` is this project's layered container, whose manifest decides what each slot plays in place of one file per slot.
- `resetMSUAtTitle` makes reaching the title screen forget every remembered position. Resuming is meant for a run in progress; carried across runs it starts the opening in the middle of itself and drops a fresh file into the last file's music.
- `packReplaceAmbient` and `packReplaceSfx`: a pack may replace ambient beds and sound effects, not only music. They are separate switches because someone may want an authored rain bed while keeping every native effect. Off means the core never reports those sounds to the app, so an unused group costs nothing.
- There is no separate MSU volume: MSU replaces the music channel, so `musicVolume` governs both (serializeToIni writes MSUVolume from musicVolume).

### types/settings/control-settings.type.ts

- `mapOnSelect` is a classic only convenience: open the map from the select or map verb in place of the pause menu.
- `modernScheme` is what each modern slot fires. Host only, because the core is told the resulting item id per frame, not the table, so it never reaches the INI.
- `saveHoldDuration` is in seconds, 1 to 5.
- `hapticsEnabled` says whether the profile routes rumble to its own controllers at all. When on, every device the profile uses gets the signal; there is no per device list (see allowedDevices in lib/input/profile-devices.ts).
- `cheatsEnabled` is the master gate for all cheat effects. Off by default: the C side no ops every cheat call while it is off, the same contract as `haptics.enabled` and `developerToolsEnabled`.
- `vanillaSafe` keeps cheat effects to changes that stay comparable to a vanilla run (the VanillaSafe bit in kRam_Features3). Off by default alongside `cheatsEnabled`.

### types/settings/developer-settings.type.ts

- `developerToolsEnabled` is the master gate for developer only instrumentation (transition settled events and any future dev only GameHook). Off by default: the C hook makes zero host calls while off. Observational only.
- `devNavigationData` gates the navigation and room data reads that feed the Location and Navigation widget, the flood fill and the simulator. It is separate from `developerToolsEnabled` so the dev surface can be on while the heaviest per frame reads are off; both must be on for the core to answer (NavQueryGate).
- `allowDebugLogging` is the master gate for the debug report tooling: verbose main process and performance logging, the titlebar capture recorder (Tab shortcut) and the floating send debug report button. Off by default; none of that code path runs while it is off.
- `trackerEnabled`: the checks tracker polls inventory and save flags out of the running game. It changes nothing, but it is a host feature reading emulated state, so it gets its own switch (TrackerQueryGate).

### types/settings/dialog-settings.type.ts

- `dialogSpeed`, `dialogHoldSpeed`, `dialogHoldToAccelerate`, `dialogFillOnB` and `dialogTypewriter` are Gameplay tab behaviour that runs in the core under either HUD. The other fields are the HUD tab dialog box look, independent of `hudMode`.
- `dialogSpeed`: 1 is the game's pacing, 0 is instant (the ROM's own Speed 00 convention). `dialogHoldSpeed` is the multiplier while A is held.
- `dialogFillOnB`: B completes the current box and the next press advances. `dialogTypewriter`: a line the game shows at once types one glyph per step.
- `dialogButtonPrompts` shows the buttons that act on a message, under the box. `dialogFont` applies to the enhanced box only; `dialogFontScale`, `dialogInkColor` (hex) and `dialogStrokeWidth` apply to the modern font only. `dialogStrokeWidth` is in game pixels around each modern glyph; 0 is none.
- `hudHighlightPrimary` (hex) colours item names in randomizer messages, in either box. `hudHighlightSecondary` (hex) colours player names.
- `dialogBoxOpacity` is 0 to 1, the enhanced box ground. `dialogFloatingGround` draws the ground behind borderless messages such as telepathy. `dialogIntroTelepathyGround` draws it behind Zelda's telepathy in the opening at Link's house. `dialogGroundFade` fades the ground out toward its edges.
- `dialogBoxFit`: `message` sizes the frame once to the whole message; `fit` follows the rows in use.
- `dialogGroundColor` is the hex ground behind the text. `dialogBorder` is the game's tiles, none, one line, or a thin line inside a thicker one. `dialogBorderColor` (hex) colours drawn borders and corner marks.
- `dialogCornerMarkAngle` is the degrees the top left mark turns; the others mirror it.
- `dialogTexture` is the pattern on the ground. `dialogTextureColor` is hex, `dialogTextureOpacity` 0 to 1, `dialogTextureScale` a cell size multiplier, `dialogTextureDensity` 0 to 100 (how close cells sit), `dialogTextureScatter` 0 to 100 (how far cells stray from the grid).

### types/settings/gameplay-settings.type.ts

- `autoSkipDialog` renders dialog instantly and auto advances message box waits; choice prompts stay interactive. Non vanilla.
- `prefillFileName` names a new file Link with the naming strip parked on End. Non vanilla.
- `allowDiving` lets B while swimming duck under for a moment, as the handheld port allows. Non vanilla. The extra dungeon forces it on, because its water room is built around it.
- `miscBugFixes` and `gameChangingBugFixes` are legacy bundle masters that enable all split fixes of the MiscBugFixes and GameChangingBugFixes origin unless overridden.
- `bugFixToggles` holds granular overrides for the 42 split bug fixes, keyed by feature id (see shared/features). Unset inherits the legacy bundle master; an explicit true or false overrides it.
- `archeryNeedsBow` lets the archery host refuse the fee when the shots it buys could not be fired.
- `extraDungeon` says whether the optional extra dungeon carried by the second cartridge is offered. It is separate from whether its data is present: owning the cartridge and leaving this off must give an untouched overworld. Off by default, so a profile that never sets it behaves like the base game.

### types/settings/general-settings.type.ts

- `autosave` is the legacy C level autosave (slot 0 save and restore), kept for INI compatibility.
- `autoSaveIntervalSeconds` ranges 60 to 1800, default 300. `autoSaveMaxEntries` ranges 1 to 20, default 5.
- `disableFrameDelay` is legacy: only the native SDL main loop reads it (not the WASM build). It is kept so existing profiles and the INI round trip unchanged. `vsync` supersedes it.
- `vsync` drives the core's frame loop from the display's vertical blank (requestAnimationFrame) and gates the game step on a 60.0988 Hz accumulator, so the speed stays right on any refresh rate. Off is the timer pacing the app always used. It can be toggled live.
- `turboEnabled` runs the game faster than real time while the Turbo shortcut is held. Off means the core never leaves real time. It can be toggled live. `turboSpeed` is the multiplier, one of the rungs in shared/display/turbo-speed.ts.

### types/settings/graphics-settings.type.ts

- `windowScale` (1 to 5), `fullscreen` and `outputMethod` are legacy INI fields, unused in Electron.
- `linkSprite` is the id or filename of a custom Link sprite in the global sprite library (under %AppData%), or null for the original. At game start the bridge writes the `.zspr` to MEMFS and sets the LinkGraphics key.
- `windowMode`, `startFullscreen`, `viewportConstraint` and `pixelPerfect` are managed by Electron.
- `displayMonitor`, `syncedRateInFullscreen` and `syncedRateTargetHz` are the Brock display module's keys, read and written by its Display tab: the screen to use, whether to switch to a whole multiple of 60 while in fullscreen, and the target rate (0 for the highest the display offers).
- `pixelPerfect` snaps the canvas to a whole number of source pixels, measured in device pixels so display scaling cannot reintroduce uneven pixel sizes. It trades a little image size for a scroll that never shimmers. Renderer only (not serialized to the INI). Only meaningful when `viewportConstraint` is `none`, because the other modes bypass the fit math. It forces `linearFiltering` off while enabled.
- `renderIntoNotch` (mobile): true (default) renders under the camera cutout, full bleed; false keeps UI and canvas inside the usable screen. Renderer only (not serialized to the INI).
- `hideSpaceBeyondWalls` paints the space past the walls of a house, a cave or the sanctuary black. The core decides per frame (hide_space_beyond_walls.c), so dungeons and the overworld are never touched.
- `coloredRupees` draws a rupee reward lying in the world as the plain coloured gem, not the game's numbered picture. `itemSheen` sweeps a slow glint across a world item's pixels.

### types/settings/haptic-settings.type.ts

- Haptic feedback configuration: vibration and rumble for game events. `intensity` is a 0 to 100 global multiplier.

### types/settings/hud-settings.type.ts

- `hudStyle`: `vanilla` rebuilds the original look from extracted sprites; `enhanced` is the same sprite set driven by the host (host owned pause menu, free HUD layout) and needs a 16:9 or wider display; `modern` is Enhanced plus the modern control scheme.
- The stored value and the label are the same word on purpose (section 59.7): `enhanced` was stored as `extended` until the label was corrected. `mergeSettings` migrates the old spelling on every read. There is no separate control scheme key; the scheme is derived from this field (see shared/features/hud-style.ts).
- `customHudAspectW` and `customHudAspectH` apply when `hudRatio` is `custom`; 0 means auto detect from the screen.
- Title screen fields are on the HUD tab: the host draws the title over the hidden native one. `titleMotion: 'drifting'` adds a slow parallax and drifting clouds while the title idles. `titleFollowsProgress` takes the world, and the sword when it is set to progress, from the most advanced save. `titleSword` is the sword planted in the title, or the save's own.

### types/settings/settings.type.ts

- `GameSettings` is the per profile game settings. It mirrors the zelda3 config.h and zelda3.ini fields. The online notice toggles (one `apNotify*` boolean per notice kind) come from online-notice-settings.ts, and the quiet rupees, bombs and arrows switches from quiet-receipts.ts.
- The section interfaces it extends exist only to keep each part readable; settings are stored flat under these exact keys.

### types/shadow-casting/shadow-casting.data.ts

- `DEFAULT_LIGHTING_CONFIG` is used when no per screen data exists. `EMPTY_SHADOW_PROJECT` is the empty project template.

### types/shadow-casting/shadow-casting.type.ts

- `ShapeDefinition.sides` is the number of polygon sides (3 triangle, 4 rectangle, 64 and up a circle); ignored for freehand. `cornerRadius` runs 0 (sharp) to 1 (fully rounded, a circle at 4 sides).
- `scaleX` and `scaleY` are stretch factors, default 1. `rotation` is in degrees.
- `x` and `y` are the centre in screen local coordinates (x 0 to 512, y 0 to 448). `width` and `height` are the bounding size. `points` holds arbitrary vertices for freehand shapes.
- `HeightmapElement.height` is normalized 0 to 1. `smoothing` is the edge falloff radius in pixels.
- `LightSource.intensity` runs 0 to 1, `radius` is the falloff radius in pixels. `color` is `sample` to sample the game pixel colour at the light's position, or a hex colour string. `castShadows` makes the light cast shadows through the heightmap.
- `ScreenLightingConfig.sunAngle` is in degrees (0 east, 90 south). `sunElevation` is degrees above the horizon. Intensities and `shadowSoftness` run 0 to 1. `cycleSpeed` is the full day and night cycle duration in seconds.
