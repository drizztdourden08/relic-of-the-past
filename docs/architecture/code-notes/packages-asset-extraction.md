<!-- @layer docs @kind doc -->
# Code notes: packages/asset-extraction

Facts about `packages/asset-extraction` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/asset-extraction/src/asset-builder/asset-builder.ts

- `serialize` writes the `zelda3_assets.dat` format: a 16-byte signature, a SHA-256 hash of the NUL-separated entry names, 32 reserved bytes, the entry count and the name block length, the entry sizes, the names, then each payload aligned to 4 bytes.
- The reserved bytes carry the bake-format stamp (see bake-version), so a cached blob from an older bake pipeline is detected at load time.
- `addInt8` writes into a scratch buffer it then discards. The writes still throw on a value outside the signed byte range, so the loop acts as a range check.

## packages/asset-extraction/src/bake-version/bake-version.constants.ts

- The container header is 16 signature bytes and a 32-byte key hash, then 32 bytes of zero padding before the entry count.
- The core's `LoadAssets` (`core/wasm-build/emscripten_io.c`) validates only the first 48 bytes and reads the entry table from byte 80. Bytes 48 to 79 are free host metadata.
- The key hash tracks entry names only. A bake that changes what an existing entry contains (for example, appending dialogue template lines) produces a byte-identical header. The stamp closes that gap: a cached blob whose version differs from `CURRENT_BAKE_VERSION` is recompiled at profile load, the same as a missing blob.
- Blobs baked before stamping existed read as version 0, because the pad is zeroed.
- `HEADER_MIN_BYTES` is the smallest valid container: 88 bytes of signature, hash, pad, count and name block length.
- Bump `CURRENT_BAKE_VERSION` on any bake-output change the key hash cannot see. History:
  - v1: receipt-message template lines appended after the vanilla dialogue lines (`packages/asset-extraction/src/text/build-language-entry`, `buildLangData`).
  - v2: one more template line after those, the archery host's refusal (`packages/asset-extraction/src/text/data/randomizer-templates`, shown by `core/game-hooks/archery_host.c`).
  - v3: eight more after that, a shelf's refusal per non-rupee currency (`packages/asset-extraction/src/text/data/randomizer-templates`, shown by `core/game-hooks/shop_refusal.c`).
  - v4: one more after those, a shelf's thanks over a purchase's hold-up (`packages/asset-extraction/src/text/data/randomizer-templates`, shown by `core/game-hooks/shop_overrides.c`).

## packages/asset-extraction/src/compile-alttp-asset-set.ts

- The SNES ROM is the authoritative base and compiles the same as it always did, so nothing here changes its bytes.
- Optional cartridges contribute separate, self-describing containers, stored as their own files and joined only at load.
- Each optional source has its own error boundary. An unreadable or unrecognised extra cartridge degrades to "no supplement", never to "no game". A single shared try block once let a bad optional ROM fail the whole compile and leave the user with no assets at all.

## packages/asset-extraction/src/compile-dialogue.ts

- Packs the US ROM dialogue plus any extra language packs into the parallel `kDialogue`, `kDialogueFont` and `kDialogueMap` arrays. The game picks one at startup through the INI `Language` key.
- US is always index 0. Extras follow in the order given.

## packages/asset-extraction/src/compile-dungeons/build-default-and-overlay-rooms.ts

- The entrance tables are built first because their order must match the C asset order in `assets.h`.

## packages/asset-extraction/src/compile-dungeons/build-dungeon-rooms.ts

- The chest table at SNES `0x81e96e` holds 168 records of 3 bytes: a room word, then the item. Bit 15 of the room word marks a big chest.
- The table at `0x80990c` lists the 57 rooms whose pits hurt the player.

## packages/asset-extraction/src/compile-dungeons/build-entrance-data.ts

- Set 0 is the overworld entrance table and set 1 the starting points. The port appends its own records to set 0 only.

## packages/asset-extraction/src/compile-overworld/build-overworld-tables.ts

- Area tables are written through `awrite`, which fills all four screens of a large area.
- Fall holes are sorted by entrance id, and each position is re-encoded from the ROM's form.
- Secrets are read for area heads only.

## packages/asset-extraction/src/compile-resources-gba-alttp/assert-travel-stays-in-dungeon.ts

- A staircase or a hole sends the player to whatever room its header slot names, with no check that the room belongs to this dungeon. A misread destination teleports the player somewhere unrelated instead of failing.
- A fixed-width read of the variable-length header once produced exactly that: short records took the next room's bytes, and two thirds of the slots named a room outside the dungeon. Most often that was room 0, which the cartridge means as "unused" and the engine reads as the base game's final boss room.
- A slot the cartridge never stored reads as zero and is never reached, because the room has no such staircase. Every slot that carries a destination must name one of the dungeon's rooms, so anything else is a reader bug and is raised, never rewritten to fit.

## packages/asset-extraction/src/compile-resources-gba-alttp/compile-gba-alttp-supplement.ts

- `assertBlocksetIdentity` fails the supplement, never the base game, if the blockset stops being a base-game one.
- The cartridge names its enemy sheets in the base game's own numbering. That was verified against the three blocksets the base table also defines, where the two quartets match. So what ships is the composition alone; the pixels are already in the base cartridge. `assertEnemySheetNumbering` fails the build when that stops holding.
- One builder per manifest entry, keyed by the asset's name. The manifest decides call order, so inserting or reordering an asset means editing `asset-manifest.ts` only.
- `kGbaPalaceCameraBounds` is empty on purpose. Hardware pans these rooms in full, and the grey backdrop beyond the walls is real map content. The pin machinery stays for a future room that measures as clamped on hardware.

## packages/asset-extraction/src/compile-resources-gba-alttp/compile-resources-gba-alttp.constants.ts

- `BASE_ENTITY_TYPE_COUNT`: entity types the base engine has a handler for. The port added four of its own beyond this (a gatekeeper, two quest actors and a marker). Dispatch is an indirect call through a fixed table, so handing one to the engine does not spawn a wrong enemy: it crashes. They are dropped until they have implementations.
- `HEADER_LIGHTS_OUT`: bit 0 of the first header byte, which the base game reads as "this room starts unlit". The cartridge sets it on five of these rooms, including the dungeon's central hub (the room seven others lead back into, described by guides as a large lit room with four doorways). Passed through, that room renders pitch black, so the base game's reading of the bit is wrong here. It is cleared until understood. The dungeon has dark rooms of its own, which will need the bit back under whatever the real condition turns out to be.
- `EFFECT_BYTE`: header byte 4 is the layer effect, and the engine's dispatch table defines eight (`ENGINE_EFFECT_COUNT`). `ENGINE_EFFECT_FLOWING_WATER` is the engine's flowing-water layer effect; a hook gives it this dungeon's direction.
- `FIRST_TRAVEL_BYTE` to `LAST_TRAVEL_BYTE`: header bytes 9 to 13 hold where a hole drops to, then the four staircase destinations.
- `UNUSED_DESTINATION`: a slot the cartridge trimmed away. No such exit exists in the room.
- `OCCLUDER_TOP_LAYER`: the cells the port occludes with sprites move onto this layer, which the loader composites onto BG1 with the priority bit. BG1 is the only background that renders above the player's sprite priority indoors; high-priority BG2 does not.

## packages/asset-extraction/src/compile-resources-gba-alttp/native-header-bytes.ts

- The port stores its own blockset id in the theme byte, which the engine reads as `aux_tile_theme_index` and loads graphics from. The blockset is a base-game blockset (see `packages/asset-extraction/src/sources/gba-alttp/blockset-identity`), so writing its native index makes the engine load the right sheets by itself.
- The cartridge uses layer-effect values past the engine's eight for effects of its own. Its effect 8 is the water rooms: measured on hardware, those rooms alpha-blend the middle layer half over the floor. This engine's translucent designation 4 renders the same thing (the lower layer blends half with the sub-screen upper layer), so effect 8 maps onto it. Every other room gets designation 3 (opaque upper layer), and other unknown effects become "none" until measured.

## packages/asset-extraction/src/compile-resources-gba-alttp/room-major-layer-buffers.ts

- One buffer per layer per room, room-major, because the C side indexes them as `room * 3 + layer`.

## packages/asset-extraction/src/compile-resources-gba-alttp/room-palette-record.ts

- Palette ids past the base dungeon-palette table read as empty from the fixed base address. A room whose extracted record is mostly zero borrows the palette of the first room with a complete record, so every emitted record is usable.
- Those rooms keep their real palette id in the header for the day the extended entries are captured from hardware.

## packages/asset-extraction/src/compile-resources.ts

- The final pipeline stage: assembles every game asset into `zelda3_assets.dat`. Ported from upstream's `compile_resources.py`.
- The call order is the asset order of the blob and must not change.
- Dialogue needs language extraction and the sound banks need the music compiler; `skipDialogue` and `skipMusic` leave them out. `extraLanguages` are baked after US, which is index 0.

## packages/asset-extraction/src/compression/brr-codec/index.ts

- BRR (Bit Rate Reduction) is the SNES DSP sample format. Ported from upstream `util.py` (`decode_brr` and `encode_brr_generic`).
- The output must be bit-exact for game audio fidelity.
- The four filters match the Python `kBrrFilters` table.

