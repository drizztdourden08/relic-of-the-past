<!-- @layer docs @kind doc -->
# Code notes: packages/navigation

Facts about `packages/navigation` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/navigation/src/crossing-sections/

A crossing that is not placed carries a placeholder tile: the exit table names a
destination without saying where its door is, so it belongs in a list but on no map.
Indoors a fall hole crossing is the tile the player lands on and gets its own section.
Outdoors it is the pit itself and belongs with the other ways off the screen. A map marks
crossings that are placed, available now, and not a landing.

## packages/navigation/src/crossings/availability/

- An approach to an entrance asks for what its transition asks plus the gate of its tile.
- An entrance asks for what its CHEAPEST approach asks. An entrance is usable as soon as ONE of its transitions is (`isEntranceUsable` is a `.some`), so a plain floor approach beside a glove gated one asks for nothing. Taking the union of every approach would demand the player hold all of them at once and report a walkable entrance as blocked.
- A crossing is available when it is within reach of the flood AND asks for nothing the player lacks. A flood that was never run cannot judge reach, so the crossing reads available on its requirements alone.

## packages/navigation/src/crossings/collect-crossings.ts

- `collectCrossings` is THE producer of every way on or off one screen. Nothing is filtered out for being unusable: a crossing the player cannot take is emitted with `available: false` and the requirements it asks for.
- A caller holding the widget's own connections passes them. That is the only way intra room scrolls arrive, because deriving them needs the room's scroll boundary, which the flood result does not carry.
- Crossings are kept one per id: a door read from two tables is still one door.

## packages/navigation/src/crossings/crossings.type.ts

- CrossingScope is the screen a caller wants the crossings of. `roomIndex` is used indoors; `owScreenIndex` outdoors, in the unified 0x00 to 0x7F numbering.
- `connections` are the border connections of `flood`, derived from it when omitted. `items` are the traversal tokens the player holds, taken from the flood when omitted.
- CrossingPass is the scope plus everything derived from the flood once per pass. `dist` is walk steps per tile from the flood's start, the same measure the simulator orders exits by.
- CrossingParts is what a detector knows about a crossing before the pass fills the rest. `edgeSig` is the simulator's own signature for the crossing, which names the arrival.
- `screenWide` means the crossing describes the whole screen, not a spot on it: its tile is a placeholder and reachability says nothing about it.

## packages/navigation/src/crossings/layer-toggle.ts

- A TogglePosition is a tile whose door record is kDoorType_PlayerBgChange, in room grid coordinates.
- The toggle table holds the tiles a room loads for door type 22 (kDoorType_PlayerBgChange), which flip `link_is_on_lower_level` when walked over.
- A toggle counts for a boundary when it sits against that wall (within EDGE_THRESHOLD tiles) AND lands on the run of tiles the boundary occupies (within POSITION_SPREAD tiles along the wall). Crossing such a boundary flips the floor the player stands on.
- The run along a wall is measured in columns for north and south, rows for east and west.

## packages/navigation/src/crossings/make-crossing.ts

- Assembles one ScreenCrossing from what a detector found plus what the pass knows, so the walk distance, the arrival words and the availability verdict are derived the same way for a door, a stair, a hole and a border scroll.

## packages/navigation/src/crossings/place-tile/

- A Landing's `inward` is tiles toward the room's middle (negative is behind or outside the wall); `lateral` is tiles along the wall, either way. INWARD points toward the room's middle, away from the wall the door sits in.
- DOOR_REACH_RADIUS (14) is how far from a door record a walkable tile is still that door's landing. It matches `exitDoorAt`, which scans 14 deep, because notch depth and the record's own lateral offset vary that much between rooms.
- ASSUMED_DEPTH is how deep inside the wall a door's landing sits when the flood cannot say. The assumed landing goes straight inward from the record, so an unmeasurable door is never placed in the wall.
- `spawnCrossingTile` returns null when the spawn record itself lies outside the room. A spawn stores the sprite's TOP LEFT, so the tile under the feet is one column right and two rows down. That shift is clamped, never allowed to reject: a spawn on the last rows of the grid would otherwise lose its whole crossing.
- Landing ranking: a tile on the door's inward side beats one beside or behind the wall however much closer that lies, because otherwise a flooded padding tile one step the wrong way wins over the real floor four steps in. Within a side the tile nearest the door wins, then the one drifting least along the wall.
- `measuredLanding` ranks the WHOLE radius at once and is null when the flood touched nothing within reach.
- `matchDoorsToSpawns` scores every pair, then claims closest first, so no door and no spawn is used twice and the order the spawns arrive in cannot change the answer.

## packages/navigation/src/crossings/resolve-target/

- A room target carries the palace index because two rooms can share a number.
- An overworld screen index is ALREADY the unified 0x00 to 0x7F numbering: the game tests bit 0x40 of `overworld_screen_index` to decide which world it is in (core/zelda3/src/overworld.c:479) and masks it off only when it wants the position inside one world (:862). So there is no world argument and no offset.
- `noTarget` is a crossing that leads nowhere the dataset can name, such as a respawn point.

## packages/navigation/src/crossings/sources/edges.ts

- A room's internal scroll boundary runs between rows and columns 31 and 32 (INTRA_NEAR, INTRA_FAR).
- A span is the run of tiles the scroll occupies, and what each of them asks for.
- An intra room scroll physically sits on the quadrant boundary, not the screen border: `getConnections` derives one from the reachable pair at 31 and 32. Placing it at row 0 or 63 would put the marker about 31 tiles from the scroll the player stands on and read it as out of reach.
- Toggle floor tiles apply to rooms only; the surface has one floor.

## packages/navigation/src/crossings/sources/exit-table.ts

- Touched door spots are distinct PHYSICAL doors back outside that the flood TOUCHED. Several entrance ids can share one door, and an id whose transition never fired, or never passed the item gate, is not a way out the room has demonstrated.
- The exit table's own answer: every room it lists HAS a way back outside, even when the flood never touched a door. Room 0xe2's spawn sits at row 59 and its floor ends at row 55, so nothing else emits its way out and it would read as a dead end.
- The table names the destination without saying where the door is, so the crossing carries a placeholder tile and is screen wide (exempt from the reach test).

## packages/navigation/src/crossings/sources/indoor-doors/

- WARP_DOOR (0x46) is kDoorType_WarpRoomDoor: crossing it teleports to a header travel slot. A west warp door reads slot 3, an east one slot 4.
- A direction the bridge could not decode arrives as `north`, which no warp door is, so THAT door emits both slots instead of silently none, while the other doors in the room still resolve normally.
- FOLLOWER_DOOR (0x14) is kDoorType_ThroneRoom, a push wall that opens only with the follower in tow.
- A DoorwayCandidate's `nativeType` decides whether crossing it is gated.
- Own doorways are outer wall doorway records on this room's own table. Neighbour doorways are records held by a NEIGHBOUR, facing back into this room.
- The neighbour's own way out to the overworld shares the doorway encoding; mirroring one would invent a room to room link into solid wall, so those are skipped.
- One doorway per edge per neighbour REGION. Dropping the region qualifier collapses two north doorways into the same room at columns 10 and 50 into one, which is the ledge the sanctuary grounds lose when a wall's separate crossings are treated as interchangeable.
- Doorway crossings go through the outer walls and are validated against the destination.

## packages/navigation/src/crossings/sources/indoor-spawns.ts

- A SpawnRow's `layer` is the floor the row puts the player on: 0 upper, 1 lower. `doorArea` is the overworld area the row's door sits on, when it is a door at all; `holeArea` is the area a fall hole drops from, when the row is a hole.
- Spawn areas are the overworld sub screens each entrance row's door or pit physically stands on. A 2x2 area records its entrances on the HEAD screen, so the raw tables name the head for all four quarters. The enriched list resolves each row to the quarter it sits on, the same read the traversal graph makes, so both name one screen for one door.
- Spawn rows are entrance rows whose destination is this room, placed on their spawn tile.
- Exit door records are readable only for the room the game currently holds.
- Only the door rows compete for an exit door record, so a respawn never takes the door's tile.

## packages/navigation/src/crossings/sources/indoor-tables.ts

- THRONE_DOOR (0x14) is kDoorType_ThroneRoom, whose walk through boundary needs the follower in tow. A room whose door table carries it is gated while no follower is active.
- FOLLOWER_REQ is a token an ungated crossing never carries, so the gate reads as a need.

## packages/navigation/src/crossings/sources/outdoor-entrances.ts

- The doors into interiors and the pits that drop into a room both come off the same enriched table the flood seeds itself with.

## packages/navigation/src/entrance-icons/

A crossing's glyph follows the detector that produced it. A crossing to the surface shows
where it comes out, a crossing into another room shows what that room is. Stair links use
the exit door icon in gold, palace toggle walk boundaries use the secret door in purple,
and a door to a header travel slot uses the portal.

## packages/navigation/src/flood/annotate-screen.ts