## packages/asset-extraction/src/compression/lz-decompress/decompress.ts

- SNES LZ decompression, the 7-mode format the game uses for compressed assets. Ported from upstream `util.py` `decomp()`; the output must be byte-identical.
- Command byte: when the top 3 bits are not `0b111`, the command is bits 7 to 5 and the length is bits 4 to 0, plus 1. When they are `0b111`, the command is `(byte << 3) & 0xE0` and the length is `((byte & 3) << 8 | next) + 1`. `0xFF` ends the stream.
- Commands: `0x00` copies N literal bytes from the stream; `0x20` repeats one byte N times; `0x40` alternates 2 bytes for N bytes; `0x60` starts at a byte and adds 1 for each copy; `0x80`, `0xA0` and `0xC0` copy N bytes from earlier in the output, at an offset read from the stream (big-endian by default).
- The reader crosses SNES banks the same way as the Python `Reader` class. With the return-length overload the result is `[data, compressedLength]`.

## packages/asset-extraction/src/data/constants.ts

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

## packages/asset-extraction/src/data/tables.ts

- Game data tables ported from upstream's `tables.py`. Only the tables the port needs so far are here.
- `kCompSpritePtrs`: SNES addresses of the LZ-compressed sprite sheet tileset data. The first 12 sheets are stored uncompressed.
- `kCompBgPtrs`: SNES addresses of the compressed background tilesets.

## packages/asset-extraction/src/extensions/second-cartridge-animated-tiles/animated-tile-bytes.constants.ts

- The engine animates a fixed window of background tiles by holding three frames in memory and uploading one each time the animation advances. This dungeon reuses that window, so its own frames must occupy it or the base game's water animation overwrites the art the rooms reference.
- Only one of the three frames is in the cartridge's static tile sheet, so these bytes are the live tile memory of the running cartridge, read in a water room, in the order it cycles them.
- Layout: three frames, each 32 tiles of native GBA 4bpp, starting at tile 0x1b0.

## packages/asset-extraction/src/extensions/second-cartridge-attrs/entrance-chamber-overlay.ts

- The entrance chamber (room 0x88): columns 19 and 44 on rows 4 to 61 are side walls the collision conversion leaves walkable, and columns 31 and 32 on rows 59 to 63 are the south exit's doorway stripe.

## packages/asset-extraction/src/extensions/second-cartridge-attrs/hub-overlay.ts

- The hub (room 0x78): its north wall door art has no door record and no room behind it, so walking the passage would edge-transition into the sealed void. Rows 4 to 6, columns 30 to 33 close the alcove at the wall line.

## packages/asset-extraction/src/extensions/second-cartridge-attrs/ledge-overlay.ts

- Ledge cells are written on both layers because a swimmer reads the lower one: the engine moves the player there the moment all four of its probes read deep water. The room's two levels are kept in step anyway, so this is a second guard.

## packages/asset-extraction/src/extensions/second-cartridge-attrs/second-cartridge-attrs.constants.ts