- Derives ScreenAnnotations for one screen from the SAME game reads the simulator's discovery uses, so what the overlay draws is what the run acts on. Nothing here derives game facts again: doors (including cell locks), sprites with their key carrier markers, chests and room tags all arrive from the existing bridge queries.
- Ways on and off the screen are NOT annotations. Those are crossings (packages/navigation/src/crossings), with their own producer and renderer. This file only orchestrates; mapping per family lives in `annotate/`.
- Room header tags 0x01 to 0x13 are kill gates: the room's doors open when it is cleared (see sim kill triggers). The same range is KILL_GATE_TAG in packages/navigation/src/simulation/engine/discover.
- A chest is named by what it WILL yield: the vanilla duplicate rule swaps an already owned item for its alternate, so a save that owns the lamp must not be promised a Lamp when the run would deliver 5 Rupees. The item name IS the label, so the detail carries the slot instead (repeating the name renders "Lamp Lamp"); the slot tells two chests with the same item apart.
- A big chest is its own kind: it is gated on the big key, so it must not read as an ordinary available check.
- A big area's spawn table lists every screen's sprites, already resolved to their true screen, so one belonging to a neighbour is drawn when THAT screen is annotated.
- Reachability marking runs last: the flood decides what is touchable, so it must run after every family has contributed.
- Check progress is read off each annotation's own state. A second test once asked the completed set about the annotation's LABEL, which could never work: a chest's label is the item it yields, not a check's name. Whoever knows the check sets `state` (chests from the room's open bit, NPCs and standing items from the completed set by `checkId`), so the state is the whole answer.

## packages/navigation/src/flood/annotate/doors.ts

- One door record gives one annotation, for doors that are a LOCK or a GATE. A door that is a way through to somewhere else is a crossing instead, so it does not come through here.
- Doors that share a `kind` are told apart by their raw kDoorType (the throne push wall reads as 'normal'), and cell locks are not door table records at all.
- THRONE_DOOR (0x14) is kDoorType_ThroneRoom, the push wall that needs the follower in tow. `followerReady` means the follower is in tow, so it will open.
- `killGated` means the room's doors open by clearing it, so shutters there are the trap kind: they close behind the player and only reopen when the room is cleared.

## packages/navigation/src/flood/annotate/npc-checks.ts

- Names an NPC sprite as the CHECK it is. `npc 0x73` tells a reader nothing; the check's own name tells them what the run is standing next to. Sprite 0x73 spawns in two rooms and only one is a check, hence the room narrowing.
- `checkId` is the identity; `name` is for drawing only.
- It uses the SAME matcher the simulator triggers through. It once had its own copy of the rule, so when the simulator learned that a sprite type is not unique across the two worlds the widget would have gone on labelling the light world flute boy as the dark world stump, showing a check the run rightly refuses to take.

## packages/navigation/src/flood/annotate/reachability/

- Marks an annotation `blocked` when the flood cannot walk to it. The Secret Passage forced this: the uncle stands in the corridor, the flood stops at him as it should, but the chest behind him was still listed as an available check.
- A feature's own tile is often solid (a chest IS a wall tile, a door IS the doorway), so reachability is judged over the tiles AROUND it: if any tile within TOUCH (2) is reachable, the player can interact.
- Screen wide facts (the kill trigger) carry a placeholder tile (0,0) because they describe the whole room, so reachability says nothing about them. Judging them would label every kill gate room unreachable because tile 0,0 is a wall.
- PHYSICAL kinds' state means lock or physical position, not check progress. They keep their open or shut state (a shut door being unreachable is already implied) and gain an "unreachable" detail; checks flip to 'blocked' so the tally and the panel agree.

## packages/navigation/src/flood/annotate/sprites.ts

- One sprite gives one annotation. Key carriers come first (a lock's key, not scenery). A pull switch says which shutters it serves; the shutter is the reason the run walks to it.
- Sprite_PullSwitch_bounce covers sprite types 0x04 to 0x07. PRINCESS_SPRITE (0x76) is the captive princess NPC; the throne gate waits on this follower.
- `shutterCount` is the shutter doors in this room; a pull switch here opens them.
- The source note (overworld or room spawn) is not cosmetic: a sprite type is not unique across the two worlds (0x2e is both the flute boy and the stump), and only the overworld table's index (the screen) settles which it is.
- A standing item is named by what it hands over, not 'item'; the simulator resolves the same id to decide the pickup, so both agree. A standing item IS a check, resolved from the same flag the pickup writes. Without its id the marker had no identity and always read as available, whatever the run had already collected.

## packages/navigation/src/flood/area-seeds.ts

- Seed bookkeeping for a multi screen flood. `propagateArea` used to flood each screen EXACTLY ONCE with whatever seeds it held at that moment, then discard every crossing later discovered into it. A screen whose real way in is only found once a NEIGHBOUR has been flooded therefore kept the small extent of its first, partial seed set. That is why the first castle's four exterior quadrants each stopped at the first wall instead of joining up.
- Seeds accumulate here instead, deduplicated by tile, so a screen can be run again with everything known about it so far. The caller decides whether a new seed is worth another run (the reachability test in `propagateArea`).
- `add` returns false when that exact tile was already known. `list` returns every seed the screen has been handed so far, in arrival order.

## packages/navigation/src/flood/blockers/

- Solid sprite blockers are the sprites that stop the BFS: tutorial guards 0x3F, barriers 0x40, the uncle 0x73, and 0x57. Everything else is walked through. Each stamps a 3x3 footprint so it seals a narrow passage without a diagonal gap.
- 0x57 is the pair of statues flanking the sealed door in the south west desert. The ground under them reads as plain floor, so without them a sealed dungeon reads as open. Their removal (altar use, needs a later item) is NOT modelled yet, so they block for the whole run; revisit when the altar trigger exists.
- The castle soldier family (0x41 to 0x4B) is deliberately NOT a blocker: they patrol, so stamping a 3x3 block at a spawn they have left sealed both southern castle quadrants down to a quarter of their walkable area. A guard that blocks is a STATIONARY one (0x3F, health 255), caught by the live sprite pass.
- The addressable spawn table is the general source; live reads only describe the loaded screen and refine it.
- UNCLE_CHECK_ROOM (0x55) is the room the uncle's check lives in. Sprite 0x73 spawns in two rooms and only one is a check. The uncle vanishes once his check is collected. That is asked by SPRITE ID, never by name: the check table owns the name, and `npcCheckFor` is the same matcher the simulator triggers through.
- Overworld blockers come from the progress aware spawn table so remote screens work too. A multi screen area returns the WHOLE area's spawns measured from its head screen, so each spawn is resolved to the screen it stands on; clipping instead silently drops blockers.
- The occupied screen ALSO reads live sprite positions: the spawn table only says where a sprite STARTED, and a patrolling guard blocks where it stands now. This is additive, not a replacement, so a stationary guard is stamped twice (harmless) and the other sub screens of a big area keep their coverage.
- Indoors the uncle is stamped as wall into EVERY layer (the raw grid aliases layer 0, so a dual layer room would flood through him on layer 1). The loaded room uses his LIVE position (he walks); other rooms use his spawn.

## packages/navigation/src/flood/bombed-walls/

- Walls the run has blown open. `Bomb_CheckForDestructibles` (dungeon.c:5170) is the ground truth: an interior attr of `0xF0 | j` marks "destructible door slot `j` is here", opened when that slot's type masks to 0x28, 0x2A or 0x2E. The attr appears on BOTH faces of the wall (the village well has 0xF0 at rows 37 to 38 and 0xF8 at rows 27 to 28, eight rows of wall between).
- A blast radius is the wrong model: it leaves the wall's interior solid. A blast PIERCES a corridor the marker's width straight through to the floor on the far side. The carve is conservative: plain wall and door markers only, one axis, the marker's width, and only if it reaches open floor within MAX_WALL_DEPTH (16); deeper is rock, not a wall, and a tunnel that never surfaces is discarded.
- WALL_ATTRS are the attrs a blast may consume: plain interior wall in its two flavours (0x01, 0x04), plus another marker.
- A marker sits on one face, so both ends of each axis are pierced. The marker patch is the contiguous 4 connected run of marker cells the blast landed on.
- This is simulator side state, not a game write: a real bomb's tilemap swap has no addressable equivalent. The widget reads the same registry so both agree. Bombs are permanent once obtained; no count is kept.
- Blast seeds are kept per room and carved at stamp time, because the carve needs the grids. Opened cells are kept so `isBombed` answers after the fact. Every recorded blast is opened in every layer on the way out of a grid build.
- The registry is cleared between runs so one run's blasts never leak into the next.

## packages/navigation/src/flood/flood-options.ts

- The one place FloodFillOptions gets assembled. Five call sites used to build it by hand and no two passed the same set. The engine's own flood omitted entrances, the exit screen map, blockers AND the start layer, while the offline dumper hard coded an interior context and an EMPTY inventory. Same core BFS, four different answers.
- Everything the BFS can use is filled in by default; a caller that wants less must say so in the FloodRequest, which makes an omission a visible decision.
- FloodRequest fields: `items` are the traversal tokens the player holds (lift.N, boots, flippers, hookshot, hammer). An omitted `startPos` lets the BFS pick a start. `atPlayer` is true when startPos is the player's real position in the loaded screen. `entrances: []` floods geometry only. `extraSeeds` are extra BFS seeds (propagating in from an adjacent screen, ledge landings). `quadrantBounds` restricts the BFS to a sub region (a 2x2 room's quadrant).
- `grids` must come from getScreenGrids so the blocker stamping and tile context are already correct.
- Indoor blockers are stamped into the grids themselves (packages/navigation/src/flood/blockers); outdoors they stay dynamic so the overlay can tell them apart.

## packages/navigation/src/flood/overworld-entrances/

- THE overworld entrance list: every door and pit on the surface, each on the 64 by 64 tile grid of the sub screen it physically sits on.
- Merged fall hole ids start at FALL_HOLE_ID_BASE (200), so a hole never collides with a door id.
- A fall hole's recorded row is offset by minus 8 (FALL_HOLE_ROW_OFFSET), which is added back here.
- A 2x2 group records its entrances on the HEAD area, in 128 by 128 coordinates; SUB_SCREEN (64) splits those into the four quarters.

## packages/navigation/src/flood/room-entrances/room-entrances.ts

- THE indoor entrance list: every way into `roomId`, at the tile the player arrives on. The widget and the simulator each built this separately. The widget refined an overworld door entrance's tile to the real door opening but had no follower gate and could only read the LIVE room; the simulator gated on the follower and could address any room but placed those entrances on the raw spawn tile. Both halves live here now, so a seed list is the same list whoever asks.
- THRONE_DOOR (0x14) is kDoorType_ThroneRoom, whose walk through boundary needs the follower in tow. The throne room's push wall opens only with the follower, so rooms whose door table carries a ThroneRoom record gate their boundaries on the follower.
- STAIR_ID_BASE (1000) and BOUNDARY_ID_BASE (2000) are synthetic id bases, so a seed's origin is readable from its id.
- An exit door's walkable tile: the door RECORD sits in the wall and the player stands a few tiles inside it, how far depends on the wall (DOOR_LANDING_OFFSET).
- Each spawn claims the nearest unused exit door, so two spawns never claim one door.
- Exit door refinement only applies to the loaded room (the door table is a live read); other rooms fall back to the raw spawn tile. An entrance that leads back outside arrives at its door, not its spawn.
- Inter room stairs and walk through boundaries can be read for any room: the loaded room reads its live tables, any other room rebuilds its own.
- When the entrance spawn or room tables are unavailable the whole list is empty.

## packages/navigation/src/flood/screen-grids.ts

- THE grid source for every flood (widget, simulator, offline dumper). Acquisition varies by LOCATION, not by caller: the occupied room has live tables (runtime door state, staircase kind, tile context); any other room is rebuilt from ROM data by address.
- Blocker footprints are stamped here into every layer so no consumer can forget them (see packages/navigation/src/flood/blockers).
- The occupied room is READ from the live tables. A rebuild throws away runtime state (opened doorway transit tiles, a lifted pot, a pushed block), so the live room must never be rebuilt. Whether the room is live is settled before any read, because it picks where every grid comes from.
- Remote rooms build BOTH layers by address. Split level rooms (the castle basements) keep their walkable floor on BG1 and would flood as solid otherwise.
- The dual layer flood reads the layer grids, not rawAttrGrid, so every grid is stamped. Walls the run has already blown open read as floor from then on.

## packages/navigation/src/flood/screen-id.ts

- The canonical screen id for an OVERWORLD screen index, such as `lw-2c` or `dw-2c`.
- Overworld only, on purpose. An indoor screen id is not derivable from the room number (indoor ids are keyed by `palaceIndex:roomIndex` and look like `hc-0x80`), so a synthesized `room-080` matches nothing in SCREEN_BY_ID, which silently cost the widget every indoor exit. Indoor callers must use the DETECTED screen's own id.

## packages/navigation/src/flood/start-layer.ts

- Which background layer a flood starts on. This was derived in different ways: the widget and dumper trusted the live `wasmGetLinkLayer()`, the simulator ran a stair, door and floor heuristic, and the engine's own flood derived it not at all, silently falling back to layer 0. In a split level room that made the flood gating every chest, door and NPC target start on the wrong layer while the exit flood started on the right one.
- One rule, most authoritative signal first: (1) the live layer bit, when the flood starts where the player stands in the loaded room; (2) arrival ON an inter room stair, which deposits the player on their own layer; (3) arrival through a door, where position slots 6 to 11 are the lower page and the game keeps the player's level bit across a door transition; (4) only layer 1 has floor near the landing (a BG1 border strip).
- DOOR_NEAR (8) is how far from the start tile a door still counts as the one the player came through.

## packages/navigation/src/flood/world-origin/

- Screen and room world pixel origins. Both formulas were derived again in eight places and disagreed in one: within a single widget run the grid origin came from the player's live position while the entrance origin came from the screen index, so they only matched while the game stood in the screen being flooded. Deriving both from the index makes them agree for remote screens too.
- The overworld has 8 screens per row, indoor rooms 16 per row, each 512 px square. Tiles are 8 px.
- A spawn records the player sprite's TOP LEFT, so the tile under his feet is one column right and two rows down (his hitbox is the bottom 2x2 of the 16x24 sprite). The widget applied this offset and the dumper did not, so the same fall hole was reported on two different tiles.
- `screenOriginFor` is the ONE place that decides "indoors, use the page the player stands on; outdoors, use the screen index". Five call sites used to derive this inline (the dumper, the sim run flag, the observation builder, the overlay draw context and the tile inspector). A drifted origin silently draws every marker on the wrong screen.

## packages/navigation/src/pathfinding/analysis/

The analysis pass that fills the `nav` fields of the dataset.

- `findBorderBundles`: a bundle is a contiguous run of fully reachable tiles (state 1) on one border. A cliff that splits a border into two gaps gives two bundles. The id reads `lw-{screen:hex}-edge-{dir}-{index}`; `requirements` is left empty for the requirement detector.
- `buildWalkConnection`: only border positions present on both sides (the overlap) are real crossing points.
- `buildConnectionNav` derives a connection's nav data from its live flood crossing and its tags. Tags give the transit type and direction; the crossing gives tile geometry and requirements. A walk records its corridor as `overlapTiles`; a door, hole or stair records its entry as `fromPoint` (tiles and grid position). Flood requirements collapse into one AND group. A connection with no crossing tiles is marked invalid.
- `buildConnectionNavUpdates` writes nav data for every connection by id. A transit tag missing from the table counts as a door, and no transit tag at all means a walk.
- `resolveEntrances` maps the WASM entrance table (`wasmGetOverworldEntrances`, `wasmGetExitScreenMap`) to connection points. Screen index 0x40 and up is the dark world. A door has no border tiles and no requirement to reach it. When the room's exit leads to another screen than the entrance's own, the entrance is a passage and is marked one way (enter).
- `runGlobalFlood` floods every screen twice, with no items and with every item, for the free and maximum reachable counts.
- `detectRequirements` floods with growing item sets (`INVENTORY_PROGRESSION`) and records the first set that reaches each target. A target unreached even with every item also gets an empty requirement set, the same value as a target that needs nothing.
- `buildScreenNavUpdates` lists obstacles from the flood's requirement grid by attribute: 0x50 to 0x57 light rocks (lift 1), 0x58 to 0x5F dark rocks (lift 2), 0x44 to 0x47 bushes, 0x4A and 0x4B hammer pegs, 0x66 deep water, 0x62 and 0x63 bombable walls, 0x6C spike floor. Features are left empty; they need deeper analysis.

## packages/navigation/src/pathfinding/core/

- `DIRECTIONS` is north, south, west, east, in that order. The walk visits neighbours in this order, so the order is part of the result.
- `getAdjacentScreen`: an overworld screen index holds the column in bits 0 to 2 and the row in bits 3 to 5 of an 8 by 8 world, and bit 0x40 marks the dark world. A step off the world's edge gives null.
- `has2TileClearance`: Link's body is 2 tiles wide, so a move needs a passable tile beside the target on the axis across the move.
- `PriorityQueue` is a binary min heap, used by the A* and Dijkstra searches.

## packages/navigation/src/pathfinding/core/bfs-engine.ts

The walk moves Link's 2 by 2 body, keyed by its top left tile, on one or two floors. The layer strategy decides each step.

- A body position reached again is kept only when it now needs fewer requirements. A step that keeps the same requirement set goes to the front of the queue and one that adds a requirement to the back, so item free ground is explored first.
- Every body tile on the bounds' edge records a border transition, once per edge position.
- An entrance counts as reached when the body's centre (top left plus 1 on each axis) comes within 3 tiles before and 5 tiles after the entrance tile on both axes (`ENTRANCE_REACH`).
- Extra seeds (from neighbouring screens, or a ledge landing) start on the start layer, each with the requirements its body tiles need.

## packages/navigation/src/pathfinding/core/inventory.ts

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

## packages/navigation/src/pathfinding/flood-fill/

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

## packages/navigation/src/pathfinding/flood-fill/connections.ts

- An intra room edge is a scroll seam inside one room, between rows 31 and 32 or columns 31 and 32 (`SCROLL_SEAM`). The walk makes no transitions there, so the seam is read straight off the reachable grid. Naming one side of a seam implies the other.
- Indoor rooms sit on a 16 wide grid of 20 rows (`ROOM_GRID`), so the room north is the index minus 16.
- Border tiles split into contiguous runs, so a blocked gap gives separate connections. Each run carries every item requirement seen on that border.
- `usableEntranceTransition`: reaching an entrance is not enough. The tile it sits on may still need an item the player lacks (a staircase under a rock that needs the glove is flooded and visible, but not usable). Every caller that lists entrances (widget, minimaps, overlay) goes through this test so none advertises an entrance the flood considers unusable.

## packages/navigation/src/pathfinding/flood-fill/screen-prep/collect-void-seeds.ts

Only wide open boundary spans seed the void flood. A walkable exit corridor reaches the grid edge as a narrow gap flanked by wall (standard dungeon doorways are 4 tiles wide; anything up to `DOORWAY_MAX_WIDTH`, 6, counts). Seeding from it would walk up the corridor and wipe the room's real floor, as room 0x72's lower floor did through its open south passage. A run that ends at a grid corner has no flank on that side and is never a doorway.

## packages/navigation/src/pathfinding/flood-fill/upper-void.ts

Upper layer 0x00 that is only the lower floor showing through. A raised surface has to be supported: somewhere along it, it sits over lower layer structure. A connected run of upper 0x00 that is open on the lower layer at every tile is no surface; it is the gap beside a walkway. Boundary flooding cannot find these, since the walkway's own edges enclose them.

Room 0x62 forced it. A bridge splits its upper layer into three open regions: the deck (supported, over lower structure) and the gaps either side (supported nowhere). Treating the gaps as floor let the walk reach the deck's ledge edge from the wrong side and hop onto a surface the two never share, which drew a column of phantom jump arrows down the room.

The result is a mask, not a rewritten grid. Stamping the gaps as 0x01 would make them `CLIFF_WALL`, and cliff preprocessing walks wall runs to find a landing, so a gap turned to wall extends the cliff beside it and invents hops dozens of tiles long. A lower layer with no structure at all supports nothing, so the mask stays empty then.

## packages/navigation/src/pathfinding/link-start-tile.ts

Link's flood start tile is the tile of his 16 by 16 collision hitbox nearest its centre. The hitbox is the lower half of the sprite: the head is skipped and it starts 8 pixels below the sprite's top. This matches the overlay's debug footprint.

## packages/navigation/src/pathfinding/screen-data/cliff-preprocessing/

- Straight cliffs: 0x28 to 0x2B are the trigger tiles. Outdoors they jump north, south, west and east in that order. Indoors their direction comes from `indoor-ledge-dirs`, and only 0x2F has a fixed direction (west). Indoors 0x04 counts as wall (it is thick grass outdoors).
- Indoors a trigger is a real jump only when a neighbour across the jump axis infers the same direction and is standable itself: its approach tile, one step back against the jump, is not wall. Link's body is 2 tiles wide. Outdoors a trigger needs a trigger or wall tile beside it across the axis instead.
- A jump runs from the trigger through the wall run behind it; every tile on the way becomes a ledge.
- Diagonal cliffs mirror the game's own search, and every constant is transcribed from the decompilation; inferring them gave wrong answers. In `tile_detect.c`, 0x2C and 0x2E share one bucket (`Ledge_NorthDiagonal`) and 0x2D and 0x2F another: the tile decides north or south and nothing more. In `player.c`, the sideways half comes from which corner of the body touched the trigger, that is the side walked in from.
- `findDiagonalLanding` is `LinkHop_FindLandingSpotDiagonallyDown` in tile space: x moves 8 pixels and y 9 per step, without bound in the game, until the landing test passes. That test samples three points on one row (x+0 bit 1, x+8 bit 2, x+15 bit 4, at y+8; `kDetectTiles_tab0` to `tab3`) and needs mask 6 going west or 3 going east, the trailing side of the hop (`kLink_Ledge_Func1_bits`). The 64 step cap is ours: leaving the screen ends the search.
- Landable ground is normal tiles, destruction aftermath, thick grass and deep water (landing in water starts a swim), never the cliff. Standable ground for the take off also counts any 0x28 to 0x2F trigger, since walking onto one is how it fires. Any footing needs a 2 by 2 patch.
- A hop has to clear something: landing on the very first step means no face was in the way, so it is no jump. That case once put a stray diagonal on the corner tile where a straight cliff meets a diagonal one.
- The tile does not say which side Link came from, so both are tried. Footing on open ground beats footing that is only more cliff; with equal footing the shorter hop wins, because a hop across a face lands in a step or two and a hop along it travels its whole length.
- South cliffs: only a south facing border tile (0x10, 0x18) with walkable ground above seeds a south run. Only 0x28 to 0x2F trigger a jump in the game; a cliff face is scenery the arc passes over. Seeding from a diagonal trigger or the west face 0x1A re-emitted tiles the diagonal pass had already claimed as straight drops.

## packages/navigation/src/pathfinding/screen-data/indoor-ledge-dirs.ts

Indoor straight ledge triggers (0x28 and 0x29 vertical, 0x2A and 0x2B horizontal) have no fixed direction; they jump toward the adjacent wall face. A wall on one side only decides it. Otherwise the walls up to 3 tiles out on each side are counted (`WALL_SEARCH_RANGE`) and the side with more wins; a tie goes east or south. The map is keyed by `row * GRID_SIZE + col` and changes no grid, so a caller can compare neighbours' directions (Link's 2 wide body needs a same direction pair).

## packages/navigation/src/pathfinding/strategies/

The BFS engine asks a layer strategy how the body moves. `SingleLayerStrategy` serves the overworld, single floor rooms and rooms whose stairs lock the floor (staircase type 2). `DualLayerStrategy` serves indoor rooms with layer swap stairs and ledges between floors.

- `getNewTiles` is the two tiles the body's leading edge steps onto: the new top row going north, bottom row going south, left column going west, right column going east.
- `enterTiles` checks those tiles and returns the requirement set after the step, or null when the step is blocked. It returns the same set object when nothing was added; the engine relies on that identity to queue the step at the front.
- A ledge tile can be left only in its jump direction; a diagonal ledge allows either of its two axes.

## packages/navigation/src/pathfinding/strategies/dual-layer-build-result.ts

- Tiles under a swap stair on either layer are left out of the body to tile merge; traversed stair tiles are then marked on the floor the stair leads to, and traversed ledge tiles on layer 0.
- Where both floors reach a tile, the one with fewer requirements wins.

## packages/navigation/src/pathfinding/strategies/dual-layer.ts

- Layer 0 is the upper floor, layer 1 the lower floor. Ledges exist only on layer 0 and drop to layer 1.
- A ledge cross needs the whole 2 wide leading edge on ledge tiles that point the step's way, since a 1 wide ledge cannot carry the 2 by 2 body. Checking the whole body at the entry spot is wrong: it straddles the trigger line and the approach floor, which matches only when the band is 2 or more deep (south fans), and 1 deep north, east and west trigger lines must still fire.
- A ledge drops Link just past the cliff face. After the body clears the ledge tiles, at most 4 landing spots are tried (`MAX_LAND_ATTEMPTS`). Without the cap, a blocked first tile sends the search along the ray until it finds any landable tile, joining two areas across whatever lies between them.
- A landed ledge returns the landing so the flood continues below. Recording the traversed ledge tiles only draws the overlay arrow.
- Swap stairs (attributes 0x1E, 0x1F, 0x3E, 0x3F) are checked on both layers. A swap stair blocks a normal same floor step and can be entered only moving north or south. The stair deposits Link at its end; if the body cannot stand within 4 steps of the band, the cross fails. An unbounded scan would carry the flood across sealed regions (room 0x71's locked corridor seam lies about 17 rows away).
- The door passage bridge: a door threshold belongs to its door's floor, and the game's door transit puts Link on that floor. When a step fails on this floor and every new tile is a door passage on the other floor, the walk continues there. Without it the lower floor doors (the sewers' BG1 corridors, the sanctuary's back door) cannot be reached from an upper floor approach. It is only a fallback: firing it beside a step that already worked claimed the doorway on both floors whenever both stamp the passage attribute. Room 0x62's west door reads 0x85 on both layers, but on the upper floor those tiles are ringed by solid wall, so that copy was a phantom.

## packages/navigation/src/pathfinding/strategies/ledge-crossings.ts

The ledge hops a dual layer walk landed, one entry per tile. This is not cliff preprocessing's wall run guess, which only walks layer 0 and cannot see where the drop ends. Nor is it one entry per body position: Link is 2 tiles wide, so an N tile ledge offers N minus 1 places to stand, and recording per body left the last tile of every ledge without an arrow and halved a 2 tile gap to one. A 1 tile gap records nothing, which is right, since the player cannot jump from it. `dr` gives the hop's axis: a vertical hop spans two columns, a horizontal one two rows.

## packages/navigation/src/pathfinding/tile-classification/

`classifyTile` joins five facts about one tile, each from its own source and none derived from another: behavior and visual (native tables keyed by attribute and indoors), room context (plain values from the caller), collision (`classifyTileAttr`) and interactable identity (a live side table lookup). `packages/game-data` never touches WASM, React, the DOM or Node, so live state always arrives as parameters.

- `RoomContext.indoors` is the only field any tile lookup keys on, and it is the engine's whole tile dispatch context (`core/zelda3/src/tile_detect.c` takes one bool). The rest is descriptive and read only by the tooltip.
- `palaceIndex` is `cur_palace_index_x2 >> 1`. The game stores the index doubled and uses 0xFF for "not in a dungeon" (`NOT_IN_PALACE_X2`); `resolveRoomContext` is the one place that sentinel becomes null.
- `roomTypeLabel` is display wording only. It never invents a room kind the game lacks; there is no cave or house distinction because the game has no such field.
- `resolveInteractable`: three attribute families point at a room local slot. Doors and manipulable tiles keep the slot in the low nibble (`SLOT_MASK`); chests use `attr - 0x58`. The tile's real identity lives in the live side table the caller passes in (door table, `replacement_tile_state`, chest locations), never in the attribute byte. When the family matches but the table has no record for the slot, the tile stays unresolved; guessing is the bug this exists to avoid. `source` records which table answered.
- A manipulable tile's kind is its `replacement_tile_state` entry masked with 0xF0F0, looked up in `MANIPULABLE_NAMES`. A chest location at or above 0x8000 is a shut chest.
- `TileClassification.interactable` is absent when no side table resolved the tile, and that absence is a real answer.

## packages/navigation/src/recommendations/compare/compare-field.ts

Compares one field probe against one record. It stays silent when the probe does not apply, when the table was not read (an unread table proves nothing either way), or when the values agree. `classify` sees presence after `isAbsent` has normalised absent values, so a `false` there means that side has nothing.

## packages/navigation/src/recommendations/compare/compare-set.ts

Joins a live collection against its dataset counterpart by key, through one `SetProbe`. An unread live side yields no differences: not read does not mean empty. A live item whose evidence cannot become a valid record (a crossing whose destination has no screen) is reported as `unresolvable` and keeps its item for the strategy's mapper. Only a `removable` probe reports dataset records the live read did not match, because a flood backed set only proves what is reachable, never that a record is gone.

## packages/navigation/src/recommendations/compare/deep-equal.ts

Structural equality between a probe's live value and the record's current value. `undefined`, `null` and a missing key all compare equal: a record that never declared a field, one that set it to `undefined` and one that set it to `null` all mean nothing here, so none reads as a difference against the others.

## packages/navigation/src/recommendations/compare/detector-from-strategy.ts

Turns one `ComparisonStrategy` into a `RecommendationDetector`, so the registry never knows a detector was built from a strategy. It emits one draft per differing field path, not one draft for the whole record: a reviewer accepts "fix the room index" apart from "fix the palace index" even when both come from the same stale record, and a batch accept over `certain` findings would otherwise swallow a `likely` one in the same draft.

- A reason is scanned, not read: it states the field and the two sides. The full pair is repeated in the evidence line for the record view.
- A delete proposes the record itself. Nothing replaces a deletion, and the action is the change.

## packages/navigation/src/recommendations/compare/detector-from-strategy.type.ts

A strategy supplies an `UnresolvableMapper` when it wants an `unresolvable` set finding surfaced; by default such a finding is dropped. It returns the bare `DraftRecommendation` union, not `DraftRecommendation<K>`, because the connection strategy's mapper proposes a `screen` record for an uncatalogued crossing destination, a different kind from the `connection` strategy that found it. Crossing that boundary is what the mapper is for.

## packages/navigation/src/recommendations/compare/difference.type.ts

What the engine hands back: the outcome of checking a probe against the live game, before it becomes a recommendation. A probe describes how to look and a difference describes what was found. A strategy author writes probes; only the engine builds differences.

- `mismatch`: both sides hold a value and they disagree.
- `missing-in-dataset`: the game reports something the record does not hold.
- `unbacked-in-dataset`: the record holds something the game does not confirm. For a set it comes only from a `removable` probe. For a field it means the live read came back `known(undefined)` while the record holds a value.
- `unresolvable` (sets only): a live item with no dataset match and no way to propose one, because `toProposed` returned null (a crossing whose destination has no screen of its own). It carries the live `item` so a strategy's `onUnresolvable` mapper can act on it. The connection strategy's mapper reads a crossing's raw destination index from it to propose the missing screen, without parsing one out of `key`.
- `SubjectComparison` is one record plus everything the game disagrees with about it. `Difference.shown` holds both values already formatted.

## packages/navigation/src/recommendations/compare/diffs-by-record.ts

Every live field difference across all registered strategies, keyed by record id and then by field path, so a caller with a record id can look its differences up directly. Only field probes feed it. A set difference describes a whole record that is missing or unbacked, so it has no path to key by and no row to bracket. `detector-from-strategy.ts` turns those into their own create and delete recommendations.

## packages/navigation/src/recommendations/compare/probe-reading/

- `known` means the table was read and the value may be absent. `known(undefined)` means "we looked and there is nothing", as authoritative as `known(5)` meaning "we looked and it is 5". A record that claims a value the live read returns `known(undefined)` for is a real `unbacked-in-dataset` finding: the game was checked and disagrees. A record compared against `unread()` gets no finding, because nothing was checked. Mixing the two up either invents findings for a screen whose tables were never read or drops a real one.
- `known` folds a live `null` to `undefined`, since both mean nothing here.
- `unread` is silence, not a negative answer.

## packages/navigation/src/recommendations/compare/probe.type.ts

A probe reads one live value or one live set. A strategy bundles the probes for one entity kind and only declares what to read; `compare-field.ts`, `run-comparison.ts` and `compare-set.ts` own the walk, the classification and the formatting once, for every kind.

- `Probe` with `known: false` means the backing table was not read this pass: silence, never a negative answer. `known(undefined)` is a different thing (see `packages/navigation/src/recommendations/compare/probe-reading`).
- `FieldProbe.read` gets the observations and the record because some fields only make sense given what the record already claims (an entrance only field on a non entrance screen). `applies` gates that.
- `FieldProbe.path` uses the diff path grammar, such as `gameId.roomIndex` or `tags[2]`. `source` names where the live value came from, such as `native:room-identity`.
- `SetProbe` compares a whole collection, such as every edge leaving a screen. Live items and dataset records are matched by key, not by position, because nothing orders both sides the same way. Every function receives the current `screenId` so a crossing probe can tell which end of a `ConnectionRecord` is here. `noun` is the singular noun used in a finding's key and reason, such as `edge` or `chest`.
- `SetProbe.removable` is true only for an enumerable native table. The flood proves presence only, so a flood backed set never proposes a delete.
- `SetProbe.removalConfidence` grades an `unbacked-in-dataset` finding when a removal deserves a different grade from an addition. A delete proves an absence, and that proof is only as strong as the enumeration behind it. A probe whose live read can miss a crossing keeps its deletes below `certain`, so a gap in the enumeration is never batch writable.
- `ComparisonStrategy.sets` types each probe's item as `any`. One strategy holds probes for different collections with different item shapes, and `SetProbe<K, unknown>` makes `liveKey` and `toProposed` uncallable without an unsound cast. The `any` stays contained: nothing in the engine inspects an item beyond passing it to the same probe's own functions.

## packages/navigation/src/recommendations/compare/record-path/

Get and set over the path grammar the diff produces: dotted keys and bracketed array indices (`gameId.roomIndex`, `tags[2]`). Tessera's data engine (`@drizztdourden08/tessera/data`, the schema path helpers) uses a dot numeric grammar (`items.0.name`) and lives where `packages/` may never import from, so this is a small local parser that behaves the same way. `getPath` never throws. `setPath` clones every container along the path and creates missing ones, leaving the input untouched. `SEGMENT_PATTERN` matches one dotted key run or one bracketed index, in path order.

## packages/navigation/src/recommendations/compare/run-comparison.ts

The field half of the engine; `compare-set.ts` is the collection half. For every subject record, each probe stays silent or yields one `Difference`. It never decides what to do about a difference: `detector-from-strategy.ts` turns differences into drafts.

## packages/navigation/src/recommendations/compare/strategy-registry/

The registry of comparison strategies, shaped like the detector registry: one kind, one strategy. Adding a kind is one registration and no edit in the consumers that walk kinds. Registering a kind again replaces it, so a host can override a built in strategy. `clearStrategies` gives tests a clean registry.

The map holds `ComparisonStrategy<EntityKind>` behind a cast in `registerStrategy`. A `FieldProbe`'s `read` and `applies` take the record in a contravariant position, which makes `K` invariant, so `ComparisonStrategy<'screen'>` is not a subtype of `ComparisonStrategy<EntityKind>` and a direct cast fails the overlap check. Every strategy is checked against its own `K` when registered, so the stored values were sound at that point.

## packages/navigation/src/recommendations/compare/value-format/

- `hex2` and `hex4` print `0x` and 2 or 4 uppercase hex digits, or `-` for anything that is not a finite number.
- `defaultFormat` is the formatter for a probe without its own `format`: `-` for nothing, a primitive as is, JSON for anything structured. It is good enough for a reason string.

## packages/navigation/src/recommendations/detection-types/detection.type.ts

What a detector may look at. Everything is plain data: no React, no `window`, no module handles, no wasm calls, so a test can call a detector with an object literal. Reading the game is the caller's job. The observation types are declared structurally and not imported from the renderer, so its `RealTransition` and `DetectedConnection` pass straight in and `packages/` never reaches into `@app/*`.

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
- `isDarkWorld` is a native flag (`packages/game-core/src/ui-bridge-parser`), read alongside `isIndoors` and never absent. Every `ScreenRecord` needs a `world`, so a strategy proposing a new record has a provable answer and does not guess `light`.
- `walkBoundaries` are the room's inter room walk through boundaries (`wasmGetRoomWalkBoundaries`). They are enumerable, so an indoor `kind: 'edge'` connection can be judged for removal against them, unlike an outdoor scroll edge the flood alone can never disprove. Outdoors there is no such table.
- `doorBoundaries` are the room's door tiles (`wasmGetRoomDoorBoundaryTiles`), the second half of "this room's exits were enumerated" beside `walkBoundaries`.
- `RecommendationDetector.id` is stable and part of every id the detector mints.

## packages/navigation/src/recommendations/diff/changed-paths.ts

The structural difference between the stored record and the proposed one. A line diff over serialized records answers the wrong question: reordered keys read as a change, and a deep change reads as a change to whichever line holds the brace. Walking both objects reports each differing leaf at its real path, which is what a reviewer wants and what `linesForPaths` needs.

- Paths use `a.b` for a member and `a[0]` for an element, bare at the root (`child-path.ts`).
- An absent key and a key set to `undefined` mean the same thing in every record shape here. A connection with `nav: undefined` has no nav data, like one that never declared the field, so neither counts as a difference.
- A subtree present on one side only is compared against an empty container of the same shape and reports its leaves, not itself. A `create` diffs against nothing, and a root level change would give the comparison view a path it cannot map to a line.
- A shape change (an object became a scalar, an array became an object) is reported at its own path and not walked into: the whole subtree changed.
- An empty result means the records are structurally identical, whatever their serializations look like.

## packages/navigation/src/recommendations/diff/lines-for-paths.ts

Gives the 1-based lines those paths sit on in a serialized record, JSON or the record emitter's TS output. A path the source does not declare falls back to its nearest declared ancestor: a value the proposal removed has no line of its own, so the object that held it is the honest answer. Lines come back sorted and deduplicated, since several changed paths often share one line.

## packages/navigation/src/recommendations/id/

A recommendation id is derived from what the finding is about. A counter would mint a new id on every pass, so the same finding would pile up as a new row each time the player walked back onto a screen, and a dismissal would be forgotten once the finding was seen again. A content id makes a repeat detection land on the entry the first pass made, and the decision recorded on it still applies.

The input is the finding's identity, never its payload. The proposed record is left out because nav data from the live flood shifts as the player moves.

- `fnv1a` is 32-bit FNV-1a. It is not a security hash. It is stable across runs and processes, so a persisted id still matches after a restart, and cheap enough to run per finding per pass. `Math.imul` keeps the multiply in 32-bit integer space, which a plain `*` would not.
- `identityOf` joins the identity parts in a fixed order through `JSON.stringify`, with no separator character. A separator can appear inside a detector name or a field path, and two findings whose parts joined to the same string would share an id and swallow each other. Quoting removes that class of collision.
- `key` carries what `targetId` and `screenId` do not: a `create` has no target, so without it every connection proposed from one screen would collide.
- `recommendationId` has the form `rec-<kind>-<action>-<hash>`. The readable head keeps a persisted file easy to skim.

## packages/navigation/src/recommendations/path-lines.ts

Maps every path in a serialized record to the line it is written on, so the comparison view can highlight what the diff found. It is a character scanner and not a set of per line regexes: the record emitter writes unquoted keys, single quotes, trailing commas and several fields per line, JSON writes none of those, and a `{` inside a string is not a container.

- A container records the line its key sits on, not its closing brace.
- `pendingPath` is the member path the next `{` or `[` opens, set when its `key:` is read.
- An array element that is itself a container has no key, so it takes the next index of the array it sits in.
- A scalar array element is claimed by the first non space character after the opening bracket or the previous comma. The rest of the element is consumed so one value claims exactly one index.
- `keyBefore` returns null when nothing key shaped precedes the colon, and that colon is ignored. No segment is made up.
- `Frame.index` is the next array index to assign; objects do not use it.

## packages/navigation/src/recommendations/reconcile/

Folds a fresh detection pass into what the store holds. Three rules let it run on every screen change without piling up:

1. A finding that reproduces lands on its existing entry: same content, same id, updated in place.
2. An `open` finding that no longer reproduces becomes `resolved`. The dataset was fixed, or the game now says something else.
3. A decision is final. `accepted` and `dismissed` are the only states a person sets, and neither a repeat detection nor a disappearance moves them. Without this a dismissed finding would come back the next time the player walked onto the screen.

A `resolved` entry is not a decision, so it reopens if the finding comes back. On a match the entry keeps its id and its first seen time. The rest comes from the new draft, so an improved reason or proposed record shows through.

- `ReconcileOptions.inScope` picks which stored entries the pass may resolve. A pass covers one screen through a known set of detectors and says nothing about anything else, so without a scope every entry about another screen would read as no longer reproducing and be resolved. The default is everything, which is correct only for a pass that rebuilt the whole collection.
- `ReconcileOptions.now` is injectable so a test can check `decidedAt` without freezing the clock.
- `scopedToPass` is the usual scope: entries owned by this run's detectors, for the screen this run looked at. Any other entry is left as it was.

## packages/navigation/src/recommendations/registry/

The detector registry, the same Strategy registry the field kits use: a new way of noticing the dataset is wrong is one registration. The built in detectors register as a side effect of importing the strategy barrels. Nothing here reads the game or the dataset; a detector is handed its observations.

- `registerDetector` with an existing id replaces it, so a host can override a built in detector. `clearDetectors` gives tests a clean registry.
- `runDetection` runs every detector registered for a kind and dedupes the drafts by the id they would mint. Two detectors that notice the same thing about the same record agree, and the ids say so. The first draft for an id wins.
- `DetectionRun.detectorIds` lists every detector that ran, silent ones included. The store needs it to scope reconciling.
- `runDetectionSweep` covers several kinds and groups drafts by the kind each draft names, not by the kind whose detectors produced it. A detector may emit a draft about another collection (see `UnresolvableMapper`), and that draft is stored, reconciled and decided under the collection it names. Filing it under the producing kind would put it where no verdict looks, so accepting it could never close it.
- The sweep's `detectorIds` is the union across the sweep, because any detector could have contributed to any group. A group's scope must cover everything that ran, or a cross kind finding that stops reproducing stays open forever. This is sound only because every draft lands in its own kind's group.
- Every kind in `kinds` gets a group, empty or not, and so does any other kind a draft names. A collection with no detectors of its own can still hold a cross kind finding from an earlier pass, and only an empty group lets it resolve. An empty group reconciles to the list already stored, which `applyPass` recognises and does not write.

## packages/navigation/src/recommendations/store/

The recommendation collection, and the only place a detection pass is folded in. `packages/navigation` has no Node and no `window`, so the store does not open files. It takes a storage port and the host supplies the adapter: Electron writes JSON, a test keeps a Map in memory. The logic lives in `reconcile`; the store decides the scope of a pass and persists the result. There is one file per collection, keyed by the content id.

- `recommendationFile` is `Data/recommendations/<kind>.json`, relative to the app's user data root.
- `memoryStorage` is the in-memory port. It is the default, and what a test uses.
- `applyPass` folds one detector run into the stored collection. The scope comes from the detectors that ran and the screen they ran for, so a pass on one screen never resolves findings about another. `detectorIds` is the set that ran, not the set that produced output: a detector that ran and found nothing is how a finding stops reproducing, and leaving it out would keep that finding open forever.
- `applyPass` skips the write when the pass changed nothing. `reconcile` rebuilds an entry it touched and returns the stored object itself for one it did not, so element identity is a sound and cheap test. A sweep covers every collection, most of which a single pass has nothing to say about, and this keeps that coverage from costing a file write each.
- `decide` records a person's verdict, a state reconcile never moves.

## packages/navigation/src/recommendations/strategies/actor/actor-spawns-probe.ts

A live sprite spawn with no `ActorRecord` cataloguing its sprite type. The room's spawn table is fully enumerable, so a spawn no record's `gameId.spriteType` names is a proven gap: `certain`. Repeat spawns of one type on one screen collapse into a single live item.

The actor's `kind` is not provable from the spawn byte. The proposal is `enemy` only when a native combat row proves the sprite fights, and `object` (the dataset's catch all) otherwise, never a name level guess like `npc` or `boss`. A person still reviews the proposal.