- The attribute overlay is a set of per-cell corrections applied after a room's collision installs. The port's collision arrays are the source of truth, but exit doorways need the native doorway stripe value the exit tables key on, and some cells the collision conversion gets wrong (the entrance chamber's side wall columns) need explicit correction.
- Overlay record format: layer byte, cell low byte, cell high byte, attribute byte. Tile override record format: tile number as a 16-bit little-endian word, then the attribute byte.
- Walls use attribute 0x01, not 0x02: the engine's simplified sprite tile table treats 0x02 as passable, so a 0x02 wall blocks the player but lets most enemies walk through it.
- 0x0a is the engine's short water ladder: a water cell the player can climb out onto.
- Tiles 0x1b6 to 0x1b9 are the water surface tiles the cartridge animates. Every cell drawn with one is deep water; without that the surface is plain floor and the room's current has nothing to carry.

## packages/asset-extraction/src/extensions/second-cartridge-attrs/wall-and-water-tiles.constants.ts

- Wall art tiles: the port redrew these ids as wall crenellation, but their vanilla attributes (which the engine's per-tile table still carries outside the aux region) are walkable. They were measured as pass-through gaps in the hub's and chamber's outer walls. The overrides apply to attributes_for_tile for every bank room.
- Water rim tiles: the base game's table calls these four a ledge. Swimming into a ledge hops the player out of the water wherever he touches it, which against a wall lands him out of bounds. They are the pool's rim, so they are wall. Making them walkable was tried and is worse: it opens the whole rim and a swimmer can push onto the floor.
- Water ledges: indoors there is no general way out of deep water. The engine's probe reports a normal tile for plain floor only outdoors, so the hop out is driven by the short water ladder (or a staircase) only.
- A vertical move probes three points across the player's 16-pixel width (+0, +8, +15), and all three must read the ladder, so a pair of cells lets the hop fire only on an exact 8-pixel alignment. The ledge pairs plus one cell of margin either side give a landing window the player can hit.
- Room 0xdd has two ledges, both at a staircase: the pool's south bank and the foot of the north stair. The columns are the port's own: its collision array marks each run's two ends with a code of its own (cols 47 to 50 south, 41 to 44 north). Only the middle pair of each run is the way up; the ends are the stair's own sides and are closed as rim.

## packages/asset-extraction/src/extensions/second-cartridge-bank/second-cartridge-bank.constants.ts

- The extra dungeon's rooms live in one full high-byte page of the room grid, ids 0x200 to 0x2FF.
- The engine's world is one flat 16-wide grid where doors and edges are id arithmetic with no ownership, so a dungeon that shares ids with the base game shares its neighbours too.
- The engine writes every staircase and hole destination into the room index's low byte, so the high byte acts as a bank. A base that is a multiple of 0x100 keeps every such write inside the bank. Any other base straddles pages: measured with base 0x140, a hub staircase went to 0x1E9 instead of 0x229.
- All cartridge room ids are below 0x100, so every room keeps its original relative geometry.

## packages/asset-extraction/src/extensions/second-cartridge-doors/extra-dungeon-doors.constants.ts

- A door is not part of a room's tilemap. The engine reaches doors past a marker in the room's object stream and reads them as two-byte records, and drawing one is what registers it: the tilemap address, type and slot, direction and the doorway's transit attribute all come from that pass. The cartridge ships its rooms pre-expanded, so the records were baked away and every room came out sealed.
- The records were recovered by enumerating every type, position and direction the engine's door drawer can draw and matching each against the room's baked maps. A record is listed when every cell it writes is already present exactly as the engine would write it. The results agree across room boundaries (each north door is answered by a south door in the room above), which is the check that this is recovery and not pattern matching.
- Word layout, as the engine decodes it: type in the high byte, position in bits 4 to 7, direction in bits 0 to 1 (0 north, 1 south, 2 west, 3 east).
- Records are only ever appended, never inserted: slots are handed out in list order, and anything ahead of a teleport record renumbers it out from under the teleport handling.
- Room 0x78 (hub): the east record was missed by the match; walking the room on hardware showed an exit there onto 0x79, whose own west door at the same height the match did find. An earlier east record 0x0023 (position 2) sat mid-room because the centre platform's frame art matched as a door. The west record is a teleport door: type 0x10's attribute becomes the 0x89 transit family on a west or east door, and the engine reads the destination from the header's third staircase slot. The hub's west exit leads to the west chamber, whose east door is the same type reading the fourth slot for the way back. There is no north record: the top-centre is the staircase to the east wing, and a door drawn there would overwrite the staircase's slot attribute with its transit strip.
- Rooms 0x79, 0xbd and 0xfc each end with a north edge record that answers the south edge door of the room above (0x69, 0xad and 0xec). Without it the transition started and found nothing to arrive at. These are plain doors: a shutter needs a tag in this room to reopen it, and none of the three has one.
- Room 0xcd: the south record at position 8 is the room's own south edge. Positions 0 to 2 are the inner wall between the room's two halves. Without the edge record the water room's north door starts a transition, finds nothing, and aborts partway with the scroll left mid-move. The art is the port's own shutter, which this engine's door drawer cannot reproduce, so the record is reasoned from geometry. It is a shutter, like the same edge in the dungeon's three other arenas; all four rooms carry the boss tag pair. Shutting the player in is safe only because that tag pair is remapped to open on a cleared room (GbaAlttp_FilterRoomTags), since the crystal it otherwise waits on never comes in this dungeon.
- Room 0xdd: the north record at position 2 is read off the room's art: the opening sits at columns 46 to 49 on rows 4 to 6, where the engine places that position. Position 8 puts the door mid-room, in the water.

## packages/asset-extraction/src/extensions/second-cartridge-doors/second-cartridge-doors.constants.ts

- The room grid is 16 rooms wide, so a direction moves the room id by -16, 16, -1 or 1 (north, south, west, east).
- Door types 6, 10, 12, 14, 16 and 18 leave for the overworld; their destination comes from the exit table, so the adjacency rule does not apply to them.

## packages/asset-extraction/src/extensions/second-cartridge-doors/stays-in-dungeon.ts

- A plain door has no destination of its own: the engine walks to the neighbouring room by arithmetic on the room id. The dungeon's twelve rooms are scattered across the grid, so some recovered records point at whatever the base game has next door. Those are dropped: some are shapes that matched a door pattern without being one, the rest are exits the cartridge reaches by stairs and holes, which carry their destination in the room header.

## packages/asset-extraction/src/extensions/second-cartridge-links/append-extra-entrance.ts

- Every geometry field is derived from the room's place in the 16x20 room grid. Checked against two base-game entrances into full-size rooms: id 19 into room 0xf8 (row 15, column 8) and id 9 into room 0x84 (row 8, column 4) both reproduce from these formulas.
- `quadrant1` is read as `quadrant_fullsize_x = value >> 4, quadrant_fullsize_y = value & 0xf`. A room declared not full size horizontally is treated as two 256px pages, so the background scrolls past the room's edge and wraps; a wrong value here caused the camera drift.
- The blockset field is read by the engine as main_tile_theme_index. The palace field makes it a real dungeon (map screen, HUD slots, banked keys).
- Room bounds are high bytes the engine shifts back up: y first, then x, each pair one quadrant's low and high edge in half-room units.

## packages/asset-extraction/src/extensions/second-cartridge-links/append-extra-exit.ts

- The exit is cloned from the Pyramid's exit and shifted east by the same distance as the opening, so scroll, camera and door fields stay coherent with each other.
- The load offset is shifted because the engine recomputes the map16 load column from it (`(off - 0x10 & 0x3e) >> 1`). Cloning it unshifted loads the Pyramid's column of tiles at the new position and the screen comes back as garbage.

## packages/asset-extraction/src/extensions/second-cartridge-links/second-cartridge-links.constants.ts

- Entering and leaving a place is table driven: kOverworld_Entrance_Area, Pos and Id map an overworld cell to an entrance id; kEntranceData maps that id to room, player, camera, scroll, bounds and music; kExitData maps a dungeon room to where the player reappears outside. One record in each makes entry, exit, music, tagalong checks, the mirror and save-and-quit work with no code aware of the dungeon.
- The overworld and exit records are cloned from the base game's Pyramid opening and shifted, so their opaque fields (map16 load offsets, the two unknown scroll deltas, door settings) stay as the original had them.
- The records are appended unconditionally. The base blob stays identical whether or not a supplement is compiled, and they are unreachable without it: the entrance is only usable once the overworld opening is drawn, which only happens while the supplement is loaded.
- The Pyramid opening is overworld cell column 14, row 27 on area 0x5b; the extra dungeon's opening is drawn on the same row at column 43. A cell is 16 pixels wide, and an entrance position is a cell index doubled.
- Room 0x10 is the room the Pyramid opening leads to; the cloned exit record is keyed on it.
- The base game ships 133 entrance records, so the next free id is 133. The count is asserted at append time so a changed base table fails the build.
- A room spans 0x200 by 0x200 pixels and the grid is 16 rooms wide. Quadrant value 0x22 means both axes are full size (one viewport, no page split); 0x02 puts the player in the left half, lower vertical quadrant.

## packages/asset-extraction/src/extensions/second-cartridge-map/second-cartridge-map.constants.ts

- `cur_palace_index_x2` carries the whole dungeon identity: the map screen refuses to open on 0xff, the HUD hides the map, compass and big key slots on it, and keys are only banked per dungeon for a real index. The base game ships fourteen dungeons, so this one is the fifteenth.
- The engine stores this field doubled. The base table holds 0, 2, up to 26 for its fourteen dungeons and -1 for a cave, and every table is reached by shifting it back down. Storing the plain index would land on an existing dungeon.
- Placeholder content: the two appended map records are a copy of palace 2, a single-floor dungeon, so the map screen opens and behaves, but the floor plan drawn is not this dungeon's yet. Authoring the real one needs the layout and tile byte format decoded (a byte per grid slot, 0xf for empty, plus one tile byte per occupied slot).
- The append asserts the base record count so the appended entry lands at the index the entrance record names.

## packages/asset-extraction/src/extensions/second-cartridge-occluders.ts

- The port anchors an entity at each standing lamp's base (entity type 202 in this dungeon), and its handler draws the lamp head as a sprite above the player, because GBA tilemaps have no per-tile priority bit.
- This engine has a per-tile priority bit. The head cells are already in the baked bottom layer, so they get the SNES priority bit at extraction.
- The head is the two rows above the anchor, two columns wide, measured against the baked footprint.

## packages/asset-extraction/src/extensions/second-cartridge-palette.ts

- A room header's second byte is a palette id that the engine reads as an index into its own table of sprite and aux palette sets. The port's own id means nothing there, so the header is rewritten to name an entry appended to that table for this dungeon. The engine's palette load then runs unmodified.
- The base game's palette set table ships 41 entries; this dungeon's entry is appended after them.
- The background colours still come from the cartridge, one record per room.

## packages/asset-extraction/src/extensions/second-cartridge-palettes/second-cartridge-palettes.constants.ts

- The extended palette ids index past the cartridge's palette table, so their records cannot be extracted from ROM. Each entry is the live palette RAM of the running cartridge, read in the room that uses the id: background rows 2 to 7, sixteen BGR555 colours per row, the same six-row block a room palette record carries.
- Palette 0x29 was captured standing in the water room (room 0xdd). Row 7 carries the water surface blues.
- The object palette rows come from the same capture: a row number then sixteen colours, which the engine writes into the matching sprite palette row.

## packages/asset-extraction/src/extensions/second-cartridge-stair-slots.ts

- A staircase's destination is the header slot named by the slot attribute the engine derives for it. That attribute depends on the order stair objects register across the engine's stair buckets, which the baked maps do not record.
- These values were measured on original hardware with a memory tracer attached: each staircase was walked, and the arrival room identifies the slot because the header's destinations are known to be correct.
- Each requirement names the centre of the attribute grid region where the engine writes the slot attribute, and the exact value: low two bits are the slot, bit two is the direction family. 0x30 plus slot walks up on arrival, 0x34 plus slot walks down.
- The solver searches stair variants and orderings until the engine's own derivation, replayed over the candidate stream, produces these values. A room absent here keeps the art-driven solve.
- Hub (room 0x78): north-west and north-east lead to the antechamber (header slots 0 and 1), north-centre leads to the east wing (slot 3), and all three walk the player down. Slot 2 is the west wall's teleport door, so the room's fourth staircase (bottom-centre) consumes it.

## packages/asset-extraction/src/extensions/second-cartridge-tiles/second-cartridge-tiles.constants.ts

- A map16 cell is a 2x2 block of 8x8 tiles. Bit 13 of each map8 word says the tile draws in front of the player.
- The wall the extra dungeon's opening is cut into has no foreground-priority variant of its own course. Borrowing the base game's opening cells drew a different course of brick, so the two rows above the doorway came out in the wrong colour.
- The two appended cells copy the wall cells' tile numbers, palette and flips and only add the priority bit, so the wall is pixel-identical with the option on or off; the player now passes behind it.
- The ids are positional. The base game ships 3752 map16 cells and the length is asserted, so the appended cells land at the index the C side draws.
- The twins are appended unconditionally, like the entrance records: the base blob keeps the same shape whether or not a supplement is compiled, and nothing reaches these ids without one.

## packages/asset-extraction/src/extensions/second-cartridge-torches.ts

- A torch is not part of a room's picture. The engine registers torches from a table of room, positions, terminator entries, and that table also stores which torches are burning (the high bit of the position word).
- The cartridge ships this table as the base game's, word for word, with its own dungeon's entries appended past the point the base game stops scanning. The base game's copy at SNES 0x84f36a (144 words) is matched in the cartridge to find it; no stored offset is used.
- 64 bytes of the table are unique in an 8MB cartridge and short enough to survive an edit to it. The 256-word read limit is a ceiling; the table ends long before.
- Entries run until one names no room, which is how the cartridge closes the table. Rooms the dungeon does not own are dropped, so nothing unexpected in the tail reaches the engine's table.

## packages/asset-extraction/src/graphics/oklab/index.ts

- sRGB to OKLab (Bjorn Ottosson, 2020): a colour space where equal distances look about equally different, and where lightness (L) and colourfulness (chroma, the length of a and b) are separate axes. A plain RGB distance has neither property: it can call a mid grey closer to a mid green than to a dark grey.
- An `Oklab` value is `[L, a, b]`: L runs from 0 (black) to 1 (white), and a and b are near 0 for a grey.
- `chromaOf` is 0 for a grey and about 0.1 to 0.3 for a saturated hue.

## packages/asset-extraction/src/graphics/palette/index.ts

- SNES colour format: `0bBBBBBGGGGGRRRRR`, a 15-bit little-endian word. Each 5-bit component (0 to 31) is scaled to 8 bits (0 to 255).
- `RGBA` is `[r, g, b, a]`, each 0 to 255.

## packages/asset-extraction/src/graphics/png-writer.ts

- `ImageBuffer` is an RGBA buffer (4 bytes per pixel, row-major) for compositing tiles before PNG export through pngjs. It replaces the PIL `Image` of the Python tools.
- `putPixel` and `getPixel` do not check coordinates, for speed.
- `paste` copies only pixels with alpha above 0. `flipX`, `flipY` and `scale` (nearest neighbour, integer factor) return a new buffer.

## packages/asset-extraction/src/graphics/stripe-image.ts

- The game's stripe image format (`HandleStripes14` in `core/zelda3/src/nmi.c`): runs of VRAM words, each copied or repeated, across the tilemap or down it, ending at a byte with the top bit set. The title screen and the story intro both upload their pictures this way.
- `applyStripes` writes the stripe list at a SNES address into a word-addressed VRAM array. It returns the address just past the terminator, where a list stored back to back with it begins.

## packages/asset-extraction/src/graphics/svg-pixel-art/index.ts

- Reads the one SVG dialect the project's own drawings use: a `viewBox` sized in pixels and a flat list of `<rect>` elements with integer geometry and hex fills (`#rgb` or `#rrggbb`, always opaque).
- Anything else in the document is ignored, so a drawing tool's extra attributes do no harm. No XML library is used; the shape is narrow enough for two regular expressions.

## packages/asset-extraction/src/item-sprites/art-badge.ts

- `art-badge` is the multiworld pool icon path: the base is a game's icon and the badge is the Archipelago mark, so the drawings stay unbadged and usable on their own.
- It stays separate from `upgrade-composite` although both stamp a badge, because the colour rules differ. An upgrade composite also reaches a binary drawn with one fixed sprite palette row; an art badge only becomes a PNG and keeps any colour the artist chose.

## packages/asset-extraction/src/item-sprites/art-picture.ts

- A drawing is parsed into the same ImageBuffer a ROM decoded sprite produces, so it can stand as a sprite of its own or as the base of a composite.

## packages/asset-extraction/src/item-sprites/art/art-library.ts

- The SVG text is inlined at bundle time through `?raw` imports, so the same table serves Electron main, the renderer and the extraction Worker with no file access at runtime.
- A drawing used by the `art` method only becomes a PNG for the app's own surfaces, written as 8 bit truecolour with alpha, so it may carry any colours.
- A drawing used by `upgrade-composite`, as the base or as the badge, also reaches a binary the core draws with one fixed sprite palette row, where every opaque pixel snaps to the nearest colour of that row. Those drawings are kept inside that row on purpose.
- The shop price symbols (`currency-*.svg`) are `art` sprites that also reach such a binary, so they are drawn in that row too.
- The pool icons (`pool/*.svg`) are free colour `art-badge` drawings that only become PNGs, one per game a multiworld pool may hold. The Archipelago badge beside them is never a sprite of its own.
- The definition schema lists a separate set of names per method, so a free colour drawing cannot reach the quantized path by accident.

## packages/asset-extraction/src/item-sprites/badge-stamp.ts

- The badge is anchored to the bottom right corner of the base. Its opaque pixels overwrite the base and its transparent pixels leave the base untouched.

## packages/asset-extraction/src/item-sprites/base-resolver.type.ts

- A derived sprite (composite or recolour) gets its base through the caller, which turns another definition's file name into that definition's extracted picture. The derived sprite never knows how its base was decoded.

## packages/asset-extraction/src/item-sprites/bg-palettes/dungeon-bg-palette.ts

- Indoors, one 90 word set gives rows 2 to 7 their full 15 colours.

## packages/asset-extraction/src/item-sprites/bg-palettes/overworld-bg-palette.ts

- A background sheet is stored 3bpp (eight pixel values). The loader widens it to 4bpp into either the lower half of a row (values 1 to 7) or the upper half (values 9 to 15), depending on the VRAM slot the sheet was loaded into, so the two halves come from different ROM tables.
- Outdoors: rows 2 to 6 take their lower half from the main table (one 35 word set per palette mode), row 7 takes its lower half from the third auxiliary table, and the upper halves come from the shared auxiliary table, rows 2 to 4 from `aux1` and rows 5 to 7 from `aux2`.
- Pixel value 0 is never written because it is the backdrop showing through, so every row keeps a transparent entry there.

## packages/asset-extraction/src/item-sprites/bg-tile-decoder/extract-bg-tile.ts

- A map screen draws from eight compressed 3bpp background sheets of 64 tiles each, loaded into VRAM in a fixed slot order. Sheet index n backs tile numbers n*64 and up.
- A tilemap word holds the tile number across all eight sheets in bits 0 to 9 (so `number >> 6` picks the sheet), the palette row in bits 10 to 12, a horizontal flip in bit 14 and a vertical flip in bit 15.
- Four words in reading order (top left, top right, bottom left, bottom right) make one 16x16 ground block.
- `upper` names the sheets whose values were widened into the upper half of their palette row (see `bg-palettes`).

## packages/asset-extraction/src/item-sprites/capacity-icons/capacity-icons.constants.ts

- The four upgrade composites are quantized to one sprite palette row and encoded as 128 B per icon, 512 B in all, written as `capacity-icons.4bpp`. The core copies one over the receipt decode slot and draws the receipt with that row (`core/game-hooks/upgrade_icon.c`), so no palette is written.
- `CAPACITY_ICON_FAMILIES` is in the core's order: explosives, projectiles, meter, wallet.
- `CAPACITY_ICON_PALETTE_ROW` is mirrored by `ICON_PALETTE_ROW` in `core/game-hooks/upgrade_icon.c`. Change both together.
- Row 4 is used because it holds the badge's green, the jar's blue and the bomb's greys. Row 2, the refill receipts' row, has no green and turned the badge orange.
- `EXTRACTION_FORMAT_VERSION` is the hand bumped half of the extraction version. Bump it whenever a decoder, a composite or a converter changes the bytes it writes while the definitions and drawings stay the same.
- Version history: 1 presence only sets before any stamp; 2 capacity icons on row 4 (were row 2); 3 gear pictures added; 4 quiver picture added; 5 shop price symbols added; 6 multiworld pool icons added; 7 pool icons quantized by OKLab with greys to greys (was plain RGB); 8 pool icons quantized to their own 15 colour palette carried after them (was row 4).

## packages/asset-extraction/src/item-sprites/currency-symbols/currency-symbols.constants.ts

- A randomized shelf may charge arrows, bombs, hearts or a bottled item, and the price is bare digits. The nine currency drawings are reduced to one sprite palette row and encoded as the two 4bpp tiles of a 16x8 strip, 64 B each, 576 B in all, written as `currency-symbols.4bpp`. The core lends each shown symbol a tile row of the substituted sprite pool and draws it beside the digits (`core/game-hooks/shop_symbols.c`).
- `CURRENCY_SYMBOL_PALETTE_ROW` is mirrored by `SYMBOL_PALETTE_ROW` in `core/game-hooks/shop_symbols.c`. Change both together.
- `CURRENCY_SYMBOL_FILES` is mirrored by the symbol ids in `shop_symbols.c`: the first four are the currency tags, and the five bottled ones follow the bottle slot values (3 red, 4 green, 5 blue, 6 fairy, 7 bee).
- Row 4 is the only main sprite row whose colours are identical in both world halves, and the drawings were made from it.
- The arrow, bomb and heart are traced from the HUD counters and carry that palette's colours. The HUD grey has no grey in row 4 and would snap to its light green, so it becomes white first, which keeps the arrow's fletching readable.
- An 8 px wide drawing fills the left tile and leaves the right one blank; the core reads the width from that.

## packages/asset-extraction/src/item-sprites/dialogue-glyph-decoder/extract-dialogue-glyph.ts

- The dialogue font is 256 tiles of 8x8 2bpp. One character is two stacked tiles (8x16), so the tiles pair up into 128 addressable characters. For character c the top tile is `(c >> 4) * 32 + (c & 15)` and the bottom tile is 16 further.
- The colour is a reconstruction, not ROM data: `GLYPH_RAMP` is shared with every live redraw so a cut file and a redraw cannot drift apart.
- `glyphRight` pairs the right half of a two half picture, giving one 16x16 image.

## packages/asset-extraction/src/item-sprites/drop-tables.ts

- The drop lookup tables are ported from upstream `extract-item-sprites.py`. `kDecodeTab` is the receipt decode table, reused by the big key drop.

## packages/asset-extraction/src/item-sprites/extract-items/extract-items.constants.ts

- The `art` method needs no ROM at all: the drawing is the sprite, for an item the game never had a picture for, so it works the same whatever ROM is loaded. `art-badge` is likewise ROM free.
- A composite builds on another definition by file name through `ctx.resolveFile`; a definition that loops back on itself throws.

## packages/asset-extraction/src/item-sprites/extract-items/extract-sprite-buffers.ts

- The extraction core is pure (no fs), so it runs in the renderer, the extraction Worker and Node. File writing and ROM loading from a path live in `extract-items-node.ts`.
- The stamp buffer goes first and names the definitions and code the set comes from, so a set whose files are all present but whose bytes predate the current code is refreshed.
- Each picture is scaled 2x for its PNG (16x16 becomes 32x32).
- The in-game binaries are added whenever the set defines every picture they are built from.

## packages/asset-extraction/src/item-sprites/extraction-stamp/extraction-version-of.ts

- Presence alone cannot tell a set built by older code from a current one, because every file is there and only the bytes differ. The stamp names what produced the set so the staleness check can refresh it.
- The version has two parts. The hash covers every input the code sees at runtime (the definitions and the drawings), so a changed recipe or SVG refreshes the set with no manual bump. The format number covers the decoders and converters, which change bytes without changing a definition.
- The drawings are hashed in name order so the hash does not depend on the table's key order.

## packages/asset-extraction/src/item-sprites/extraction-stamp/fnv1a.ts

- FNV-1a 32 bit: stable across runs and hosts, dependency free and synchronous so it runs inside the pure extraction core. It is not a security hash; a collision only means one skipped refresh.

## packages/asset-extraction/src/item-sprites/fixed-row-tiles/encode-icon.ts

- A 16x16 picture becomes the four SNES 4bpp tiles of the core's animated tile decode slot at 0xBD40, in the slot's own order: top left, top right, bottom left, bottom right, 32 B each (see `core/game-hooks/decode_slot.h`).
- Each tile is planar: planes 0 and 1 interleaved per row, then planes 2 and 3.
- The core copies the tiles over the decode slot and forces the draw's OAM palette row to the row they were quantized to, so nothing writes CGRAM and the picture cannot pick up whatever the row happens to hold.

## packages/asset-extraction/src/item-sprites/fixed-row-tiles/quantize-icon.ts

- Index 0 is transparent. Every opaque pixel snaps to the nearest of the row's colours 1 to 15 by squared RGB distance.
- The returned error is the mean squared RGB distance per opaque pixel, a measure of how well the row fits the picture.

## packages/asset-extraction/src/item-sprites/foreign-icon-palette.ts

- The palette is picked from the icons' pixels. The core shows the icons against a private palette bank of these colours (`foreign_icon_bank.c`).
- Fixed entries come first: black, white, every tone all the icons share (the outline, and the Archipelago badge's colours, so the badge reads the same on every icon), and every grey covering at least an eighth of one icon (the fused shadow's two greys).
- The remaining entries come from a weighted k-medoids over the other tones, measured in OKLab with lightness at half weight, as the matcher measures them. Seeds are picked farthest first: each takes the tone the entries so far serve worst, weighted by area. A medoid is a real tone of the art, so every entry is a colour an icon uses.
- A grey and a colour never serve each other, so their distance is infinite.
- Every entry is snapped to SNES 15 bit colour. Index 0 is transparent; entries run greys dark to light, then colours by hue.

## packages/asset-extraction/src/item-sprites/foreign-icons/foreign-icons.constants.ts

- The multiworld pool icons are drawn by the core over the hold up of another player's item. Each pool picture is quantized to the icons' own 15 colour palette and encoded as 128 B, in `FOREIGN_ICON_FILES` order, followed by the palette: 16 little endian SNES words, the first one 0 (transparent). The file is `foreign-icons.4bpp`.
- The core shows picture n for foreign icon id 0xB0 + n (`core/game-hooks/foreign_icon.c`), so `FOREIGN_ICON_FILES` is the id table: append, never reorder.
- The core resolves the icon's pixels against the palette in a private bank, so no sprite row of the game has to fit art drawn for other games.
- `FOREIGN_ICON_PALETTE_ROW` is the row the icon's OAM entry names. The colours come from the private bank, so the row only decides colour math (rows 4 to 7 take it, as every receipt does). It is mirrored by `FOREIGN_ICON_PALETTE_ROW` in `core/game-hooks/foreign_icon.c`. Change both together.

## packages/asset-extraction/src/item-sprites/gear-icons/gear-icons.constants.ts

- The eight gear receipts (four blades, three shields, and the duplicate blade id the opening scene uses) are the only receipt ids drawn with sprite palette row 5 (`kWishPond2_OamFlags`). Row 5's entries 9 to 15 are loaded from the player's own blade and shield level, and `AncillaAdd_ItemReceipt` reloads them for the item being granted.
- That is right for the hold up and wrong elsewhere: a shelf, a drop or a standing pickup draws the item in whatever gear the player carries, and three shelves offering three blades look the same because they share one picture (gfx 0x18).
- Each picture is extracted with its own row 5 variant (`PAL5_CONFIG`), quantized to one always resident row and written as `gear-icons.4bpp`, 128 B per id, 1024 B in all. The core copies the tiles over the slot after a world draw decoded the art there and forces that draw's palette row (`core/game-hooks/gear_icon.c`). The hold up is left alone.
- Row 4 is the best fit of the four candidates by mean squared error per opaque pixel (worst id 4119, mean 2066, against 5778, 5434 and 16859 worst for rows 1, 2 and 3). It is also the only main sprite row whose colours are identical in both world halves. Rows 1 to 3 change with `Palette_Load_SpriteMain`'s world offset, and rows 0 and 5 to 7 are area or equipment palettes that are not always resident.
- `GEAR_ICON_PALETTE_ROW` is mirrored by `GEAR_PALETTE_ROW` in `core/game-hooks/gear_icon.c`. `GEAR_RECEIPT_IDS` is mirrored by `kGearReceiptIds` there. Change both together.
- `GEAR_RECEIPT_IDS` is every id whose `kWishPond2_OamFlags` entry is row 5, which is the set in `PAL5_CONFIG`. `GEAR_ICON_FILES` is in the same order.
- A narrow receipt (`kReceiveItem_Tab1` is 0) is two stacked 8x8 tiles drawn from the slot's left column. The extracted picture centres it in a 16x16 frame, so its pixels sit `NARROW_INSET` (4) columns right of where the slot wants them.

## packages/asset-extraction/src/item-sprites/hud-decoder/decode-hud-tile.ts

- HUD item tile ids hold the tile number in bits 0 to 9, the palette index in bits 10 to 12, a horizontal flip in bit 14 and a vertical flip in bit 15.
- The tiles live in three compressed sheets (106, 107, 105 in that order), 128 tiles each, 16 bytes per tile in 2bpp.

## packages/asset-extraction/src/item-sprites/palette-swap/extract-palette-swap.ts

- A palette swap derives a gem of a colour the game never drew from one it did, keeping the tile art and the outline.
- Colours match the decoded RGBA exactly. A `from` colour the base does not hold is treated as a typo in the definition and throws.

## packages/asset-extraction/src/item-sprites/perceptual-match/match-tones.ts

- Colours are matched by how they look (OKLab), for pictures drawn with colours the row does not hold.
- A grey only becomes one of the row's greys, matched by lightness. When several greys of the picture land on one entry and the next darker grey entry is unused, the darkest of them moves down to it, so a picture drawn in three greys keeps an outline against its body.
- A colour only becomes one of the row's colours, matched by OKLab distance with lightness at half weight, so the hue decides first. When two areas land on one entry, the one closest to it in lightness keeps it and the other moves to the nearest entry on its own side in lightness within `SPREAD_LIMIT`, so two shades of one hue (a gold shield and its pale cross) stay apart.
- A tone of `SPECK_PIXELS` or fewer pixels (the badge's specks) never takes or loses an entry; it shares its nearest one.
- An equal colour held twice in the row resolves to its lowest index.
- `NEUTRAL_CHROMA` is the OKLab chroma below which a colour reads as grey. The pool art's warm outline is 0.002.

## packages/asset-extraction/src/item-sprites/perceptual-quantize.ts

- This quantizes the multiworld pool icons to one fixed row by how the colours look. The colour choice is made per picture by `matchTones`. Index 0 is transparent.

## packages/asset-extraction/src/item-sprites/quiver-icon/quiver-icon.constants.ts

- Under the retro bow the quiver is handed over as the single arrow receipt, so the game's own art for it is an arrow, on the shop shelf and in the hold up.
- The app's `quiver.png` drawing (`packages/asset-extraction/art/quiver.svg`) is reduced to one sprite palette row and written as `quiver-icon.4bpp`, 128 B. The core copies it over the slot wherever that receipt's art was decoded and draws with that row (`core/game-hooks/retro_quiver_icon.c`). The extracted PNG keeps every colour.
- Row 4 fits the drawing's browns and gold best by mean squared error per opaque pixel (1705, against 1801, 1850 and 1896 for rows 3, 1 and 2), and its colours are identical in both world halves.
- `QUIVER_ICON_PALETTE_ROW` is mirrored by `QUIVER_PALETTE_ROW` in `core/game-hooks/retro_quiver_icon.c`. Change both together.

## packages/asset-extraction/src/item-sprites/receipt-decoder/extract-receipt.ts

- Receipt sheets are 0x5A (base) plus one of 0x5B, 0x5C or 0x5D, picked by the graphics sheet number.
- An OAM flags entry of 0xFF falls back to sprite palette row 5, the row filled from the player's sword and shield.
- The crystal (receipt 32) uses palette row 6 with a fixed blue gradient in entries 9 to 15. The gradient is a reconstruction, not ROM data.

## packages/asset-extraction/src/item-sprites/receipt-palettes/load-sprite-palettes.ts

- Rows 1 to 4 are the main sprite palettes, 15 colours each.
- Rows 5 and 6 take their lower half from the first auxiliary table. Row 6's upper half (entries 9 to 15) is row 6 of `kPalette_MiscSprite`, the light world outdoor default.
- Row 5's entries 9 to 11 are the sword colours and 12 to 15 the shield colours.
- Row 0 comes from the third auxiliary table.
- Row 7 is the player's armour palette, loaded as the Green Mail (armour 0).

## packages/asset-extraction/src/item-sprites/receipt-tables.ts

- The decode tables for the receipt (item hold up) sprites are ported from upstream `extract-item-sprites.py`.
- `PAL5_CONFIG` holds the receipt ids drawn with sprite palette row 5 and the sword and shield level whose colours fill that row for them.

## packages/asset-extraction/src/item-sprites/write-and-prune.ts

- Writing no PNG means the definitions were absent, never that every file on disk went stale, so pruning is skipped then. Pruning against an empty set would empty the whole folder.
- Only PNGs are pruned; the stamp and the icon binaries beside them stay.
- A missing output folder on the first run is tolerated during pruning.

## packages/asset-extraction/src/music/compile-music.ts

- Compiles the extracted music text back into an SPC sound bank image. Ported from upstream's `compile_music.py`.
- `produceLoadableSeq` turns the sparse SPC memory into the loadable sequence: runs of a u16 length and a u16 target address followed by the bytes, ended by a zero length.

## packages/asset-extraction/src/music/dump-brr-info.ts

- Dumps the BRR samples and builds `music_info.yaml` (samples, instruments, note gate and volume tables, sound effect instruments).
- Samples 10 and 20 are duplicates of 9 and 19 (`kDupSamples`, also in `compile-music.ts`).

## packages/asset-extraction/src/music/extract-music.ts

- Loads the SPC sound banks from the ROM, decodes songs, phrases, patterns and sound effects, and produces their text plus the sample output. Ported from upstream's `extract_music.py`.

## packages/asset-extraction/src/music/music-serializer.ts

- Writes compiled music entities into the SPC memory layout. In a sound effect line, a rest or tie (`.`) needs no extra byte.

## packages/asset-extraction/src/music/sound-bank-context.ts

- Holds the SPC memory state while decoding, and decodes song, phrase and pattern structures from it.

## packages/asset-extraction/src/music/spc-command-tables.constants.ts

- The SPC command tables shared by extraction and compilation. Command `0xe0 + n` is effect `n`, which takes `kEffectByteLength[n]` argument bytes. Notes 72 and 73 are `-+-` and `---`.

## packages/asset-extraction/src/rom/load-rom-file.ts

- Node-only ROM loading from a file path. It is kept apart from `rom-loader` so the browser and Worker asset pipeline (`loadRomFromBuffer`) carries no `fs` import.
- `load-gba-rom-file.ts` is the same for the GBA cartridge.

## packages/asset-extraction/src/rom/reader.ts

- A sequential byte reader that advances across SNES banks. It replaces the Python `Reader` class and the `get_byte` callback pattern. Words and 24-bit values are little-endian.

## packages/asset-extraction/src/rom/rom-loader/load-rom-from-buffer.ts

- Loads a ROM with SHA-1 validation and version detection, and returns a `RomData` (dependency injected, no global state).
- A 512-byte SMC header is stripped when present. The Swedish translation is identified by hash with a length of `0x10083b`, and then carries a second 512-byte header that is also stripped.

## packages/asset-extraction/src/rom/rom-types/rom-types.type.ts

- `RomData` is the dependency every extraction function receives. It replaces the Python global `ROM` singleton.
- `bytes` is the raw ROM with the header stripped. Every getter takes a SNES address; words and 24-bit values are little-endian.
- `getBytes` and `getWords` handle bank boundaries.
- `RomHashTable` maps an uppercase hex SHA-1 to the ROM identification.

## packages/asset-extraction/src/sets-types/language.type.ts

- Language pack types are shared by the extraction pipeline, the Electron language store and the renderer's language inspector.
- `code` is a language code such as `fr`, `de` or `fr-c`.
- `glyphCount` is the number of glyphs in the font's width table, the effective alphabet size.
- `encoder` is the text compression format the language uses.
- `flags`: bit 0 means the new dialogue map format, bit 1 means no US ROM match.
- `source` is a human description of the ROM the pack was extracted from.
- `DialogueLine.id` is 1-based. `content` keeps bracketed control tokens such as `[Scroll]` and `[Name]`.
- `LanguageFont.tiles` holds raw 2bpp glyph sheet bytes (256 tiles of 16 bytes). `glyphCount` is how many glyphs of the sheet to display.

## packages/asset-extraction/src/sources/gba-alttp/asset-manifest.ts

- This manifest is the single source of truth for the order of the GBA supplement's assets. The C engine reads the container positionally: an index means the Nth `assets.add*` call and nothing more.
- The TS compiler (`packages/asset-extraction/src/compile-resources-gba-alttp`) iterates the manifest to decide call order, and `npm run generate:gba-asset-index` reads it to emit `core/game-hooks/gba_asset_index.generated.h`, a C enum in the same order. Adding, removing or reordering an entry here moves both sides together.
- `name` is the exact string passed to `assets.add*`. It also feeds the container's key signature hash, so it must stay stable for an asset once shipped.
- The generator script imports this file directly with Node type stripping, so it must keep its path and must not gain a runtime import (type-only imports are erased and are fine).

## packages/asset-extraction/src/sources/gba-alttp/blockset-identity/blockset-identity.constants.ts

- The extra dungeon's background blockset is a base-game blockset. Measured against the base cartridge: the eight 64-tile sheets are packs 0, 1, 17, 12, 14, 37, 27 and 15, which is what the engine composes from main theme 9 plus aux theme 9. 453 of the 512 tiles are byte-identical to those packs in planes 0 to 2, and five of the eight sheets match 64 out of 64.
- MAIN_TILE_THEME is main_tile_theme_index, carried by the entrance record's blockset field. AUX_TILE_THEME is aux_tile_theme_index, carried by the room header's third byte.
- The identity gives tile ids: the room maps address the base game's tiles by the base game's numbers, which makes derived collision and rebuilt object streams possible. It does not give the pixels. The base game stores background art as 3bpp and synthesises the fourth plane on load (zero for some VRAM slots, the OR of the other three for others). The port stores real 4bpp and re-encoded three sheets to carry their colour in the palette. So the sheet is still uploaded whole; the theme indices cover everything the engine derives from a blockset.
- assertBlocksetIdentity guards that claim: below 440 matching tiles the build fails, so rooms whose ids mean something else never ship.

## packages/asset-extraction/src/sources/gba-alttp/dungeon-source/parse-room-header.ts

- Only the stored bytes of a header belong to the room; the trimmed tail is zero, not the next room's header.

## packages/asset-extraction/src/sources/gba-alttp/dungeon-source/parse-room-layer.ts

- Dungeon graphics are assembled from 64-tile sheets whose collision meanings share one 128-entry attribute bank, selected by the room's blockset.
- A room layer is a 64x64 map stored as four 32x32 GBA screen blocks.

## packages/asset-extraction/src/sources/gba-alttp/graphics-source/graphics-source.constants.ts

- The sprite sheet pointer table is at 0x0822b324, four entries higher than it first appears. Reading from 0x0822b314 returns the art of the sheet four ids lower, which made the cartridge's ids look renumbered. They are not: its quartets match the base game's for every blockset the base table also defines.
- The animated background slots 6 and 7 take tiles 32 to 47 of the sheets at 0x08276ff0 and 0x08276c38, placed at tiles 432 and 448 of the palace sheet.

## packages/asset-extraction/src/sources/gba-alttp/header-record-length/header-record-lengths.ts

- The cartridge stores the fourteen-byte room header with its trailing zero bytes trimmed, and the pointer table records where one record ends and the next begins.
- The first seven bytes are always present. The rest (the quadrant nibbles, the hole destination and the four staircase destinations) are stored only up to the last non-zero byte, so records are seven, ten, eleven, twelve, thirteen or fourteen bytes long.
- Reading a fixed fourteen bytes walks off the end of every short record and picks up the next room's header as this room's travel destinations, which silently rewrites where a staircase leads. Lengths are recovered by sorting the pointer table and measuring the gap to the next record.
- Rooms may share one record (the table holds duplicate pointers), so the gap is measured to the next distinct address.

## packages/asset-extraction/src/sources/gba-alttp/room-records/parse-entities.ts

- An entity list starts with a sort mode byte, then three-byte records (y, x, type), terminated by 0xff. Lists are stored per room behind their own pointer table.
- Type 0xe4 with y 0xfd or 0xfe is a death marker, not an entity.
- An x byte of 0xe0 or more marks an overlord.

## packages/asset-extraction/src/sources/gba-alttp/room-records/parse-secrets.ts

- A secret record is a two-byte tilemap position and an item byte, terminated by 0xffff. Secret lists are stored per room behind their own pointer table.

## packages/asset-extraction/src/sources/gba-alttp/sprite-sheet-identity/sprite-sheet-identity.constants.ts

- The cartridge's enemy sheets are the base game's, under the same numbering. For blocksets 21, 25 and 26, which both tables define, the cartridge's quartet is byte-identical to the base game's.
- Uploading the sheets' pixels is the wrong fix: enemies draw from tile numbers baked into the engine's sprite code, which assume the base game's sheet in each slot. What the cartridge contributes is the composition for the blocksets the base table leaves empty, which is most of this dungeon's.
- BASE_SHEET_DELTA is 0 and kept named so a future divergence has somewhere to go. Sheet id 0xff is a slot the cartridge leaves to whatever was already loaded.
- Base game sprite sheets below index 12 are stored raw; the rest are compressed. A base sheet is 64 tiles of 24-byte 3bpp, 0x600 bytes.
- compareSpriteSheets checks every referenced sheet against its base sheet so a wrong pointer table or delta cannot ship unnoticed; the caller decides what to do with an imperfect match.

## packages/asset-extraction/src/sources/gba-alttp/tile-shape-matches.ts

- A base game 3bpp tile is planes 0 and 1 interleaved (16 bytes), then plane 2 (8 bytes). A 4bpp tile is 32 bytes with plane 2 starting at byte 16 interleaved with plane 3. A tile's shape matches when planes 0 to 2 are equal.

## packages/asset-extraction/src/sources/optional-sources.ts

- Every optional cartridge that can add to the base game, in the order their containers are appended at load time. The engine sniffs containers positionally, so this order is part of the on-disk contract: append new sources, never reorder.
- Each optional source owns both halves of its job: deciding whether the user supplied it (compile returns null when its ROM is absent) and compiling it. Adding a source is a registry entry, not another branch in the compiler.

## packages/asset-extraction/src/sources/source-ids.ts

- This module has no runtime imports on purpose. The storage layer needs to know which sidecar files can exist, and importing that from the source registry would pull the whole extraction pipeline into every renderer module that touches asset storage.
- Append only. The engine reads containers positionally, so the order of the ids is an on-disk contract.

## packages/asset-extraction/src/sources/source.type.ts

- The base cartridge is required: if it fails to compile there is no game, so it throws. Every other source is optional and must never take the base down with it, so an optional source reports failure as data.

## packages/asset-extraction/src/story-intro/extract-legend/extract-legend.constants.ts

- The four pictures of the story intro: the legend told over the polka-dot backdrop before the attract sequence moves on to the world map.
- Each picture is a stripe list (`kAttract_Legendgraphics_0` to `3`, stored back to back from `ADDR_LEGEND_STRIPES`) that the NMI writes into the BG3 tilemap. Each list starts where the one before it ends.
- The pictures are drawn from the 2bpp sheet `Attract_LoadBG3GFX` uploads: sheet `0x67` (`LEGEND_SHEET`), copied as-is to BG3 characters `0x100` to `0x17f`.
- They use HUD palette row 5. `hud_palette` 1 is the second 32-colour block of `kHudPalData` (`HUD_PALETTE_BLOCK`).
- `UNWRITTEN` marks the tilemap cells no stripe wrote, so each picture is cut to exactly its own cells.

## packages/asset-extraction/src/text/build-language-entry/build-lang-data.ts

- The randomizer template lines are appended after the canonical vanilla lines at bake time only. dialogue.txt, meta.json and the Language Studio all keep seeing 397 lines. The core addresses the templates as fixed message ids (kReceiptMsg_* in core/game-hooks/game_hooks.h), so the vanilla count must be exact before appending.

## packages/asset-extraction/src/text/build-language-entry/build-language-entry.constants.ts

- The core's kDialogue, kDialogueFont and kDialogueMap are parallel arrays; index 0 is the US ROM and extras follow. ZeldaSetLanguage(code) looks the code up in kDialogueMap and pulls dialogue and font by the stored index. Ported from upstream's compile_resources.py print_dialogue().
- The US ROM omits one control string. It is inserted at index 4 so a 396-string ROM reaches the canonical 397.
- Dialogue map flags: bit 0 is the new format, bit 1 means no US ROM match.

## packages/asset-extraction/src/text/data/font-data.ts

- Each language stores its 8x8 2bpp glyph tiles and a per-glyph width table at language-specific ROM addresses. Every dialogue font is 256 tiles of 16 bytes.
- The official EU ROMs (de, fr, fr-c) keep their font in a different bank than the US ROM; the translation hacks reuse the US font slot but vary the glyph count.
- tileAddr is the SNES address of the glyph sheet, widthAddr the SNES address of the width table, widthCount the number of glyphs in the width table (the language's effective alphabet size). Ported from upstream's sprite_sheets.py kFontTypes.

## packages/asset-extraction/src/text/data/glyph-ramp.ts

- The colour ramp the dialogue face is drawn with. It is not ROM data: the font stores two bitplanes and the engine paints it over whatever palette the text box has loaded, so these four values reconstruct the on-screen look.
- Index 0 is background (transparent), 1 the dark blue edge, 2 the mid highlight, 3 the white fill. The values are SNES 5-bit colours expanded to 8-bit.
- It lives on its own so the extraction that cuts characters to files and the editor that redraws them from a pack's font agree.

## packages/asset-extraction/src/text/data/language-data/language-data.constants.ts

- Language definitions for the game's text compression and decompression, one config per language, ported from upstream's text_compression.py.

## packages/asset-extraction/src/text/data/randomizer-templates/randomizer-templates.constants.ts

- Randomizer template lines are appended after the 397 canonical vanilla dialogue lines at bake time (build-language-entry), never persisted into a pack's dialogue.txt, so every language entry gains them on its next compile whenever the pack was extracted.
- The order is a frozen contract with the C side: `kReceiptMsg_*` and `kRandomizerMsg_*` in `core/game-hooks/game_hooks.h` index these lines as dialogue message id 397 plus position. Append new templates at the end only, and bump CURRENT_BAKE_VERSION (packages/asset-extraction/src/bake-version) so cached blobs are recompiled.
- The game's text engine has no runtime string substitution (only the player name and preloaded digit commands), so these are fixed context-class lines, not per-item text.
- The character set is restricted to letters, digits, space and `.,!?`, the intersection of every language's alphabet, so the fallback text encodes under every encoder. `[1]`, `[2]` and `[3]` select the box's three lines and are commands both encoders share, so a line long enough to wrap says where it breaks.
- Lines in order: generic (an overridden chest with no richer class), progressive (one tier of a multi-tier family), dungeon item (key, big key, palace bitmask trio), delivered (granted by the delivery queue), online (sent by another player in a shared game); then the archery host refusing a fee for a game that could not be played (archery_host.c); then shelves refusing a price the player cannot pay, one line per non-rupee currency (shop_refusal.c), where the five bottled ones follow the bottle slot values the game stores, 3 to 7, so the core indexes them by the value a bottle price demands; then a shelf's thanks over the hold-up of what was bought (shop_overrides.c), which names nothing because the item is already in the player's hands.
- TEMPLATE_TRANSLATIONS holds per-language translations keyed by language code, each in the same order and length as the fallback list. None exist yet; a translated language adds its entry and the bake picks it up.

## packages/asset-extraction/src/text/dialogue-decoder/decode-strings-with-config.ts

- Ported from upstream's text_compression.py decode_strings_generic(). Byte 0x7f ends a message.
- The pt translation tolerates the eight bytes after its bank switch byte, and its decode stops after 397 messages.

## packages/asset-extraction/src/text/dialogue-encoder/cmd-info.ts

- The command table for the new encoder format (pt and the EU ROMs).

## packages/asset-extraction/src/text/dialogue-encoder/compress-strings.ts

- Ported from upstream's text_compression.py compress_strings() and its encoders. Compression is greedy: a dictionary match first (looked up by first character), then a bracketed command or a bracketed alphabet entry, then a plain alphabet character.

## packages/asset-extraction/src/text/menu-text/charset/charset.constants.ts

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

## packages/asset-extraction/src/text/menu-text/decode-captions.ts

- Captions on the sixteen closing scenes. `kEnding0_Offs` (SNES 0x8EC2E1, 17 words) brackets each scene's slice of `kEnding0_Data` (0x8EBF4C, 917 bytes). A slice is a run of records shaped vram address word, control word, character indexes; the character count is `((control >> 9) & 0x7f) + 1`. Records use the credits' 160-entry character set.
- Each scene has a caption in the small 8x8 font and a place name in the large 8x16 font. The large one costs two records (upper halves, then lower halves, at two tilemap addresses), so the upper record is dropped and the lower one is emitted as `location`. Small font records are emitted as `title`. Extra records of a role are suffixed `-2`, `-3`; only scene 2 does this, opening with a stray one-character record before its caption.
- Every record writes horizontally into a 32x32 tilemap, so every caption gets a 32-tile row positioned by its start column. The record's own length is not a ceiling, since the offset table lets a record be repacked to any size.

## packages/asset-extraction/src/text/menu-text/decode-credits.ts

- `kEnding_Credits_Offs` (SNES 0x8EB93D, 394 words) gives, for each of the 394 scroll rows, a byte offset into `kEnding_Credits_Text` (0x8EB178, 1989 bytes). A row is either the single byte 0xFF (nothing on the row) or a record of start column, byte count, character indexes. The count is a DMA byte count: the renderer uploads one 16-bit tile per character, so a row holds `(count + 1) >> 1` characters. Records are packed back to back and several rows share an offset, so the offset table is the only reliable way in.
- A large 8x16 character spans two scroll rows. A row of only upper halves is dropped and the following row emitted, because the lower row carries the whole line: on the play count rows it also carries a small font prefix that never appears on the upper row.
- The renderer walks a 32x32 tilemap (advancing 0x20 words per row and wrapping every 0x400), so a row is 32 tiles wide and a line is centred by its own start column. The play count table at the end is the exception: the renderer writes three digits at column 0x19 of the same row, so those lines get 25 tiles. Both numbers come from the renderer.
- COUNTER_SCROLL_Y lists the scroll positions at which the renderer also draws a play counter, from its own table. Halving gives the row index; the row after each one is part of the same two-row band and gets a counter too.

## packages/asset-extraction/src/text/menu-text/decode-stripe-text.ts

- The file select and name entry screens are four prebuilt tilemap uploads in ROM (SNES 0xCE7BF, 0xCE2A8, 0xCE63C, 0xCE456, in screen order), each a chain of stripe runs shaped address hi, address lo, control hi, control lo, payload, closed by a byte with bit 7 set. The control word carries the payload length in its low 14 bits (length plus 1 bytes) and a fixed source flag at 0x4000 (the payload is one word repeated). A listed payload is a run of tilemap words, two bytes each.
- The letters are the dialogue font in its 8x16 arrangement: the tile for character code `c` is `(c & 0x70) * 2 + (c & 0xf)`, with the lower half 0x10 later. Reading a run inverts that and looks the code up in the language's alphabet. Runs of only lower halves repeat the row above and are dropped; runs whose tiles fall outside the 256-tile sheet are frame art and are dropped too.
- A few codes past the end of the alphabet table are supplied in EXTRA_GLYPHS (the sheet has more glyphs than the compressor can encode). Code 0x5f is a narrow bar the roll uses as capital I and the on-screen keyboard reuses as lowercase l; it is read as I.
- A run's tile count, read from the control word, is the room the screen gives that line.

## packages/asset-extraction/src/text/menu-text/menu-text.type.ts

- Every menu, credits and caption decoder returns the same shape. The three bodies of text live in three different ROM formats, but an editor wants the same three things from each: a stable key (for example `credits.row-041`, `caption.scene-03.title`, `menu.copy-player`), the readable English line, and how much room the screen gives it (for the editor's fit meter).

## packages/asset-extraction/src/text/parse-dialogue-text/parse-dialogue-text.ts

- Parses a stored dialogue.txt dump (the inverse of formatDialogueText) back into lines. Each line is `N: <content>`; content never contains a newline because control codes are bracketed (for example `[Scroll]`), so a plain line split is safe.
- dialogueTexts returns only the content strings, ordered by id, ready to feed back to compressStrings.

## packages/asset-extraction/src/title-screen/extract-title/extract-title-part.ts

- The pictures of the finished title screen, each cropped to what it draws: the logo (BG1), the Master Sword (ten intro sprites at rest), the triforce behind the logo (three copies of the polyhedral engine's triangle) and the lake with the castle behind them all (BG2).
- The backdrop shows through the background's own colour-0 pixels, so the background picture is made opaque over palette entry 0.

## packages/asset-extraction/src/title-screen/title-palette.ts

- The title screen's CGRAM once every fade has finished: the palette the intro fades toward (aux_palette_buffer), which the main palette equals from then on. The backdrop (entry 0) is black, as Palette_BgAndFixedColor_Black leaves it.

## packages/asset-extraction/src/title-screen/title-render/render-bg-screen.ts

- Draws the first 32x32 screen of a background layer from its tilemap, as the PPU would draw it unscrolled. Colour 0 stays transparent.

## packages/asset-extraction/src/title-screen/title-render/render-sprites.ts

- Draws 16x16 sprites from a name table, on one OBJ palette row, onto a 256x256 canvas. Colour 0 stays transparent.

## packages/asset-extraction/src/title-screen/title-tables.ts

- Where the title screen's pictures come from, resolved from the game's own setup (Intro_InitializeMemory_darken, Overworld_LoadAllPalettes and the intro sword in core/zelda3/src). The title loads main tileset 35, aux tileset 81 and sprite tileset 125; the sheet ids are those rows read out, so no tileset table is needed.
- A sheet slot is one 3bpp sheet expanded into 64 4bpp tiles at a VRAM word address. When `high` is set the fourth bitplane is the OR of the other three (Do3To4High), otherwise zero.
- TITLE_BG_SLOTS hold the background character data for BG1 (logo) and BG2 (lake and castle), VRAM 0x2000 to 0x3fff.
- 0x5000 is the second OBJ name table (OBSEL 2); the intro sword's sprite sheet (50) is expanded there.
- 0x0cdd6d is the stripe list the NMI uploads when the logo appears (kBgTilemap_0). Tile 0x1ec is what EraseTileMaps_normal fills both tilemaps with before the stripes land.
- Tilemap VRAM word address per layer: BG1 at 0x1000 (BG1SC 0x13), BG2 at 0x0000 (BG2SC 0x03).
- A palette load copies `rows` rows of `count` colours from `rom` (table address plus index times stride) into CGRAM starting at word `dst`. The loads are Overworld_LoadAllPalettes with the title's indices (mode 5, aux 3/3/0, sp0l 11), plus LoadTriforceSpritePalette, which copies kPolyhedralPalette into OBJ palette 5.
- The sword at rest comes from Intro_PeriodicSwordAndIntroFlash. Its attribute byte (0x21) selects OBJ palette 0, which is CGRAM row 8.
- The triforce is the polyhedral engine's one 64x64 triangle, drawn as three 4x4 grids of 16x16 sprites where the pieces land (kIntroSprite0_XLimit and YLimit), the right-hand one mirrored (kIntroTriforceOam_Left and Right). It uses OBJ palette 5 (CGRAM row 13) from the second name table. Its bitmap sits at VRAM 0x5800.

## packages/asset-extraction/src/title-screen/title-vram.ts

- Rebuilds the part of VRAM the finished title screen draws from: background and sprite character data, the triforce bitmap and the two tilemaps the stripe list writes. Word addressed like the PPU (0x8000 words). A 64x64 tilemap is four 32x32 screens (0x1000 words).
- expand3bpp follows Do3To4High and Do3To4Low: 24-byte 3bpp tiles into 16-word 4bpp tiles.
- The triforce is no sheet: the polyhedral engine draws it, and at rest its frame never changes, so it is rendered once.

## packages/asset-extraction/src/title-screen/triforce/poly-model/poly-model.constants.ts

- The triforce model is read from bank 09 of the ROM: the tables poly.c carries as kPoly1_Vtx, kPoly1_Polys and kPolySinCos.
- Each face is its vertex count, that many vertex indices, then a colour byte the engine ignores.
- The sine table is signed; cosine is the same table 64 entries on.
- The rest pose is both angles zero, the distance term (poly_config1) run down to zero, and the picture centred at (32, 32) of its 64x64 bitmap (Intro_InitGfx_Helper, Intro_RunStep).

## packages/asset-extraction/src/title-screen/triforce/poly-raster.ts

- Port of the polyhedral engine's face filler (Polyhedral_DrawFace and its helpers in core/zelda3/src/poly.c), kept to the same integer widths so its edges land on the same pixels. It writes 4bpp sprite tiles into a WRAM-shaped buffer at 0xe800, the block the NMI copies to VRAM 0x5800.
- leftMask and rightMask are the span masks of the left and right partial bytes of a line, doubled for two bitplanes. planesOf is kPoly_RasterColors: every bitplane byte full where the colour has that bit set.
- nextEdge is Polyhedral_SetLeft and SetRight: find the next vertex down this side; true ends the face.
- drawFace fills one convex face given as poly_xy_coords (count times 2, then x, y pairs).

## packages/asset-extraction/src/title-screen/triforce/poly-render.ts

- One frame of the polyhedral engine (Poly_RunFrame in core/zelda3/src/poly.c): rotate and project the vertices, then fill every face that faces the camera. The integer widths follow the original because they decide where the edges land. Returns the 0x800-byte tile block the NMI copies to VRAM 0x5800.
- divide is Poly_Divide: a signed numerator over an unsigned divisor, both halved until the divisor fits a byte.
- projectVertices is Polyhedral_OperateRotation; the model's x and z trade places.
- crossProduct is Polyhedral_CalculateCrossProduct: positive when the face turns toward the camera.
- shadeOf is Polyhedral_SetForegroundColor for this model at distance 0: brighter the more face-on.

## packages/asset-extraction/tests/alttp-asset-set.keep.test.ts

The byte identity case compiles with full options on purpose. The cheap variant
(`skipDialogue`, `skipMusic`) only proves identity for a blob the app never ships.

## packages/asset-extraction/tests/gba-alttp-supplement.keep.test.ts

The base game ROM is found by its `(USA).sfc` suffix, never named, because its filename
carries the trademark. The USA image is the one the extractor validates.

The `.sav` fixture is a live save the reference emulator writes during play, so its slots
hold whatever the tester last did. The test asserts the shape of the decode, never story
state.