`removable: false`: the per room table only proves what this room spawns, never that another catalogued actor is wrong to exist.

## packages/navigation/src/recommendations/strategies/actor/actor-strategy.ts

The `actor` comparison strategy. The engine allows one strategy per kind (`strategyFor(kind)` is a single lookup), so combat and spawns share it. An `ActorRecord` is not scoped to the current screen: a sprite type is catalogued once and can spawn anywhere. So `subjects` is the whole catalogue, and the combat probe's `applies` and `read` narrow it to what this pass observed.

## packages/navigation/src/recommendations/strategies/actor/combat-probe.ts

Field probe over `ActorRecord.combat`: the health, `flags4` and per class damage facts `kSpriteInit_Health`, `kSpriteInit_Flags4` and the per class damage lookup report for a sprite type. The table is a native, enumerable fact about the sprite type and not inferred from watching a fight, so a disagreement is always `certain`.

`spriteCombat` only carries rows for sprite types observed this pass. A type missing from it was not seen this time and is not proven to lack combat data, so `read` returns `unread()` for it. Returning `known(undefined)` would propose deleting a correct combat profile because this room did not spawn that sprite type.

## packages/navigation/src/recommendations/strategies/actor/combat-profile.ts

Converts a resolved native combat row into the `ActorCombatProfile` shape `ActorRecord.combat` stores. The combat field probe and the spawns set probe (a proposed actor carries a profile when a combat row proves it fights) share it.

## packages/navigation/src/recommendations/strategies/check/check-correction-probes.ts

Two corrections the room's chest table proves about an already catalogued check: it is not recorded as a chest though a chest object draws it, or its `screenId` names a screen of a different room. Both read the same enumerable chest table as the presence probe, so both are `certain`.

- The screen probe's live value is the current screen's id, which a field probe has no direct channel for. `observations.match?.screen.id` is the same value `context.screenId` always carries in production (`useScreenObservations.ts` sets `screenId = match?.screen.id ?? null`), so reading it there is not a guess.
- Chest contents are left alone by both probes: the check collection's `vanillaItemIds` is edited per dungeon reward in ways the raw chest byte cannot settle. That belongs to the item strategy.
- The screen comparison goes through the recorded screen's own `roomIndex` and does not compare screen ids. One room can carry several screen records (a progress variant of the same interior), so a check attached to a variant this pass did not resolve is correct. Only a recorded screen in another room is a real mismatch.

## packages/navigation/src/recommendations/strategies/check/check-strategy.ts

The `check` comparison strategy. The chest presence probe covers a chest the room draws that no record catalogues. The correction probes cover an existing record the same chest table proves wrong about its `kind` or `screenId`. `subjects` resolves each of the current room's chests to its own `CheckRecord` through `getCheckByGameId`. A check with no chest match gets no field correction; the presence probe proposes a record for it.

## packages/navigation/src/recommendations/strategies/check/chest-for.ts

Returns the live chest a `CheckRecord`'s own room and chest index name, if the room's chest table was read and draws it. It derives the match from `record.gameId` each time: a field probe's `read` and `applies` only receive the observations and the record, so a value computed while building `subjects` cannot reach them. The scan over a small array is cheap.

## packages/navigation/src/recommendations/strategies/check/chest-presence-probe.ts

A chest the loaded room draws that no `CheckRecord.gameId` covers. The chest table is enumerable (no chest has to be opened for it to report one), so the absence is proven: `certain`.

- The kind `chest` is proven by the object the room draws.
- `name` has no native answer, so the proposal carries an obvious placeholder a reviewer must replace, not a guessed name.
- The contents byte is a raw receive id in the same space as `ItemGameId.receiveItemId`, so `vanillaItemIds` holds a real item when the catalogue has it and stays empty when it does not.
- With no chest table, no resolved room, or no screen to attach a proposal to, the probe stays silent and does not invent a placement for an orphaned chest.
- `removable: false`: the chest table never proves an existing check wrong to exist, only that a new one is missing.
- Big and small chests are not told apart: no native read distinguishes them yet, so the probe does not guess.

## packages/navigation/src/recommendations/strategies/check/room-id-of.ts

The loaded room's index, or null when there is none to read (outdoors, or the room table was not read).

## packages/navigation/src/recommendations/strategies/dungeon/dungeon-strategy.ts

The `dungeon` comparison strategy: the loaded room resolves to a dungeon whose `roomScreenIds` does not list this screen. `subjects` is at most the one dungeon the loaded room's own palace index names; no other dungeon record has anything to say about this room. The live palace index is already carried on `liveGameId`.

## packages/navigation/src/recommendations/strategies/dungeon/room-screens-probe.ts

`DungeonRecord.roomScreenIds` against the loaded room. The fix is an append, so this is a field probe whose `read` returns the union of the record's list and the current screen, never a smaller set, and an existing member is never dropped. A set probe does not fit an append onto one array field of a record that exists: a `missing-in-dataset` set finding always becomes a `create`.

Room to dungeon membership is a native, enumerable fact about the loaded room (`cur_palace_index_x2` names the dungeon outright), so a missing entry is `certain`. The live value is the current screen's id, read from `observations.match?.screen.id` for the same reason as the check screen probe. With no resolved screen there is nothing provable to append.

## packages/navigation/src/recommendations/strategies/item/alias-probes.ts

An existing record's `aliasOf` claims a duplicate swap rule (`resolveDuplicate`) that an observed grant contradicts: the record's own raw id was granted as is while its own item was already owned, at which point `resolveDuplicate` says the swap should have applied. The check uses only the record's own id and the observation's owned set snapshot.

There are two probes on the same path because confidence is fixed per probe: a direct native tally (`fromInventoryDelta: false`) is `certain`, a tracker inventory delta is only `likely`. The two `applies` gates are exclusive on the same grant's flag, so at most one fires for a record in one pass. `format` shows the dataset side as the alias's display name, the item a reviewer recognises.

## packages/navigation/src/recommendations/strategies/item/grant-probes.ts

A native item id no `ItemRecord.gameId.receiveItemId` covers, from the three places the game says so. Each is its own set probe because confidence and source are fixed per probe, not per live item, and the three differ in both:

- the room's chest table needs nothing to have happened: `certain`, `native:room-chests`;
- a direct native receive count tally is enumerable too: `certain`, `native:receive-count`;
- a grant seen as a change in the tracker's inventory only proves an item appeared, never that the native table backs it: `likely`, `tracker:inventory-delta`.

One combined probe would give every finding one confidence and one source and overstate the weaker two. All three share one join (the raw native id, the space `ItemGameId.receiveItemId` uses) and one placeholder, so a `create` from any of them has the same shape; only the evidence differs.

`grantProbes` is in priority order: chest, native receive, tracker delta. When more than one fires for the same id in a pass, `runDetection` keeps the draft produced first, so the enumerable source wins a tie against a grant and a native tally wins a tie against a delta.

The placeholder's `category` and `name` have no native answer and `ItemRecord` requires both, so it uses the dataset's neutral defaults. `origin: 'vanilla'` is provable: anything that reached this join (a chest's static contents or the native receive path) is a real in game item. `removable: false` on all three: none of these tables proves an existing `ItemRecord` wrong to exist.

## packages/navigation/src/recommendations/strategies/item/item-strategy.ts

The `item` comparison strategy. The grant probes cover a native item id no record catalogues. The alias probes cover an existing record whose `aliasOf` duplicate swap rule an observed grant contradicts. `subjects` is the whole catalogue: an `ItemRecord` is not scoped to the current screen, so there is no narrower set to hand the alias probes.

## packages/navigation/src/recommendations/strategies/screen/game-id-probes.ts

Field probes over `ScreenGameId`, the native identifiers a screen record claims. Every value is read off a table fully enumerable for the loaded room, so every probe is `certain` and compares unconditionally: a wrong value is reported, not only a missing one.

- The room, overworld and entrance probes describe only the room the game is in, so each requires the record to be the resolved screen. `subjects` can widen past the current screen for the palace mismatch case, and comparing against an unrelated subject would make up a mismatch.
- Indoors the overworld index RAM slot is left over from the last outdoor screen (it is not refreshed on an indoor transition), so it is compared only outdoors.
- The palace probe reaches beyond the current screen. The current screen reads the live RAM value (indoors only), any other subject reads its value from the recorded mismatch list, and anything else is unread.
- `PALACE_NONE` is what the register holds for a cave, for a house, and for a palace room the game has not put in palace context. The three cannot be told apart, so it says nothing about the record's palace membership and reads as unread.
- RAM $010E names the entrance a room was entered through only when it was entered directly. Walking in from another indoor room leaves it stale, and `entranceRooms[whichEntrance] === roomIndex` is the only way to tell.
- RAM $010E holds 0 from boot and is not rewritten by loading a save state, so a live 0 cannot be told apart from walking through entrance 0x00. It is not evidence and reads as unread.

## packages/navigation/src/recommendations/strategies/screen/identity-probes.ts

The game reports a screen's kind only through `isIndoors`. Outdoors that bit proves `overworld`. Indoors it settles nothing: the record could be `dungeon`, `interior` or `cave`, and no native byte tells them apart, so a guess would be a finding the game never proved. Only the outdoor case is provable, and only for the currently loaded screen: `subjects` can include other screens named by a palace mismatch, and `isIndoors` is a global flag that says nothing about those. There is no probe for `position.floor`; inventing one without an observation would be a guess.

## packages/navigation/src/recommendations/strategies/screen/index.ts

Importing a strategy barrel (`packages/navigation/src/recommendations/strategies/actor`, `check`, `dungeon`, `item`, `screen`) installs that strategy as a side effect. `strategy-detectors.ts` turns a registered strategy into a runnable detector, so import it after these. The geography detector compares the dataset with itself and is not strategy derived, so this barrel registers it directly. It has its own detector id, so wiring the strategies cannot overwrite it.

## packages/navigation/src/recommendations/strategies/screen/palace-mismatches.ts

Every palace mislabel the fallback rescued this session, folded with what the live match just resolved. The live match is folded in so a screen that appears in both yields one finding, not two that share an id. `screen-strategy.ts` uses it to widen `subjects` past the current screen, and the palace probe uses it again to read the value for whichever extra screen it is looking at.

## packages/navigation/src/recommendations/strategies/screen/screen-draft.ts

The minimal `ScreenRecord` a `create` proposes for an uncatalogued room or overworld index: everything besides the identity (`gameId`, `kind`) and the label, which differ by caller. The presence probe (the screen the player stands on) and the connection strategy's `onUnresolvable` mapper (a crossing destination) share it. Only the current screen's live registers carry a palace index; a crossing destination never can. Geography has no native answer, so the draft carries the placeholder area and location ids and an unfinished name. `validate-create.ts` refuses to let it reach disk.

## packages/navigation/src/recommendations/strategies/screen/screen-geography-detector.ts

A screen whose two geography ids contradict each other: it names an area and a location, and the location record names a different area. It is hand written and not a field probe because there is no live signal: the game never reports which area or location a room sits in. This is the dataset disagreeing with itself, which only a detector reading the records can see. `screenBlockers` refuses such a pair at edit time; this detector is the read side of the same rule for records already on disk.

- The fix proposed is a corrected location, never a corrected area. Screen files are grouped by area and an area's own locations can go unreferenced, so the area is the dependable half of the pair and the location is the stale one.
- The reason states the fault, then whether the proposed value is forced (only one location in the area) or a guess. An area and a location often share a name, so naming both sides would read as a contradiction. The evidence line names the records involved.
- Confidence is `likely`: which half is stale is inferred, and `certain` is the grade batch accept acts on.
- A placeholder on either side means no place assigned, not a contradiction. A location id no record answers to is a dangling reference, a different fault with a different fix.
- When nothing is filed under the area there is no value to propose.

## packages/navigation/src/recommendations/strategies/screen/screen-presence-probe.ts

The screen the player stands on has no record cataloguing it. Reaching this needs a pass that runs with a null `context.screenId`, which `apps/desktop/src/nav-widget/recommendations/strategies/connection/wire-detector.ts` provides.

- Both sides hold at most one entry: the screen the player is on, identified by its game id.
- `datasetKey` does not derive a room and palace key from the matched record's own `gameId`. Several resolution methods of `resolveCurrentScreenDetailed` (`palace-scan`, `cave-single`, `cave-ambiguous`, `variant`) return a record whose `gameId` disagrees with or omits the live values: a palace scan match still carries the stale expected palace index (which `palace-mismatches.ts` corrects), and a cave or interior record has no `palaceIndex` while the live register does. Keying each side off its own `gameId` would make a mapped room fail the join and mint a duplicate `create` beside the correction the field probes already propose. So the live item carries the id `observations.match` resolved (`matchedScreenId`) and `liveKey` prefers it. The join fails, and proposes a `create`, only when `observations.match` is null.
- The fallback key is `room:<index>:<palace>` or `overworld:<index>`. It carries the palace index indoors so room 0x80 in the castle and room 0x80 as a cave never collide. It is also the finding's persisted `key`: a `create` draft's `screenId` is null for every unmapped room, so without a per room key every unmapped room would collapse onto one recommendation. An id like `room-080` is never built by hand, because a room number alone is ambiguous.
- `readLive` builds its probe directly: `known()` collapses a missing value to `undefined` for a single field, the wrong shape for a one item array.
- The proposal leaves `palaceIndex` off when it is `PALACE_NONE` (a cave, a house, or a palace room not in palace context), since that is an absence. It leaves `entranceId` off entirely: no dataset record carries one, and RAM $010E holds a stale boot or entry value for a room reached from another interior.
- Outdoors the proposed kind is `overworld`, provably. Indoors it is `interior`: `dungeon` would claim palace membership, which one byte cannot prove, and `interior` is the dataset's catch all for an indoor screen with no palace (as in the wells and shops data). Raising a real dungeon room from `interior` later is a one field fix; a wrong `dungeon` would mark a house or a cave as a palace room.
- `removable: false`: the lack of a match does not prove a record wrong. It may be a detection bug, an unresolved variant, or a stale palace index the field probes are already correcting.
- Confidence is `likely`: the game supplies the identity but never the geography a screen record must carry, so the create is never batch safe.

## packages/navigation/src/recommendations/strategies/screen/screen-strategy.ts

The `screen` comparison strategy. Every field reads `ScreenObservations` directly. `subjects` is the current screen plus every screen a recorded palace mismatch names, deduped by id. Only the palace probe needs the extra screens, but every probe runs over `subjects`, so the dedup happens here once.

## packages/navigation/src/recommendations/strategies/screen/spawns-probe.ts

`screen.spawns` against the live sprite spawn table. It is a field probe despite the file name. `SetProbe` works over whole records and `spawns` is one array field on a record that exists, so a set probe would turn a `missing-in-dataset` difference into a `create` of a second screen record for the same room. Comparing the path as one array yields an `update`.

- `read` returns the union of the record's spawns and every live spawn missing from them, never a smaller set. Sprites spawn conditionally and the dataset models that with variant screens, so one pass proves nothing about a spawn being impossible. This is `removable: false` made structural.
- A spawn's identity is which actor at which tile, independent of order.
- A sprite type with no `ActorRecord` is skipped; that gap is the actor spawns probe's finding.
- An empty union becomes `undefined`, not `[]`: an empty array is a real value and would make up a finding against an undefined `record.spawns`.

## packages/navigation/src/recommendations/strategy-detectors.ts

Turns every registered comparison strategy into a registered detector through `detectorFromStrategy`. Without it a registered strategy never runs. Import it after every `strategies/*` side effect import (see `apps/desktop/src/nav-widget/recommendations/strategies/connection/wire-detector.ts`), so `allStrategies()` already holds every strategy for the pass. Running it again is harmless: `registerDetector` keys on id, so a repeat call replaces the same entries with themselves.

## packages/navigation/src/recommendations/types/recommendation.type.ts

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

## packages/navigation/src/simulation/annotations.type.ts

What is on a screen and what state it is in, derived from the simulator's own discovery so the overlay, the minimaps and the widget panel cannot disagree with the run. A kind with no renderer is a test failure (see the renderer registry); an unmapped kind still draws as a neutral marker.

- `AnnotationState`: `shut` and `open` are physical; the rest are check progress.
- `ScreenAnnotation.layer` is the BG layer the thing sits on, when it is layer specific.
- `ScreenAnnotation.direction` is the wall a door record sits in, for door table kinds only. A door's footprint is wide along the wall and shallow through it (`n` and `s` are wide in columns, `e` and `w` wide in rows), so a marker is sized per direction.
- `label` is a short human label for display only, never an identity. `checkId` is the check this thing is, when it is one; without it `state` can only say "available", since nothing knows whether the run already collected it. `detail` is the secondary line (item name, destination screen, walk distance). `requires` lists the traversal tokens the thing demands.
- `ScreenTag` is one decoded room header TAG byte. It is screen wide, so it has no tile.
- `ScreenAnnotations.screenIndex` is the room id indoors and the overworld screen index outdoors, used for world placement. `checks` is the check progress for the minimap badge. `tags` are the decoded room tags saying what mechanic the room header arms, indoors only.

## packages/navigation/src/simulation/detect/check-matcher/

Identifies a raw flag diff as one of the known checks, using the check records' own `gameId`. This is identification only: detection already happened by byte diffing. A diff that matches no known check yields nothing, so the recorder can propose a dataset fix.

Every matcher returns the record, so the caller holds the check's id. Matching by name once let 11 dungeons that each hold a "Big Chest" collapse onto one record, and 57 checks became unreachable.

- `CHEST_OPEN_MASKS` are the `save_dung_info` bits for chest slots 0-6.
- A progress check with mask `WHOLE_BYTE_MASK` (0xff) matches any nonzero value.
- Progression events are threshold reads of the progress buffer, not bitmasks (`sram_progress_indicator` 1 is after the uncle, 2 is the completed rescue). A diff names an event only when it crosses that threshold, and the highest crossed threshold wins. Reaching 2 is the completed rescue, not the started one.

## packages/navigation/src/simulation/detect/flag-snapshot/

Pure byte diffing of raw SRAM snapshots. This layer never touches check data; it reports which flag bytes changed and which bits were newly set.

- `save_ow_event_info` starts at 0xF280 and the flag tables index up to screen 0x81. Screens 0x80 (the sword pedestal) and 0x81 (the waterfall ledge) alias into the adjacent SRAM word at 0xF300 and 0xF301, so `OW_EVENT_LEN` spans through 0x81.
- `diffSnapshots` emits one `FlagDiff` per changed byte or word across the three buffers.

## packages/navigation/src/simulation/detect/unidentified.constants.ts

`UNIDENTIFIED` is what the log calls a flag change no check accounts for. It is only a display string; the matcher returns nothing for an unmatched diff and never this sentinel.

## packages/navigation/src/simulation/dungeon-key-target/

What a key requirement token points at. A `smallkey:` or `bigkey:` token either names the dungeon whose key it wants, by `DungeonId`, or carries the wildcard `ANY_DUNGEON` (`*`). The wildcard is what a connection's `barrier:small-key` or `barrier:big-key` tag turns into, because the tag says a key is needed without saying whose. Keeping the wildcard as its own value (and not a string looked up in a per dungeon map that always misses) is what makes the two cases answerable separately.

`keyTargetOf` returns the target a key token's suffix names, or null when it names nothing real.

## packages/navigation/src/simulation/engine/discover-bombs/

Cracked walls the run can blow open now. The flood models one as an obstacle needing bombs, which only lets the player stand on it while the passage beyond stays shut. So a reachable wall is offered as a target: blast it, mark it floor, and flood again. There is one target per contiguous patch (`BLAST_PATCH_RADIUS` 4), since one blast opens the lot.

- `BOMBABLE_ATTR_MIN` to `BOMBABLE_ATTR_MAX` (0xf0-0xff) are the cracked wall attributes (`TileBehavior_FlaggableDoor`), solid until blasted.
- `attrGridsOf`: a split level room keeps its floor on the layer grids, and the dual layer flood reads those, so scans read every grid. A scan of the raw grid alone missed every cracked wall in such a room.

## packages/navigation/src/simulation/engine/discover-reach/

Neighbour reach against the detect flood's `reached` grid, shared by every interactable whose own tile is solid (a sprite, a door record inside a wall, a cracked wall marker). What matters is whether the player can stand on a tile beside it. A `Reached` of undefined means no grid, so the gate is skipped.

- `SPRITE_TALK_RADIUS` (2): a sprite's own tiles are often solid (a blocking NPC like the uncle stamps a 3x3 footprint into the grid, so the spawn tile never floods). Any reached tile within two tiles counts as able to talk to it.
- `DOOR_REACH_RADIUS` (10): door records sit several tiles inside walls; internal quadrant doors run up to about 10 tiles from the nearest floor.

## packages/navigation/src/simulation/engine/discover-switches/

Pull switches (`Sprite_PullSwitch_bounce`, sprite types 0x04-0x07) and the one remote effect a switch can have.

- Pulling a switch sets `dung_flag_statechange_waterpuzzle`, which the room's tag routine reads to raise its trapdoors. That is what opens the shutter behind the sanctuary onto the sanctuary. It only matters in a room that still has a shutter shut.
- `DRAIN_SWITCHES` lists switches whose effect reaches past their room: the tag routine writes an overworld event bit on a remote screen (`save_ow_event_info[screen] |= mask`), lowering water there. The same bit gates the one standing item whose spawn code stays inactive until it is set. The switch offer and the item's presence read this one table so they cannot drift apart.
- `standingItemPresent`: the one item the game holds back this way is a heart piece type sprite on the drain gated screen, which checks `save_ow_event_info[screen] & mask` and stays dormant otherwise. Every other standing item fails open.

## packages/navigation/src/simulation/engine/discover/

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

## packages/navigation/src/simulation/engine/discovered-graph/

The game driven traversal graph, revealed screen by screen: each visited screen's flood contributes the exits it detected (border connections, doors, holes, stairs). There is no requirement gating, because the flood already ran with the current inventory, so every recorded edge is passable now.

- `discoveredExitFor` returns the exit record for a hop, which carries the landing tile. `wantSig` pins which exit when several lead to the same screen: a screen can be entered by more than one crossing and they need not land in the same place, so a job that exists to try one must not be satisfied by another.
- `recordExits` keeps previously known edges the new flood did not detect again (synthetic reverse edges), and mirrors every two way border crossing as a reverse edge, so a dead end room never strands the BFS.
- `owWorldOf`: overworld screen indices from 0x40 up are the second world. That is a game fact, so it holds for synthetic `ow:N` ids too. It is undefined for interiors, whose world only their palace context knows.
- A discovered edge that jumps between the worlds without a warp or mirror is always an artefact. Once rooms with no dataset entry gained real geometry they could report other world exits, so the world test sits on the edge, where it holds however the endpoint got its name.

## packages/navigation/src/simulation/engine/dungeon-ledger-lifecycle/

Closes a dungeon group once nothing in it can be acted on, and reopens an exhausted one when the run acquires something on its `reopensOn` list. This is the only path back into a group: it hooks the frontier reset on item gain (`onCheckVerified`) and adds no second reset mechanism.

- `closeIdleDungeonGroups` settles every ledger the run has nothing left to do in: `complete` when nothing is owed, `exhausted` with reopen requirements otherwise. A group stays live while any part of it is reachable or workable this epoch.
- `reopenLedgersFor` reopens every exhausted group whose `reopensOn` includes a token just gained. Marking the group's own screens unvisited is enough, because the discovered graph already has their edges.
- `inCompletedGroup`: a group settled as complete owes nothing, so the engine keeps its screens out of the frontier for the rest of the run. Without this the run kept walking back through dungeons it had already finished.

## packages/navigation/src/simulation/engine/dungeon-ledger-scan.ts

Fills a dungeon group's ledger from one observed room. Every chest and key drop guard becomes an owed entry, reachable or not, and anything else the engine turned into a target (a standing item, an NPC check) is recorded the first time it is seen. Gates (doors, cracked walls, switches) are never owed; they only explain why something else is blocked. Which of the two a target is comes from `SimTarget.role`, never from its log noun.

- `targets` is the same list `discoverTargets` produced this step, so what counts as reachable here never disagrees with what the engine is about to trigger.
- A chest's `opened` bit is the live ground truth, independent of `done`, so the chest is struck even when this run did not open it (a pre-opened save).
- `hasUnblastedWall` looks for any bombable attribute tile still standing, ignoring reach: a wall the flood treats as impassable never shows up as a target without bombs.
- `guessBlocker` gives a best effort reason from the same gates discovery checks for doors, walls and kills. Outside a dungeon there is no key bucket to be short of, so a locked door there explains nothing.

## packages/navigation/src/simulation/engine/dungeon-ledger/

Per dungeon group bookkeeping of what a run still owes there. `complete` is permanent: the group is fully cleared and never reopens, and it is set only when `owed` is empty. `exhausted` is provisional: nothing owed can be acted on right now, but an acquisition listed in `reopensOn` can undo it. Keeping the two states distinct is the point: a group can go between exhausted and open again, but never leaves `complete`.

- `OwedCheck.blockedBy` is what stopped the run taking it: a missing token or a gate it could not open.
- `upsertOwed` adds or refreshes an entry's blocking reason. A check already struck off (the caller's `done` filter) never enters again through it.
- `pruneDoneChecks` strikes every entry the run has since taken.

## packages/navigation/src/simulation/engine/end-summary/

What the run found versus what it resolved. `not-completable` alone is a verdict, not a report. This counts everything discovery saw and how much of it was dealt with, so a run that stops early can be told apart from one that exhausted its reach, and a blocked chest or an unentered room is visible.

- `exits.edges` counts the edges the discovered graph knows; `leadingNowhereNew` counts the screens they lead to that were never entered.
- `MAX_LISTED` (40) caps the listed screens, so a run that entered nothing does not print a novel.
- `formatEndSummary` renders one line per fact for the run log.

## packages/navigation/src/simulation/engine/enemy-reach-geometry/

Tile geometry for enemy reach: whether the player's 2x2 footprint fits at a tile, and whether a ranged weapon has a clear orthogonal line from a candidate tile to a target. Diagonal firing lines are not modelled for any weapon, including the boomerang's longer diagonal range.

- `MAX_SEARCH_STEPS` (64) bounds a firing line search; the flood grid is 64x64.
- `findLineOfFirePosition` finds a standable tile along an orthogonal ray from the target, within the weapon's travel, with every tile in between passable for a projectile. A tile blocks when any layer's attribute maps to `PROJECTILE_BLOCKED` (1) in the collision table; a split level room keeps floor on the per layer grids. With no attribute grid the line cannot be verified, so there is no position.

## packages/navigation/src/simulation/engine/enemy-reach-weapons/

The weapons an inventory can bring to bear against a sprite: each one's ancilla type (null for the sword, which is not an ancilla), its resolved damage class and its reach. Thrown bombs are not modelled because their parabolic travel distance was not pinned down; only the placed (contact) bomb is. Every match is on an `ItemId`; the tracker's sword ladder adds every rung below the one held, so the bare tier 1 sword is always in the set.

- `CONTACT_RADIUS` (2 tiles) is the reach of the sword and the placed bomb.
- `SWORD_BASE_DAMAGE_CLASS` holds the `kSprite_Func14_Damage` base entries (`sprite.c`), indexed by sword tier minus 1. Swing timing adjustments on top are not modelled.
- `SWORD_TIER_IDS` come from the dataset's own Swords group, already ordered weakest first.
- `SWORD_BEAM_ANCILLA` (0x0c) needs a sword above tier 1. Its near full health firing condition is not modelled, so the beam is offered whenever the sword requirement is met.
- `BOMB_ITEM_ID` (the bomb pickup) stands in for carrying bombs, since no record expresses bomb capacity. `PLACED_BOMB_ANCILLA` is 0x07.
- `ANCILLA_WEAPONS` lists ancilla weapons by the item that unlocks them. The ancilla type and travel distance come from that item's own `weapon` profile; only the short log label is stated here.
- `damageByClass` is indexed by damage class, not ancilla type; the ancilla to damage class step is the first half of the game's two step lookup.

## packages/navigation/src/simulation/engine/enemy-reach/

Decides which sprites gating the current room's clear can be killed with the inventory on hand. A sprite gates the clear unless its flags4 carries the room clear exempt bit 0x40 (`Sprite_CheckIfRoomIsClear`, `sprite.c`). Damage class 0 is a real class resolved through `damageByClass` like any other: a weapon whose class reads 0 is not automatically harmless, and one whose class is nonzero is not automatically lethal. Both are runtime lookups.

- `isGating`: an unknown flags4 (no combat row for the sprite type) gates, since a room cannot be called clear on the strength of a sprite nothing is known about.
- `evaluateRoomThreat`: a missing `combat`, or one with null tables, means combat reasoning is unavailable (the developer tools combat gate is off), and every gating sprite reads as not killable.
- `inSameSection`: the game's clear test walks its sixteen live sprite slots, while the simulator holds the room's whole static spawn list, and one room can cover several scrolling sections, each with its own shutters and guard. The castle's boomerang room is two: entering the first slams its shutters until its guard dies, then the section to its east does the same. Judging both at once makes each look unclearable, so sprites are counted per section. Inside a section every gating sprite must be killable. A missing split, or a split on neither axis, means one section where everyone gates. `SECTION_SPLIT_LINE` is 32 because every indoor room screen is 32x32 tiles and the game never divides one anywhere else.

## packages/navigation/src/simulation/engine/engine.constants.ts

- `ROOM_CLEAR_KILL_ITEM` (0xff) is the kill action's item id for a room clear that drops nothing.
- `SCREEN_CENTER` is where the virtual player lands when a crossing names no entry tile.
- `TRAP_ENTRY_RADIUS` (8 tiles, Chebyshev) is how close a shutter must sit to the landing tile to count as the door just walked through.

## packages/navigation/src/simulation/engine/engine.ts

The pure step state machine: observing, planning, traversing, triggering, verifying, then observing again. Steps never mutate their input. Once observations carry flood detected exits, traversal runs on that discovered graph alone.

- `observe` adopts the runner's real tile only when it is on the virtual screen. The detect flood (`obs.reached`) is the only flood. When exits are observed the frontier comes from the discovered graph, and the doorway just walked through is spent from this side too. Visited rooms entered outside their explored region (a hall behind another door) still owe a visit.
- `plan`: when everything is exhausted but progress happened this epoch, the run makes one more pass; `resetFrontier` keeps that from looping.
- `traverse`: in discovered mode a hop must be a flood detected exit. Passing through explored ground is one backtrack line with no new observation (an unlock clears `visited`; a landing outside the explored region is a fresh visit). Otherwise the destination is observed so its targets get triggered.
- `trigger`: a target marked as a trap slams the shutters shut behind the player first, as its own trigger and verify cycle; the real target runs right after.

## packages/navigation/src/simulation/engine/event-log/

The two `SimEvent` constructors live on their own so a module that only logs (the dungeon ledger) never imports the hop and side effect modules. Those pull in the explorer, and a ledger module the explorer calls into cannot import back through that chain.

## packages/navigation/src/simulation/engine/explorer/

Virtual player bookkeeping: inventory to reach tokens, consumable dungeon keys, events, and the unlock reset epoch rule. Dungeon identity is a `DungeonId`.

- `keyAvailable`: a key is available while its counter is positive; `ANY_DUNGEON` asks about any dungeon.
- `spendAnyKey` spends one small key from whichever dungeon has one (coarse).
- `applyItem`: the game grants a generic small or big key with no dungeon attached, so `dungeon` (from the matched check, else where the run stands) attributes it. A key with no dungeon to credit is dropped, not guessed. It returns the requirement tokens the grant satisfies, for `reopenLedgersFor`.
- `localRefresh` follows an unlock or kill inside a room: a new epoch where only the current screen loses its visited mark. `progressSinceEpoch` stays set, so the exhaustion pass still sweeps everything once at the end.
- `globalRefresh` follows a change that alters reach in other screens (the follower tagging along opens the throne room's push wall passage, far from where she was rescued). Every screen but the current one becomes explorable again.
- `resetFrontier` starts a new epoch. Visited screens are cleared because they may expose new tiles and targets after an unlock, and failed triggers get one retry per epoch.
- `onCheckVerified`: a traversal affecting unlock runs a local refresh and advances the epoch; anything else marks the check done. Key grants with no dungeon go to the matched check's dungeon, or, for an unmatched grant like an enemy's key drop, to the dungeon the run stands in. `events` is optional only for direct call tests; the live engine always passes it, since a reopened dungeon group is only reviewable through the narrative log.

## packages/navigation/src/simulation/engine/goal/

Terminal condition evaluation. The `not-completable` verdict (the frontier emptied with no progress since the epoch began) is the softlock signal this tool exists to produce.

- `DEFAULT_GOAL_CHECK` is the ledger's "Ganon beaten" event, by id.
- `allChecksDone` is true only when a non empty set of checks is fully covered.
- The screen limit is a bounded testing cap: the run stops once that many distinct screens were visited over the whole run (`everVisited` survives epoch resets; `visited` does not).

## packages/navigation/src/simulation/engine/hop/

- `foundMessage` reads "Found chest at 12,20" when the tile is known, else it names the room.
- `landingTile`: a discovered exit lands on its entry tile, a static edge on its entry point, else the screen centre. A connection point is one sided: `edge.connection` is the point being left, so its partner's `nav.fromPoint` is the point arrived at.
- `arrivalLabel` says in words how the player got in, from the crossing's `edgeSig`. A screen id alone cannot say which way in was used, and two ways in need not lead to the same ground. Border signatures carry the tile span because one side of a screen can hold more than one crossing.
- `emitHop` narrates one screen hop and updates `s.virtual` and `s.area`. It records which way in was used (`arrivals`), so the same screen entered another way still counts as unexplored. It records the boundary too (`crossings`): the same tiles seen from the far side resolve to the same key, so a doorway is never walked twice. The way back is used up once the destination's own exits name it (`markWayBackUsed`).
- `spendKeysForEdge`: a wildcard token names no dungeon, so there is no bucket to spend from. That is a real leak (the static graph lets a run walk a `barrier:small-key` edge for free), kept because spending would change what the simulator can reach. It is the same family as the unsatisfiable `bigkey:*`; both want the connections dataset to name the dungeon.

## packages/navigation/src/simulation/engine/regions/

Region aware exploration memory. A room can hold several walkable regions that do not connect inside it, so the engine keeps a per screen union of every flood's reached tiles and treats an entry landing outside it as a fresh visit.

- `stampReach` marks an attempted entry point (a 5x5 patch, `ENTRY_STAMP_RADIUS` 2) as explored, so a landing whose flood cannot reach its own doorway never queues the same screen again forever.
- `regionCovered`: landing tiles sit on walls and door notches, so it scans a window (`LANDING_SCAN_WINDOW` 3) around them. A screen with no recorded reach counts as fully covered.
- `RegionJob.from` is the screen holding the exit into the unexplored region; `edgeSig` is the way in, so traversal takes that exit and not another to the same screen.
- `crossingKey` is the canonical identity of a crossing, the same from either side: the screen pair, the axis and the tile span. An arrival key cannot do this because each side derives its own `edgeSig` from its own flood. Region qualifiers (`@col,row`) are stripped from the pair, since the quadrant each side landed in says nothing about which boundary was crossed.
- `arrivalAccountedFor`: a way in is accounted for when it was used, when its boundary was crossed from the other side, or when it lands inside explored ground (several edges on one side mostly drop the player in the same place). An edge landing outside the explored region is not skipped: a ledge the lower part of a screen cannot reach is a different place behind the same screen id.
- `markWayBackUsed`: crossing a link uses it up from both ends; otherwise the way back reads as unexplored and the run goes back and forth across one doorway forever. The far end is identified on arrival: the exit leading back where the run came from, launching within `SAME_DOORWAY_RADIUS` (6) of the tile it landed on. A door's trigger tile is a few tiles off the spawn it puts the player on, and a border crossing's launch tile sits on the seam. It matches on position, not axis: two crossings can share screens and axis while landing in places that do not connect.
- `unexploredRegionJobs` lists visited screens that some discovered exit enters outside their explored region; a room with several regions still owes a visit through that doorway.
- `takeRegionJob` walks to the job's source screen and then takes its exit, since routing straight to the target screen would enter again through the explored door. It pins the way in, because arriving through the wrong exit would leave the job unsatisfied forever.

## packages/navigation/src/simulation/engine/screen-label.ts

Builds a label like `screen-183 (Uncle Estate)` for the run's log. It is display only; traversal never consults the dataset. The lookup must be able to answer "nothing", because most ids reaching it are `TraversalId`s (`room:80`) that are not dataset keys, and the dataset getters answer a miss with a stand-in record. It is memoized because it runs several times per engine step and a run's id space is small. The cache holds a label, never an identity, so a replaced dataset bundle can at worst leave a stale string in a log line.

## packages/navigation/src/simulation/engine/side-effects/

Side effect cycles that settle a trigger without naming a check, each ending with `settleTrigger`.

- `emitDoorUnlock`: a door unlock is state progress, not a check. Spend the key, log it, and flood the room again through the opened door (`refloodHere`).
- `emitSwitchPulled`: a local switch raised the room's trapdoors, so the room floods again. A drain switch lowered water on a remote screen, so every screen but this one is invalidated, since a screen already passed through may now offer new ground.
- `emitWallBombed`: unlike every other trigger, a blast writes no game state (the opened tiles live in the flood facade), so it produces no flag diff and never reaches the diff check, which would mark it failed.
- `emitShutterClear`: the room clear kill was verified and the shutters are open.
- `emitFollower`: the follower now tags along. It unlocks the throne room's passage, a remote screen, so the whole graph reopens.
- `emitEntryTrapSlam`: arriving beside a closed shutter in a kill tag room means it slammed shut behind the player. The flood's zero edges line is the hard evidence; this only narrates it.
- `interceptTrap`: interacting inside a trap section that is still hostile slams every open shutter first. The virtual tile moves to the target, the real target is queued again, and the slam runs as its own trigger and verify cycle. It returns true when it used up the step.
- `emitTrapClosed`: the slam was verified (the door open bits dropped).

## packages/navigation/src/simulation/engine/softlock-report.ts

Builds the `SoftlockReport` from a finished run: the checks completed, the checks left blocked with the requirement sets on every edge into their screen, and the screens never reached. Blocked checks are matched by id; a name join once marked all 11 dungeons' "Big Chest" complete the moment any one of them was.

## packages/navigation/src/simulation/engine/state/

Everything the run holds or has done is keyed by dataset id (`ItemId`, `CheckId`, `DungeonId`), never by display name: 11 dungeons each hold a check named "Big Chest". Place identity is the simulator's own `TraversalId`, not a `ScreenId`.

- `SimTargetRole` says whether a target is a thing the run is owed or a gate that explains why something else is blocked. It is never derived from the log noun.
- `SimTarget` is a discovered interactable paired with the trigger that fires it. `key` is the stable identity for dedupe and done tracking. `label` names it in the narrative log, `noun` is the interactable noun ("chest", the NPC kind) and `verb` the trigger verb ("Opening", "Talking to"). `tile` is the flood grid tile, when the position is known. `trap` means interacting walks into a live trap section, so the shutters slam shut behind the player first.
- `EngineState.area` is the big area the virtual player stands in (log grouping). `inventory` mirrors the game inventory, by dataset id. `reachTokens` are the item derived traversal tokens, rebuilt from the inventory on each observation. `keys` counts the small keys left per dungeon (consumable). `bigKeys` holds the big keys by dungeon. `events` holds the observed done events that `event:*` tokens gate on.
- `visited` holds the screens explored this epoch (cleared by `resetFrontier`). `everVisited` holds every screen explored in the whole run; the screen limit counts these. `discovered` is the game discovered exit graph; once any screen contributes exits, traversal runs on this graph alone. `regionReach` is the per screen union of flood reached tiles for the whole run. `regionJobs` are pending visits into unexplored regions of visited screens. `frontier` holds the screens reachable but not explored this epoch. `reachedScreens` holds every screen reachable this epoch and feeds the softlock report.
- `arrivals` holds the ways in already used, as `screenId#edgeSig` (`arrivalKey`). `crossings` holds the boundaries already crossed, by canonical identity (`crossingKey`); a crossing recognised from either side is walked once. `cameFrom` is where the last hop came from and the tile it landed on: crossing a link uses it up from both ends, and the far end can only be identified once the destination's own exits are known (`markWayBackUsed`). `pendingEdgeSig` is the edge signature the current route must arrive through, when pinned.
- `trapClosed` holds the screens whose trap shutters sit slammed shut behind the player. `done` holds target keys already triggered. `failed` holds target keys whose trigger produced no flag change this epoch; they are retried next epoch. `completedChecks` holds the verified checks by id and feeds the goal and the softlock report. `pending` holds interactables found on the current screen awaiting a trigger. `route` holds the remaining screen hops.
- `preTrigger` holds the flags captured just before the active trigger, for the verification diff. `progressSinceEpoch` says whether any check completed since the current epoch started.
- `cloneState` is a shallow structural clone, so a step never mutates its input state.

## packages/navigation/src/simulation/engine/traversal/

Screen level traversal over the static screen graph (all screens and connections from the data facade). There is no tile walking: a route is a sequence of screen ids. Connection requirements gate every edge: `ConnectionNavData.requirements` when present, else a fallback derived from `barrier:*` tags.

- A light to dark crossing is detected two ways: by the cross world and warp tags, and by comparing the endpoints' `world` fields, since some crossings carry no marker (the Superbunny Cave doors join light world East Death Mountain screens to a dark world interior). Endpoints missing from the registry count as the same world, so unknown screens never gain a false gate. The lookup uses `get`, since a getter throws on a missing end.
- A cross world portal with no explicit nav data requires the Moon Pearl. Without this the rain intro run with an empty inventory warped from lw-10 to west-dark-world and swept the whole dark world. This is a conservative placeholder until the connections dataset pass gives the real requirement set.
- `buildAdjacency` adds one edge per record: a `ConnectionRecord` is one point on one screen, and `canExit` says whether the player can leave through it. A two way crossing gets two edges because both paired records carry `canExit: true`; a drop's `canExit: false` adds none.
- `findScreenPath` is a BFS by hop count and returns the crossed edges too. `reachableFrom` returns every screen reachable under the `canPass` predicate.
- `gameNumberOf` gives the game's own number for a screen on a path, or -1 when the screen has neither index or the registry never held it. It goes through `get`, never a throwing getter. `toRoute` and `toScreenPath` adapt a path to the navigation `Route` and `ScreenPath` stubs (no tile paths).

## packages/navigation/src/simulation/engine/verify-step.ts

The verifying phase: diff the flag snapshots around the trigger, name the check, fold in the item, and route the side effect cycles for door unlocks, shutter clears and trap slams, each of which floods the room again in place.

- A blast changes no game state, so it can never show a diff. It is settled first, or the no diff branch would mark the wall failed for good.
- No flag change means nothing observable: the target is marked failed so this epoch skips it.
- Names are resolved here, for a person reading the log, and stored nowhere.
- A drop kill that satisfied the room's kill tag (the last living killable) reopens the trap shutters the game closed behind the player.
- A traversal affecting unlock seeds the frontier again. When the check is the stop target, the run goes straight to planning, because it must end on the verification with no reset, flood or discovery after it.

## packages/navigation/src/simulation/key-items/

Which received item is a dungeon key, by id. Identity is the native receive index the game delivers through `Link_ReceiveItem`: 0x24 for a small key and 0x32 for the big key, resolved to a record through the facade. These are the same two constants the discovery step uses for a guard's drop.

The dataset also holds 26 per dungeon key records (native 0x92-0xad) with no `dungeonId`. They are deliberately not a second path here: the vanilla core never delivers them, and one could not be attributed from the record anyway, which is why attribution comes from the matched check's `dungeonId`.

`keyKindOf` resolves the key item ids lazily, per call. A published dataset bundle can replace the records after import, and a snapshot taken at import time would pin the ids from before the bundle.

## packages/navigation/src/simulation/logic-referenced-items.ts

`logicReferencedItems` holds every item referenced anywhere in the check and connection requirement graph (`CheckRecord.requirements` and `ConnectionRecord.requirements`). Receiving one can change whether a gated check becomes triggerable (boss gates, medallion checks, pendant and crystal counts), so picking it up triggers a reach re-flood even when the item carries no direct traversal token. The set is id based, like the requirement graph, so two records can never collapse onto one shared name.

## packages/navigation/src/simulation/port.type.ts

`SimulatorPort` is the single seam between the pure engine and the outside world. `LiveGamePort` drives the real game through the wasm bridge; a later `DataWorldPort` would replay the recorded dataset offline. The engine only ever speaks to this interface.

- `getRoomTags` reads the room header TAG bytes for scripted effects (the kill to open door family and others).
- `getSpriteCombat` returns the resolved combat row for one sprite type; null off the developer tools gate or out of range. `getCombatTables` returns the shared ancilla and projectile tables; null when the developer tools gate is off.
- `getRoomSectionSplit` returns the scroll section split of the loaded indoor room (all false outdoors or with no room loaded).
- `setAutoSkipDialog` and `setDeveloperTools` set the features0 bits: true or false force them, null defers to the user's setting.
- `setSimulatorSupport` sets the host gate `kHostGate_SimulatorSupport`, which arms the `WasmSim*` mutators (and the item grant fallback in `TriggerGrantAllowed`) for the length of a run. It is on at start and off at the end, including on abort or crash, so it never lingers armed against a live session.
- `snapshotState` and `restoreState` save the pre run state so it can be restored afterwards.
- `onItemReceived` reports the granted item by dataset id. The tracker resolves the native receive index to a record already, so nothing downstream derives it again.

## packages/navigation/src/simulation/presence/evaluate/

Pure evaluation of a declarative `PresenceCondition` against a `PresenceGameState`. This is the simulator's one sanctioned data read: the transcribed spawn conditions live as data on the checks (`CheckRecord.presence`) and this function reads them. An absent condition means "always present". An `itemId` leaf asks the inventory directly.

## packages/navigation/src/simulation/presence/presence.constants.ts

- `BOSS_DEAD_BIT` is the `save_dung_info` bit marking a room's boss defeated or the room cleared.
- `PROGRESS_INDICATOR_SLOT`, `PROGRESS_FLAGS_SLOT`, `PROGRESS_INDICATOR_3_SLOT` and `FOLLOWER_INDICATOR_SLOT` are byte offsets in the `WasmGetProgressFlags` buffer. The follower indicator sits at index 13; a value of 1 means the follower is tagging along.

## packages/navigation/src/simulation/presence/presence.type.ts

`PresenceGameState` is the read only snapshot of live game state that `evaluatePresence` reads to decide whether a check giving NPC is spawned. Every field comes from a raw game read; the live port fills it on each observe through `buildPresenceState`. Plain scalars and array-likes keep it cheap to build and trivial to construct in tests.

- `progressFlags` is the `sram_progress_flags` byte (0xF3C6). `progressIndicator` is `sram_progress_indicator` (0xF3C5). `progressIndicator3` is `sram_progress_indicator_3` (0xF3C9). `followerIndicator` is `follower_indicator`, the tagalong id (0 is none, 0xF3CC).
- `inventory` holds the items held, by dataset id (the tracker's inventory set).
- `owEventInfo` holds the `save_ow_event_info` bytes, indexed by overworld screen (base 0xF280). `roomState` holds the `save_dung_info` words, indexed by room id.
- `status` holds the live facts behind the status pills. It is absent on a snapshot with no live core (the simulator, the offline reader).
- `StoryStatus` matches `WasmGetStoryStatusBytes` byte for byte (`core/game-hooks/story_status.c`).
- `PresenceStateInput` is the raw input the live port hands in. `progress` is the buffer from `WasmGetProgressFlags`; the other two buffers are the SRAM copies the simulator already snapshots for flag diffing. `statusBytes` are the `WasmGetStoryStatusBytes` bytes, when a live core is there to read them.

## packages/navigation/src/simulation/presence/state/

`emptyPresenceState` is a zeroed snapshot for the idle or no map path, where nothing is discoverable.

## packages/navigation/src/simulation/recording/dataset-updates.ts

Turns recorder output into `DatasetSuggestion[]`, the ready to write code blocks for the widget's Apply button. Suggestions arise where what the run observed disagrees with or extends the static screen, connection and check data.

- `knownConnectionSet` holds every crossing the dataset already covers, in the direction it can be walked.
- Open work: a connection suggestion's `code` still emits an informal shorthand, not a real point pair literal. A connection point now always needs a minted `toConnectionId` partner, which a suggestion cannot allocate. Once connections live in the vault as JSON, the suggestion has to become a JSON fragment for the vault in place of a TS snippet.
- `checkSuggestions` takes every observation the matcher could not account for. A null `checkId` is the unmatched case; comparing names once suppressed real suggestions when an unknown thing shared a name with another dungeon's check.

## packages/navigation/src/simulation/recording/recorder/

Accumulates what a run observed in game: check positions discovered, screen transitions traversed and door gates seen. `dataset-updates` turns disagreements with the static data into suggestions.

- `ObservedCheck.checkId` is null when the diff matched no check. An unmatched observation is exactly what becomes a dataset suggestion.
- `recordCheck` dedupes by identity and location, not identity alone: every unmatched observation has a null `checkId`, so an identity only key would collapse all of them into one, and they are the ones worth reporting one by one.

## packages/navigation/src/simulation/requirements-map/

Turns what a run holds into the `TraversalRequirement` tokens the nav data gates on, maps connection barrier tags to tokens as a fallback when a connection has no explicit `ConnectionNavData.requirements`, and evaluates an OR of AND `RequirementSet` against a reach context. The item side is `ItemId` throughout; the token table lives in `packages/game-data/src/data/records/native-tables/traversal-tokens.ts`.

- `ReachContext.tokens` holds item derived and always available tokens. `keyAvailable` says whether a small key remains for a dungeon, or for any dungeon. `bigKeys` holds the big keys possessed, by dungeon. `events` holds the observed done events.
- `tokensForItem` returns every token an item grants, including the rungs a progressive token implies.
- `inventoryToReachTokens` always adds `BARE_HANDS_LIFT`: the base lift needs no item.
- `requirementsMet`: an empty set means no requirements.
- `bigkey:*` is unsatisfiable on purpose, and that is a known defect. The barrier tag says the crossing wants the big key without saying whose, and a wildcard big key means nothing for a per dungeon set. The 12 connections tagged `barrier:big-key` are impassable on the static graph. Unblocking them changes what the simulator can reach and belongs in its own verified change. The engine's own big key door handling is already coarse (`bigKeys.size === 0` in discovery), which shows the mismatch is an oversight.
- `affectsTraversal`: progress buffer changes (events, Agahnim, the rescue) and overworld event changes gate traversal.

## packages/navigation/src/simulation/room-tags.constants.ts

The clear room tag name, the log lines and the door suggestion code print `->`, the same arrow the other `ROOM_TAG_NAMES` entries use, so every tag name reads the same way.

## packages/navigation/src/simulation/room-tags.ts

Human names for the room header TAG bytes, indexed like the game's own tag routine dispatch table (`kDungTagroutines`, 0x00-0x3F). A raw `tag 0x26` in the widget says nothing; a name says why a door is shut. Entries the dispatch table sends to an unnamed stub are left out and fall back to the hex value, so the table never claims to know more than it does. Tags 0x01-0x13 are the clear the room family the simulator gates on (`isClearRoomTag`), all named `CLEAR_ROOM_TAG_NAME`.

## packages/navigation/src/simulation/sim-run/report.ts

Builds a `SimRunReport` from a finished `EngineState` and `RecorderState`. `boundaryEdges` are the dataset edges that leave the reached set: the places to point `--dump-nav` at when hunting a missing or blocked connection. There is one per exitable point, since a two way crossing already surfaces both orientations as separate records. The report is read by a person, so edges carry tag terms, not ids.

## packages/navigation/src/simulation/sim-run/sim-run.type.ts

Types for the headless sim run automation (`--sim-run`): the config the CLI flag parses into, and the report the run writes for the data correction loop.

- `SimRunConfig.startSlot` is the 0-based save state slot to load before running (null is the current state). `stateName` is a named manual save to load in place of a slot. `--auto-state` cannot be combined with `--sim-run` because both hooks load the profile on mount and race, so the flag loads it itself.
- `target` stops early once that screen is reached (null runs to an outcome). `stopAtCheckId` halts right after that check triggers. `maxSteps` is a hard step cap so a stuck run always ends.
- `floodScreen` is a diagnostic: flood this overworld screen addressably, report its numbers, then exit. `probeRoom` is its indoor counterpart: report the room's entrance seeds, exit table entry and detected exits, to find out why a room reads as a dead end. `probeItems` are extra traversal tokens for the flood diagnostic (`lift.2`, `boots`), comma separated and fed straight to the flood, not item ids. `probeTile` is an optional entry tile for `probeRoom`.
- `scanSprite` reports every room whose spawn table holds that sprite type, then exits. It answers where the game puts a sprite when a dataset room index is suspect. `combatSprite` reports the sprite type's resolved combat row (health, flags4, per class damage) and the shared ancilla and tile combat tables, then exits.
- `screenWalkLimit` is the most distinct screens the game driven flood visits before ending (null is unlimited).
- `BoundaryEdge` is a dataset edge from a reached screen to a screen the run never reached.
- `SimRunReport` is written to `debug-output/sim-run.json` for the correction loop to read. `reachedTarget` is true when `target` was reached before the run ended. `reachedScreens` are the logical screens the flood reached. `verifiedChecks` are the real checks triggered and confirmed by flags, by id. `boundaryEdges` show where traversal stopped. `suggestions` are the recorder derived corrections.

## packages/navigation/src/simulation/traversal-id.type.ts

`TraversalId` is the simulator's own identity for a place, and deliberately not a `ScreenId`. The engine keys visited, frontier, route and discovered on the game's own number: `room:<roomIndex>` indoors and `ow:<screenIndex>` outdoors, set by the live port's observe. Seeding it from screen detection put the virtual player in the wrong place when a room index collided across a palace and a cave.

A `TraversalId` is not a dataset key. Handing one to a dataset getter returns a stand-in record, so anything that needs a display name does an explicit lookup that can answer "nothing" (`screenLabel`).

The static graph fallback (`buildAdjacency`) walks real `ScreenId`s through the same fields, so the id space holds both vocabularies. That is why it is a plain string alias: a template literal union would exclude the ids the fallback puts there.

## packages/navigation/src/simulation/trigger/trigger-plans/

Maps a discovered interactable (chest, NPC sprite, standing or overworld item) to the `TriggerAction` that fires the real check. NPC sprites resolve their flag and item payload from the check records' `gameId` by sprite type.

- `npcConfigForSprite`: a config that pins a `room` matches only when the sprite's live room equals it (`CheckGameId.room`). For an overworld sprite the room is the screen index, so it says which world the sprite is in; overworld screens from `DARK_WORLD_SCREEN_BASE` (0x40) up are the second world. That is the only thing that separates two NPCs sharing a sprite type across the worlds (`CheckGameId.owWorld`).
- A room flag NPC records its completion where the chest bits live, which the npc action cannot reach, so the chest action writes exactly that bit.
- Outdoors a pickup is an overworld event bit (`OW_PICKUP_MASK`, 0x40), and the sprite's room is the screen it stands on. Item id 0 is a real item, so a sprite with no mapped item is never triggered.
- `indoorPickupSlot`: indoors the game records a pickup in the room's own state bits (`HeartUpgrade_CheckIfAlreadyObtained`, `sprite_main.c`): 0x2000 when `sprite_x_hi & 1` is set (a column in the room's right half, from column 32, since a room is 64 columns of 8 pixels), 0x4000 otherwise. Both are room state slots (5 and 6), which the chest action already writes.
- `checkForStandingItem` derives the check a standing or overworld pickup is from the same facts `planSpriteTrigger` writes, so the two cannot disagree.

## packages/navigation/src/simulation/types/

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
- `DatasetSuggestion.targetFile` is relative to `packages/game-data/src/data/`. `targetId` null means insert a new entry. `code` is a code block ready for the writer IPC.
- `SimChest.isBig` is bit 15 of the chest room word; a big chest needs the big key. `posKnown` is false when the C layer reports an unknown position (col and row 0xFF) for a remote room.
- `SimSprite.outdoor` is true when the sprite came from the overworld spawn table, so `roomId` is a screen index. `kind` cannot answer this (a check giving NPC is `npc` indoors or out), and the screen index says which world the sprite is in (see `NpcCheckConfig.owWorld`). `posKnown` false means the tile is unknown (coarse reach). `carriesKey` means it drops a small key when defeated (the room's die action marker); `carriesBigKey` means it drops the big key (marker 0xe4 or 0xfd).
- `SimDoor.index` is the slot in the room's door table, which is also the open bit index (slots 0-3). `opened` comes from the room's door open flag bits. `cellLock` marks a jail cell keyhole plate (room object 0x18), not a door table door: `index` is then its chest slot and opening it writes that slot's open bit. `nativeType` is the raw `kDoorType`, which tells apart doors that share a `kind` (throne push wall 0x14, warp room door 0x46). `layer` 0 is upper (BG2) and 1 is lower (BG1), from door position slots 6-11.

## packages/navigation/src/simulator/exit-order/

- Walk distance ordering for detected exits: BFS steps from the entry tile, so the simulator tries the CLOSEST way out first.
- HOP_STEPS (999) is stamped on tiles the flood reached but the walk BFS still cannot, after ledge hops are walked: reachable, distance unknown.
- AREA_EXIT_BIAS (0x1000): exits LEAVING a big multi sub screen area sort after every exit inside the area, so the whole big screen gets explored before moving on.
- A ledge drop is ONE WAY. Priced as one move, the ordering dropped off ledges with work still pending above, and the screen left behind was marked visited. So a hop costs LEDGE_COST, more than any walk on the current footing (HOP_STEPS is the ceiling a real distance stays under): every walkable target first, drops after, deepest last. A hop's distance saturates below the out of area bias, so a tile many hops away in THIS area still sorts ahead of another sub screen's exits.
- The start may sit on a tile that was not reached (door thresholds, spawn markers), so the walk also seeds from every reached tile within 2 of it.
- Ledge drops are one way edges the walk must use: a tile only reachable by hopping a ledge has a real distance, not a sentinel. Without them the BFS stops at every ledge and everything beyond sorts arbitrarily.
- Flood reached tiles the walk could not touch lie across one way hops (ledge drops seed the flood but are not step adjacent), so they stay reachable for exit detection, sorted after every real walk.
- `distanceAt` tolerates exits whose own tiles are solid by taking the nearest tile within 4. That radius covers doorway notches, whose door tiles run about 4 deep into the wall, with the first walkable tile that far from the recorded door position.
- `decodeScore` splits an ordering score (real steps, out of area bias, unknown sentinel) back into what it means; the raw score is never shown. A score past the bias is still a real walk, just on another sub screen of a big area.
- `sortExitsByDistance` takes one precomputed score per exit (same order); exits on other sub screens of a big area carry the area bias. The score feeds the log; `steps` only ever holds a real distance.
- `entryFromEdge` is the landing tile on the DESTINATION screen when crossing an edge at a position; `exitFromEdge` is where the exit sits on the SOURCE screen. `reachedGrid` is the engine's region memory format.

## packages/navigation/src/simulator/flood-room/

- Single room indoor flood by address. It feeds floodFillScreen the room's REAL entrances (exit doors at their spawn tiles, plus stairs and walk through boundaries) so an interior always detects its way out (at least one entrance, never 0). The grid arrives with the uncle's blocker footprint already stamped (see screen-grids.ts), remote rooms included.
- Intra room scroll boundaries (a 2x2 room's internal doorway) come from the live room layout read, which is only available for the loaded room.
- A room's spawn record can sit outside its walkable floor (the door threshold, not the ground behind it). Seeding there reads as a sealed room, so the flood falls back to the room's own entrance list, which lands on floor.

## packages/navigation/src/simulator/flood-screen/

- The simulator's view of one overworld screen: the shared flood plus the summary numbers the run and the nav widget both report. The flood itself is `floodOneScreen` (packages/navigation/src/flood/flood-area), run for every caller, so a screen flooded from a given seed answers the same for the widget and for the run.
- `intraCount` is the intra room scroll boundaries (a 2x2 room's internal doorway crossings).
- `edgeRows` holds raw attrs and reach for the rows nearest the top and bottom edges (rows 0 to 3 and 60 to 63, columns 14 to 31). It shows whether a border crossing runs over open ground or over a cliff face. Diagnostic only.
- `sprites` lists what this screen's spawn table reports and whether the flood can stand within 2 tiles of each. For a LARGE (multi screen) area the table is the whole area's and its coordinates are area relative, so they run past 63 and do not index a single screen's grid; `reached` is only meaningful on a small screen.
- `floodOneOverworld` is null when the grid cannot be built. The widget calls the same flood, so the same seed on the same screen cannot give the two of them different numbers.
- A usable entrance transition is one the player can take right now: the BFS reached it without unmet item tiles, and the entrance tile itself is not under an item locked obstacle (for example the stairs west of the uncle's house buried under a rock, where the proximity trigger fires from beside the rock but the way in is sealed).
- `floodOverworldScreen` floods by address: the game need not be standing on the screen.

## packages/navigation/src/simulator/interactables/

- Decodes the raw sim query records into the engine's SimChest, SimSprite and SimDoor value types. Detection stays free of dataset reads: positions, open bits and door kinds all come straight from the game.
- DOOR_KINDS matches SimDoorKind() in core/game-hooks/sim_queries.c, by index.
- Room sprites are the static spawns of any room, read from its sprite table, so they work for remote rooms the virtual player is not in. The progress conditional NPCs the table lists (intro uncle, King Zora before the Flippers, and so on) are filtered later by the engine's presence gate (evaluatePresence over the NPC's declarative condition), the one sanctioned dataset read for the detector.
- `posKnown` is always true for sprites: spawn positions come from the static table and are valid remotely, and the engine floods the VIRTUAL room's grid, so the flood can always judge these tiles. Failing open here would let unreachable NPCs trigger through walls and blockers.
- A standing item indoors hands over the same thing it does outdoors. Without `itemId` the trigger fell back to item id 0, which is a real item (the uncle's sword), so the woods heart piece silently handed out a second sword and the piece never counted.
- A big overworld area returns the SAME spawn table whichever of its four screens is queried, with every tile relative to the area's head screen. Each spawn is resolved to the screen it sits on before it becomes a SimSprite, so `roomId` always names the screen that owns it and `tile` is always local to that screen.
- A room's doors include its CELL LOCKS, the keyhole plates that gate a jail cell (room object 0x18). They carry no door table record at all, so they arrive as big key doors flagged `cellLock`, keyed by chest slot.

## packages/navigation/src/simulator/overworld-area.ts

- Resolves an overworld sprite's AREA relative spawn coordinate to the screen it sits on, and its local tile there. A large (2x2) overworld area shares one sprite table across all four screens, and the game reports every spawn's position relative to the area's HEAD screen, so a spawn on the far half carries a row or column past 63 instead of one clipped to a single screen's 64x64 tile grid.
- SCREEN_TILE_SPAN is the tiles per overworld screen on either axis (the flood grid size). Overworld screens are laid out 8 per row.
- WORLD_SCREEN_COUNT (64) is the screens in one world. The area head table (`wasmGetAreaHeads`) only covers this many entries and is reused for the other world by masking off a screen index's +64 offset before the lookup, then adding it back.
- A row or column past 63 belongs to the screen one row down (head + 8) or one column right (head + 1), the only two offsets a 2x2 area can produce. `screenIndex` is whichever of the area's screens the sprite table was queried through.

## packages/navigation/src/simulator/probe-room-anchors/

- Two diagnostics for telling a room's real interior from the dead space around it, for the `room=` probe. A dungeon supertile is always a full 64x64 grid and a room rarely fills it. The remainder reads as attr 0x00, the same value as plain floor, so a flood seeded there spreads through space the player can never stand in. When a crossing looks wrong these answer the first question: is the flood standing anywhere the game put something, and is the wall it left through a wall at all?
- Anchors sit on walls and in doorways, so a record can be a tile or two (ANCHOR_SLACK) off the floor the player stands on.
- The anchor report lists which of the room's own doors, stairs, chests, sprites and entrance seeds the flood reached. A flood that hits none of them is standing in dead space, whatever its tile count says.
- `edgeOpenCount` counts how much of one outer wall is open on the outermost tile ring. Read it as padding, not as wall: nearly every room answers 64 on every edge because the supertile's outer ring is open all the way round. That ring is what lets a stray flood run a room's whole perimeter, so a low number is the interesting case.
- Passable attrs for this count: 0x00, 0x80 to 0x8d, 0x90 to 0xaf.

## packages/navigation/src/simulator/probe-room-threat.ts

- The combat sweep's verdict on a probed room's gating sprites. See packages/navigation/src/simulation/engine/enemy-reach for what "gating" and "clearable" mean.
- `inventory` is the LIVE tracker inventory at probe time (not a simulated run's inventory), so a room probed before picking anything up reads every sprite as `no-weapon` by design.
- The combat context is built the same way the runner's combatFor does (observe.ts) but straight off the bridge, because the probe runs without a SimulatorPort.
- The room's section split is only trustworthy when the player is standing in the probed room (the layout read is live only, see WasmGetRoomLayoutInfo). A remote probe gets no split, so every gating sprite counts, the same as a plain single section room.

## packages/navigation/src/simulator/read-loadout.ts

- The player's full loadout, read from the game, not tallied by the run. The run's own inventory is a set of check names: it answers "what did the run collect" but not "what does the player have" (no hearts, no equipment tiers, no map, compass or key state per dungeon). Those live in the save and the game already decodes them for the HUD, so this reads the same buffer the HUD does.
- Tiers stay NUMBERS. The display layer decides what to call a tier 2 sword; naming it in code would put the game's own product names into the repository, which the copyright gate exists to prevent. 0 means not held; higher is a better tier of the same slot.
- Health is stored in eighths of a heart (PER_HEART).
- The map, compass and big key bitfields cover 16 dungeons. `dungeonIndex` is `palaceIndex >> 1`, how the game's own dungeon tables index; the name is display only, resolved from the screen data.
- The dungeon bit is tested the game's own way (hud.c: `field << dungeonIndex & 0x8000`), so the slot order cannot drift from what the HUD draws. Only dungeons the player has something for are reported; the full sixteen slots are mostly empty early and would bury the ones that matter.
- The game keeps ONE small key counter, for the dungeon being stood in.
- Rupees report the GOAL, not the displayed counter. The HUD ticks `link_rupees_actual` up toward `link_rupees_goal` a few per frame (hud.c:389), so a run that ends while the counter is still climbing would report less than the player owns.
- `grants` is a diagnostic: how many times the game was told to hand over an item, per item id (0 to 255) and per site. Link_ReceiveItem is not idempotent, so a count above the number of checks taken means something was granted twice. Sites: 0 chest, 1 npc, 2 overworld, 3 kill.

## packages/navigation/src/simulator/room-doorways/

- Geometry tests for a doorway through a room's OUTER wall, shared by every detector that decides whether a door table record is a real way through.
- A candidate is validated against the DESTINATION room's own grids: exit doors back to the overworld share the same door table encoding, so mirroring one into the neighbouring room id fabricates a connection into solid wall (for example the castle's front entrance doors "leading" into the basement jail rooms below).
- Rooms are laid out 16 per row, 20 rows; ROOM_EDGE_ADJ proposes the room id plus or minus 1 or 16 as a neighbour.
- Entrance rooms are the rooms an overworld entrance points at: the MOUTH of a standalone place. Two mouths never scroll into one another; each is the way into a different cave, house or dungeon. ROOM_EDGE_ADJ proposes neighbours regardless, which is how room 0x10a "scrolled north" into 0xfa and the run walked from the desert to the mountain summit through two unrelated caves. A mouth scrolling INWARD is fine (that is what a dungeon's entrance hall does), so only a crossing from mouth to mouth is rejected. The set is memoized only once the table has loaded.
- Door trigger tiles sit a few tiles INSIDE the wall (a south door's record is about row 55, a north one about row 4); records in the middle of the grid (for example row 36, the lower page's top) are internal quadrant doors, not ways out of the room. That is why the outer wall bands sit below 8 and at or above 52.
- Wall strip attrs that mean "crossing here never scrolls to the adjacent room": 0x8E is the exit door trigger (walks OUT of the dungeon), 0xF0 to 0xF7 is a flag gated door, solid until its story flag, as the sanctuary's escape door is. `exitDoorAt` checks the strip at the position (the notches are 2 wide) up to 14 deep, on any layer.
- `doorwayLandingOpen` is the reality check that kills fabricated connections: the DESTINATION room must have walkable floor (or door passage) behind the doorway, on any layer, against its OPPOSITE wall. A real doorway lines up with its opening: the old 14 deep by 9 wide window accepted any room with floor loosely near that wall, which is how unrelated caves at consecutive room indices "scrolled" into one another. The window is now 3 deep and 3 wide.

## packages/navigation/src/simulator/scan-sprite.ts

- Answers where the game puts a given sprite. A check's room index comes from our own data, and when that index is wrong the failure is silent: the room exists, it just holds something else, so the check never fires and nothing says why. Asking every room's spawn table settles it against the game, not the dataset.
- Indoor room indices run 0x000 to 0x17F (LAST_ROOM).
- Which overworld screen a room is entered from is what names it; a room index alone cannot be checked against anything.

## packages/navigation/src/simulator/screen-location.ts

- Maps a screen id to the numeric location the room addressable reads need. A synthetic `room:N` or `ow:N` id still carries the GAME's number; returning null for those made the room a hole in the graph, and with two way doors a hole welds together every screen pointing at it (`room:277` joined lw-2e, lw-3a and lw-34). The dataset only supplies the name.
- The native index lives in DIFFERENT fields by kind: `overworldIndex` outdoors, `roomIndex` indoors. Reading `roomIndex` for both silently resolved every overworld screen to index 0.

## packages/navigation/src/simulator/screen-name/

- Maps a TraversalId to the DISPLAY NAME of the place it leads to, or null when the dataset cannot answer. A traversal id is the game's own number (`ow:19`, `room:112@0,0`), not a dataset key, so the lookup goes through the field that holds it (`overworldIndex` for overworld records, not `roomIndex`). The synthetic room id may carry the region and entrance qualifiers a node key carries.
- A bare room number is ambiguous (palace or cave), so the asking screen lends its palace (a stair inside a dungeon stays in it). The room keyed index is keyed on `roomIndex:palaceIndex`, so a lookup without a palace only matches a record without one; the candidate scan covers a dungeon room reached from outside any dungeon. If more than one candidate remains, answer null: a visible id beats a confidently wrong name.
- Names are display only; nothing here feeds traversal. `displayNameFor` is for a field that must hold a string: the raw id stands in for an unnamed place.

## packages/navigation/src/simulator/sprite-kinds/

- Maps a static sprite type to a SimSprite kind. NPCs that hand out a check are 'npc' (the trigger planner then resolves their flag payload from CHECK_NPC_FLAGS by sprite type); everything else falls back to 'other', which cannot be triggered and feeds coarse reachability. The union has no 'enemy' or 'item' member, so 'other' is the neutral default. The map starts small and grows as vanilla runs surface more check giving NPC ids.
- NPC ids: 0x16 the first sage; 0x1a Blind's Hut hint NPC; 0x1f Sick Kid; 0x28 sets the bombable wall room flag on trigger; 0x2b dwarf at the smithy; 0x2e named villager (progress flag); 0x36 Mad Batter or potion NPC; 0x39 hint or storyteller NPC; 0x3a half magic bat NPC; 0x52 King Zora; 0x73 Link's Uncle (UncleAndPriest); 0x75 Bottle Merchant; 0xad Old Man (Death Mountain); 0xbb shopkeeper dispatch (subtype2 selects the role; the cave gift giver is one).
- Standing items are collected by walking onto them, not by talking. The pair that matters before the first dungeon: the fungus in the woods and the loose heart pieces (`Sprite_E7_*` and `Sprite_HeartPiece`, sprite_main.c:705): 0xe7 and 0xeb.
- STANDING_ITEM_IDS is what a standing sprite hands over (the Link_ReceiveItem argument): 0xe7 gives 0x29, 0xeb gives 0x17.

## packages/navigation/src/simulator/trigger.ts

- Maps a TriggerAction onto the delivery queue and resolves once the delivery has FULLY completed (onComplete fires when the game consumed the item, not when the flag was written), so the runner never steps the engine while the item get dialog animates.
- A door record pair is the records describing one PHYSICAL doorway: the room's own [roomId, index] plus, for an outer wall door, the adjacent room's matching record (opposite direction, same kind, within 4 tiles along the wall, among the first 4 records).
- A door is unlocked the way the game would: one key is spent on the room's own record, and the same doorway's twin record opens for free. A trap shutter slamming shut clears the open bit on both records.
- The engine's npc action carries only the flag payload; sprite 0xFF means no in game sprite transition and no side effects tied to an id, just a flag plus item.
- Boss (simplified): set the boss room flag and grant its item, then queue the prize as a second delivery. Resolve on whichever entry executes last.
- Door: no item pickup is involved, so the bits are written directly (no queue). A cell lock's "index" is its chest slot, not a door table slot. Bombable walls blow open without consuming a key; big keys are never consumed.
- Kill is virtual: mark the room's drop or cleared bit and grant the drop through the normal receive path. A kill that satisfies the room tag also opens the room's closed shutter doors, as the game does. Door kind 4 is the shutter (SimDoorKind order).
- Progress steps are scripted rescue progression: pure state writes with no item pickup.
- Pull switch: the room's tag routine raises its trapdoors when a switch is pulled, so every shut shutter in the room opens (the door out behind the sanctuary). A drain switch writes the same overworld event byte its room's tag routine would, for real: no item (0xFF), just the flag the game itself reads.
- Bomb wall: a blast turns the cracked patch into floor for the rest of the run. No game write by address exists for this, so the opened state lives in the flood facade and every later grid build stamps it (packages/navigation/src/flood/bombed-walls).
- Trap shutters slam shut behind the player: every OPEN shutter record closes.

## packages/navigation/src/tracker/check-facts/

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

## packages/navigation/src/tracker/collected-checks/

Checks the multiworld room holds as done while the save does not: a location collected for this
slot by `!collect`, or checked in another session of the same slot. The tracker shows them
completed, as the room does. The game's own completion flags are never written: this is the
app's view alone, and it goes with the online session. `addCollectedChecks` returns true when any
id was new. `withCollectedChecks` adds every collected check to the completed set the save shows.

## packages/navigation/src/tracker/completed-checks-core.ts

The per-check completion sweep, shared by the live poller (flag-polling) and the offline battery
save reader (packages/navigation/src/save-file/offline-progress.ts). Every check record is tested against whichever of
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

## packages/navigation/src/tracker/derived-checks.ts

The derived pass of the completion sweep: the records that are true because of other records. A
combined event names the records it is made of (`derived`), a dungeon-wide event names a dungeon
and the kinds it sums (`derivedDungeon`), and a check the game keeps no flag for answers from a
vanilla `fallback`. Records are visited in dataset order, so a combined event only names records
that come before it; one pass is enough. `armed` lists the rows a seed has armed: their own taken
bit is the only answer, never a fallback.

## packages/navigation/src/tracker/event-status/

The live side of the reversible events: for every record with a `now` condition, whether it holds
this poll. Pure over a presence snapshot, the same language the simulator reads NPC presence
with, so a status is one declarative condition on the record and nothing else. It never touches
the completed set: an event that happened stays ticked, and this only says whether it is true
right now.

## packages/navigation/src/tracker/flag-polling/

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

## packages/navigation/src/tracker/item-ids/

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

## packages/navigation/src/tracker/normal-placement-ref.ts

Normal's placement, built once for the session. Nothing about it varies while the app runs: every
location holds what the unmodified game puts there, and no rng is drawn. Two tracker surfaces and
the simulator's picker ask for it, so it is built on the first ask and kept.

## packages/navigation/src/tracker/record-row-inputs/

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
(packages/game-data/src/data/records/checks/events/world.ts, n 283). `bigKeyItemIds` is every Big Key the dataset knows.
Nothing here comes from a second rule table; before this the same four answers came out of a
resolver that also carried a copy of every location rule.

## packages/navigation/src/tracker/tracker-count.ts

Whether a tracker row counts toward the run's check total. The roster also lists rows that are
not checks: the event records (beating Agahnim, the frog, the smiths among them) and the status
only rows. Those stay in the list, but a total is its item locations only, which is what an
Archipelago room counts for the slot.

## packages/navigation/src/tracker/tracker-roster.ts

The rows the app lists for a run, built once and read by every surface that lists them: the
Checks widget, the randomizer page's spoiler tab and the cheat console's Checks tab. On a seed
the roster is the seed's own: every record the placement names, plus a virtual row for each
location no record covers (shelves, chiefly), plus the event rows. No event is a location of a
seed, so the two lists never share a row. Without a placement it is the dataset's own list,
which is where the fairy rungs and the intro's story beats live: real rows that were never
locations of any world.

## packages/navigation/src/tracker/tracker-statuses/tracker-statuses.ts

Every check's status, from one engine, for the plain game and for a seed alike. Which reading
answers a row depends on the row, never on the mode:

- A row the world holds a location for is answered by the generator, over the placement handed
  in. Normal's placement is the one where nothing moved (packages/randomizer/src/normal-placement), so the engine
  cannot tell the two modes apart.
- A row it holds no location for is answered from the dataset's own record, against the place
  the row happens at. That is every event, because an event is a thing that happened and no
  location of any world, and the fairy rungs while no pond sells them. On a seed those rungs are
  locations, so the same rule sends them to the engine instead.

The place comes from the engine too: its reachable regions, named as dataset screens
(packages/game-data/src/logic/regions/reachable-screens.ts), so there is one graph. `fired` holds locations the session
recorded as taken where no check record could see it. `smallKeyDoors` off reads every small key
door as open (packages/randomizer/src/world/small-keys). `trackerReachableScreens` gives the screens the engine says
the player can stand on.

## packages/navigation/src/usable-crossings/usable-crossings.ts

- MAX_DOORWAY_SPAN is the widest a room to room crossing can be and still be a doorway. A supertile's outer padding ring is open tiles all the way round, so a flood that gets into it anywhere runs the whole perimeter and reports a crossing spanning most of every edge. A real doorway is a notch a few tiles wide; the first castle's own room to room walks measure 2 to 6.
- WARP_DOOR is kDoorType_WarpRoomDoor, which teleports. THRONE_DOOR is kDoorType_ThroneRoom, a push wall. Crossing either teleports or is refused, so it never scrolls to the adjacent room; the throne wall stops blocking while a follower is active.
- BLOCKED_SPREAD is how far from a blocked door record a wall spot still belongs to it.
- CrossingFilterScope: `roomIndex` is used indoors only. `connections` are the border bundles the edges were built from, because a ScreenCrossing carries neither the tile span nor the free tile count the filters need. `flood` is the flood the crossings were collected over, when the caller ran one.
- `connectionCrossingId` is the id the facade mints for a border bundle, the join between the two.
- A standalone interior is a room the game can leave straight to the overworld. Two of them never scroll into one another: each is the mouth of a different cave, house or dungeon.
- An exit spot is a wall spot that walks out of the dungeon, not into a room.
- An indoor room to room scroll is usable when it is a doorway width notch, in a wall that is not an exit door trigger, with floor behind it on the neighbour's side, between two rooms that are not both mouths onto the overworld. Outdoors an edge is usable when it has a free tile.
- The flood knows a crossing by its own id. Outdoors a pit is seeded at `FALL_HOLE_ID_BASE + id` so it never collides with a door sharing its number; every other crossing keeps the number its own table gives it.
- Gated entrance ids are entrances the flood touched but the player cannot take: every transition onto them is gated by a tile requirement the loadout does not meet, such as stairs buried under a rock, whose proximity trigger fires from beside it while the way in stays sealed. Table read crossings carry no gate of their own, so without this the run walks through the rock.
- `usableCrossings` is the one plausibility pass over a collected screen, so the simulator, the recommendations and anything else reading the facade see the same set. The facade emits every crossing the game's tables describe; this decides which of them the player could walk.
- `takeableCrossing`: a border bundle answers to the filters that built it, never to `available`. One item gated tile anywhere along the run puts that item on the whole bundle's requirements, so judging it that way deletes a crossing whose other tiles are plain floor. Everything else asks for its own cheapest approach and can be judged directly.
