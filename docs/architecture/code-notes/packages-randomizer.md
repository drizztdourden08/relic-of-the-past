<!-- @layer docs @kind doc -->
# Code notes: packages/randomizer

Facts about `packages/randomizer` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/randomizer/src/ap-received-index/

- The multiworld received-item index lives in the save (2 bytes), so it travels with save states and SRAM.
- A core built before the export existed answers null, and the caller falls back to a value of its own.

## packages/randomizer/src/ap-room-hash/

- The multiworld room a file belongs to lives in the save (4 bytes, ap_room_hash.c), so it travels with save states and SRAM.
- A core built before the export existed reads 0 (no room yet) and ignores a write.

## packages/randomizer/src/archipelago/ap-game/

Who this game is to an Archipelago server. `AP_GAME` is the game name a slot registers under, so it must match the world package exactly. `AP_ID_BASE` is the first numeric id the world owns: locations count up from it, and items from `AP_ITEM_ID_OFFSET` above it, so no item id can meet a location id. `AP_WORLD_VERSION` is the version of the world package that carries those tables.

## packages/randomizer/src/archipelago/ap-id-lookup/

Both directions across the id tables. An unknown key or id throws: a location or item with no id is one the table was never extended for, and a multiworld cannot carry it, so the caller hears about it at once and never sends a number the server would drop.

## packages/randomizer/src/archipelago/ap-ids.constants.ts

Generated, then frozen: the Archipelago numeric id of every location and item this game can put in a multiworld, and the name the server shows for each. The tables are append only. A seed already generated carries these numbers, so an id handed out is never changed, reused or removed; a new key takes the next free id at the end of its table. `apps/desktop/tests/randomizer/ap-ids.keep.test.ts` pins every id in use and fails on any edit to one. A story event carries no id: the world package creates it as an Archipelago event, which Archipelago gives none.

## packages/randomizer/src/archipelago/ap-item-universe.ts

Every item that can enter the pool under any option: every item record, plus the items no record answers for yet (every capacity upgrade a family's name table can mint, each jump size and the progressive item, and the retro quiver). Taking every record errs on the wide side on purpose: a spare id costs nothing, and a missing item would stop a multiworld at the first grant.

## packages/randomizer/src/archipelago/ap-key-order.ts

The order the id tables were first numbered in: natural key order, so rung 10 sorts after rung 9 and `item-100` after `item-099`. It only decides where a new key lands when a table is extended; an id already handed out never moves.

## packages/randomizer/src/archipelago/ap-location-universe.ts

Every location the world can declare under any option. The widest world is built once (key drops on, every pond rung present, every shelf slot opened at the deepest restock), and each seed row of the collection and every shelf key at every depth are added on top, so a row an option would hide still counts. A story event is no location, so none is here.

## packages/randomizer/src/archipelago/concrete-option-values.ts

Archipelago reads the word `random` in a player file as its own keyword: roll any value of the option. In this app `random` is a real choice of some rows (a progressive family's any-order mode, the shop shuffle's random mode), the value the pre-roll was built for. Written as the word, the generator would roll a different value and the package would refuse the file for disagreeing with its pre-roll. So such a choice is written as its numeric id, which Archipelago stores as is and the package reads back as the same app value (`options.py` `app_value_of`). Every other value passes through.

## packages/randomizer/src/archipelago/export/export-options.ts

`options.json`: the whole option catalog, one row per key the player file may carry, plus the two rows only the package reads: `seed_text`, the profile's seed, and `pre_rolled`, the values and world model the app rolled from it. A choice row keeps the app's own spelling of each value and a numeric id for Archipelago to store. When every value is a whole number the id is that number, so a player file that writes `50` and one that writes `"50"` read the same; otherwise the id is the value's position. Values that differ only by case are refused.

## packages/randomizer/src/archipelago/export/export.type.ts

The JSON the world package is built from (Archipelia builds that package). The rule trees are the engine's own `RuleNode` trees, unchanged; everything one profile settles (which locations exist, the pool, the readings, the seed table) travels as a `WorldModel`, written into the player file under `pre_rolled.world`.

- `LocationRequires`: a location exists always, or only while the world model lists it.
- `ExportedLocation.id` is Archipelago's numeric id.
- `ExportedEvent` is a story event: the loader creates it at generation time as an Archipelago event (a location and an item, both with no id, under the event's own name) in its region.
- `ExportedItem.classification` is what the pool calls the item under the default options.
- `ExportedRules.primitives` are the helpers the loader implements itself, with their parameter names; `helpers` is every derived helper call the trees make, with the tree it stands for.
- `ExportedOption.choices` holds the app's value, the numeric id Archipelago stores, and `numeric` says whether it is a number.
- `CapacityFamilyData.jumpItems[j - 1]` is the item that climbs j rungs.
- `PrimitiveData.capacityShop` is the capacity fairy's room and price: a vanilla bomb or arrow family tops out there. `meterItems` are items every use of which spends the meter, so they are unusable on the meter's empty rung.
- `WorldModel.dungeonItems` are placed inside the dungeons before the main fill; a set `dungeon` pins one to its own, and the fill takes the highest `rank` first (`packages/randomizer/src/world/fill/dungeon-fill.ts`). `locationDungeon` lists every dungeon location with the dungeon that owns it.
- `ItemHalfInput.fillable` is the locations Archipelago fills (present, not a prize or a locked spot); `fixedProgression` is the prizes, advancement whatever the pool says; `read` is the items the world's rules read; `locked` is the items locked onto their spots, which still need a class.
- `WorldModelInput.options` is the option values the world was built from, as the profile's snapshot holds them.

## packages/randomizer/src/archipelago/export/helper-calls.ts

Every derived helper call a set of trees makes, each with the tree it stands for, following each expansion into the helpers it names in turn. The trees keep their helper leaves; the loader looks a call up by name and arguments and compiles the tree it finds, so a helper used a thousand times ships once. A primitive helper has no expansion and is left to the loader. A derived call must carry plain arguments, never a setting or seed reference.

## packages/randomizer/src/archipelago/export/model-items.ts

The item half of a world model: the pool Archipelago fills, the dungeon items placed before it, each item's class, and the placement predicates (the engine's item rules) written out as the items each fillable location refuses. The dungeon items follow the prefill's own order (`packages/randomizer/src/world/fill/dungeon-fill.ts`): big keys, then small keys, then the rest, with pinned items first (`PINNED_SORT_BONUS`). The filler item is the one the pool carries most copies of: what an extra slot receives.

## packages/randomizer/src/archipelago/export/primitive-data.ts

The numbers the six primitive helpers read for one world: each capacity family's ladder, the rung a new file stands on, the item for each jump and the planned jumps of its progressive item, plus the items the meter, bottle and heart readings count. The loader's primitives are the arithmetic of `packages/randomizer/src/world/state-helpers-capacity`, `packages/randomizer/src/world/state-helpers` and `packages/randomizer/src/world/rules/heart-capacity.ts` over these tables and nothing else.

## packages/randomizer/src/archipelago/export/read-items.ts

The items one world's rules can read: every item a specialized tree names, plus the items behind each primitive it asks (a family's upgrades behind a capacity reading, the hearts behind a heart reading) and the meter behind any item that spends it. Archipelago counts only items it calls progression while it sweeps, so an item a rule reads must be one, even where the pool calls it filler (a piece of heart under a heart price). A vanilla bomb or arrow family tops out at the capacity fairy's, which asks the wallet for her price, so those readings also read the wallet.

## packages/randomizer/src/archipelago/export/specialize-node.ts

A tree specialized to one world: every setting and seed-table test answered, the branch it picks kept and the other dropped, every derived helper inlined, and every setting or seed argument replaced by its value. What is left names only what this world's rules can ask, which is how the model knows which items a rule reads.

## packages/randomizer/src/archipelago/export/world-model.ts

Everything one profile's world settles, as the package reads it: which locations exist, what is locked where, the pool, the setting readings and seed table the trees read, the progressive tier ladders, the numbers behind the primitives, and the placement predicates. It is built from the same fill world the local generator builds, so the package plays the profile's game and not a second reading of its options.

## packages/randomizer/src/archipelago/foreign-item/

The item key a multiworld placement holds at a location whose item belongs to another player. This game has no record for it: the pickup behaves like any other and nothing enters the inventory (the core's foreign-item sentinel). Only an online placement (`scouts-to-placement.ts`) carries it. `FOREIGN_ITEM_NAME` is what every surface calls it when no owner is known; `foreignItemName` adds the owner's name when the server gave one.

## packages/randomizer/src/archipelago/online-notice-settings/

The kinds of notice an online session raises, and the setting that shows or hides each as a toast: one boolean per kind, stored with the profile's other settings. A new profile shows what happens to this player and hides the rest of the room. A setting a profile never saved reads as its default.

## packages/randomizer/src/archipelago/parse-slot-data.ts

Validates the raw `Connected.slot_data` object. The result is `malformed` when a required field is missing or has the wrong type, and `version` when the slot was generated by a world package of another version than `AP_WORLD_VERSION`: its ids, options and rules are not the ones this app reads, so the slot is refused and never half read. The rolled values travel as they came; a later step reads each one.

## packages/randomizer/src/archipelago/pre-rolled/

The values a profile settles before any fill, rolled as the local generator rolls them on its first attempt (`world/fill/generate.ts`): the pond demands from the seed alone, then one rng from the seed that rolls the shelf prices and makes the pool's picks, then the fill world those values build. The player file carries all of it under `pre_rolled`, so the world package places against the numbers the app shows and builds the same world. `world` is the whole world the package builds (`packages/randomizer/src/archipelago/export/world-model.ts`).

## packages/randomizer/src/archipelago/slot-data.type.ts

What the world package hands the game in `Connected.slot_data`: the slot's options and the few per-seed values the client needs before play (the two medallion locks, and the values the generator already rolled: pond demands, prices, capacity). `deliverable` holds the npc, pond and world spots the world was built with (`packages/randomizer/src/world/fill/deliverable-lists`). `seed` is the seed the per-seed values derive from (a pond's throw schedule, a random shop draw), as a local placement keeps it; when absent, the room's seed name stands in.

## packages/randomizer/src/audit/anchor-checks.constants.ts

Live-verified crosswalk anchors: each check paired with the room id and chest index it was confirmed to occupy in the native chest table. They are keyed by check id, because a record has one name and an audit that named a row by text would go stale the moment the name was edited. `strideGroups` lists checks expected to occupy consecutive chest-table entries, in listed order.

## packages/randomizer/src/audit/check-invariants.ts

The mechanical-invariant audit over the check dataset: every rule module composed into one pure pass. Findings are returned, never thrown; this feeds the data-certification pipeline's discovery run. `spriteMainText` is the text of the core sprite source file; the source-function rule runs only when it is provided.

## packages/randomizer/src/audit/check-item-refs.ts and packages/randomizer/src/audit/check-dungeon-refs.ts

A4-item: every `vanillaItemIds` entry must resolve to a real item record, and for physically granted kinds the resolved item (one `aliasOf` hop) must carry a native receive id. A5-dungeon: a check claiming a dungeon must sit on one of that dungeon's room screens, and any dungeon-bound vanilla item must belong to the same dungeon.

## packages/randomizer/src/audit/check-names.ts and packages/randomizer/src/audit/check-source-funcs.ts

A6-name: every check names itself for the randomizer, and no two checks within the same dungeon scope (or both scope-less) share a name. SRC-func: a check citing a source function must point at text that exists in the core sprite source; it runs only when that text is supplied.

## packages/randomizer/src/audit/check-names.ts

- Maps a check id to its community standard display name: `<dungeon> - <check>` when the check belongs to a dungeon, else the check's own name, with a small data file override table for sub-areas whose standard prefix differs from their dungeon (the shared check-standard-name).
- The record form (standardNameOfCheck) takes the CheckRecord itself, so it also answers for a record the registry does not hold: a virtual row the tracker mints for a location with no check of its own (packages/randomizer/src/client/virtual-locations).
- completedLocationKeys is the set of locations a run counts as taken: the locations of the completed checks, plus the locations the substitution seam reported, which are the only word on a row no check record covers (a shelf, a pond prize past the reference's two). Two callers need exactly this set: the rules engine's collected state and the receipt lines' found/total.

## packages/randomizer/src/audit/chest-address-to-table-index.ts

Crosswalk between the reference project's location addresses and the native chest table (linear offset `0xe96e`, 168 entries of 3 bytes, the same table the census reads). It was validated against the live anchors: chest-check addresses fall inside the table span and advance in 3-byte strides congruent to the table base, so the table index is `(address - 0xe96e) / 3`. The anchors rule out an item-byte +2 offset: consecutive same-room entries sit exactly 3 apart, starting at an address congruent to `0xe96e` mod 3. Addresses at or above `REFERENCE_CUSTOM_ADDRESS_FLOOR` (`0x180000`) are the reference project's own expanded-ROM slots. An address that is custom, outside the table span, or not stride-aligned gives null.

## packages/randomizer/src/audit/comparator-vanilla.ts

The vanilla-item side of the comparator: it resolves a check's declared vanilla item (first item, its record, one `aliasOf` hop) to a native receive-item id and judges it against the census byte. Decomp ruling: the chest-table item byte and the receive-item index are the same id space (identity pass-through). The owned-duplicate alternates `0x0C` and `0x44`, `0x12` and `0x35`, `0x2A` and `0x46` apply only when the item is already owned (`OWNED_DUPLICATE_PAIRS`). A check whose resolved id differs from the census byte is a dataset vanilla-item error, unless it is exactly the alternate of the byte, which is still wrong for override matching but is classified separately as `vanilla-alt-id`.

## packages/randomizer/src/audit/comparator.ts

The S3 comparator: a pure cross-check of every dataset chest check against the ROM census (S1) and the reference project's location table (S2). Per chest check it can emit up to two verdicts (position and vanilla item); `ok` is emitted only when nothing else was. Key-drop checks are judged for datapackage name coverage only. In `ComparatorInput`, `flatTable` is the native chest table in table order (room ids drive the per-room ordinal join), `referenceLocationIds` is the datapackage map from location name to id, and `nameOf` builds the reference project's standard name for a check.

## packages/randomizer/src/audit/invariant-shape.ts

A1-shape: every check's `gameId` must carry the physical keys its kind demands, and nothing contradictory. A check with no physical identity at all is flagged unless its kind legitimately has none (prize, event). A progress-buffer bit is how the receive-crossing standing grants (the two tablets) are detected: their only persisted completion fact is their substitution-completion bit, exposed through the progress buffer.

## packages/randomizer/src/audit/invariant-unique.ts

A2-unique: no two checks may claim the same physical save bit. A room bit is keyed by room id plus its chest index or mask; an overworld bit by its screen plus mask; a `roomFlag` occupies a chest bit like a chest does. One sharing is legitimate: a boss check and its prize check read the same room `0x800` bit (`BOSS_KILL_MASK`), because the prize is granted by the boss kill itself.

## packages/randomizer/src/audit/join-crosswalk.ts

The address alone gives only a global table index. A per-room chest ordinal needs the table contents (room ids in table order), so the join against the census is a separate step. The chest index is the entry's ordinal among earlier entries of the same room, matching the save-bit assignment order.

## packages/randomizer/src/audit/rom-census/

The S1 census: reads the ROM's native chest table and produces the physical ground truth the dataset's check records are verified against. The layout is the same parse as `packages/asset-extraction/src/compile-dungeons/build-dungeon-rooms.ts`: base SNES address `0x81e96e`, 168 entries of 3 bytes, a little-endian room word at +0 (bit 15 is the big-chest flag, the low 15 bits the room id) and an item byte at +2. A chest's index is its order among the chests of its own room in table order, matching the save-bit assignment (`0x10 << index`). `flat` keeps every entry in native table order, the order the address crosswalk indexes into. `censusFindings` is pure: no I/O, no logging.

## packages/randomizer/src/audit/rom-native-tables/

The cartridge's own id tables, read straight out of a ROM image. Every number a record carries under `gameId` comes from one of these, so a test can hold the dataset against the bytes and not a transcription. Addresses are SNES LoROM and go through `snesToLinear`.

- `AREA_HEADS_ADDRESS` (`$82A5EC`, 64 bytes): the head area of every overworld area. `overworld.c:157` keeps it by hand as `kOverworldAreaHeads`, and `build-overworld-context.ts` reads the same bytes. An area is its own head when `headOf` returns it; the head carries the world bit, and the special screens (from `0x80`) are their own heads.
- `ENTRANCE_ROOMS_ADDRESS` (`$82C813`, 133 words): the room each entrance id lands in (`assets.h:33` `kEntranceData_rooms`). `ENTRANCE_PALACES_ADDRESS` (`$82D48B`, 133 signed bytes): `cur_palace_index_x2`, or -1 outside a dungeon (`assets.h:53`).
- Mouths: the 129 overworld entrance slots (`assets.h:250-255` `kOverworld_Entrance_Area`, `_Pos`, `_Id`, read as `overworld.c:265` reads them) and the 19 fall-hole slots (`assets.h:256-261` `kFallHole_Pos`, `_Area`, `_Entrances`, paired as `overworld.c:3210` pairs them). `entranceId` is the value the game puts in `which_entrance` (`$010E`). `area` is the area word the slot is filed under: a large area's head, never its sub-screen. `screen` is the sub-screen the mouth sits on, derived from the area plus the tile; `x` and `y` are the tile inside the area in 16px collision tiles. A slot position is a byte offset into the area's map16 tilemap (2 bytes a tile, 64 a row), so the tile is `pos >> 1` and the row `pos >> 7`. Both tables are already 16px aligned: `overworld.c:871` sets `overworld_offset_mask_y` to `0x3f0` (`0x1f0` for a small area) and `overworld_offset_mask_x` to a third of that, which clears the sub-tile bits before the position is stored. `Overworld_GetPitDestination` builds the same `pos` as `Overworld_UseEntrance` and compares it to the stored word unchanged, so the two tables decode the same way.
- Exits: the 79 exit slots, where leaving a room puts the player back on the overworld (`assets.h:262-265` `kExitDataRooms`, `_ScreenIndex`, landing coordinates at `:272-275`). `screenIndex` is the area the exit lands in, a head for a large area; `x` and `y` are the landing spot in pixels relative to the area's own origin.
- Room travel: a room header's four inter-room staircase destinations plus its fall-hole destination, read through `dungeon.c:3700` `GetRoomHeaderPtr` and the pointer table `extract-resources` reads at `$04F502`.
- `palaceOfRoom`: every room the in-game dungeon map draws, to the `cur_palace_index_x2` it is drawn under. `messaging.c:1717` `DungeonMap_DrawSingleRowOfRooms` walks `kDungMap_FloorLayout`, one palace per entry, 25 bytes a floor, `0xf` where the map draws nothing; `packages/asset-extraction/src/compile-dungeons` reads the same pointer table at `$8AF605` with the same per-palace sizes. A dungeon room the map leaves out is absent, so a miss means off the map, never "not a dungeon room"; a hit is the cartridge naming the room's dungeon.

## packages/randomizer/src/audit/rom-room-doors/

Every door a dungeon room declares, read straight out of a ROM image. A room's object stream starts with the floor and layout bytes, ends each of its three layer sections with `0xfff0`, and then lists its doors as words terminated by `0xffff` (`dungeon.c:2670` `RoomDraw_DrawAllObjects`). One word is `type << 8 | position << 4 | direction`, as `dungeon.c:2689` `RoomData_DrawObject_Door` takes it apart. The type values are the `kDoorType_*` enumeration in `dungeon.h:5-36`. `ROOM_POINTERS` is the 3-byte pointer table to each room's object stream (`extract_resources` reads the same one).

What a door asks for is the cartridge's own answer: `dungeon.c:5069-5094` opens a small key door for a key and a `kDoorType_1E` for the big key, `dungeon.c:5200` lists the types a bomb blows open, and `dungeon.c:3036` names the four locked staircase masks, one per staircase slot of the room header. That makes a door table the place a wing of a dungeon ends, which is what `regionId` on a room is derived from.

`position` is which of the wall's door slots (0 to 11, upper half first, `dungeon.c:84-87`). `direction` is 0 north, 1 south, 2 west, 3 east, as `RoomData_DrawObject_Door` dispatches it. `leavesRoom` is true when the door sits on the room's own outer wall, so it crosses into the next room: north and west doors take the low six slots, south and east the high six, and the other half of each table is the wall between the room's own quadrants. `slot` is which of the three door slots along that wall, so a crossing record can be matched to it. `lockedStairIndex` says which of the header's four staircase slots a locked staircase mask locks.

## packages/randomizer/src/audit/strip-copier-header.ts

A 512-byte copier header is stripped when present, which is when the file size is 512 mod 1024.

## packages/randomizer/src/capacity-profile/capacity-profile.constants.ts

- The TS half of the capacity profile contract with core/game-hooks/capacity_profile.c and wallet_grants.c. Moved to packages/randomizer/src/capacity-profile/capacity-profile.constants.ts.
- CAPACITY_FAMILY_INDEX is the index WasmSetCapacityProfile addresses each family by (the core's enum order).
- CAPACITY_FAMILY_LAST_TIER is the last rung per family: the eighth pond level, the bat's quarter setting, the wallet ladder top.
- The ladders and the wallet's virtual id range are owned by the shared model (capacity-ladders.constants.ts, packages/game-data/src/data/upgrade-receive-id, packages/game-data/src/data/wallet-jump-table) and only re-exported, so the bridge cannot drift from the pool, the names and the receipt export.
- WALLET_JUMP_SLOTS is sixteen slots, virtual ids 0x67 to 0x76.
- The unused helpers walletReceiveIdOfSlot (WALLET_VIRT_FIRST plus slot) and walletCapOfIndex (ladder index i gives cap 0, then 100 times i minus 1, clamped) were removed; isWalletReceiveId is still in packages/game-data/src/data.

## packages/randomizer/src/cheat-check-mark/

- Records a check as collected without handing anything over.
- The write is chosen from the check's own detection, never from its grant coordinates. For several checks these are not even the same byte: a wish pond carries flagType 2 and flagMask 0 for its grant, while the tracker and the poller read its substitution completion bit in the progress buffer. Marking the grant side wrote a zero mask into a byte nothing observes, so the item went out and the check stayed open. Deriving the write from detectionOf, which the tracker reads through, keeps both surfaces on one fact.
- A check whose completion cannot be written honestly is refused, never approximated. That covers every threshold detection (key counts, capacity tiers, pond throws): those are counters the game reads for more than this one check, and faking one corrupts the file.
- NO_ITEM_SENTINEL (0xFF) is the core's "no item" argument for a trigger export: record the flag, hand nothing over.
- SUBSTITUTION_BUFFER_INDEXES are the progress buffer bytes [21], [22] and [25] that hold the substitution completion bits (state_queries_progress.c; npc_overrides.c allocates them). A check detected through one of them is recorded by its substitution key, the vanilla receive id its giver's own script grants.
- BUFFER_INDEX_OF_FLAG_TYPE maps the npc trigger's flagType to its progress buffer index. The numberings disagree (check_triggers_world.c takes flagType 0 as sram_progress_flags, which the buffer publishes at [1]), so a mark that assumed they matched would write the wrong byte.
- A chest mark writes the room word plus, in the loaded room, the open chest tile, through the chest trigger.
- A substitution mark sets the one bit that says a possession-gated giver's check was taken.
- An overworld mark goes through the trigger export that already honours the no-item sentinel.
- An npc flag mark writes the giver flag byte and also records the giver's own post-grant state. Only a non-zero mask writes anything, and the flag it names has to be the byte the detection reads.
- markPlanOf is pure, so the widget can call it to decide whether the Grant button is live. A refusal is the reason the row shows instead of a button that does nothing.

## packages/randomizer/src/client/active-capacity-profile/

- Holds the capacity profile the running seed was generated with, set when the session arms and cleared when it disarms.
- `progressive` says whether upgrades climb the plan in order or each carry a fixed jump.
- Readers such as the cheat console capacity ladders use it to stay inside what the seed allows: logic reads a family as its start rung plus the collected jumps, so a value no set of upgrades reaches is a value logic never assumed.
- A listener that throws never breaks the session.

## packages/randomizer/src/client/ap-client-packets.type.ts

- Client to server packets of the Archipelago multiworld protocol.
- StatusUpdate status 30 is CLIENT_GOAL.
- Get reads data storage keys. Keys starting with `_read_` belong to the server itself (for example a slot's client status).
- SetNotify asks the server for a SetReply whenever one of the listed keys changes.

## packages/randomizer/src/client/ap-kill-link.ts

- The DeathLink kill asks the core to take Link's life when another player in the room died.
- Guarded like every optional export: a core built before `WasmApKillLink` existed answers 'unsupported' and the death is only logged.
- The core drops a kill that arrives while its death module runs (death_link.c), so the same test runs here first: 'down' is a kill that did nothing because Link is already dying or at the game over.
- `MODULE_GAME_OVER` (18) is the core's MODULE_GAME_OVER from game_constants.h, read from the first byte of the UI state buffer.

## packages/randomizer/src/client/ap-link-died/

- The core calls `window.__onLinkDied(cause)` when Link dies. One listener at a time, since one online session owns the room.
- The cause is a number from death_link.c: 1 when the room's kill caused the death, 0 for any other. A string cause is the death's own wording, from a host that has one.
- `byRoom` true means the room's own kill caused the death, so it is never sent back out. `text` is empty when the core has none.
- The core calls the handler from inside the wasm frame, so the listener is queued as a microtask and runs after the frame returns.

## packages/randomizer/src/client/ap-names.ts

- Name tables for a multiworld room: slot to player, and per game the item and location names behind the network ids.
- An id means nothing without its game, so every lookup goes through the slot that owns it. slot_info tells which game a slot plays.
- Slot 0 is the server itself (commands, starting inventory), named "Server".

## packages/randomizer/src/client/ap-protocol.type.ts

- The typed subset of the Archipelago network protocol the online session speaks: JSON arrays of packets over a WebSocket, each packet discriminated on `cmd`.
- This file holds the shared shapes; the packets live in ap-server-packets.type.ts and ap-client-packets.type.ts and are re-exported here.
- ApGameData is the per game name to id tables from the server's data package. `checksum` is present on every current server and is the cache key for a game's tables.
- ApNetworkItem carries network ids, not names. In ReceivedItems `player` is the slot whose world held the item (the sender); in LocationInfo it is the slot that receives it.
- ApJsonMessagePart is one piece of a PrintJSON message.

## packages/randomizer/src/client/ap-server-packets.type.ts

- Server commands outside this set fall through unhandled as the closed `Unknown` arm.
- RoomInfo `permissions` holds release, collect and remaining, each a Permission value: 0 disabled, 1 enabled, 2 goal, 6 auto, 7 auto enabled.
- `hint_cost` is a hint's price as a percentage of the slot's location count. `location_check_points` is hint points earned per checked location.
- RoomUpdate is a partial RoomInfo or Connected: only the fields that changed are present.
- PrintJSON `tags` is present on Join only: the tags of the client that joined.
- Retrieved answers a Get with every key asked for, null when the server holds nothing under it.
- SetReply means a watched key (SetNotify) changed.

## packages/randomizer/src/client/ap-socket.type.ts

- The slice of the browser WebSocket the online client uses, kept narrow so a test can hand in an in-process fake through a `createSocket` factory.

## packages/randomizer/src/client/baseline-entries.ts

- The armed overrides an online baseline must still look at. Their completion reports come from the substitution seam, so the plan never polls them.
- A pickup made while no client was connected fired to nobody, and only the save still shows it: the tracker's completed set, which reads an armed giver's real taken bit.

## packages/randomizer/src/client/browser-socket.ts

- The default socket factory: the browser's own WebSocket.

## packages/randomizer/src/client/check-detection/

- Derives, from a check record's own gameId, the live memory read that proves the check completed: a persisted room flag bit (chest slot, direct mask, or an NPC's room recorded chest bit), an overworld event bit, or a progress buffer byte (bit mask or threshold).
- Mirrors the tracker's check-facts read modes so the poller and the tracker agree on what "done" means. A review mark on a record decides nothing here.
- `CHEST_MASK_BASE` 0x10: the per slot chest open bits in the persisted room flag word start at bit 4 (slot n is 0x10 << n).
- Progress bytes 23 and 24 are pond tier bytes; 27 and 28 are their paired empty rung flags (state_queries_progress.c [27]/[28]).
- isReportableCheck answers whether a record may report a completion at all, for a caller that reads completion from somewhere other than a detection (the tracker's own sweep covers modes no detection covers). A real record can always report; an id nothing answers to cannot.
- detectionOf returns null for an unknown id or a record with no read.
- withProgressBaseline rebases a progress threshold on a Custom family's starting rung: rung r is native level r minus 1, so a tier byte that starts above the first native level still means "advanced by one purchase" when compared past that start. From the empty rung the first purchase leaves the tier byte at 0 and clears the family's empty rung flag, so that start reads the flag byte for 0. Every other detection shape is returned untouched.

## packages/randomizer/src/client/client-status/

- The server keeps a slot's client status under the read only data storage key `_read_client_status_<team>_<slot>`: 0 unknown, 5 connected, 10 ready, 20 playing, 30 goal.
- The server sets 5 when the first client of a slot joins and 0 when the last one leaves; goal is never undone.
- slotOfStatusKey returns the slot only when the key names one on this team.
- statusImpliesOnline: goal outlives the client (null, says nothing), unknown means offline, any other status means the client is connected.

## packages/randomizer/src/client/client-uuid.ts

- The install's client id for Connect, generated once and kept in localStorage so a server sees the same client across sessions. When storage is unavailable the id lives for this page only.

## packages/randomizer/src/client/connection-notices.ts

- Turns the network monitor's snapshots into online notices: the slot accepted (at first, or again after a drop), the connection lost, the server not reached at all, and the session ended by an error (a refusal among them).
- Only a change of state speaks, so a retry that fails again says nothing new. A stop the player asked for is silent.
- A session started again after a stop (state back to idle) connects for the first time again, so "ever connected" resets on idle.
- The `[Online]` log prefix is stripped from an error before it is shown.

## packages/randomizer/src/client/data-package-cache/

- Data package cache keyed by game and checksum in localStorage, so a reconnect to the same room asks the server only for games whose tables changed.
- Every storage call is guarded: without storage the cache is empty and every game is fetched. A failed write (storage full or unavailable) means the next connect fetches again.

## packages/randomizer/src/client/death-link-toast-text/death-link-toast-text.ts

- The toast line for a DeathLink notice, split so the player's name can be drawn apart from the rest: `name + text` is the whole line. `name` is empty for our own death.
- The cause is the sending game's own free text, shown as sent, on one line and cut to a length a toast can hold.
- A cause says nothing when it is empty, the name, or "<name> died".
- A cause that opens with the name already reads as a sentence about that player, so it follows the name directly.
- deathLinkToastLine is the whole line, for the toast's accessible label and the log. deathLinkOnlineNotice is the same line as an online notice, with the player's name drawn in the player colour.

## packages/randomizer/src/client/delivery-ready.ts

- One shot: calls back once the game can take a server item again, meaning the game is running and the delivery queue has drained.
- The online client asks for the full received list at that moment, since the list stopped where the game last could not take an item.

## packages/randomizer/src/client/fire-reported-classes/

- The physical plan classes whose completion arrives from the substitution seam (a fire id is allocated when they are armed, see apply-overrides.ts), never from polling.
- Shared by live arming and the offline reader's armed check mirror, so the routing can never drift between the two.

## packages/randomizer/src/client/foreign-icon-of-game.ts

- The icon id another player's item is held up as: the pool icon of that player's game (packages/game-data/src/data/sprite-manifest/pool-game-icons), as its place in foreign-icons.4bpp, counted from the first foreign icon id.
- A game we hold no drawing for, or an unknown game, gets the Archipelago mark.

## packages/randomizer/src/client/foreign-icon-plan.ts

- The plan with each foreign item armed as its icon id instead of the plain sentinel, so the hold-up shows the icon of the game the item belongs to (core/game-hooks/foreign_icon.c).
- The plan is classified once, with the sentinel, like any placement; this swaps only the target id of the foreign rows, whatever substitution table they arm in (TARGET_FIELDS has one field per table).
- With no resolver (a local seed, or pictures the core did not take) the plan is returned as it came. A resolver answer of undefined keeps the sentinel.

## packages/randomizer/src/client/foreign-item-line.ts

- The receipt line a location shows when its item belongs to another player: what it was and who it went to, `Progressive Scale sent to Zelda!`. One line per such location, composed with the session's other lines, so the pickup says where the item went instead of showing a class template.
- The line comes as candidates, fullest first (receipt-line.type.ts), and the composer keeps the first that fits the box: the item name loses words from its end, then characters (cuts of 16, 12, 8 tried longest first), and says so with "...", before the line falls back to naming the player alone. The player is never shortened.
- The item carries the primary highlight and a named player the secondary.
- ForeignItemOf answers undefined when the room named nothing. ForeignOwners is location to the owning player, as an online session keeps it beside its placement.

## packages/randomizer/src/client/freestanding-key-drops.ts

- Freestanding placed keys that physically cross the drop absorption seam. A key standing in a room is the same absorbable sprite as a released key drop, and the one absorption handler every freestanding pickup crosses is already intercepted by the drop override table (keyed room and size).
- The table certifies, per check, that its room holds exactly one such placed key (decomp audited), so a (room, small) drop entry substitutes it safely.
- The only certified entry today, check-135, is the mountain tower's caged key.
- The lookup calls getCheck so an unknown id throws and the table stays honest with the dataset.

## packages/randomizer/src/client/item-lookup/

- Resolves a community standard item name to the receive item index the delivery layer feeds to the core, following a duplicate alternate alias one hop when the direct record has no native id.
- The seven crystals answer first: they share one native id, so each one's grantable id is a reservation the records cannot hold (packages/game-data/src/data/prize-receive-id). A pendant carries its own id and falls through to the record path.
- Counter upgrades and progressive families carry no native id: they resolve to the reserved virtual ranges every grant seam translates (upgrade-receive-id and progressive-receive-id contracts), so a progressive copy is mapped to its next tier by the core from live inventory, never statically here.
- A wallet upgrade name resolves to a slot of the session's wallet jump table (session-wallet-table.ts), the table the core climbs by, so the id and the grant never disagree; outside a session it is unresolvable.
- A dungeon flavoured record answers with the targeted id of the dungeon it belongs to (packages/game-data/src/data/dungeon-item-receive-id). Its native id credits whichever dungeon the player stands in, which is right only while the family cannot leave its dungeon, so the targeted id is used for every mode, including the baseline, where it lands on the same dungeon the native grant would have.
- A flavoured name with no record of its own falls back one hop to the base family item ("Small Key (Ice Palace)" to the small key record).
- Every native id is range checked: the native grant tables hold 76 entries, so an id outside 0x00 to 0x4B resolves as undefined instead of reaching the core.
- The retro quiver has no record: it resolves to the single arrow receipt it is granted as (retro-bow.constants.ts).
- itemIdByStandardName is for display (label, sprite) and skips the native id range check because nothing is granted through it.

## packages/randomizer/src/client/key-drop-size.ts

- A key drop spawns the large drop sprite when the drop's vanilla item is its dungeon's Big Key, the small one otherwise.
- The core matches a drop override on (room, size), so an entry armed at the wrong size never fires and the vanilla key is granted instead (drop_overrides.c).

## packages/randomizer/src/client/last-network-status/last-network-status.ts

- The last network picture of the last online session, kept after the session ends (the game stopped, the socket closed). The Network tab shows it as the last known state while no session runs, and says so, instead of an empty page.
- Kept for this run of the app only.

## packages/randomizer/src/client/listener-set.ts

- A set of listeners with an unsubscribe per add, where one listener that throws never stops the rest.

## packages/randomizer/src/client/local-session-items/

- Resolves an assigned dataset item id to the receive item index the core understands, and to a display name.
- Progressive families and counter upgrades have no native id: they resolve to the reserved virtual ranges every grant seam translates, so a progressive copy lands on the next tier from live inventory at grant time.
- A dungeon flavoured record resolves to the targeted id naming its own dungeon (the same reading packages/randomizer/src/client/item-lookup gives the name), because its native id would credit whichever dungeon the player stands in.

## packages/randomizer/src/client/message-log.ts

- The room's chat and item messages as a ring buffer (the last 200), with change listeners so a panel can follow along. A listener that throws never breaks the log.

## packages/randomizer/src/client/native-grant-id.ts

- What the game's own script passes to the plain receive seam when a check's vanilla grant fires, per check kind.
- The npc kind id comes from the record itself. The boss prize always grants the ceremonial heart, receive id 62 (decomp audited: the arena pickup's receive call). World items (standing, dig, bonk) resolve their vanilla item record's receive id.
- A dungeon reward's falling ancilla carries the id the boss's own script grants. A pendant's record says which id that is; the seven crystals share one id no record holds, so those alone come from the prize table (packages/game-data/src/data/prize-receive-id).
- The native grant tables hold 76 entries (ids 0 to 75); 0xFF marks "no item" in the records.

## packages/randomizer/src/client/network-facts/

- What the network section needs that the room state does not already hold, read off the packets as they cross: counters, timestamps, the room's advertised settings, and which of this client's reported checks held another player's item. Two observers, one per direction, each a plain update of the facts.
- `requestedGames` are the games asked for in GetDataPackage: every other game of the room came from the cache by checksum.
- `scoutOwners` maps a location to the slot receiving its item, from the scout answer.
- `retryInFlight` means a scheduled try is under way: its socket is opening or its slot is being accepted.
- The room's settings come from RoomInfo or the part of them a RoomUpdate (or Connected) changes.
- When the socket closes, what described the live connection goes with it.

## packages/randomizer/src/client/network-monitor.ts

- The online client's network section, an Observer on its traffic: every packet in and out passes through here, and so do the socket's open and close, the reconnect schedule and the error that ends a session. Listeners get a fresh NetworkStatus (network-status.ts) after each.
- Once the slot is accepted the ping (packages/randomizer/src/client/network-ping) runs, its echoes stopping here, and the roster is asked for (create-roster.ts). When the roster settles the tracker links open, and they close with the connection.
- `send` in the deps goes straight to the socket; the monitor's own `send` counts the packet first.
- `received` returns true for a ping echo, which goes no further. `changed` means a message was handled and the room state moved, so listeners hear it.
- `attempting`: the scheduled try started; it stays in flight until the next schedule or the slot is accepted.
- `stop` is the session end: the ping stops, the facts stay readable, an error among them. `reset` is the session start: nothing of an earlier run is kept.
- When the connection is gone, what was learned about it (ping, roster, tracker links, presence) goes too.

## packages/randomizer/src/client/network-ping/

- Round trip time to the room. While connected, a Bounce tagged `rotp-ping` goes out every PING_INTERVAL_MS addressed to this slot only, and the server echoes it back as a Bounced.
- The time is taken from this client's own record of when each id left, never from the echo.
- PING_WINDOW is how many round trips the mean covers. An echo later than PING_EXPIRY_MS is dropped: the connection it measured is long gone.
- handleBounced answers true when the packet was one of this client's pings.

## packages/randomizer/src/client/network-players.ts

- The room's players on this slot's team, in slot order. This slot is online while its own connection is; every other one as packages/randomizer/src/client/network-presence has it.
- The status is the slot's client status, except that one needing a connected client reads unknown while the slot is offline (a tracker holding the slot keeps the server's value alive).
- This slot's checks come from the room; another slot's from its tracker link (tracker-links.ts), when one is up.

## packages/randomizer/src/client/network-presence/

- Who is connected to the room and what each slot's client status says. Three sources feed it: the client status read at connect (packages/randomizer/src/client/client-status), the `!players` line (roster-of-reply.ts), then the room's Join and Part messages.
- A slot can hold several game clients at once, so each keeps a count and reads online while it is above zero.
- Trackers and text clients (this app's own tracker links among them) join and part too, but never count: a player is online while a game is.
- NON_GAME_TAGS are the tags the server calls non game clients (its _non_game_messages). A non game client's Part carries no tags; its text says "has stopped tracking the game" and the like, which NON_GAME_PART matches.
- onlineOf answers true, false, or null when the room has not said. handlePrint answers true when the message changed a slot's count. setOnline records what `!players` listed for the slot.
- setStatus with `seed` also decides online while nothing else has. A key the server did not fill (null) says nothing about presence.

## packages/randomizer/src/client/network-roster/create-roster.ts

- Who is already in the room when the slot is accepted. The server announces joins and parts, never who was there first, so each connection asks twice: a Get of every slot's client status on the team (then SetNotify, so a change arrives as a SetReply), and `!players` once through Say, when there is another player to ask about.
- The roster settles on the `!players` answer, or after SETTLE_AFTER_MS when none comes. Only then do the tracker links open, because a tracker connected to a slot makes the server list that slot as connected. For the same reason a later listing never decides a slot one of this app's tracker links holds.
- This slot's own status is shown too, but its presence is the connection's, so its status never seeds presence.
- query asks once per connection; reset (the connection closed) lets the next one ask again. received answers true when the packet moved a slot's presence or status.

## packages/randomizer/src/client/network-status.ts

- One NetworkStatus snapshot, built from the session's status, the packet facts (packages/randomizer/src/client/network-facts), the room state, the ping, the presence counts, the tracker links' progress and two reads of the game (the received index and whether a file is in play).
- A hint's cost in points follows the server's own formula: a percentage of the slot's locations, never under one point (and 0 when the percentage is 0).
- A game the client did not ask for was served from the cache under the room's checksum, so it counts as matched.
- Queued items are those handed on and not granted yet: the run in a row, plus the positions handed ahead of it, less the ones among them the game already granted.

## packages/randomizer/src/client/network-status.type.ts

- The online session's network picture, one snapshot at a time (network-status.ts builds it). Times are epoch ms, so a reader works out an age or a countdown against its own clock.
- `configuredUrl` is the address as the profile holds it; `url` is the candidate that opened (packages/randomizer/src/client/server-url), null until one did.
- `uuidShort` is the first block of the install's client id.
- `worldVersion` is the world package version the slot was generated with, null until Connected; `appWorldVersion` is the version this app speaks (AP_WORLD_VERSION).
- `connectedAt` is when the slot was accepted on the live connection, null while not connected. `reconnectAttempt` counts tries since the last drop, 0 while connected. `nextRetryAt` is when the next try runs while reconnecting and waiting, null while a try is in flight. `retryInFlight` means a try is under way: its socket is opening or its slot is being accepted. `error` says why the session ended in error, or why the server was never reached while retrying.
- `pingMs` is the last round trip in ms; `pingMeanMs` the mean of the last PING_WINDOW round trips.
- `heldItems` are items the server sent before the scouts were armed, waiting for them. `queuedItems` are items handed to the game and not granted yet. `receivedIndex` is how many of the server's items the save holds.
- A player's `online` is null when the room has not said (neither `!players` nor a join, part or client status). `status` is the slot's client status; a status that needs a client reads unknown while offline. Another slot's `checked` and `total` come from a tracker link, null while none is connected.
- `hintCostPoints` is a hint's price for this slot, worked out as the server does.

## packages/randomizer/src/client/notice-burst/

- The toast queue's reducer, which folds a burst into one line. A collect or a release sends a room's worth of items in one message, and a toast per item would bury the game.
- Notices of one group (a kind, and for items the other player) that arrive within BURST_WINDOW_MS of the last one form a burst: the first BURST_LIMIT show as they are, and the next replaces them with a single summary that counts the whole burst ("136 items received from <player>") and keeps counting while the burst lasts.
- An entry's `at` is when its group last grew; `count` above 1 means the entry is a burst's summary.
- Trimming drops the oldest entries past MAX_VISIBLE. The singles of the burst still forming count as one line, since the next notice may fold them: a burst in progress never pushes out a line of another group that would still fit once it folds.
- queueNotice leaves the queue unchanged when the profile turned the notice's kind off.

## packages/randomizer/src/client/notice-of-print.ts

- The notice a PrintJSON message raises, or null. Items are told from this player's side: received from someone, sent to someone, found for ourselves, or passed between two other players.
- A hint keeps the server's own line, its names drawn apart.
- Joins and parts of trackers and text clients (this app's own tracker links among them) raise nothing, and neither does anything this client said or did itself, except its own goal.
- PrintSide `slot` is this client's slot, null before Connected.

## packages/randomizer/src/client/npc-capability/

- Capability probes decide, per capability gated location, whether the app can physically play a shuffled item there.
- A location is serviceable when it resolves to a check record, its nominal vanilla item resolves to a native receive id, and it has either a physical substitution key (npc, standing, drop or scripted tables, which report completion at the grant seam itself through override fired events, so no polled detection is needed) or a certified live detection for the deliver path.
- The resulting sets feed generation (only these locations enter the shuffle) and the bridge (the rest classify vanilla locked), so a plan error on a probed location is structurally impossible for fresh seeds.
- Data driven and stable per build, so each set is cached after the first walk.
- The pond probe runs the same test over every pond's own pair of slots: the capacity pond's two carry scripted grant keys (its handler's own seam), like the cave bat and the prize minigame, and each wish pond's two carry npc keys (the receive seam, keyed by the water's room). A numbered rung past a pair has no seam of its own, so certifying the pair certifies that pond's whole ladder (packages/randomizer/src/world/pond/pond-spots reads a pond's pair out of the set).
- POND_SLOT_LOCATIONS maps every pond's two vanilla slots to the grant its fairy makes there in the unmodified game. The capacity pond's pair is named by the upgrade table, the wish ponds' pairs by the npc scope, because that is where each one's vanilla item is written down.
- Generation carries one set for every pond, so all six pond slots are certified; the capacity only complement stays over the upgrade table, because that is the only pair a profile locks.
- The undeliverable sets are complement views: the locations generation must keep vanilla.

## packages/randomizer/src/client/npc-override-key.ts

- Substitution keys for scripted (npc) grants: decides, per check record, how the in-core npc override table identifies the giver's grant at the plain receive seam.
- Indoor givers key by (room, vanilla item); the boss prize keys by its arena room and the ceremonial heart grant. A giver with no room keys by vanilla item alone, and so does a giver whose grant runs somewhere other than the room its record names (ROOMLESS_GRANT_CHECKS).
- Keying by item alone is allowed only while that item id is unique across every roomless giver (certified over both scope surfaces), or, for the audited givers whose shared vanilla item makes that impossible (the three bottle givers), by the giver's own sprite type.
- SPRITE_KEY_CERTIFIED (117, 43, 57): sprite types the decomp audit certifies to grant inside their own handler frame (the bottle seller, the sleeping man under the bridge, the chest carrying locksmith), so the sprite executing at the receive seam is the giver itself.
- ROOMLESS_GRANT_CHECKS (check-060): the record's screen says where the giver is found, but the escorted elder hands his reflector over after the escort ends, on the mountain overworld, when the tagalong trigger for that outdoor area turns him back into a sprite and the fresh sprite's first frame calls the receive seam (tagalong.c:562-570 over kTagalong_OutdoorInfos / kTagalong_OutdoorRooms; sprite_main.c:24674-24686 and 24721-24728, all with player_is_indoors clear). A room test would refuse every one of these grants, so they key by item alone under the same uniqueness rule.
- The boss prize's arena room pins its ceremonial grant, and the dungeon reward's the falling one, since both rows carry the arena room and nothing else.
- NpcOverrideKey: `roomId` is the giver's indoor room index, or null to match by item or sprite; `vanillaItemId` is the native receive id the giver's own script grants; `spriteType` is set on sprite keyed entries only.
- The ambiguous set holds vanilla grant ids carried by two or more roomless givers across both scope surfaces (npc gifts and world items that key by item alone). Room keyed duplicates stay allowed because the room disambiguates them at the seam. Computed once over the scope tables. A slot key (a restock, a pond rung) has no record and no giver, so it is skipped.
- World items (standing, dig, bonk) use this table only when they cross the receive seam and the standing table has no physical claim on the pickup.
- A null key (no native grant id, or a roomless giver of an ambiguous item) sends the caller to the delivery path.

## packages/randomizer/src/client/online-context.type.ts

- What every per packet handler of the online client shares.
- `fail` ends the session with an error and no reconnect follows; `logLine` replaces `message` in the log.
- `markConnected`: the server accepted the slot, status goes active and the backoff ladder resets.
- `isLive` is false once the session was stopped: an arm still in flight must undo itself.
- `setPlacement`: the scouts became this placement, shown with who owns each foreign item (the Spoiler tab).
- `setDeathLink` turns DeathLink on or off for the rest of the session: the gate bit and the room link.

## packages/randomizer/src/client/online-core.type.ts

- Everything the online client asks of the game, behind one seam. The session speaks the protocol; this is the only way it reaches the core, so a test runs the whole client in node against a fake (apps/desktop/tests/randomizer/ap-protocol.keep.test.ts) and the app passes the real one (online-core.ts).
- DeliveryOutcome 'not-ready': the game cannot take the item now, so the received index must not move past it.
- ScoutedInput is the scout answer and what the room says about the slot. `seedName` is the room's seed name, standing in when the slot data names no seed; `itemName` is an item's name in its owner's game (the room's data package); `gameOf` is the game a slot plays, when the room said.
- ScoutedOutcome armed: the placement the scouts became (null when the core keeps none), the player each foreign item belongs to, and the plan's poll entries (null keeps the ones polling already has). Refused: nothing is armed.
- arm is the session start, before the socket opens (the online gate bits). disarm is the session end: every override, gate and table the session armed.
- armScouted arms the session exactly as a local seed with the same options would, and leaves in `maps.overriddenLocationIds` only the locations granted in world.
- deliver queues one item; `onGranted` runs when the game confirmed the grant, and only then. `senderName` is null when the server itself sent the item. cancelDeliveries withdraws every queued item not granted yet.
- onDeliveryReady is one shot: the game can take items again (running, delivery queue drained).
- isFileInPlay: a save file is in play (not the title, file select or the attract demo). onSaveSwap: the save under the game changed (a state load, a file entered, the return to the title).
- goalEntry is the goal's own poll entry, reported under its check key; null when nothing detects it.
- pausePolling stops the ticks and keeps the armed overrides (a reconnect resumes with them).
- readRoomHash is the room hash the save holds (room-hash.ts); 0 means no room yet.
- markCollected: the room holds these locations of the slot as checked, so show them done and never report them.
- setDeathLink sets the DeathLink gate bit when the slot data decides differently from the profile.
- killLink answers 'armed' when the kill will land, 'down' when Link is already dying, 'unsupported' with no export.

## packages/randomizer/src/client/online-goal/

- The run's goal goes to the server as `StatusUpdate` with CLIENT_GOAL (30) once the final fight is won.
- The goal is the ledger's "Ganon beaten" event, check-351 (the location packages/randomizer/src/client/randomizer-completion-bits.constants.ts writes the goal rules for; packages/navigation/src/simulation/engine/goal in the simulator names the same row), polled like any other row but never a server location.
- The ledger bit is written the frame Ganon's death finishes, so the goal fires exactly when the run is won.
- Sent once per connection when it fires locally, and sent again on a reconnect when already reached, since the server may never have seen the first and a repeat changes nothing.

## packages/randomizer/src/client/online-handshake/

- Pure builders for the client packets the online session sends while connecting, and the parser that turns a raw socket message into typed server packets (a message that is not a JSON array yields no packets).
- FALLBACK_VERSION (0.6.6) is sent when the server's RoomInfo names no version of its own.
- The version claimed is the server's own, so a newer server never refuses an older build.
- items_handling 0b111 (ITEMS_HANDLING_ALL): receive remote items, own world items, and starting inventory.

## packages/randomizer/src/client/online-items.ts

- Resolves a server item name (community standard) to the receive item index the core understands.
- A progressive family name resolves to its virtual id (progressive-receive-id contract), so the tier a delivery lands at is decided by the core from live inventory at grant time, the same path the local session takes.

## packages/randomizer/src/client/online-notices/

- What the online session tells the player, one notice at a time: items both ways, the room's other finds, hints, the connection, players joining and leaving, goals, releases, DeathLink and chat.
- The session emits every notice. The play area's toast stack (useOnlineNoticeToasts) listens and shows the kinds the profile's settings leave on.
- A notice is its whole line (every part's text, joined) plus the same line in parts, so an item name and a player name can be drawn in the message highlight colours.
- `counterpart` is the other player an item notice is about, so a burst of them reads as one line.
- A DeathLink notice is a room death that killed Link or found him already down, or our own death sent out.

## packages/randomizer/src/client/online-probe/

- Pre-flight probe for an online randomizer boot. It opens a WebSocket, reads the RoomInfo the server greets every socket with, then closes.
- It never sends Connect, so the room sees no join and no leave. It answers only whether the server is reachable and hosts this game, and reads its version.
- A wrong slot name or password is the real session's to report, through its own error path.
- A bare local host:port tries ws:// only. Any other address tries wss:// first and ws:// when the secure socket never opens (packages/randomizer/src/client/server-url).
- An attempt reports `opened`, which tells the caller whether another scheme is worth a try.
- `game` is the server-side game key and defaults to this app's own registered name.

## packages/randomizer/src/client/online-room-identity/

- A save belongs to one multiworld room. The save keeps the room's hash (room-hash.ts): zero until the save first meets a room, when that room's hash is written.
- A save holding another room's hash takes nothing from this one. Its received index counts a different list, so delivering against it would hand out the wrong items.
- `acceptsRoom` ends the session when the save in play may not take this room's items.
- A save with no room yet is bound to this one at its first granted item.
- `bindSaveToRoom` runs on Connected and after every save swap, before any check is reported or item delivered. A save of another room ends the session before it sends that room's checks here. With no file in play there is no save to judge yet; entering one is a save swap.

## packages/randomizer/src/client/online-room/

- What the online client knows about its room has two lifetimes. The per-connection half (roomInfo, connected, heldReceived, syncPending, resyncWait) is reset on every new socket. The rest outlives a reconnect, because the overrides armed from the scout answer stay armed while the client redials.
- `heldReceived`: ReceivedItems held until the scout answer is in.
- `syncPending`: a Sync is out, so every further gap waits for its full list.
- `resyncWait`: the cancel for waiting until the game takes items again to ask for the list once more. A new connection sends the full list on its own, so a reset cancels it.
- `reportedLocal`: every location this client reported, resent on a connect for any the server lacks.
- `scoutIds`: the locations asked for in the scout, asked again when a drop lost the answer.
- `scoutArming`: a scout answer is being armed, so a second answer waits for it instead of arming twice.
- `scouted`: the scout answer has been applied, or nothing needed scouting.
- `cursor`: where the received list stands between the queue and the save (packages/randomizer/src/client/received-cursor).
- `roomHash`: the room identity a save is bound to (room-hash.ts), null until RoomInfo names a seed.

## packages/randomizer/src/client/online-session-config.type.ts

- An online session is started with the room and the slot only. Everything the game is set up with comes from the room itself (the slot data and the scouts), as a local seed's comes from its placement.
- `url` is kept as typed: a bare local host:port tries ws:// only, any other wss:// first, then ws://.
- `game` is the server-side game key and defaults to this app's own registered name.
- `password` is absent or empty for an open room.
- `deathLink` joins the room's DeathLink: a death here kills the others, and theirs kill Link.
- `trackOtherPlayers` opens one tracker connection per other player for their checks count (tracker-links.ts). It is on unless false.

## packages/randomizer/src/client/online-session.type.ts

- The online session's surface is the shared session contract plus what the room told it.
- `slotData` is the world's slot data, checked by parse-slot-data.ts. It is null until connected or when malformed.
- `messages` holds the room's last 200 messages, newest last.
- `senderNameOf` names the player an item came from ("Server" for slot 0).
- `placement` is the placement the scouts became, null until they are armed. `onPlacement` also hands the player each foreign item belongs to.
- `networkStatus` (connection, health, players, server and progress) is built fresh on each read. `onNetworkStatus` fires on every packet in or out, every ping echo and every state change.

## packages/randomizer/src/client/online-socket.ts

- One connection to the room, over the candidate URLs of packages/randomizer/src/client/server-url in order. A socket that closes without ever opening hands over to the next candidate, so wss:// failing on a server that only speaks ws:// falls back to it. The session hears one close, for the last socket.
- A socket that fails to construct reports its close in a microtask, so the caller already holds the link when it hears the close.
- A socket error is ignored: the close that follows decides.
- A send that throws (not open yet, or already closing) is dropped: the reconnect resends what matters.
- `onClose(opened)` tells whether any candidate ever opened (a drop, versus nothing answering).
- `close()` returns false when no socket is left to close, so the caller cleans up itself.

## packages/randomizer/src/client/physical-plan.type.ts

- The physical plan is the bridge's answer to "what does this placement mean in the running game". Every planned location falls in exactly one class: an in-core chest override, an in-core scripted-grant (npc) override, a poll-and-deliver grant, or a generation-locked vanilla location (no physical action, still reported).
- A non-locked location with no physical path is a plan error, never a silent skip, so a session must refuse to start on any.
- `PlanNpcGrant` holds the parameters forwarded to the delivery queue's npc trigger. A deliver entry carries it when the deliver should run the NPC trigger instead of the queue grant.
- Each override sub-object is present exactly for its plan class: `target` for 'override', `npcOverride` for 'override-npc', `dropOverride` for 'override-drop', `standingOverride` for 'override-standing', `scriptedOverride` for 'override-scripted', `shopOverride` for 'override-shop'. `targetLocalId` at the top level is the native receive id of the assigned item for 'deliver' entries.
- `PlanEntry.item` is the assigned (or scouted) community-standard item name. `detection` is how completion is observed live; absent means poll-blind (locked only).
- npc override: `roomId` is the giver's indoor room index, or null to match by item or sprite. `vanillaItemId` is the native receive id the giver's own script grants. `spriteType` is set for sprite-keyed entries only: the certified giver's sprite type.
- standing override: `area` is the overworld screen index (outdoor) or room index (indoor). `sprite` is the standing prize's sprite type. `half` is the indoor room half the prize stands in: 0 left, 1 right, 2 either.
- shop override: `slotIndex` is the slot's stable id across every shop, which keys its sold counter. `roomId` is the indoor room the shelf stands in. `entrance` identifies the shop when the room is shared, or -1 for any.
- shop override `owArea` is the overworld area the shop's own door stands in, or -1 when no door of its own reaches it. Several doors share one room AND one entrance value, so this is what tells them apart: the running game keeps the area a visit was entered from for the whole visit (core/game-hooks/shop_table.h).
- shop override: `subtype` is the shelf sprite's own subtype, which names one shelf inside the shop. `depthIndex` is the purchase order within the slot (the shelf sells depth 0 first). `depth` is how many purchases the slot carries in total, so the core knows when it empties. `currency` is the native currency tag (packages/randomizer/src/world/shops/shop-price-native: rupees, arrows, bombs, hearts, bottle). `amount` is the amount, or the bottle-slot value a bottle price demands.
- drop override: `roomId` is the drop's indoor room. `big` is true for the large-key drop sprite, false for the small-key drop sprite.
- `PlanCounts.pollBlind` counts locked locations with no usable detection: reported never, logged once.

## packages/randomizer/src/client/placement-bridge/

- The placement to game bridge classifies every planned location of a Placement into the physical plan classes.
- Chest-kind checks with a resolvable item become in-core chest overrides. Standing world items with a certified pickup seam become in-core standing overrides: the pickup shows and grants the assigned item natively. Checks whose grant crosses the plain receive seam with a usable key (npc gifts, boss prizes, the receive-crossing world items) become in-core npc overrides. Key drops become in-core drop overrides. The boss-prize slots have no seam at all and are reported as locked vanilla, not dropped.
- Physical classes report completion from the substitution seam itself (override-fired events), so they need no polled detection. Remaining detectable checks are delivered on their flag flip. Generation-locked locations need no action because the game already gives vanilla, and they are still polled and reported. Anything else is a hard plan error the session must refuse on.
- A location has no check record when it is a restock or a pond rung.
- A locked location must hold its vanilla item, so a shuffled item there means the placement predates the lock (a stale seed the game cannot honor), which stays a hard refusal.
- A shelf slot is keyed off the shop dataset, not a check record: the app has none for a shelf, because a shelf is a repeatable purchase in the unmodified game instead of a one-off check. It reports from its own substitution seam.
- A pond prize slot under a non-legacy pond is keyed by its place in that pond's own table (pond-prize-target.ts). It is still the scripted-grant plan class, so completion reports from the substitution seam like every other pond grant.
- The certified scripted-grant surfaces (upgrade pond, cave bat, prize minigame) substitute at their own handler seams. They are checked before the generic keys, since their records carry no receive-seam key at all.
- A freestanding placed key crosses the same absorption seam as a released key drop, so it substitutes through the drop table under its room.
- A key drop's vanilla item names its size; the record's roomId pins it.
- The persisted placement stats say what generation locked; the same derivation names the rows.
- Physical override rows report from the substitution seam, so only a locked row without a detection is invisible to the session (poll-blind).

## packages/randomizer/src/client/placement-view/

- Crosswalks a placement into the tracker's own vocabulary, so a check can be shown holding what this run put there instead of its vanilla contents.
- A placement is keyed by id, so a real check is its record (packages/randomizer/src/world/location-record maps a shelf's first stock back to the shelf's record).
- The rows the dataset does not model on its own: a slot with no check record takes the virtual id packages/randomizer/src/client/virtual-locations mints for it, so its row shows what this seed placed; an item with no item record is counted and reported instead of silently dropped; another player's item (an online placement) has no record in this game and is shown by name, with its owner's name when the server gave one.
- `sphereByCheck` holds the sweep sphere the location was reached in.

## packages/randomizer/src/client/plan-armed-checks.ts

- Offline mirror of session arming: the check ids a session would physically arm for this placement. apply-overrides.ts allocates a fire id for exactly the fire-reported plan classes, so classifying the placement the same way names the same checks. An offline read then applies the same real-bit versus possession-proxy routing the live poller uses, without a session ever having started.

## packages/randomizer/src/client/plan-scope-flags.ts

- The scope flags of a persisted placement: what generation locked, derived again from the same stats so the bridge and the fill always name the same rows.
- Option toggles lock whole scope tables. A toggle on locks the capability probe's undeliverable remainder, classified with the same probe so both sides name the same rows.
- The capacity spots follow the profile the placement was generated with: a present fairy slot not proven deliverable stays vanilla, and a vanilla meter locks the bat explicitly, exactly as packages/randomizer/src/world/fill/fill-world does.
- A Custom family with a locked spot also hands the poller its starting rung (rung 0 is the empty tier and is included), so the pond's "purchased" compare keeps meaning "advanced by one purchase". Other modes are omitted.
- A wish pond at Vanilla grants locks her own two slots to what her upgrade produces, so no override is armed there and the real upgrade runs. Only a placement that recorded the rule does.
- A non-legacy pond owns its prize slots outright: they are proven deliverable at generation or they are not locations at all, so nothing of the pond is ever capability-locked.
- A slot sold as a prize rung is out of the npc and world scopes, as the fill left it.
- The rolled shop prices live on the placement, not its stats; the plan builder merges them in.
- A placement that kept the legacy pond carries no prize slots at all: its two pond names stay the capacity families' spots.
- Each wish pond's numbered rungs are that pond's own, apart from the capacity pond's.

## packages/randomizer/src/client/plan-target-id.ts

- The id an override arms for a planned item is the native grant id its name resolves to, or the core's foreign-item sentinel for another player's item (an online placement only). The setters check the sentinel against the core's own WasmForeignItemId before arming it.
- `planItemLabel` (now plan-item-label.ts) is what a plan error calls the item.

## packages/randomizer/src/client/players-reply/roster-of-reply.ts

- The server's answer to `!players` is a CommandResult line such as `2 players of 3 connected :: Team #1: Link (Zelda) Ganon :: Team #2: ...`.
- A name in parentheses has no client connected; a bare one has at least one.
- Names may hold spaces, so each known name is matched whole, longest first, and taken out of the line once matched.
- `team` is 0-based while the line numbers teams from 1. A known name the line misses is left out of the roster.

## packages/randomizer/src/client/poll-heap-reads/

- The live-memory reads behind a check detection, all straight off the core's heap: the persisted room-flag words (with the live room's unsaved bits folded in), the overworld event bytes and the progress buffer.
- The live room block is two little-endian words: the room id, then its unsaved flags.

## packages/randomizer/src/client/poll-rebaseline.ts

- The poller's baseline decision, kept pure so it can be tested without a core. It runs on the first tick and after every state load: whatever reads as complete stops being eligible.
- A local session adopts it all silently, since nothing outside the save needs telling. An online session passes `isKnownReported`, and every complete entry the server does not already hold is handed back in `toReport`: those are the checks made while no client was connected, and the server learns of them here.
- Suppressed entries report from the substitution seam, never from polling, so they stay out whatever the state shows.

## packages/randomizer/src/client/pond-demand-messages.ts

- The pond demand lines in the session's composed pool: for every rung of a custom pond whose demand the core asks, its ask, refuse and award lines (pond-demand-lines.ts), appended in pond and rung order and looked up by the core's own (pond, rung) keys, `${pond}:${rung}`.
- A line index of -1 means the rung has no such line.
- The core asks every demand but one: a rupee demand at the rupee pond is that throw's own price, charged by the pond's own flow with its own lines, so it gets none here.
- The rupee pond's award line says whether the water still holds a prize after this one (a later throw carries a prize), read from the plan's throws exactly as the core reads them.
- Rungs asking for the same thing speak the same words, so a line already in the pool is reused and the pool stays small however long the ladders are.

## packages/randomizer/src/client/pond-demand-native.ts

- A rung's rolled demand in the terms the core stores it, at any of the three ponds (core/game-hooks/pond_demands.h): a kind tag, an amount and one native id.
- The kind tags (POND_DEMAND_KIND) are shared with core/game-hooks/pond_demands.h. They are the shelf's currency tags plus one, so zero is "no demand", and item is the one kind a shelf has no tag for.
- counted: the amount, straight through (hearts in whole hearts). bottle: the value the game stores in a bottle slot for that content, with how many bottles of it as the amount. item: the receive id of the named item, resolved the way a grant of that name is, so a progressive family name carries its virtual id and the core reads the tier from live inventory.
- `nativeId` is the bottle-slot value or the item's receive id, 0 for a counted demand.
- Pure: the item lookup is handed in, so a test pins it with a plain map.
- An item name with no receive id is refused: it would arm a demand the core could never test, and a demand armed as none would hand the rung over for free once the handler charges it.

## packages/randomizer/src/client/pond-demand-rows.ts

- Pond demands for a session, the pure half: the placement's rolled demands in, one row per prize rung of every custom pond out, in the core's own keys.
- POND_DEMAND_KEY is the core's key for each pond (core/game-hooks/pond_demands.h).
- A rung is position k in its pond's prize list (pondPlanOf): the prize ordinal at the capacity pond and the rung of the ladder at a wish pond, the same position the demand roll reads.
- Only a custom pond arms rows: a pond at its native economy asks for what it always asked, and a legacy pond has no rungs at all.
- Each row carries its three composed lines (pond-demand-messages.ts), looked up by the same keys. A session without composed dialogue arms -1 for all three, and the core then keeps each pond's own line at that beat.
- A pond arms whole or not at all. An item demand whose name has no receive id refuses every row of its pond, and the refusal line names the rung that stopped it.
- A row keeps the location it came from for the log and the harness.

## packages/randomizer/src/client/pond-prize-target.ts

- The scripted-grant slot a pond prize location arms, or null when the location is no pond's prize.
- Two kinds of pond hand prizes over in order from a table of their own, so both are keyed by position and never by a check record, since most of their slots have none: the capacity pond by the prize ordinal its throw schedule hands over, a wish pond by the water and the rung of its sequence.
- A wish pond at its native economy is neither: its prizes are its own two fairy slots, which are ordinary npc checks and classify as such.

## packages/randomizer/src/client/pond-session.ts

- Pond arming for a session turns the pond setting a placement was generated with into the core's throw table. Split into pond-session.ts (pure translation), arm-pond-session.ts and disarm-pond-session.ts.
- The throw schedule is not stored on the placement: it is derived again from the setting and the placement's own seed (pondPlanOf), so the spoiler, the logic and the running game always read the same prices and the same winning throws.
- The core arms one pond, the capacity one (core/game-hooks/pond_plan.c).
- Each row carries the two pre-rendered lines that belong to its amounts (the price the toss announces, the consolation a losing throw pays), looked up by amount in the session's composed pool (pond-lines.ts). The award line a prize throw shows and the emptied-pond line are armed once alongside them.
- A refused composition hands back -1 for every line, which the core reads as "keep the native one", so the pond still runs its plan with the game's own wording.
- A legacy pond arms nothing at all: the table stays empty, the gate bit stays down, and the pond's own handler runs as it always has.
- Plan fields: `throws` has one row per throw in the order the pond sells them; `prizeCount` is the pond locations of this placement; `awardMoreMessageId` is the line a prize throw shows while the water still holds one; `awardLastMessageId` the line for the throw that takes the last prize; `closedMessageId` the line an emptied pond shows; -1 keeps the native question or refusal.
- Every pond goes down together, so every stop and refusal site clears the wish ponds and the demands too.

## packages/randomizer/src/client/print-json.ts

- Renders a PrintJSON message to plain text. Id parts become names through the room's tables: a player id is a slot, an item id belongs to the game of the slot in its `player` field (the item's owner), a location id to the game of its finder.

## packages/randomizer/src/client/public-api/

Each folder is one concept of the package's public surface, and the package `index.ts` only star re-exports them. The split exists to keep the entry barrel under the barrel line cap, so a name moves between folders without changing what the package exports. Add a new export to the folder of its concept, and add a folder when a concept has none. The folders are `death-link`, `online`, `overrides`, `protocol`, `session` and `tracking`.

## packages/randomizer/src/client/randomizer-completion-bits.ts

- TS mirror of the C allocation in core/game-hooks/npc_overrides.c, the single documented source of the byte addresses and bit assignment. Keyed by check id; keep in lockstep with the C table's vanilla-item rows.
- Several givers gate on possession of their vanilla item and write no completion flag, so their record detections are possession proxies: sound on a normal profile, false-positive the moment a randomizer seed hands the vanilla item out elsewhere. When a session has physically armed such a check, its completion is read from the real bit the substitution seam persists, exposed as progress-buffer bytes 21, 22 and 25 (state_queries.c).
- A check not in the table already has a real-fact record detection.
- Byte 21 bits: 0x01 check-019 river king (swim gear), 0x02 check-033 first sage (running gear), 0x04 check-041 sick child (catching net), 0x08 check-060 escorted elder (reflector), 0x10 check-077 whirlpool dweller (third medallion), 0x20 check-006 standing fungus, 0x40 check-055 shelved tome, 0x80 check-008 dug-up instrument.
- Byte 22 bits: 0x01 check-080 desert tablet, 0x02 check-070 mountain tablet, 0x04 check-039 smithy's tempered blade. The smithy row's own record flag (progress byte 2 bit 4) has no vanilla writer (a dead invented bit), so its armed completion reads this bit instead.
- Byte 22 also holds the wish ponds' four gear upgrades, which have no vanilla completion flag at all: 0x08 check-021 wish pond returning-weapon slot, 0x10 check-022 wish pond guard-gear slot, 0x20 check-266 cursed pond blade slot, 0x40 check-267 cursed pond piercing-shot slot.
- Byte 25 holds the scripted-grant surfaces with synthetic keys (no vanilla receive id): 0x01 check-273 pond capacity explosives slot, 0x02 check-274 pond capacity projectiles slot, 0x04 check-040 the cave bat's meter upgrade, 0x08 check-078 haunted stump's digging tool. The haunted stump's record flag is the song played to it, not the gift.

## packages/randomizer/src/client/receipt-plan-messages.ts

- Renders one contextual receipt line per planned grant of a physical plan (chest override, scripted-giver override, queue delivery) from the frozen placement and the seed's found/total numbers, and records the baked class-template id each grant falls back to when the session dialogue cannot be composed. Vanilla-locked locations keep their native message and get neither.
- The capacity lines follow: a progressive placement appends one line per planned rung per Custom family (capacity-rung-lines.ts), a fixed-jump placement one line per (jump, starting rung) (capacity-fixed-lines.ts), so the core can show the climb a pickup applied.
- The pond's own three situations follow (the price of a toss, a throw that won nothing, an emptied pond, pond-lines.ts): one line per distinct price and per distinct refund of its plan, so a toss announces its real amount instead of a native line naming amounts no plan charges.
- The award line comes in two, one for a water that still holds a prize and one for the throw that took the last, so a player always knows whether the pond is worth returning to. pondLinesOf ends its list with award-more, award-last and closed, in that order.
- The wish ponds' two host lines follow (wish-pond-lines.ts), and the lines every pond speaks for a rung that asks for something close the pool (pond-demand-messages.ts).
- The pond lines are derived from the setting and the placement's own seed exactly as the session's arming does, so the prices they quote are the prices charged. The lines the core speaks belong to the one pond it arms, the capacity one.
- The fallback class line mirrors the core's own routing. Another player's item says what it was and who it went to.
- Index fields point into `lines`; -1 means none (native pond, or no wish pond planned). `rungIndexByFamily` is for progressive placements only, `fixedLines` for fixed-jump placements only, `pondLines` for non-legacy ponds only.

## packages/randomizer/src/client/received-batch-order.ts

- The server sorts a collect or a release by item id, which puts every wallet and bag upgrade at the end, after the rupees, bombs and arrows they would have held. Capacity upgrades go first, so the ammunition and rupees of the same batch land in a bag or wallet that can hold them. Within each group, the server's own order stands.
- `index` is the item's position in the server's received list.

## packages/randomizer/src/client/received-cursor/

- Where the client is in the server's received list, between the queue and the save. The save keeps how many items it holds (packages/randomizer/src/client/received-index), and that number moves only when the game confirms a grant, in list order.
- Items handed to the queue and not granted yet sit between the saved index and `queued`, so a repeated list does not queue them twice. `queued` is one past the last position handed on in a row, never read below the saved index.
- A grant can land out of step with the list (an own pickup echo settles at once, a queued item later), so each settled position is kept in `settled` until every one before it has settled too; the saved index then moves over the whole run.
- A batch is handed on in its own order (received-batch-order.ts), so a position can be handed on before the ones in front of it. Such a position waits in `handed` until the run in front of it is handed on too, and a repeated list skips it meanwhile.
- A save swap resets the cursor, and `epoch` tells a grant queued before the swap that it no longer counts.

## packages/randomizer/src/client/received-index/

- How many server items this save has already been handed. The core keeps it in the save (packages/randomizer/src/ap-received-index). An older core without that export falls back to a value held in the page, which lasts only for this page.

## packages/randomizer/src/client/reconnect/

- Reconnect timing for a dropped room: 1 s, then doubling, never more than 30 s between tries. A successful connect resets the ladder; a stop cancels the pending try.
- `backoffDelay(attempt)` is 0-based. The scheduled listener's `attempt` is 1 for the first try after a drop.

## packages/randomizer/src/client/refusal-text.ts

- A ConnectionRefused in words: one short sentence per error code the protocol names. The network tab shows the sentence; the log keeps the codes. The server may send no codes at all.

## packages/randomizer/src/client/room-hash.ts

- The identity a save keeps of its multiworld room is a 32-bit FNV-1a hash of the room's seed name, over its UTF-8 bytes. Zero is what a save with no room holds, so a hash that comes out zero is stored as 1.

## packages/randomizer/src/client/scope-lock.ts

- Which planned locations the session treats as locked vanilla, and the vanilla item a capability-locked location must still hold (now capability-vanilla-item.ts).
- Lock sources: an option toggled off locks its whole scope table (key drops, npc gifts, world items); with a toggle on, the capability probe's undeliverable remainder stays locked so generation and the session always name the same locations; the boss-prize slots are locked whenever the placement was generated without the prize shuffle (packages/game-data/src/data/records/items/prizes.ts).
- A slot sold as a pond prize is exempt from the npc and world scopes.
- The pond's own table is checked before the npc remainder, because it names the item she produces. The fairy slots carry their vanilla item in the capacity table; the bat is an npc-scope row.
- ScopeFlags fields that are absent mean the online flags: nothing capability-locked, nothing capacity-locked, no pond lock, no rung locations, no exemptions.
- `shufflePrizes` off (or absent) keeps every reward slot locked to its vanilla prize.
- `npcLockedLocations` (npc option on only) are scope locations generation keeps vanilla because they have no certified physical path (npc-capability). `worldLockedLocations` is the same over the world-item table.
- `capacityLockedLocations` are the capacity spots generation keeps vanilla under the placement's profile: present fairy slots with no certified physical path, and the bat of a vanilla meter (plan-scope-flags.ts).
- `pondLockedItems` are a wish pond's vanilla slots locked at Vanilla grants, each to the item her upgrade produces there (packages/randomizer/src/world/pond/pond-vanilla-slots), so no override is armed and the real upgrade runs.
- `capacityStartTiers` maps a locked spot of a Custom family to its starting rung (0 is the empty tier), so a polled "purchased" threshold is read past the tier a new file starts at.
- `shops` is the shelf scope the placement was generated with. A placement from before shops existed carries none, which reads as no slot open, so every shop behaves as with the option off. `shopPrices` empty means every shelf keeps its vanilla price.
- `pondPrizeLocations` are the pond's prize slots in prize order when the pond is part of the shuffle. Absent (a legacy pond, and the online flags) means the two reference slots are the capacity families' own spots.
- `wishPondRungs` maps each numbered rung location to its water and place in sequence (wish-pond-rung-keys.ts). Absent when both wish ponds are legacy or at their native economy.
- `pondPrizeSlots` are a wish pond's own two slots that her Custom mode sells as prize rungs (packages/randomizer/src/world/pond/pond-vanilla-slots). The npc and world scopes no longer decide them, in the fill (packages/randomizer/src/world/fill/fill-world) and here alike: they carry a pool item handed over by the rung table.

## packages/randomizer/src/client/scouts-to-placement.ts

- Adapter: a server's scout answers and slot data turned into the Placement a local seed with the same options would have produced, so an online session arms through the same start sequence a local one does (session-start.ts).
- The fill world is built from the slot's options the way the generator builds it, with no fill run: the scouts say what every location holds. Generation-locked rows keep what the fill world pre-places.
- This slot's own items map through the frozen id table; another player's item, or an id this game does not know, is the foreign item.
- The stats come from the generator's own function over that world, and the sweep gives the spheres the Spoiler tab groups by.
- `fallbackSeed` is the room's seed name, used when the slot data names none.
- Deliverable sets: the caller's, else the ones the slot's world was built with, else the app's probes (a room from before slot data carried them).

## packages/randomizer/src/client/scripted-override-key.ts

- Substitution keys for the scripted grants that never cross the receive seam: the certified surfaces of core/game-hooks/scripted_grants.c. Each is a singular, decomp-audited grant moment: the upgrade pond's two capacity purchases (its handler's own once-per-level counter bumps), the cave bat's meter write, and the prize minigame's once-only top roll (its own chest routine, outside the native chest table).
- Keyed by check id so the capability probe, the classifier and the arming switch always agree.
- Table rows: check-273 the pond's explosives-capacity slot, check-274 the pond's projectiles-capacity slot, check-040 the cave bat's meter upgrade, check-270 the prize minigame's top prize (room 262).
- getCheck throws on an unknown id, so looking the check up keeps the table honest with the dataset.

## packages/randomizer/src/client/server-address/

- A profile's server address as the two fields the connection form edits. The profile keeps one `host:port` string, the shape the connect path reads (packages/randomizer/src/client/server-url); a scheme the address names stays on the host. For example `wss://host:38281` splits to host `wss://host` and port `38281`; no port gives an empty one.

## packages/randomizer/src/client/server-host-locality.ts

- Whether a server address names a machine on this computer or its local network. A local Archipelago server answers plain ws:// only, so a secure attempt there can only fail.
- Local means a loopback address, a private or link-local IPv4 range, an IPv6 loopback, unique-local or link-local address, a `localhost` or `.local` name, or a bare machine name with no dot in it.
- An unbracketed address with several colons is a bare IPv6 address with no port.
- The `IPV4` pattern flagged by no-slop-identifiers was local, renamed DOTTED_QUAD.

## packages/randomizer/src/client/server-url/

- The creation form accepts a bare host:port, and the scheme it needs depends on the host: the public servers only answer wss://, a local server only ws://. So a bare address keeps no scheme, and the connect path tries each candidate in turn. A local address (server-host-locality.ts) is tried as ws:// only; any other secure first, plain second. An address that names its scheme is tried as written.

## packages/randomizer/src/client/session-wallet-table/session-wallet-table.ts

- The session's wallet jump table, host side: the TS mirror of the sixteen slots wallet_grants.c holds (slot s of virtual id 0x67 + s maps to ladder rungs).
- Both halves are rebuilt from the same family plan at every session start (apps/desktop/src/game/randomizer-client/capacity-session), so a wallet item name resolves to exactly the slot the core will climb by.
- Empty outside a session: a wallet name then resolves to nothing, which the plan reports as an unresolvable item instead of granting a blind slot.

## packages/randomizer/src/client/session.type.ts

- The randomizer session contract: the surface a session mode exposes to the location poller and the UI. A local session resolves a reported check from its own placement table; an online session forwards it to the server.
- `reportCheck` is the poller telling the session a planned location just completed in live memory, keyed by its standard name.
- 'reconnecting' is online only: the server dropped or was never reached, and the session is retrying.
- The file had its header on line 2; it is now on line 1.

## packages/randomizer/src/client/shop-override-key.ts

- The in-core substitution key of a shop-slot location comes off the slot's own check record (`gameId.shopSeam`): the shelf's room, the entrance and overworld area that tell apart a room several doors share, and the shelf sprite's own subtype, which is unique inside any one shop. Together those name one shelf in the running game.
- A restock past the first has no record of its own, because the unmodified game has no such spot; it takes the first one's seam and its own depth index.
- The depth pair rides along so the core knows which purchase of the slot this entry is, and when the slot runs out.
- ENTRANCE_ANY and OW_AREA_ANY (-1) are the core's "match anything" values, for a shop the earlier fields already name.
- A rolled price replaces the shelf's own; with nothing rolled the shelf keeps charging the rupees the unmodified game charges.
- A price with no native form (packages/randomizer/src/world/shops/shop-price-native) cannot be sent, so the shelf gets no override. Only an item price is shaped that way, and no shelf can roll one, so this is the shape of the refusal, not a case that runs.

## packages/randomizer/src/client/slot-data-values/

- The per-seed values a slot's data carries, read into the shapes a local placement keeps: the options snapshot, the two medallion locks, the rolled pond demands and shelf prices, and the deliverable spots the world was built with.
- A value the slot does not carry, or carries in a shape this game cannot read, is absent, and the caller falls back the way a placement from before that value existed does.
- A medallion arrives as its key or its name; anything else keeps the vanilla lock.

## packages/randomizer/src/client/slot-death-link.ts

- One DeathLink source: the profile's toggle. It is written into the player file, the world package hands it back as `slot_data.deathLink`, and once Connected that value decides.
- The Connect packet's tags still come from the profile flag (no slot data exists yet), so when the two disagree the tags are corrected with a ConnectUpdate. The session started with the profile's flag already applied; only a disagreement changes it.

## packages/randomizer/src/client/standing-override-key/standing-override-key.ts

- Substitution keys for standing in-world items: decides, per check record, how the in-core standing table (or the plain grant seam) can identify the pickup. Three certified shapes, all from the decomp audit.
- The standing prize sprite (the quarter-heart pickup, sprite 0xeb, one touch-grant handler) is keyed by overworld screen outdoors, and by room plus which horizontal half of the room indoors (the same bit its own obtained flag uses).
- The dash-item dungeon key (sprite 0x3b; its key form bumps the key counter with no receive) is keyed by room, in the two audited key rooms (115 and 140, one per room).
- The receive-crossing world grants (the fungus, the book, the dug-up instrument, the two tablets, the ceremonial sword) cross the plain Link_ReceiveItem seam with a vanilla item unique across roomless givers, so they key by item alone in the npc table. Their native receive ids are 41, 29, 20, 15, 16 and 1. The tablets use receipt method 3, where the seam still applies.
- The indoor half comes from the detection mask: the obtained bit 1024 is left, 512 is right. A maskless record in a shared room takes the half its roommate leaves free (room 283 takes the right half); a maskless record alone in its room matches either half (2).
- item-024 is the heart piece and item-037 the dungeon key.

## packages/randomizer/src/client/tracker-availability/

- Tracker statuses for a randomized session: availability comes from the ported rule engine evaluated over the frozen placement, never from the hand-authored normal dataset (which models neither the seed nor the standard-mode escape).
- Completed checks crosswalk to placement locations by their community-standard name. A check whose name is not a location of this placement (event and prize slots, dataset gaps) can never inflate availability, so it reports blocked unless the player completed it.
- A shelf slot or pond prize past the reference's two has no check record (see apps/desktop/src/game/randomizer-client/override-fire-registry), so its completion never reaches `completedChecks`. firedLocationKeys is the session's separate record of those substitutions, folded in so their items still enter the collected-item state the rule engine evaluates against.
- `checks` carries both real CheckRecords and the virtual ones packages/randomizer/src/client/virtual-locations synthesizes for every world location none of those cover (shop slots, chiefly). A virtual id is never in the live-polled completedChecks set, so its status reads off completedLocations / available by its own name.
- completedLocations answers for both kinds. A real check whose normal detection cannot fire in this seed would be stuck at reachable forever: the pond's two named slots keep the records the reference's names gave them and poll the capacity counter bytes, and a randomized pond hands over a pool item without writing either one.
- The completed set carries the event rows too, the record of what the player did. Handing the ids over lets the rules ask about an act instead of guessing it from an item or from the lever being within reach.
- `heldItemIds` are the dataset item ids the player is holding, which the seed world reads by pool name.
- `bigKeyDoors` off (the tracker's "Big Key doors" switch) reads every big key door as open by putting the keys in the state's hands: a door whose key is held is open, so no rule needs a second version (packages/randomizer/src/world/big-keys). `smallKeyDoors` off does the same with each dungeon's small keys, as many as any rule counts (packages/randomizer/src/world/small-keys).
- `reachableScreens` are the dataset screens the engine's regions come out to, for the rows read from the records. computeTrackerSnapshot is for a caller with no use for the screens.

## packages/randomizer/src/client/virtual-locations/

- Synthesizes tracker-facing CheckRecord-shaped entries for every world location this seed placed an item at that no real CheckRecord backs (shop shelves at every restock depth, chiefly). Built fresh per placement so the widget's total matches what this seed generated, never a smaller fixed dataset that silently drops whole categories.
- A virtual record carries no gameId: there is nothing to poll, its status comes from the availability engine and the fire-id ledger, both keyed by the raw world location name.
- Its kind is the one its real siblings carry (a restock is a shop slot, a pond rung a pond slot), so the "type" facet puts every rung of a ladder together; it is not a detection claim.
- vanillaItemIds carries the real vanilla item where one exists (a shop shelf, a key-drop pot). Everything here hands over a real item, so isGuaranteedReward is true even with no vanilla precedent (a pond prize rung).
- A restock rides on the screen its own slot's record names, which is what the world and area grouping reads.
- The slug keeps underscores, because a shop key uses them (`kakariko-shop-shelf_left-slot_2`). A key is already slug-shaped, so mapping a virtual id back to its location is exact.
- The virtual id is shared with packages/randomizer/src/client/placement-view so a virtual check's row and its placed-item lookup can never drift onto two ids for the same location. tracker-availability now reads VIRTUAL_PREFIX from here too.
- One cache slot: placements do not change mid-session, and this only runs against the active one.
- placementCheckRecords is every real record this seed's placement names plus a virtual one for every location none cover. A few checks (the intro's story beats such as "Link Wakes Up", "Rescued Zelda") track real vanilla progress but were never world locations, so counting them would inflate the total; they stay in the base checkRecords array for the normal profile.
- The event records are shown on every profile and are never part of a seed's total. No event is a location of any world, so that list and the placement's never overlap.

## packages/randomizer/src/client/wish-pond-lines.ts

- The two lines a planned wish pond speaks for itself. A planned visit takes no throw and asks nothing, so the native lines at those two beats (the question after she rises, the refusal of a spent water) cannot stand.
- The award: she rises and says this, then the visit's one rung follows on its own receipt. The closing: a water whose ladder is spent, every time she is spoken to.
- A rung that asks for something speaks its own award line instead (pond-demand-messages.ts), since the player did throw something in.
- Neither line names what she hands over; the receipts say that. Candidates run fullest first, so the composer keeps the longer wording when the box has room (receipt-line.type.ts).
- Both waters share the wording, so the pool carries one of each, and only when at least one water is planned (runs on a plan).

## packages/randomizer/src/client/wish-pond-rung-keys.ts

- The two item-throwing waters as the core counts them, and which of a placement's locations are their numbered rungs. The core reads a water by its place in wish_pond_plan.c's own order (the light world's water first, the dark world's second), so that index is written once here and every other file asks for it by pond id.
- A rung key is which water and its place in that water's sequence from zero.
- A rung is a location only while its pond's plan lists it: a legacy pond lists nothing, and a pond at its native economy lists its own two fairy slots, which are ordinary npc checks and never rungs. Pure: a function of the settings alone.

## packages/randomizer/src/client/wish-pond-rungs.ts

- Wish-pond arming for a session, the pure half: the two waters' settings and the classified plan in, one rung row per prize location out, in the order each water hands them over. Nothing here touches a module, so a test pins it with a plain counter standing in for the fire-id ledger.
- capacity (legacy): no rows; the water keeps its native branch list.
- vanilla-cost: the water's own two fairy slots. Each rung hands over that slot's vanilla receive id with no fire id, so the grant crosses the receive seam, where the npc table substitutes the placed item, marks the slot's bit and reports the check as the vanilla throw would. That only pays when the slot's npc entry is armed in the same session, so a slot the plan did not classify as one refuses the whole water.
- custom: the numbered rungs. Each hands over the placed item's own receive id with its receipt line and a fire id from the session's ledger, which is what closes the rung.
- A water arms whole or not at all: the core reads a missing rung as the end of the ladder, so a gap would strand every rung past it.
- Fire ids are allocated only once the whole water is known to arm, so a refused water leaves nothing behind in the ledger.
- `assigned` is false for a vanilla slot, which the receive-seam table substitutes and reports. A row keeps its location and item names for the log and the harness. `rungs` of a water plan is empty for a legacy water and for one that refused; `refusal` says why a water with prizes arms nothing. The session plan's `rungs` is every rung of both waters, the single call the core takes.
- Context: `messageIdOf` gives one location's pre-rendered receipt line or -1; `fireIdOf` allocates the completion id in the session's ledger; `lines` are the two host lines every planned water speaks.

## packages/randomizer/src/delivery-execute/

- The one place a queued delivery reaches the core. It was split from delivery-queue.ts so the execute and refuse contract has a single home.
- Outcomes: 'done' means the action fired (for a receipt grant, the core confirmed it). 'refused' means the receipt export reported status 0 and nothing was granted (gate not latched yet, or the player cannot receive despite the readiness probe); the queue must retry such an entry, never complete it. 'settled' means granted with nothing left to show (a quiet receipt), so the entry completes at once instead of waiting for a pickup the game never runs.
- A receipt-flow grant is the only action the core can refuse synchronously.
- WasmGrantQuietReceipt answers 1 granted, 0 not now (retried), 2 not quiet here (the ordinary receipt runs in its place).
- Randomizer deliveries (receiptExport) run the native receipt flow: hold-up, message and inventory, gated by kFeatures3_ReceiptExport. The cheats UI and the simulator keep the cheat export (WasmCheatGiveItem) and its cheat and sim gates.
- The one-shot receipt message is armed at execute time, not at enqueue: the queue may hold several entries and the slot is consumed by whichever receipt finishes next. Re-arming on a retry records the same id again, because the setter only records.
- WasmGrantItemWithReceipt returns 1 granted, 0 refused (receipt_grant.c). A pre-status WASM build returns undefined from the void export, which counts as the old fire-and-forget behaviour instead of retrying a grant that may have fired.
- A heart piece (0x17) skips the npc message arm: a non-wrapping piece never crosses the message seam, and the stale arm would leak into the next unrelated receipt.
- The Assigned npc trigger bypasses the core's npc override seam because the queued item is already the host's final answer. The plain form replays the giver's vanilla grant, which an armed npc override table may substitute.
- A bad onGranted listener never stalls the queue.

## packages/randomizer/src/delivery-queue/delivery-queue.type.ts

- Moved to packages/randomizer/src/delivery-queue/delivery-queue.type.ts.
- DeliveryEntry: `message` is the human-readable text in the queue indicator; `source` is 'cheat', 'randomizer', a player name and so on; `enqueuedAt` is the enqueue timestamp.
- `refusals` counts the times the core synchronously refused the entry's receipt grant (status 0 from WasmGrantItemWithReceipt). A refused entry stays at the front and retries; it is never dropped and never completed as delivered.
- `onComplete` fires once the game has fully consumed the delivery and is ready for the next item (WasmCanReceiveItem went false during the message or pickup, then back true), or on timeout. The simulator awaits it so trigger() paces the runner off real completion, not the synchronous flag write.
- `onGranted` fires once, the moment the core confirms the grant. Never for a refused attempt and never for an entry removed or cleared before it executed, so it counts exactly the items that reached the player.
- give_item `receiptExport` true routes the grant through WasmGrantItemWithReceipt (gated by kFeatures3_ReceiptExport), set by the randomizer path (apps/desktop/src/game/delivery-api). Absent or false keeps WasmCheatGiveItem: the cheats UI and the simulator run under the cheat and sim gates and must not silently move to a gate their sessions never arm.
- give_item `messageId` is an optional contextual receipt message id (RANDOMIZER_RECEIPT_MSG, or a raw dialogue message index) armed as a one-shot right before the grant. Omitted, the core derives a class default from the item id. Only meaningful with receiptExport.
- give_item `messageOf` answers the message id when the entry reaches the front, for a line composed only then (a received item's line, apps/desktop/src/game/randomizer-client/server-delivery). It is asked on every attempt, so a retry after a refusal gets the same id, and it wins over `messageId`.
- quiet_receipt: the rupees, bombs or arrows go straight to the wallet, bag or quiver (WasmGrantQuietReceipt), no hold-up and no message. When the core answers the receipt is not quiet (its option was turned off after queueing), `fallback`, the ordinary receipt, runs instead.
- trigger_npc_check `assigned` true marks itemId as the host's final answer (the randomizer path), bypassing the npc override seam. Absent or false replays the giver's vanilla grant (the cheats UI passes the dataset's native item), which an armed npc override table may substitute. Its `messageId` has the same contract as give_item's.

## packages/randomizer/src/foreign-items/foreign-item-id.ts

- The core's foreign item sentinel (foreign_item.c) is the id an override arms at a location whose item belongs to another player in a multiworld.
- The plan carries the mirrored number (foreign-item-sentinel.ts); a setter asks the core itself, so a core that disagrees refuses the arm instead of taking an id it would read as something else. A core built before the export existed answers with the mirrored number.
- coreHasForeignIcons: a core built before the icon ids does not know them.
- An override setter may arm a native grant, the foreign sentinel, or one of its icon ids when the core knows them. The core refuses those itself unless kFeatures5_ApOnline is set, so outside an online session they reach exactly the code they reached before.
- coreHasForeignIcons is no longer exported (nothing imported it).

## packages/randomizer/src/foreign-items/foreign-item-sentinel.ts

- The foreign item sentinel as the core defines it (foreign_item.c FOREIGN_ITEM_ID), mirrored so a plan can carry it without a running core. apps/desktop/tests/randomizer/ap-online-core.keep.test.ts parses the C source and fails the moment the two disagree.
- The icon ids are the same item held up with a game icon: id FOREIGN_ICON_FIRST_ID plus n shows picture n of foreign-icons.4bpp (FOREIGN_ICON_FILES order). Mirrored from the core's FOREIGN_ICON_FIRST and FOREIGN_ICON_LAST the same way.
- isForeignIconId moved to is-foreign-icon-id.ts, so the data file holds data only.

## packages/randomizer/src/foreign-items/receipt-jump-text.ts

- The session line for a capacity upgrade addressed by its virtual receive id, the form the delivery labels and grant logs hold, for example "Explosives +2 tiers" or "Wallet +500 rupees".
- The step families carry the jump in the id; a wallet slot resolves through the session's jump table (the same table the core climbs by), so the text can never disagree with the grant.
- Never a running total: see capacity-jump-text.ts. A progressive id carries no jump of its own, so its label names the next planned step.
- Undefined for a non upgrade id or an unarmed wallet slot.

## packages/randomizer/src/generate.ts

The generation entry point. It delegates to the ported reference pipeline (`packages/randomizer/src/world/fill/generate.ts`) for a frozen option snapshot. The optional sets name the npc-scope locations, capacity slots and world items the app proved physically deliverable; with the matching option on, only those shuffle and the rest stay locked vanilla. Absent counts as empty, so library callers always get valid seeds.

## packages/randomizer/src/normal-placement/

Normal play as a placement: every location holds what it holds in the unmodified game. This lets one engine answer for both modes: Normal becomes the seed where nothing moved, so the engine cannot disagree with itself. Nothing is shuffled and no rng is drawn, so the result is the same every time.

The world Normal plays in has every location the game has. Key drops and the npc and world scopes are all on, because in the unmodified game those places exist and hand over what they always did. `NORMAL_DARK_ROOMS` is the generator's own dark-room model with the one light the unmodified game gives; it is written down so the tracker rebuilds this world with the reading Normal was measured under, and its own "dark rooms need a light" switch composes from a stated base. A missing `storyGates` means the story as the game tells it; `world` carries anything else a profile turns on. The sweep runs after the items are placed, because a rule may read the fill seam.

`normalPlacementStats` gives the stats of the Normal placement: nothing shuffled and every setting at the reading the reference world pins, so a rebuild from these stats is the unmodified game.

`originalContentOf` maps a location to its original item in the pool's own terms. Five recorded items are generic because the dataset names the object, not the copy: Small Key, Big Key, Map, Compass and Heart Container. The pool names each for its dungeon, so those are resolved from the dungeon the location sits in, read off the world graph. Order matters: the scope and key-drop tables name the copy directly, so they win over the check record's generic reading.

## packages/randomizer/src/options-snapshot/

The frozen option snapshot recorded on a randomized profile. `buildOptionsSnapshot` freezes the whole catalog (baselines plus the caller's unlocked choices; overrides apply only to unlocked options). `normalizeRandomizerOptions` reads a stored snapshot back over the baselines, so a row added to the catalog after the snapshot was frozen reads as its baseline. Anything that is not a snapshot under the current schema reads as a fresh one: an older shape is a clean break.

## packages/randomizer/src/placement-availability/

Tracker availability over a frozen placement. The player's logical inventory is the multiset of items at the locations already completed, plus every story event within reach and every dungeon prize slot whose location is in logic for that inventory. That is the reference sweep's semantics: an in-logic slot's content counts because the player can go take it. A location is available when its region and access rule pass and it is not completed yet.

The world is rebuilt from the placement's own frozen record and the locations are loaded over the fill seam, the same replay idiom the standard-mode verification uses, so availability always answers for this seed under the ported rules. `worldFromPlacement` passes every setting the fill read. A field left out falls back to `buildFillWorld`'s own reference default (the lamp-only escape, no shops, every progressive tier); that is how the escape once stayed unreachable for a player who lit their way with a Fire Rod or Cane of Somaria. The tracker's own dark-room switch, when off, reads every unlit room as walked in the dark, whatever the seed asked.

`sweepAutoGrantedSlots` is a fixpoint over the prize locations and the story events: an in-logic slot's content, or an event within reach, joins the inventory, which can open more. Locations already in the state's hands are skipped, because sweeping one again would count its item twice. With a record of what the player did attached, the record alone answers: a crystal or pendant is held once its boss is beaten, and one merely within reach is not held yet (counting it once opened Ganon's Tower). A story event is the same.

`heldItems` is what the player holds. A gift from another world, a cheat grant, or a pickup whose location was never detected all put an item in hand that no completed location accounts for. Each item is a floor over what the completed locations gave, never an addition: a crystal in hand is the same crystal its finished dungeon handed over (adding them once read four crystals as eight). Listed twice means at least two are held, which is how a counted item such as a small key is handed over. `completedCheckIds` lets the acts among the completed checks be read as acts (`events/`); absent means no record is attached and every act falls back to the capability that would perform it. `computePlacementAvailability` is the availability half alone.

## packages/randomizer/src/public-api/

Each folder is one concept of the package's public surface, and the package `index.ts` only star re-exports them. The split exists to keep the entry barrel under the barrel line cap, so a name moves between folders without changing what the package exports. Add a new export to the folder of its concept, and add a folder when a concept has none. The folders are `delivery`, `overrides`, `placement`, `world-model`, `world-options` and `world-progression`; the three `world-` folders re-export the world model.

## packages/randomizer/src/receipt-text/capacity-fixed-lines.ts

The lines of a fixed-jump capacity plan (the progressive switch off). A fixed item carries its jump, but the capacity it climbs from is known only in the core at grant time, because the shuffle decides the order copies are found in. So the session pre-renders one line per pair of item jump and possible starting rung, and the core selects by the live rung (`capacity_fixed_lines.c`). The counted families and the meter can stand on any rung below their top (a locked pond's native step moves them off plan), so every rung is a candidate start. The wallet has no native step, so only the sums the plan's own jumps can reach are.

- Arms the (family, starting rung, jump) to receipt-line table the core's fixed-jump resolvers read (core/game-hooks/capacity_fixed_lines.c). When a fixed item lands, the core looks up the line pre-rendered for the rung it climbed from and shows it in place of the location's jump-only line.
- Writes only record, the same contract as the plan and the wallet table. The read side answers to the grant seams and kFeatures3_ReceiptMessages.
- `messageId` is the pre-rendered line's message id in the session dialogue.
- The session layer composes the entries from the family plans; this module is the ccall surface only.

## packages/randomizer/src/receipt-text/capacity-jump-text/

The jump one capacity upgrade performs, as receipt text. A receipt shows the jump and never a running total: collection order depends on the route, so "now 35" is true for one of the many orders a seed can be walked in while "2 tiers" is true in all of them. The counted families' tier values are uneven (the last tier is +10, the others +5), so a value label would change meaning with position; a tier count does not. The wallet ladder is uniform (100 rupees per step), so its jump is shown in rupees. The family label comes from the capacity model, never a game name.

## packages/randomizer/src/receipt-text/capacity-rung-lines.ts

The per-rung lines of a progressive plan. A progressive item's jump is known only when it lands (the plan entry the family's reached rung points at), so the session pre-renders one line per planned rung per Custom family, in plan order, and the core picks line k when the k-th pickup resolves. The from and to values of rung k are the plan's cumulative rungs k and k+1. A profile with no Custom family has nothing to pre-render.

## packages/randomizer/src/receipt-text/capacity-rung-values/

What one capacity climb reads as on the receipt, for example "Your bomb bag swells 2 tiers. 10 > 20. 50 is the ceiling." The numbers are the point (tiers jumped, the capacity before and after, and where the family is headed), carried by a sentence the game would say. A rung reads as the family's own ladder entry (`capacity-ladders.constants.ts`). The meter is the exception: its bar never grows, because its rungs are the cost tiers the game has, so a meter climb names those (none, normal, half, quarter). The wallet counts in rupee caps.

The ceiling sentence names the plan's final rung, not the next one (a phrase like "on the way to" read as the next pickup's rung, which it never was); on the last rung it says the climb has arrived. The composer may drop it when the box is short of rows, so the jump and the two values always survive. The family label carries the primary highlight, as an item name does, and opens a possessive clause so it reads as speech. Each family has its own growth verb so the four lines do not read as one template; the verb takes an "s" for a family whose label is a singular noun. The climb is the receipt's second page: the first is the line every item gets in that context, and the core joins the two (`receipt_pages.c`).

## packages/randomizer/src/receipt-text/highlight-markup/

The markup a receipt line uses to colour names: an item name in the primary highlight, a player name in the secondary one. Each span is a private-use character, the words, then the end character, so the markup never collides with a name the player typed. The dialogue composer turns the three characters into the core's highlight bytes (`session-dialogue`); they have no width, and any copy of a line meant for reading strips them. `HIGHLIGHT_KIND` uses the core's numbering: 0 closes, 1 is primary, 2 is secondary. `capitalizeMarked` upper-cases the first letter, looking past any marker that opens the text. `balanceRows` closes the span each row ends inside and reopens it on the next row, so a row read on its own (a choice line repeats its last row as the prompt) still starts in the right colour.

## packages/randomizer/src/receipt-text/numbered-item-label.ts

The item label of a receipt line, numbered when the seed can count it: "Small Key of Eastern Palace (2 of 4)", "Piece of Heart (3 of 4 to a heart, 7 of 24)", "Sword tier 2 of 4", "Bottle (2 of 4)", "Crystal 3 (3 of 7)", "Triforce Piece (12 of 20, 30 available)". A dungeon item names its dungeon in every case; the other numbers appear only with a count (an online receipt has no seed to count from and shows the plain name). The names come from the placement data. The name carries the primary highlight and the numbers stay plain. The fourth heart piece says what it did: "(4 of 4, a whole heart, 8 of 24)". The label carries that news so every candidate of the line keeps it.

## packages/randomizer/src/receipt-text/pond-demand-lines/

The three lines a pond speaks for a rung that asks for something, at any of the three ponds (`core/game-hooks/pond_demand_visit.c`).

- The ask: a yes or no box naming the demand ("150 rupees", "5 bombs", "a bottle of Red Potion", "3 Bees in bottles", "the Hookshot"). An item is only shown, so she asks for it to be thrown in as proof.
- The refuse: a yes from a player who cannot pay.
- The award: what she says when she rises with the gift. An item goes back with it, and she says so. The rupee pond also says whether the water holds more; a paid demand at a wish pond thanks the offering in place of the line a free rung speaks. The award is absent when the pond's own award line already fits.

Counted amounts reuse the shop's price labels. A one-count label drops its plural "s", because "1 bombs" reads wrong when spoken, and the shared price label only singularises hearts (a shelf shows its price as digits beside a picture). A progressive family names the thing itself ("the Sword"). The bottle label already ends in "in bottles", so the bottle prompt falls back to the pronoun; page one carries the demand for every kind. The composer keeps the fullest ask the box can page (`choice-message.ts`); the terse last candidates are the fallback for a very long label, and every one still names the demand. What she asks for carries the primary highlight in every line.

## packages/randomizer/src/receipt-text/pond-lines/

The four lines the pond speaks for itself. Every other receipt line belongs to an item; these belong to the transaction around it.

- The price: what one toss costs, in place of the vanilla two-choice line, which offers two native amounts a plan does not charge. Rung 0 of the price ladder is free and says so.
- The loss: a throw that wins nothing, carrying the rupees handed back (the vanilla line promises a flat hundred, which is wrong under any plan whose refund is half the price).
- The award: a throw carrying a pool item, in place of the vanilla question asking which capacity family to climb. It shows in one box, so the purchase keeps its beat: the fairy speaks once, then the item arrives on its own line. One wording for water that still holds a prize, one for the throw that took the last; this is the only place that can be said, because a pond with nothing left refuses the throw and speaks the closing line.
- The closing: an emptied pond, in place of the vanilla come-back-later refusal.

A plan pre-renders one line per distinct price and one per distinct refund above zero, then the two award lines and the closing line, which sit at fixed offsets from the end. The two key arrays say which line each amount landed on, so the arming can look an id up by the price or refund of the throw it writes.

## packages/randomizer/src/receipt-text/receipt-counts/

The found and total numbers of a seed's countable items. A count class groups the copies of one thing the player collects several of (a palace's small keys, the heart pieces, the bottles, the crystals), and the seed's placement fixes the total per class. Found so far is a tracker fact: the completed locations, whichever copies they held. The ordinal of a location is one more than the other completed locations of its class, so a line reads the same before and after its own location completes, and the renderer can recompose on every tracker change without ever showing k+1 for the copy being received. Key drops count only under key-drop shuffle; with it off they stay vanilla pickups the tracker never sees. `required` is the goal's requirement for a triforce piece, absent when there is no such goal.

## packages/randomizer/src/receipt-text/receipt-flavour/

The voice of a found-item receipt. Every line carries the numbers, which live in the label (`numbered-item-label.ts`), but the sentence around them is written per item class, so a key, a heart and a crystal do not read as one template with the nouns swapped. Each class also answers to where this copy sits in its set: the first, the one that completes the set, or another along the way. Heart pieces answer to the quarter instead, because four of them make a heart whatever the seed's total; the label already says which quarter, so the sentence names only the source. The retro bow's quiver answers for itself: it is the one item whose point is that the bow was useless without it, and it shows only in a retro seed with shuffled shops (`packages/randomizer/src/world/retro/retro-pool`). Candidates run fullest first, so a long location name costs the flavour, then the source, and never the numbers. An item speaks in its count class where it has one, else the dungeon-item shape for the uncounted palace pieces, else the plain found line.

## packages/randomizer/src/receipt-text/receipt-item-class.ts

Sorts a standard item name into the message class its receipt line is rendered from. Progressive and dungeon-restricted items are recognized from the name's own shape. A capacity upgrade is recognized from the name tables (the name carries its family and jump). A progressive capacity item is checked before the progressive equipment prefix, because its name starts the same way but its jump is the plan's. Junk is everything the reference item table classifies as filler, neither progression nor useful (`packages/randomizer/src/world/pool/item-classes.constants.ts`). The two classes are id sets, and the caller has a name because the wire speaks names.

## packages/randomizer/src/receipt-text/receipt-line.type/

One receipt line as the renderer hands it to the dialogue composer: a single text, or a list of candidates from the fullest wording down to the shortest. The text box shows three rows of a fixed pixel width, and the composer is the only place the real glyph widths are known, so it keeps the first candidate that fits and falls back down the list. A long location name costs the source clause, never the numbers.

A line can also be a yes or no question (`ChoiceReceiptLine`). It carries what she says as candidates, a short `prompt` for the page the answers sit on, and the two answers. The first answer is the one the game reads as yes. The answers take the lower two rows, so anything longer than a row is paged: what she says, a key, then the prompt with the answers under it (`choice-message.ts`). When no prompt fits, the last row of `ask` stands in.

A line can also be a detail page (`PageReceiptLine`): the core shows it as the next page of the line armed for the same receipt (`receipt_pages.c`), so the receipt reads like every other one and the details follow a key press (`page-message.ts`). `receiptLineKey` joins every text a line carries, prompt and answers included, which is what tells two lines apart.

## packages/randomizer/src/receipt-text/receipt-templates/

One pure renderer per situation. Every placeholder is filled from real data (the frozen placement, the check dataset, the network session). The template text stays name-free and uses only the game alphabet's shared punctuation (letters, digits, space and `.,!?-'"()>`); the colon the capacity lines carry is mapped to " -" by the composer for alphabets that lack one. The found line's wording is per item class (`packages/randomizer/src/receipt-text/receipt-flavour`); these are the situations a class cannot speak for. A capacity upgrade has no situation of its own: it takes the line of its context and its climb follows as a second page.

- Found item (local seed): a chest or giver hands over a shuffled item.
- Progressive tier with no seed to count from (an online receipt): the core decides the tier from live inventory when the grant fires, so the line carries no number. The slot is the whole subject.
- Delivered: from a check with no physical container.
- Online: another player found the item. From server: the server itself sent it (a command, the starting inventory).
- Junk or trap.

## packages/randomizer/src/receipt-text/render-receipt-message.ts

Picks the template for one planned grant and renders its line. A grant the seed can count (a palace's keys, a heart piece, a bottle, a progressive tier, a prize) takes the found line with its numbered label and its class's wording, so the numbers always show and never twice. Otherwise physical grants (chest and scripted giver overrides) are routed by item class: progressive, dungeon item, junk, or the plain found line. A capacity upgrade takes the plain found line, because its climb is known only when the grant resolves and the core shows it as the next page. Queue deliveries always take the delivered template, because the missing container is the salient context. Online receipts are rendered separately because their sender is known only at network time. Only `physical` and `delivered` grants have a pre-rendered line; vanilla-locked has none.

## packages/randomizer/src/rng/

The seeded deterministic generator. A seed string hashes to a u32 with FNV-1a over its UTF-16 code units, which seeds a mulberry32 stream, so the same seed string gives the same sequence forever on every platform (all math is u32 through `Math.imul`). `next` gives a float in [0, 1); `int` a uniform integer below its bound; `shuffle` is Fisher and Yates and returns a new array, leaving the input untouched.

## packages/randomizer/src/spoiler.ts

Renders a placement's spoiler as text: the seed line, the two rolled medallions, then the verification sweep's spheres with each location's item. A placement holds ids, so every name is read off the record at print time.

## packages/randomizer/src/world/accessibility/accessibility-check.ts

The post-fill verdict is the single-world reading of `fulfills_accessibility`. The source walks only the locations it calls relevant and stops once every one that has to be collected has been, with the goal reached:

- `location_relevant(loc)` is `loc.player in full or loc.advancement`.
- `location_condition(loc)` is `loc.player in full or loc.item.player not in minimal`.

With one player that collapses to a table. In `full` every location is relevant and required. In `items` only advancement locations are relevant, and all of them are required. In `minimal` only advancement locations are relevant, and none is required. In every mode the goal must be reachable; that check belongs to the caller.

The caller's sweep runs to a fixpoint over the whole world and never stops early. It can only collect more than the source's walk, so the missing set is a subset of the source's, and a seed this accepts is one the source accepts.

A story event is an event location to the source, holding an advancement event item. One the sweep never made happen fails `full` and `items` alike.

`advancementItemsOf` is Python's `Item.advancement` for the items this world can place: the pool's progression partition (`progression-class.ts`, the one the fill uses), plus the dungeon rewards (`AUTO_ADVANCEMENT`), which are advancement in `Items.py` and never in the shuffled pool.

## packages/randomizer/src/world/accessibility/accessibility-from-snapshot/

This is the one reading the generator and the live panel share. A missing key or an unknown spelling reads as `full`, the app's baseline. The reference's own default is `items`; the app's catalog baseline is `full`, and the fallback follows the app.

## packages/randomizer/src/world/accessibility/accessibility.type.ts

`AccessibilityMode` is the source's `accessibility` choice (Archipelago `worlds/alttp/Options.py`, read through `BaseClasses.MultiWorld.fulfills_accessibility`, which is what the three values mean).

- `full`: every location must be reachable. This is the app's baseline, and the only contract the generator had before the option was read.
- `items`: every location holding an advancement item must be reachable, and so must the goal. A junk location may stay shut.
- `minimal`: only the goal must be reachable.

In `AccessibilityInput`, `uncollected` lists the locations the verification sweep never reached, `missedEvents` the story events it never made happen, and `placedItems` maps a location to the item on it.

## packages/randomizer/src/world/big-keys/

Every big key the dungeons own, by id, read off the dungeon records. The tracker's "Big Key doors" switch is answered by handing these to the state, not by rewriting the rules: a door whose key is in hand is open, which reads the same as the door not being there, and needs no second version of any rule.

## packages/randomizer/src/world/build-world/

Assembles the world model: the region records, the one graph table and the rows' locations become wired regions, resolved locations, dungeons and an empty rule registry. It ports the standard-mode path of Archipelago worlds/alttp/Regions.py `create_regions` and EntranceShuffle.py `link_entrances` (entrance shuffle vanilla, mode-independent there) with the standard start connection from Rules.py `standard_rules` 1091. Wiring errors throw: a passage naming an unknown region is a porting bug, not data. A region is a record, keyed by id. A passage is a rule row that states both ends as ids, so no wiring pass resolves anything. A location is a record too: each region takes its own check rows, keeps the ones a seed fills and hands them over in record order. A region's story events come from their records the same way. An exit stays named, because the rule tables key by that name.

Record order is the reference's own everywhere but two kinds of region: a pond's room sells a ladder longer than its records, and seven regions are built in another order. Either way the stated list has to cover exactly the region's own rows, because a row it drops would leave a spot nothing can fill and a key it adds would name a spot the region does not hold. A second graph row naming one exit throws: the rule tables key by that name, so two passages under it would share one requirement. A pond slot covers a wish pond's own pair (rungs 1 and 2 of her ladder), the prize rungs above it, and the capacity pond's two family ladders; which of them this world holds is `pondLocations`, settled before the graph. A shelf slot exists only while the shop scope asks for it, so a scope of zero slots leaves the graph as it was. Dungeons are in `create_dungeons` order, because the prefill pushes each dungeon's items in it.

## packages/randomizer/src/world/capacity-pond/capacity-pond-notes.constants.ts

The sentences the rule shows, kept as data so both tabs say the same thing about the same state. `off`: the master switch is off. `forcedInPool`: the pond sells throws, so the families it used to stock cannot stay on Vanilla (`forcedInPoolRetro` is the same with retro bow on, where only explosives is the pond's). `modeUnavailable`: the other half of the rule, said from the pond side. `retroProjectiles` is shown in red on the projectiles card while retro bow is on.

## packages/randomizer/src/world/capacity-pond/capacity-pond-rule.type.ts

The capacity families and the wishing pond share the same physical slots, so neither can be read alone: the selection is what the player asked for, the reconciliation is what the seed is built from, and the notes say why the two differ. The retro switch rides along because it takes one of the pond-fed families out of the pair.

- `enabled` is the master switch. Off means the whole feature is out: every family vanilla, the pond native.
- `retroBow`: with it on every shot is paid for in rupees, so the projectiles family has nothing to upgrade. It reads as Vanilla whatever was stored, and the pond stops counting it as a family it feeds.
- `CapacityPondAuthority` names the control the player just moved, which keeps its value when the sides disagree. `pond`: the mode dropdown moved, so the families follow it. A family id: that row moved, so the pond follows it and the other pond-fed family falls in behind. Naming the row matters: a family leaving the pool must be able to pull the pond back to its legacy mode, which reading the profile as a whole could not tell apart from the family that stayed. `capacity`: the profile changed wholesale (a reset), so the pond follows the profile: legacy unless both pond-fed families are pooled.
- In the reconciled pair, `notes` holds one sentence per binding rule; `capacityEditable` and `pondEditable` are false while the master switch is off (the tab renders greyed and frozen); `pondModes` is what the dropdown may offer; `forcedFamilies` lists families a sibling setting took out of the player's hands, each with the sentence its card shows in red. The stored setting is kept; the reconciled profile carries the masked reading.

## packages/randomizer/src/world/capacity-pond/pond-status.ts

What the pond will do in play, in plain sentences read off the live pair. Two readings, because the tab has two questions: what the pond sells or hands out and what it costs, and which of the two families it feeds are still on Vanilla and so still have the pond as their only source. The numbers come from the same plan the seed is built from, so a sentence never quotes a price the generator would not charge. With retro bow on, the arrow family is out of the question. It is pure, so the panel re-reads it on every edit.

## packages/randomizer/src/world/capacity-pond/reconcile-capacity-pond.ts

The one rule binding the capacity families to the wishing pond, and the only place it is written. The pond is the game's only native source of explosives and projectiles upgrades, so the two features cannot be chosen apart: the moment the pond stops selling capacity levels and hands out pool items, a family left on Vanilla has no source anywhere in the seed. This module makes that hole unreachable.

- Vanilla goes with the pond's `capacity` mode, the only place its upgrades are sold.
- Vanilla in pool goes with `vanilla-cost` or `custom`, so the same upgrade is never both sold and shuffled.
- Custom goes with either pond: its own ladder is already in the seed, so it asks nothing of the pond and the pond asks nothing back.

So the rule binds a family to the pond only while the family has no source of its own. When the sides disagree, the control the player just moved wins and the other side is re-pointed, with a note; a Custom family is never re-pointed and never drags the pond with it. With the master switch off the pair collapses to the shape the game shipped with. The reconciliation is idempotent under either authority, so the snapshot writer can run it again as a final guarantee.

Retro bow takes the projectiles family out of the pair: with every shot paid for there is nothing to upgrade, so the family reads as Vanilla (`packages/randomizer/src/world/capacity/retro-projectiles`) and the rule is judged on explosives alone. The pond never pushes a pinned family back into the pool, and the stored setting waits for retro to go off.

The pieces, in the order the rule uses them:

- `pondDemandOf`: what a family needs of the pond. Vanilla needs the native sales (`legacy`); Vanilla in pool has taken them out of the pond, so the pond must not sell them too (`active`); Custom needs nothing.
- `profilePondDemand`: what a whole profile asks. Legacy wins a disagreement, because a family with no source is the hole this closes, and `alignFamilies` brings the other family in behind it.
- `fedFamiliesOf`: the pond-fed families still the pond's to stock (retro takes the projectiles out). The meter and wallet have no pond slot.
- `alignFamilies`: a Vanilla family moves into the pool once the pond stops selling levels, and a pooled family goes back to Vanilla once the pond starts again. Custom is skipped on both sides. The row the player just moved is exempt, because it is the one deciding.
- `pondForDemand`: the pond is moved off the legacy mode while a family is in the pool (to `vanilla-cost`, the native economy at unchanged prices), back onto it while one is Vanilla, and left as the player set it when neither asks.
- `settleCapacityPond`: the moved row speaks for itself; a wholesale profile change (a reset, or a row that is not pond-fed) is read as a whole. A row asking for nothing leaves the pond where the player put it.
- The notes are standing explanations, not one-shot toasts. An active pond rules Vanilla out for the families it feeds; a family sitting in the pool rules the legacy mode out. They are separate now that Custom satisfies neither. The dropdown drops the legacy mode while a family sits in the pool.

## packages/randomizer/src/world/capacity/bonus/

The pickup bonus of a capacity family: what an upgrade hands over beside the ceiling it raises. A percentage (0 to 100, snapped to the slider's stride of 5, fine enough to say "a quarter"), and what it is a percentage of: the new maximum, or with `stepBase` on, only the capacity this pickup gained. The core adds the amount to the counter and clamps it at the new maximum; at 0 only the ceiling rises.

`REFERENCE_CAPACITY_BONUS` is what a pickup hands over in the reference world: the pond arithmetic refills a counted family to its new cap (100 of the ceiling), the meter's borrowed refill gives 16 of the 128 bar (15 of the ceiling, the nearest step), and the wallet's borrowed receipt a flat fifty, half of every hundred-rupee rung (50 of the step). It pairs with the reference capacity profile wherever a world is built without a setting. `DEFAULT_CAPACITY_BONUS` is where a new profile starts: a quarter of each counted step, the meter refilled whole, nothing beside a wallet rung.

The bonus rows (two per family: the percentage and the base switch) are synthetic, unlocked, group `items`, and render on each family's own row in the capacity block, never as plain rows. The rows and the setting are read and written in one place, so the reading a session arms and the writing the creation form freezes never spell an option two ways; an absent key reads as the family's baseline bonus.

## packages/randomizer/src/world/capacity/capacity-family/

Strategy pattern: four families behind one interface (the ladder, the rung a vanilla file stands on, the reference jumps, the item carrying a jump), so the derivation, the pool builder, the logic helpers and the In Pool model never branch on the family. The reference pool is six one-tier items and one two-tier item per counted family, and the single half-meter item, all climbing from the vanilla rung. The wallet has no vanilla upgrades, hence no reference jumps and no spot. `indexOf` throws for an off-ladder value. `maxJump` is the largest jump an item (and a virtual id) of the family can carry. `hasSpot` says a pond or bat exists to become a check. `defaultCount` is written by the catalog baseline and by an off-ladder fallback. `maxSpanOf` is the whole ladder as steps: the largest span and count the family admits.

## packages/randomizer/src/world/capacity/capacity-ladders.constants.ts

The value ladders of the four families, mirrors of the core's tier tables and rung convention (`core/game-hooks/capacity_tiers.h`). Every ladder opens with rung 0, the empty tier below the native grid: no explosives or projectiles at all, an unusable meter, a zero wallet. Rung r of 1 or more is native level r minus 1, so the native grids keep the engine's own arithmetic (+5 six times, then +10; three meter levels) one rung up, and a vanilla file stands on `VANILLA_RUNG` (the first native level, the 999 wallet). A start or max is always one of these values and a jump is a count of rungs.

- Explosives and projectiles: rung 0 is none; rungs 1 to 8 are the native tier bytes 0 to 7.
- Meter: rung 0 is no magic; rungs 1 to 3 are the native cost levels 0 to 2 (full, half, quarter). `METER_LEVEL_LABELS` names the rungs as the game does, by cost tier, because the meter is a fixed bar and a rung is what one use costs.
- Wallet: the cap table is ours, so the ladder is as fine as the curves need: 100-rupee steps ending in 99 like the vanilla 999, from 0 to 9999, 101 values (index i of 1 or more is `100 * i - 1`; rung 10 is 999, rung 100 is 9999).

## packages/randomizer/src/world/capacity/capacity-option-keys/

The 22 snapshot keys of the capacity profile: six per counted family (mode, start, max, count, curve, jumps), four for the meter (its curve is fixed to equal, one item per level climbed), six for the wallet. The mode rows are what the panel renders; the value rows sit behind them. `CAPACITY_ENABLED_KEY` is the master switch: off means every family plays vanilla and the pond keeps its native purchase loop; on for a new profile. `CAPACITY_PROGRESSIVE_KEY` is the switch over every Custom family: true means pickups climb the planned ladder in order (one progressive item per family); false means each item carries its own fixed jump and the shuffle decides the order. Neither is a family row, so `familyOfOptionKey` answers undefined for them.

## packages/randomizer/src/world/capacity/capacity-profile-defaults/

The fixed profiles. `REFERENCE_CAPACITY_PROFILE` is the reference randomizer's baseline (its single half-meter item at the bat, nothing else in the pool, no fairy-slot locations): the world every oracle and existing view was built on, and what an absent profile means everywhere. `VANILLA_CAPACITY_PROFILE` has every family untouched; it is what the master switch means when off (the reference profile pools the half-cost upgrade, so a feature switched off needs a profile of its own). `DEFAULT_CAPACITY_PROFILE` is where a new profile starts, and is the catalog baseline of the capacity rows and the creation form's starting profile only: all four families on a Custom ladder from an empty rung, bombs and arrows climbing to 50 and 70 over seven equal steps, the meter over its three tiers, the wallet from an empty purse over eight geometric jumps.

## packages/randomizer/src/world/capacity/capacity-profile-from-snapshot/

Snapshot values to a validated `CapacityProfile`, and back. An unknown mode is vanilla (the wallet can never be in pool); off-ladder values fall back to the family default (vanilla rung, top of the ladder); a max below the start clamps to the start (no span, no items); the count is clamped at derivation; a free sequence that does not sum to the span, or carries a jump above the family's largest item, degrades to equal; the meter's curve is always equal. Every fallback is reported so the panel can say so. Values with no capacity row at all read as the reference profile. A projectiles max below the final fight's floor is raised onto it, as is a wallet max below what the settings let the seed charge at once; the wallet floor is read before any family because it depends on no family's setting. A snapshot with retro bow on reads its projectiles family as Vanilla. Only an explicit true of the retro key pins the family; only an explicit false turns the master or progressive switch off (an absent key is its baseline). `capacityValuesOf` writes the rows a profile freezes, the inverse of the parse; unknown fields keep the family default.

## packages/randomizer/src/world/capacity/capacity-profile.type.ts

The capacity profile: how each counter family with a ceiling is reshaped for a seed. Vanilla leaves the family untouched (its spot sells the native tiers and is not a check). Vanilla in pool ships the reference's ladder as pool items and turns the spot into a check. Custom picks a start and a final value on the family's own ladder (the start may be the empty rung below the native grid: no capacity, no magic, a zero wallet), a count of pool items, and a curve that cuts the climb into that many jumps. A free curve carries the user's own jumps, validated to sum to the span. The wallet has no vanilla upgrades, so it is never in pool.

`FamilyPlan` is derived and never stored: `jumps` (empty for vanilla, the reference jumps, or generated or free), `ladder` (cumulative values for the preview: start, then one per jump), `items` (one pool item per jump; its length is the In Pool number), `spotIsCheck` (false only for vanilla or a family without a spot), and `progressive` (Custom under the progressive option: every item is the family's one progressive name, jumps taken in order). In `CapacityPoolCounts`, `poolDelta` is the sum of the per-family counts minus the spots that are checks: filler removed when positive, added when negative, to keep the fill one to one. `ParsedCapacityProfile.notes` has one line per fallback applied.

`PlannedFamilySetting` is the setting of a family in Custom mode: a start, a final value, a count and a curve.

## packages/randomizer/src/world/capacity/capacity-shop.constants.ts

The capacity fairy's shop: where a vanilla bomb or arrow family climbs to its top rung, and what she charges for the first step. A family in the pool counts its items and never reads this (`packages/randomizer/src/world/state-helpers-capacity`). It is no event and no location: the game writes no flag for it and the player does nothing recordable, so the rules read the two facts directly (the room reached, the rupees in the wallet), the way the potion seller is read for the magic extension. The price is the one the reference's shop table lists for a fairy slot.

## packages/randomizer/src/world/capacity/capacity-spots/

The family spots as locations. The two fairy slots exist only while their family is not vanilla, and enter the shuffle only when the caller proved them physically deliverable; otherwise they sit locked to their vanilla one-tier upgrade (an absent deliverable set locks them all). The meter's spot is an NPC-scope row: a vanilla meter locks it explicitly and the other modes leave it to that scope switch, so it is never part of the fairy-slot sets. The spots are read off the records: a spot is the row that grows a family's ladder from its bottom, the one check whose single vanilla item is that family's own upgrade and which stands at rung 1 (the pond's first purchase for the two counted families, the meter giver's only row). The pond's later rungs carry the same item, so the rung picks the spot out of them. The wallet has no spot. The map is read once: the registry is seeded before any rule runs and never changes under one. `capacityPondSpots` returns the fairy slots in the order the pond hands them over; the meter's giver is not one.

## packages/randomizer/src/world/capacity/curves/

The curve registry: pure proportion generators. A curve maps n to n weights, every one above 0; it knows nothing about a ladder, a span or rounding. Adding a curve is one entry and no branch anywhere else. `front` is big first, then two shrinking plateaus (6, 2 2 2, 1 1 1 at n = 7); `ramp` is Fibonacci, small first; `reverse-fib` is Fibonacci largest first; `geometric` doubles each jump ("Halves").

`scaleToSpan` is the one rule from proportions to exact ladder jumps summing to the span: scale the weights to the span; floor, then hand the missing units to the largest remainders (ties go to the earliest jump); the last jump absorbs any residual (a float guard, a no-op by construction); every jump is at least 1, a zero taking one unit from the largest jump (the nearest on ties), which is always possible because the caller clamped n to at most the span. The preview, the pool builder and the receipt export all call it on the same inputs, so they never disagree.

The item cap on a jump: a family's name table (and its virtual id space) carries jumps of 1 to `maxJump` only. `minCountFor` is the fewest jumps covering a span under the cap. `capJumps` moves the excess of every over-cap jump onto the smallest jump with headroom (the nearest on ties), keeping the sum and length and drifting the shape as little as possible; it throws when too few jumps were given. A sequence already under the cap comes back unchanged, so every plan legal before stays byte-identical.

`jumpsOf` dispatches a shape, count and span to jumps: it clamps the count between `minCountFor` and the span (a ladder cannot be cut finer than one step per item, nor coarser than the largest item), runs the generator through the scaler and the cap, takes a valid free sequence as is, and degrades an invalid one to the equal curve at the clamped count.

`ladderOf` is the preview: cumulative ladder values, one per jump after the start, walking the family's own ladder so every value is a legal tier. A clamp at the top means a surplus step (the reference's two-tier item at the end of its ladder pays the pond consolation), so a Custom ladder never clamps, because its jumps sum exactly to the span.

The free sequence is the user's own jumps typed as "4,2,1". It is valid when every entry is a positive integer no larger than the family's biggest item and the sum is the span; its length is then the count. An invalid sequence never reaches the pool: the caller falls back to equal and reports it.

A preset is a curve plus a count rule for a span: selecting one writes curve and count and nothing else, so a preset never drifts from what it produced. The panel shows a preset's name whenever the curve and count equal what it would write; editing either detaches it. `reference` is one tier per item, the reference ladder exactly, and is hidden on the wallet (no reference ladder). `halves` fits exactly when the span is a power of two minus one.

## packages/randomizer/src/world/capacity/family-plan/

The plan of a family in every mode: setting, then jumps, then ladder, then items. Vanilla contributes nothing (the preview shows the native ladder from the vanilla rung, sold at the pond). Vanilla in pool ships the reference jumps from that rung. Custom cuts the span between start and max with its curve, under the family's item cap (no jump above `maxJump`). The item count is N for Custom, 7, 7 and 1 for Vanilla in pool, 0 for Vanilla. A Custom plan under the progressive option ships N copies of the family's progressive name: the jumps are the same, taken in plan order at grant time. `progressive` applies to Custom only. `startTierOf` is the Custom start (rung 0 allowed) or the vanilla rung; `maxTierOf` is the Custom max or the top of the ladder. In `capacityPoolCountsOf`, `checkSpots` is the number of family spots that are checks in this fill (0 to 3: the two fairy slots and the bat).

## packages/randomizer/src/world/capacity/max-rung-floor-of.ts and packages/randomizer/src/world/capacity/held-max-rung-of.ts and packages/randomizer/src/world/capacity/max-floor-reason-of.ts

The lowest rung a family's final capacity may stop at, and the sentence saying why: one reader for both floors, so the editor's thumb and the snapshot reader's fallback never disagree. The projectiles ladder opens on the empty rung, and a Custom setting may end there (a file that never holds an arrow). The ending takes the final fight's silver shots back to back (`packages/randomizer/src/world/final-fight.constants.ts`), so an arrow capacity below that count could never finish, and under full accessibility the generator would refuse every seed. The floor is the first rung holding the count, which on the native grid is the first native level. The wallet's floor is whatever the settings let the seed charge at once (`wallet-floor`), handed in; a caller with no settings gets no floor. Every other family may end anywhere. `heldMaxRungOf` raises a max rung onto the floor.

## packages/randomizer/src/world/capacity/reachable-top.ts

The top rung a family can ever stand on under a profile: the vanilla rung for a family left alone, or the Custom start plus every planned jump, clamped to the ladder's end. Every ceiling that follows the profile reads it from here (a rupee price, a retro shot cost, the pond's dearest throw), so no two of them disagree about what a wallet holds.

## packages/randomizer/src/world/capacity/retro-projectiles/

Retro bow takes the projectiles family out of the player's hands. With every shot paid for in rupees a carried count means nothing, so an arrow capacity upgrade has nothing to upgrade: dead weight in the pool, a purchase that changes nothing at the pond. The family reads as Vanilla the moment retro is on, wherever a profile is read: the capacity and pond rule masks it before the snapshot is written, and the snapshot reader masks it again so a profile frozen with both on rolls the same way. It is a mask: the stored setting stays, so switching retro off hands the row back.

## packages/randomizer/src/world/capacity/wallet-floor/

The lowest final cap the wallet may stop at: the largest rupee count a seed built from these settings can ask for at once, rounded up onto the wallet ladder. It mirrors the projectiles floor and exists for the same reason: a cap below what the seed charges leaves a check nobody can pay for, and under full accessibility the generator then refuses every seed. The editor snaps the max thumb onto this rung and the snapshot reader raises a stored cap onto it with a note.

What can set it:

- The fixed prices (`packages/randomizer/src/world/rules/priced-entries`): a check or passage charges what the unmodified game charges, and no option moves it.
- A bottle content offered as a shelf price whose only repeatable source is a counter that sells it, because paying again means buying it again (`packages/randomizer/src/world/rules/shop-prices`, `packages/randomizer/src/world/potion-price/potion-cauldrons.constants.ts`).
- The paid-shot option, which asks for the first purchase and then the ending's shots back to back (`packages/randomizer/src/world/retro/retro-bow.constants.ts`).

What cannot: a rolled shelf price (both ends of its range are already brought down to the cap the profile reaches, `packages/randomizer/src/world/shops/shop-price-plan`), and the pond, held to the wallet the same way (`packages/randomizer/src/world/pond/pond-wallet-top`). The paid-shot costs are read as stored, not as the reader hands them back: they are held to the wallet on read (`packages/randomizer/src/world/retro/retro-cost-ceiling.ts`), so from there they could never raise anything; read as asked, the cap grows to meet the costs, which is what a player setting them expects. A content whose counter went to the shuffle is counted too: it can only make the number smaller, so counting it keeps every price payable. The stored retro rows carry no capacity of their own, so reading them is never a write. `holdWalletToFloor` raises a Custom final cap below the floor onto it; a wallet left alone keeps the vanilla cap, which stands above every fixed price.

## packages/randomizer/src/world/collection-state.type.ts

Port of the reference generator's collection state as consumed by Archipelago worlds/alttp/StateHelpers.py (python CollectionState: the `prog_items` multiset, has, count, has_any, count_group, and a reachable-region cache invalidated by every collect and remove). Progressive base items also grant their concrete tier on collect, per Items.py `progression_mapping`. `has` and `hasAny` answer for usable items only: a meter-consuming item owned on the meter's empty rung reads as absent, so every reference rule that names one is capacity-aware without a rewrite; `count` and `countGroup` stay raw, which is what the capacity readings sum. Everything is keyed by id: an item is its record's id, an act or story event is the check that certifies it, and a region is its record's id. A `Holding` is anything the state can hold: an item, or an act the player has done. The tier ladder a pickup climbs is the world's: a seed whose tier ticks left a rung out hands over the next rung still there, and every rung ticked (the default) gives the reference map back unchanged.

## packages/randomizer/src/world/dark-rooms/can-cross-dark-room.ts

The one dark-room question: may this file cross an unlit room? Every dark spot in the rule tables (`packages/randomizer/src/world/rules/tables/lamps/lamps.constants.ts`) is registered with this one predicate, so the settings are read once and no spot is left on a hardcoded item check. Three readings collapse into it, in order:

- Light not required: the room is passable in the dark.
- Light required but no light accepted: a requirement nothing can meet would leave the rooms behind it unreachable and no seed could roll, so an empty set reads as no light required. It is a mask: ticking a light back on gives the requirement back.
- Otherwise one accepted light has to be carried, nothing more.

Carried is the whole test, which is why the rule reads the raw count and not `state.has`. The core lights a room on possession alone (`core/game-hooks/dark_room_lights.c` hooks the game's own lamp-ownership seam), so no light costs the meter and none is withheld on the meter's empty rung. A rule asking for usability here would be stricter than the game, and a rule stricter than the game only hides seeds that were fine. A world built before the settings existed reads as the reference default (`darkRoomSettingOf`).

## packages/randomizer/src/world/dark-rooms/dark-room-from-snapshot/

The dark-room rows and the setting they stand for, in both directions in one place, so the generator's reading and the creation form's writing never spell an option two ways. An absent key reads as its baseline (light required, all four lights). The reading is masked by the scope switch: a light the seed could not count on without the standing world items shuffled reads as unticked whatever the row stores, so a snapshot that ticked it with the shuffle off rolls, and arms the core, as if it had not. `darkRoomValuesOf` gives the rows a setting freezes, which the creation form hands the catalog.

## packages/randomizer/src/world/dark-rooms/dark-room-lights.constants.ts

The four lights and the item each stands for. Carrying one is the whole rule: a ticked item lights an unlit room by being in the inventory, with no meter charged, nothing held up and nothing to activate (`core/game-hooks/dark_room_lights.c` answers the game's own "is a light carried" question for all four). That is the lamp's own behaviour, given on purpose to every ticked light, so the rules and the running game always agree. The fields are in the order the option rows are shown. Of the two canes, the red one is the cane that lays blocks, not the one that raises the blue barrier, and the tile art uses the same lookup, so this name decides which colour the row shows. `REFERENCE_DARK_ROOM_SETTING` is the reference's reading: light required, the lamp alone provides it. `DEFAULT_DARK_ROOM_SETTING` is where a new profile starts and the rows' baseline: light required, and all four lights provide it.

## packages/randomizer/src/world/dark-rooms/dark-room-option-keys/

The catalog keys the dark-room settings occupy, derived from the light fields so a light added to the data table brings its row with it: one key for the requirement, one per light. `isDarkRoomOptionKey` is true for a row the dark-room section owns.

## packages/randomizer/src/world/dark-rooms/dark-room-options.constants.ts

The five dark-room rows of the option catalog: synthetic, unlocked, group `world`, so they list beside the other world settings and wear the same row as every toggle. They replace the reference's three-way choice, which stays in the catalog, locked, as the transcription of its dataclass: the requirement row covers its "none" value and the four light rows cover the rest. Every baseline is the fresh-profile reading. Descriptions merge in from `options-descriptions.constants.ts` like every other row. A light row is titled with the item's own name (`display-names/`), the same lookup the tiles under the row use, so heading and art never disagree.

## packages/randomizer/src/world/dark-rooms/forced-dark-room-light-reasons.ts and packages/randomizer/src/world/dark-rooms/mask-dark-room-lights.ts

Which light tiles the scope switch has taken out of the player's hands, and the sentence that says why. The generator, the gate word and the panel all read through this rule, so a tile never shows one thing while the seed is built with another. The first medallion (Bombos) is the one light it covers. In the unmodified game it stands on a tablet in the desert, and the whole world past the opening is behind the unlit rooms of the escape, so nothing before those rooms could hold it. Only the standing-item shuffle moves it off the tablet. With that shuffle off, a seed counting it as a light would need it before any place it could be put, and no seed could roll. With the shuffle on it is a pool item like the rest and the fill places it ahead of the escape, as the sweeps show. This is a mask: the stored answer is kept, so ticking the shuffle back on hands the tile back. The masked tile's sentence names only the condition; the tile itself names the item.

## packages/randomizer/src/world/difficulty/difficulty-copies-pool.ts

The copy multiples applied to an assembled pool. This runs last of the three passes that reshape a tiered family, after the tier ticks and after the per-family order (`progressive/`), and that order is the design. The ticks decide which rungs exist, the order decides whether the copies are nameless steps or the rungs themselves, and only then is there something to multiply: whatever names the family's copies wear by then are put in again, once per extra multiple. Running earlier would multiply copies the ticks were about to remove, or hand the order pass more copies than it has rungs to name.

Unlike those two passes this one grows the pool, so it returns how many items it added, and the caller displaces that many filler items (`packages/randomizer/src/world/pool/balance-filler.ts`), the same arithmetic a capacity upgrade goes through. What an extra copy hands over is answered by the core: a surplus progressive copy past the top rung pays the reference's twenty-rupee replacement, and so does a concrete rung that arrives for a tier the file already stands at or above (`core/game-hooks/progressive_grants.c`), so a doubled family is never a pickup that does nothing.

## packages/randomizer/src/world/difficulty/difficulty-from-snapshot/

The difficulty rows and the setting they stand for, both directions in one place, the contract every other block keeps. A missing key falls back to the reference pool: one copy per rung, hearts to the game's own ceiling. `difficultyValuesOf` writes the rows a setting freezes. A setting the choices never carried writes its keys with nothing behind them (not the defaults), as the retro rows do: the wiring guard reads the frozen map by value, and an unwired field has to show there. `defaultDifficulty` returns a fresh copy for a creation form.

## packages/randomizer/src/world/difficulty/difficulty-hearts-pool.ts

The heart ceiling applied to an assembled pool. A ceiling is enforced by carrying fewer heart pickups, never by patching the game: the container receipt already refuses to raise capacity past twenty, so the only way under it is for the seed not to hold the pickups. A pickup the ceiling takes out is converted in place to the twenty-rupee stand-in the reference uses for a missing copy, as an unticked rung is, so the pool keeps its size and no filler arithmetic is needed.

Quarter pieces go first, a whole set of four at a time, then the boss containers, then the sanctuary container. Four pieces and one container are worth the same heart, so taking pieces first removes the most pickups whose loss the player will not feel, and it keeps a container in the seed at almost every ceiling: the pickup the reference promotes to progression for its hearts-as-requirement branch (`packages/randomizer/src/world/pool/item-classes.constants.ts`). A part set of pieces left by a set-sized step is left alone: it was worth nothing before the ceiling was lowered. Nothing in the access rules is stranded: the two rules that read hearts (the spike room and the long magic cape crossing) each offer hearts as one alternative beside items every seed carries, so even a ceiling of three leaves both satisfiable. The function returns how many hearts of growth were taken out, zero at the default ceiling, where the pool is left byte-identical. `heartGrowthOf` is how many hearts the pool adds to the three a file starts with.

## packages/randomizer/src/world/difficulty/difficulty-option-keys/

The catalog keys the difficulty rows occupy. The copy keys are derived from the family table, so a family added to the data brings its row with it; each key names the family and never a rung, so it survives any change to the ladder. The heart ceiling is one row of its own. `DIFFICULTY_OPTION_KEYS` is every key the block owns, in render order.

## packages/randomizer/src/world/difficulty/difficulty-options.constants.ts

The difficulty rows of the option catalog: synthetic, unlocked, group `items`, so they sit with the rest of what is in the seed and render beside the tier cards they qualify. Together they replace the reference's four-step pool choice, which is not in the catalog at all: its generous step is these multiples set to double, and its two mean steps are the tier ticks and this ceiling. One row would mean a player could not double the swords without doubling everything else. Every baseline is the reference pool.

## packages/randomizer/src/world/difficulty/difficulty.type.ts

How generous a seed is with things a file can hold more than one of. The reference asks this as one four-step choice (`Options.py` `ItemPool`: easy, normal, hard, expert), which bundles two unrelated questions: its easy step duplicates copies (eight swords where normal has four, six shields where normal has three), while its hard and expert steps lower the ceiling, stopping a family short of its best rung and thinning the hearts. A player who wants twice as many swords would also get twice the shields, armour and bottles. So the question is asked per family here, and the ceiling half is not asked at all: which rungs a family carries is already the tier ticks' question (`progressive/`). What is left:

- How many copies each tiered family puts in the seed, as a multiple of what it normally carries. Normal is the reference pool byte for byte; double and triple multiply the copies the shuffle carries, and each extra copy displaces one filler item so the fill stays one item per open location.
- How high the hearts climb (`heartCap`, the three starting hearts included).

The numbers the setting is built from, each read off something real.

- The copy multiples 1, 2, 3. One is the reference pool (Archipelago `worlds/alttp/ItemPool.py` `difficulties['normal']`), two is what its easy step does to every tiered family at once, and three is one step past it, as far as the shape stays honest, because a copy past a family's top rung already resolves to a rupee pickup (`core/game-hooks/progressive_grants.c` `PROGRESSIVE_CAP_ITEM`). `COPY_MULTIPLIER_LABELS` is the short wording shared by the control and the catalog row.
- The heart ceiling, 20. The container receipt refuses to raise capacity past `0xa0` (160 units, eight per heart, `core/zelda3/src/ancilla.c` 3494), so twenty is the most the game can hold. It is also what the untouched pool adds up to: three to start, one from the fixed container, ten from the boss containers and six from the twenty-four quarter pieces. Default and maximum are the same number, which is why the default row changes nothing.
- The heart floor, 3: what a file starts with. Four quarter pieces make one heart.

`asCopyMultiplier` brings a stored number back to the three stops; `asHeartCap` brings it back inside the range the game can honour. `isReferenceDifficulty` is true while the setting still describes the reference pool.

## packages/randomizer/src/world/display-names/item-key-name/

The engine keys items by id. This is the only place a name is made, and only for something shown: a receipt line, a spoiler line, a tracker row. An item with no record carries its own name behind the unrecorded prefix (see `item-ids.constants.ts`), so one call answers for both. Another player's item from an online placement has no record either, and answers with the foreign item name.

`itemKeyOfName` goes the other way. Two callers need it, and both receive a name at a boundary: an online server sends a granted item as a name, because names are the wire protocol, and the counter catalog mints its rungs as names by formula. A name no record answers for comes back as the unrecorded key for that name, never undefined.

## packages/randomizer/src/world/display-names/location-display-name/

The engine keys every location by id (`packages/randomizer/src/world/location-key`). A check answers with its own standard name. A slot with no record of its own is named from the row that owns it: a shelf's later purchases read as the shelf name plus an ordinal (the first purchase keeps the plain name), and a pond rung reads as the pond label plus a number.

## packages/randomizer/src/world/dungeon-items/dungeon-item-from-snapshot.ts

Every reading of the four option keys goes through here, so the panel's In Pool column and the seed never disagree. A key that is missing, spelled as something the catalog never offered, or naming a refused mode reads as `original_dungeon`, so a hand-edited snapshot still gives a playable seed.

## packages/randomizer/src/world/dungeon-items/dungeon-item-modes/

What each mode means to the fill, transcribed from `Options.py` 170 to 213 and the `generate_early` block in `worlds/alttp/__init__.py`. For each of `small_key_shuffle`, `big_key_shuffle`, `compass_shuffle` and `map_shuffle`: `own_world` adds the group to `local_items`, `different_world` adds it to `non_local_items`, and any `in_dungeon` value adds it to `dungeon_local_item_names`. Only `original_dungeon` also adds it to `dungeon_specific_item_names`. `in_dungeon` is the values 0 and 1 (`Options.py` 181 to 183).

- `original_dungeon`: the family is prefilled inside dungeons and pinned to the dungeon that owns each item. This is the baseline every stored placement was rolled under.
- `own_dungeons`: still prefilled inside dungeons, but any dungeon will do.
- `own_world` and `any_world`: the family leaves the dungeon prefill and joins the global pool. In a one-world game the two are the same question.
- `different_world`: asks for another player's world. None exists, so the value cannot be met.
- `start_with`: the item is precollected and junk takes its slot. The app has no starting-inventory delivery, so it is refused.
- `universal` (small keys only): every key becomes one shared currency bought from a shop. That needs the retro shop stock and a universal key item the core cannot grant, so it is refused.

`DUNGEON_ITEM_OPTION_KEYS` uses the source's own dataclass field names. `DEFAULT_DUNGEON_ITEM_SETTING` is the reference default and the app's baseline. `REFUSED_MODES` lists values the engine will not roll, with the reason; the option reader falls back to the baseline for them, and each one also stays locked in the catalog.

`FAMILY_BY_ITEM` is read off the dungeon records: a dungeon names its own key, big key, map and compass, so the four fields are the four families and nothing is guessed from a name. An item no dungeon owns belongs to no family, and its mode reads as the baseline.

## packages/randomizer/src/world/dungeon-items/dungeon-item.type.ts

The four `DungeonItem` choices of Archipelago `worlds/alttp/Options.py` 170 to 213, one setting per family. The mode names are the source's own option values, so a snapshot value maps across with no translation table. The catalog unlocks only the values the app can both roll and hand to the player. `DungeonItemFamily` lists the four families in the source's field order.

## packages/randomizer/src/world/events/bombs-record.ts

Bombs are the one thing the capacity ladder cannot answer for. The carry limit stands above zero from the first frame, so a rule reading the ladder alone would believe a bomb is always in hand, and everything behind a cracked wall would read as open before the player owns one. The ledger keeps the fact the game keeps, and the tracker hands it over as a token beside the other acts.

A world with a record attached answers from the record. A world without one, which is every fill, keeps the capacity reading alone, so a seed still treats bombs as farmable and nothing is over-constrained against the reference. `BOMBS_HELD_CHECK` is the ledger's own bomb bit, a dataset check like any other act.

## packages/randomizer/src/world/events/event-gate.type.ts

An act is a thing the player did once that changed the world for good: a wall blown open, a staircase uncovered, a barrier cut down. The dataset's event check certifies it, and that check id is how a rule asks about it and what the collected state calls it. `precondition` is what performing the act takes now. When it is absent the rules cannot judge the act, so a world with no record reads it as available (what a fill needs) and a world reading the record answers from the record alone.

## packages/randomizer/src/world/events/event-gates/

`EVENT_GATES` lists every act the rules judge from an inventory, with the dataset event check that certifies it. These acts used to be item rules, where holding the item stood in for having done the thing, and each precondition is the item rule that was there, so a world with no record answers as it did before. The rows, in order:

- `check-353`: the desert statues, moved.
- `check-325`: the tomb, cracked open.
- `check-342`: the pyramid wall, blown up.
- `check-327`: the warp pegs.
- `check-334`: the peg field, flattened.
- `check-344` and `check-345`: the two medallion entrances.
- `check-343`: the back thorns, burned.
- `check-314`: the barrier, cut down.
- `check-348`: the tower, opened.
- `check-332` and `check-333`: the two the rules cannot judge. One is hired for rupees the generator does not count; the other is a door pulled open with the gloves, and the event's own record carries that.
- `BOMBS_HELD_CHECK`: not a place changed but a thing owned. The ledger is the only source for it.

Story events that happen at a place (a boss beaten, the smiths reunited) are not here; the solver finds them in the world (`story-events.constants.ts`).

A world built with `actTokens` answers from that record: an act it does not list has not happened. A world built without one falls back to the capability that would perform the act. `actGate` asks for an act by check id: it was done, or the means are in hand. An id with no gate row throws at build time and never opens silently. `RECORDED_ACTS` is every act a record can certify: the gated acts, then the story events.

## packages/randomizer/src/world/events/event-sweep/

An event is done once its region is reachable and its own rule holds, and doing it can open more, so a sweep grants events as it goes, beside the items it collects. `collectReachableEvents` repeats until one pass grants nothing. A world reading a save's record never infers an event: whether the floodgate lever was pulled is a fact the game wrote down, so such a world holds exactly the events its record lists.

## packages/randomizer/src/world/events/story-event-rule.ts

A rule asks for a story event by holding it: the sweep grants it where it happens, and the record grants it on a live file. An id that is not one of those events throws at build time.

## packages/randomizer/src/world/events/story-events.constants.ts

Each story event is a ledger record (`packages/game-data/src/data/records/checks/events/story.ts`) that the rules ask about and that happens at one place: the region its own record names, under the rule the tables give it. A seed never fills one and never counts one as a location. These eight differ from the other acts because their requirement is a place as much as an inventory: a boss room, the smiths' hut, a lever in the dam. `GOAL_EVENT` is Ganon beaten. `WORLD_EVENT_IDS` is the order the sweep asks them in.

## packages/randomizer/src/world/events/world-events.ts

Each story event happens in the region its own record names, the same field a location's region comes from, so the place is never a second table. A record with no region is a porting error and throws when the module loads.

## packages/randomizer/src/world/fill/can-fill-location.ts

Python `Location.can_fill`: the item rule, then always-allow or reachability. `checkAccess` is the source's own `check_access` argument; false drops the reachability half entirely, which is what minimal accessibility asks for once the goal is already reachable (Fill.py, `perform_access_check`).

## packages/randomizer/src/world/fill/deliverable-lists/

The spots the capability probes proved deliverable, as plain lists a profile file, a player file and slot data can carry, and back into the sets generation reads. `pond` is the one set every pond's slots share, which generation names `capacity`. Lists read back from a file or a server are accepted only in the expected shape; anything else in their place reads as absent.

## packages/randomizer/src/world/fill/dungeon-fill.ts

Restrictive prefill of the dungeon-restricted items into the dungeons: the port of Dungeons.py `fill_dungeons_restrictive` (197 to 270). One location list is pooled across every dungeon and shuffled. Items are sorted so big keys place first, then small keys, then maps and compasses (the source's ascending sort popped from the end of the deque). The placement restriction is what the shuffle modes decide, and the assumed inventory is the entire non-dungeon pool (`all_state_base` collects the full item pool, 237 to 252). Locked vanilla drop keys are not assumed, because the source removes them from the base state (258 to 267), so they only enter through the placement sweep, which is exactly how the fill world models them (pre-placed, swept when reachable). The source's goal-item removal (253 to 256) is skipped: no ported access rule reads the goal item, only the completion check does.

The restriction follows the source's two name sets (Dungeons.py 199 to 223). Everything reaching this pass is `dungeon_local`; a family that left the dungeons never arrives here, because the pool builder puts it in the shuffled pool. Only the families in `dungeon_specific_item_names` (the original-dungeon ones) are also pinned to the dungeon that owns them. `SPECIFIC_SORT_BONUS` is the source's own `+5` (231 to 232): those items are the hardest to place, so they go first. It is constant across every item under the baseline, which leaves the order the stable sort has always produced. Under minimal accessibility the prefill relaxes reachability once the game is beaten.

## packages/randomizer/src/world/fill/dungeon-order.constants.ts

The order the fill walks the dungeons in. It is not a fact about any dungeon, which is why it is not on the records: it is the order the prefill pass pushes each dungeon's restricted items in, and the placement depends on it, so it belongs to the fill. It is ported from Archipelago worlds/alttp/Dungeons.py `create_dungeons` (open mode), whose call order this is.

## packages/randomizer/src/world/fill/fill-options-from-snapshot/

Snapshot to fill-world options: the one reading of the option keys the generator and the pool accounting share, so the In Pool column and the seed can never disagree about what a snapshot means. The deliverable sets name the scope locations and fairy slots the app proved physically deliverable; an absent set counts as empty, so everything of that scope stays locked vanilla.

The shop seed is the placement's own seed. The random shop mode draws its slots from it and stores it on the scope, so a session rebuilding the scope opens the identical shelves. Every other mode ignores it, which is why the live panel may read a snapshot with none. Under retro no shop may still be selling arrows, so the arrow shelves open whatever the mode drew, and the scope every consumer sees is the one the seed is built from: the mode's own slots plus those shelves. With retro off it is the scope untouched. Every seed rolled from a snapshot lets a wish pond's mode decide her two vanilla slots (`POND_SLOTS_FOLLOW_MODE_FROM_SNAPSHOT`).

`shufflePrizesFromSnapshot` says whether the ten dungeon rewards are shuffled over the ten reward slots. It is read here and not in the generator, so every consumer of a snapshot reads the option once. Only an explicit false turns it off: an absent row is its baseline.

## packages/randomizer/src/world/fill/fill-restrictive.ts

Port of the reference generator's `fill_restrictive` (Fill.py, single-player path). It pops one item at a time off the end of the pool, computes the maximum exploration state assuming everything still unplaced, places at the first candidate in the caller-shuffled location list that accepts it, and on a miss tries the swap pass: displace an earlier placement whose slot accepts this item, requeueing the displaced item at the front so it is placed last. An item may be swapped out at most twice (`MAX_SWAPS_PER_ITEM`, the source guard). Items and locations are consumed in place, so the caller shuffles first.

Simplifications against the source, none of which can deadlock the baseline because the caller retries with a fresh seed on failure: the swap's reachable-location-count guard is skipped (the final full-accessibility sweep rejects any bad outcome instead); a placement miss after the swap pass throws at once and does not park the item in `unplaced_items` (the source raises at the end anyway when unplaced items remain and partial fills are not allowed); progression balancing is not ported (it redistributes valid placements, it never creates or repairs validity).

Under minimal accessibility, once the assumed state already beats the game, the source stops requiring a spot to be reachable (Fill.py: "if minimal accessibility, only check whether location is reachable if game not beatable"). Absent, the check stays on for every placement, which is what the other two contracts ask for. `allowedAt` is an extra placement restriction, the dungeon prefill's own-dungeon rule.

## packages/randomizer/src/world/fill/fill-world.type.ts

The fill-facing world constructor. It always builds the full graph, drop locations included, so rules and accessibility see every location in both key-drop modes. This mirrors the reference, where the option only decides whether the drop locations are fillable or locked to their vanilla keys (ItemPool.py 349 to 369). It also prunes the always-allow registry to the rows the reference installs under full accessibility, and pre-places the locked content the fill must never touch: the vanilla drop keys (key drops off), the locked npc-scope locations' vanilla items (the whole scope table with the option off, the physically undeliverable remainder with it on), a wish pond's own pair at Vanilla grants (what her upgrade produces), and the capacity spots the profile locks: a vanilla meter's giver, and every present fairy slot not proven deliverable.

The rolled shelf prices are handed straight through to the graph builder, because the access rules read them back off `world.options`. Keeping them here priced every shelf at its vanilla rupees in logic while the running game charged the rolled price, which shipped seeds whose one bomb bag stood behind a five-bomb shelf (issue #219). With nothing rolled, every shelf charges the rupees the unmodified game charges.

Two pond questions are kept apart: which pond slots the graph holds, and which of them are prize slots the pool counts. A wish pond's own pair is the first and not the second, because the npc scope has always counted it. Only a live file carries a record of what was done; a fill has none, and leaving the act tokens out keeps every act on the capability that performs it. The pond demands reach the rules through the world, because that is where the rung ladder is registered from.

Rules.py installs all but one of its self-locking allowances behind `accessibility != 'full'` (387, 401, 419, 431, 533, 538, 1232), so the registry is pruned to the unconditional row for a full-accessibility seed and kept whole for the two looser contracts.

A scope table's locked subset is the whole table with its toggle off, and the remainder outside the caller's deliverable set with it on, because items must never be shuffled onto a location the app cannot physically grant them from. On mode with no set keeps the fully shuffleable world the parity oracles pin. A wish-pond slot its mode decides is left out of the scope lock: a locked one holds what her upgrade produces (a separate table), and one sold as a prize rung carries a pool item, so its vanilla item stays in the pool. A vanilla meter's giver is locked.

A prize slot past the reference's two has no vanilla item to fall back to, so a non-legacy pond is all or nothing: proven deliverable, or no location. The pool builder reads the options from the world it receives, so it gets a view carrying the requested key-drop flag: the dungeon sets shrink in off mode while the graph itself stays full. Standard-mode assurance places the chosen starting weapon locked on the mentor check before any fill pass (ItemPool.py 318, `place_locked_item`).

Spots that are checks are the pond's prize slots that are not locked, plus the meter's giver when not locked. Under the legacy pond the prize slots are the present fairy slots, so this is the count it has always been. `fillEligibleLocations` is every empty, fillable location: not a prize slot, not placed.

The fill-facing world bundle. Unlike the plain graph constructor, which drops the key-drop locations when that option is off, the fill world always carries the full location graph: with the option off, the drop locations stay in the world, are excluded from fill, and sit pre-placed with their vanilla keys (the reference locks them via `place_locked_item`, ItemPool.py 349 to 369). `lockedVanilla` records exactly those pre-placements.

Option defaults when a field is absent: `includeNpcChecks` is true, the fully shuffleable world the oracles pin. `includeWorldItems` mirrors `includeNpcChecks`, since the earlier single synthetic toggle covered both. With the npc option on, `deliverableNpcLocations` is the scope locations proven physically deliverable by the app's capability probe, so only these enter the shuffle and the rest stays locked vanilla; absent keeps the fully shuffleable oracle view, and the generation entry point always passes a concrete set. `deliverableWorldLocations` is the same contract over the world-item table. `capacity` absent is the reference profile, where no fairy slot exists. `capacityProgressive` absent means fixed-jump items. `capacityBonus` absent means the baselines. `deliverableCapacityLocations` absent locks every present fairy slot to its vanilla upgrade (there is no fully shuffleable oracle view to preserve). `shops` absent means no shop location exists. `shopPrices` absent keeps every vanilla price. `ponds` absent means every pond legacy. `pondDemands` absent rolls nothing, and every rung keeps the wallet reading of its own price. `pondSlotsFollowMode` absent means false, where a wish pond's two vanilla slots answer to the npc scope alone: the oracles' world. `darkRooms` absent is the reference reading: light required, the lamp alone providing it. `storyGates` absent is the story as the game tells it. `actTokens` is passed only by a tracker reading a live file. `progressiveTiers` absent is every tier; `progressiveModes` absent is every family in order. `difficulty` absent is one copy per rung and the game's own twenty-heart ceiling. `retroBow` absent is off. `itemPower` absent is the reference's normal step. `dungeonItems` absent pins every family to its own dungeon. `accessibility` absent is `full`, with the pruned always-allow registry. `unlitEscapeExempt` is the parity seam for the reference-oracle harness. `pickWeapon` present runs the standard-mode assurance (ItemPool.py 294 to 318); absent is the parity path, which loads a finished placement over the world. `pickFiller` absent removes the last filler.

On `FillWorld`, `keyDropShuffle` is the requested option (`world.options.keyDropShuffle` is always true here), and `pool` is built for the requested option. `itemPower` is as asked for, before the masks. `locationDungeon` and `itemDungeon` map a location or a dungeon item to its owning dungeon, for the restricted prefill.

## packages/randomizer/src/world/fill/generate.ts

The reference-faithful generation pipeline, driven by a frozen option snapshot. It seeds the rng, builds the fill world (the two entrance medallions are always the fixed vanilla pair; standard mode locks a usable starting weapon onto the mentor check, ItemPool.py 294 to 318), places the dungeon prizes, runs the restrictive dungeon prefill, the assumed fill of the progression pool and the shuffled junk fill of the rest, then a verification sweep judged against the profile's accessibility contract plus the completion check. Any fill dead end or validity failure retries with a derived seed, up to `MAX_PLACEMENT_ATTEMPTS`. Which items the dungeon prefill handles at all, and how tightly, is the four dungeon-item modes' question.

The npc-check scope option narrows generation the same way the key-drop option does: off pre-places the npc-scope locations' vanilla items, locked and fill-excluded, and removes them from the pool; on opens only the scope locations the caller proved physically deliverable and locks the rest the same way. An absent capability set counts as empty, so a caller with no physical probe still always produces a valid, fully locked-scope seed. The capacity profile follows the same capability-locked mechanism for the fairy slots of its non-vanilla families (a vanilla family's slot is not a location at all).

A tick set that closed a load-bearing rung is reported up front, not twenty attempts later as "the goal is not reachable", so the caller gets the rung to tick back on. The pond demands are settled once, from the seed alone: every attempt is handed the same demands, which lets the options panel show them before a placement exists.

Within an attempt, the rolled flags are drawn from the seed, never the attempt seed, so a retry never moves what the profile already settled. Shelf prices roll before the world is built, because the access rules read them back. Minimal accessibility is the only contract that lets the fill park an item somewhere it can never be reached, and only once the goal is already secured (Fill.py's `perform_access_check`).

## packages/randomizer/src/world/fill/location-order.constants.ts

The order a region hands its locations to the fill, where record order is not it. This is a fill order, not a fact about the game. The fill shuffles one candidate list built region by region, so the order a region lists its rows in decides which item lands where. The reference builds a dungeon's rows in walk order, with a key drop sitting where the pot it comes from stands; the records number the same rows by kind, key drops last. The two agree everywhere except the seven regions listed. Dropping this table moved 9 to 14 rows of every seed in apps/desktop/tests/regression when it had nine entries (measured); the other two only ordered a story event, which is no location any more. Nothing else reads it. Every other region comes out in record order, which is already the reference's, and the world builder throws when a row here is not exactly that region's own set.

Per region: in `region-167` the three pots come before the boss and its prize. In `region-168` the two key drops sit between the third and fourth chest. In `region-185` the waterway pot comes before the waterfall room. In `region-187` both pots come before the cell. In `region-196` the corner pot comes before the boss and its prize. In `region-197` the jelly drop comes before the compass chest. In `region-199` the pot room sits between the first and second chest.

## packages/randomizer/src/world/fill/place-prizes.ts

With the prize option on, the reference's own model: the ten reward items over the ten reward slots, uniformly (its pre-fill runs with an everything-collected state, which degenerates to exactly this), with the reward slots kept reward-only by the item rule (Rules.py 204 to 211). A placement that leaves something unreachable is caught by the sweep and retried on a derived seed. With it off, each dungeon's vanilla prize sits on its own slot.

## packages/randomizer/src/world/fill/placement-stats.ts

The option-derived stats a placement records, read off the fill world it was built on. One function serves both producers, the generator after a successful fill and an online session rebuilding a placement from a server's scouts, so the two can never record the same options differently. `attempts` is the 1-based attempt that produced the seed.

## packages/randomizer/src/world/fill/placement.type.ts

The generator's output: the fixed vanilla medallion pair, what every location holds (pre-placed and locked content included), the verification sweep's spheres, and generation stats. Locations and items are ids throughout. `locations` covers every location in the world and is keyed by location key, so a record relabelled tomorrow leaves it untouched; what a row is called is read off the record when it is shown. `shopPrices` maps a shelf location to the price rolled once from this seed, and is empty whenever no currency was ticked (every shelf then charges its vanilla rupees). `pondDemands` maps a pond rung to the demand rolled once from this seed, and is empty whenever no pond rolled one.

On `PlacementStats`: `attempts` is 1-based (retries are reseeded). `npcDeliverableCount` is how many npc-scope locations entered the shuffle (the caller's deliverable set intersected with the scope table; 0 with the option off); `worldDeliverableCount` is the same over the world-item table; `capacityDeliverableCount` is the deliverable set intersected with the present fairy slots. `ponds` is what each pond sold; a throw schedule is not stored but re-derived from these settings and the placement's own seed, so a spoiler, the logic and the running game always read the same one. `itemPower` is as asked for: the two derived fallbacks are recomputed from the tier ticks at arming time, so a stored placement and a live one always agree. `pondSlotsFollowMode` is true when each wish pond's mode decided her two vanilla slots, false where those slots answer to the npc scope alone.

## packages/randomizer/src/world/fill/pond-candidate-pool-of.ts

The candidate pool an item demand names from is this snapshot's own pool, built on a stream of the seed, not the attempt's, so a retry cannot move which names were on offer. It is built only when a pond has the item row ticked.

## packages/randomizer/src/world/fill/pond-demands-of-snapshot.ts

A snapshot and a seed to the demands that seed's ponds ask for. It is the one entry point: the generator calls it to record them on the placement, and the options panel calls it to preview them, so a row the panel draws is the row the seed carries. The deliverable sets are the capability probes' answers, the same ones the fill is given, because the scope they open decides what the pool carries.

## packages/randomizer/src/world/fill/roll-placement-prices.ts

What the shelves charge, rolled before the world is built, because the access rules read these amounts back: a shelf the file could never pay for is out of logic, and the fill has to know that before it places anything. The roll runs on the attempt's own rng, so a retry rolls fresh prices and no stored seed moves. The pond demands used to roll here on the same stream; they now come from the seed alone so the options panel can show them before anything is generated. A pond asking for rupees and nothing else drew nothing from this stream, so the move left every placement where it was.

## packages/randomizer/src/world/fill/sweep-placed-items.ts

The assumed-state sweep the fill runs before every placement: the port of the reference's `sweep_from_pool` and `sweep_for_advancements`. It starts from the assumed inventory (the still-unplaced pool), then repeatedly collects the items sitting on already-placed locations that are collectable, in sphere batches, until a fixpoint. Placed non-advancement items are collected too: no rule reads their names, so this is behaviour-neutral and keeps the bookkeeping to one map. Each batch also grants the story events within reach of the same state. `collectedLocations` is the locations whose placed item the sweep has collected.

## packages/randomizer/src/world/fill/verify-placement.ts

Verification sweep over a completed placement: from an empty inventory, repeatedly collect every collectable location's item in sphere batches until a fixpoint. What the sweep reports is the same in every accessibility contract: the spheres, the locations it never reached and the story events it never made happen. Which of those invalidate the seed is the contract's question, asked of the accessibility check. The batches double as the placement's spoiler spheres. The story events within reach of each batch's state happen with it; they are no location, so a round that only made events happen is no sphere.

## packages/randomizer/src/world/fill/verify-standard.ts

Standard-mode structural checks on a finished placement. The reference guarantees these by construction (ItemPool.py `generate_itempool` 294 to 318), so a stored placement violating them was generated under different rules and is unplayable. The escape must be fought with whatever the mentor check grants, before any other check is reachable, and the in-game start carries no bombs, because the reachability sweep's ammo assumptions hold only once that check yields a member of the assurance set, one the capacity profile, when given, leaves usable at the start. An empty list means the placement honours the guarantee.

## packages/randomizer/src/world/final-fight.constants.ts

What the final fight asks of the bow, read off the core. The evidence, all in the vendored core (read only, never edited here): in `sprite_main.c`, the boss sprite's state 16, after the fourth ceiling fall the last phase opens with `sprite_health[k] = 96`. In the boss sprite's invincibility helper, a blade hit that lands while the hit timer reads 26 stuns the boss for 127 frames and switches its sprite type from 0xD6 to 0xD7 (`sprite_type[k] = 215`); state 19 switches it back. In `ancilla.c` `Ancilla_CheckDamageToSprite_aggressive`, an arrow (damage class 6) fired from the silver bow (`link_item_bow >= 3`) is promoted to class 9, and a class-9 hit on type 0xD7 starts the 32-frame recoil. The enemy damage table the ROM ships (asset `kEnemyDamageData` at 0x83e800, one nibble per damage class, unpacked by `DecompressEnemyDamageSubclasses`) gives type 0xD7 bucket 2 for class 9 and bucket 0 for every other class, and type 0xD6 bucket 0 for both arrow classes, so only a silver shot on the stunned form scores at all. In `sprite.c`, `kEnemyDamages[9 * 8 + 2] = 24` per such hit, and `Sprite_GiveDamage` ends the sprite the moment health minus damage reaches zero. 96 / 24 = 4 exactly: four silver shots, each landed on a fresh stun, and nothing can be farmed between them. Every reading that depends on the count (the final fight's rule, the retro wallet floor, the arrow capacity floor) takes it from here. `final-fight` re-exports these under the path the app imports.

## packages/randomizer/src/world/item-groups/

The item sets a rule counts against, read off the item-group records. The engine used to carry its own lists of bottle, crystal and medallion names, a second copy of groups the dataset already holds. Each is now the record group's own member ids, so adding a bottle to the dataset adds it to the logic. `BOTTLE_ITEMS` is every bottle, whatever it holds: the group a bottle count reads. `MEDALLION_ITEMS` is also the set a gated entrance may ask for. `VANILLA_MEDALLIONS` is the unmodified game's fixed pair for the two gated entrances.

## packages/randomizer/src/world/item-ids/

The record id of every item the engine names, under a code handle. The engine used to spell an item's name wherever a rule, the pool or a lock had to say which item it meant, which made the name a key: two records could not share one, a relabel moved a placement, and the engine's spelling and the record's had to agree by hand. An id is the record's own primary key, so each handle is a reference and never a second copy of the data. A name is read back off the record when something is displayed and is needed nowhere else. Same bargain as `ITEM_GROUP_IDS`: the ids resolve at compile time, so a call site reads a named property and stops typechecking if the handle is gone, while the record it points at is free to change anything but its id. The alternate bow row rides the same ladder as the main one. The flute has two rungs (the plain Flute, the Activated Flute that calls the bird as it is) and the family item the pool carries for them.

An unrecorded item is a pool item the dataset holds no record for, carried as its own name behind a prefix that cannot be mistaken for an id. Two groups: the counter catalog's generated rungs (a family's upgrade item is minted by formula per family and jump, which is 110 names and 8 records; the two counted families' third to seventh tier jumps, and every rung of the hundred-step wallet ladder, exist only as names), and the retro quiver. Each becomes an ordinary `ItemId` the day a record exists, and nothing else has to change: the engine only compares keys, and a name is read back through the display-name lookup either way. The quiver is the one-off, spelled once.

## packages/randomizer/src/world/item-power/item-power-forced.ts

Names the rows the sword ticks have taken out of the player's hands, and the one sentence that says why, off the same condition the generator and the core arm from. The panel uses it to stop showing a switch that says off while the seed is built with it on, because a control that lies about the seed is worse than none. There are two conditions: no sword at all (`FORCED_WITHOUT_BLADE`), and no sword that throws a beam (`FORCED_WITHOUT_BEAM`). The second is wider, so a file stuck on the first sword is walled off by three of the five rows while the other two still answer to the player. Every masked row carries the same `FORCED_ON_REASON`: which condition masked it is already visible in which rows went inert. The map is empty while the sword family can reach both readings, which is every seed that keeps its ladder.

## packages/randomizer/src/world/item-power/item-power-from-snapshot/

The rows and the setting they stand for, in both directions in one place, so the reading the generator uses and the writing the creation form freezes never spell an option two ways. An absent key falls back to its baseline, the normal step. `itemPowerValuesOf` gives the rows a setting freezes, which is what the creation form hands the catalog.

## packages/randomizer/src/world/item-power/item-power-options.constants.ts

The item-power rows of the option catalog: synthetic, unlocked, in the `items` group. They replace the reference's single `item_functionality` choice, which stays in the catalog, locked, as the transcription of its dataclass. Every baseline is the normal step, so a fresh profile plays the unmodified game.

## packages/randomizer/src/world/item-power/item-power-rule/

The one place item power is read: what is in force for this world. Some switches are read and not obeyed, because a tier tick can make the requirement they stand for unmeetable:

- No beam sword anywhere in the seed: a rule insisting on one would wall off the tablets forever, so the hammer stands in. This is the fallback the reference's own swordless mode uses (`Rules.py` `can_retrieve_tablet`, `Rom.py` 180044).
- No sword at all: the medallion doors take none, as the reference's swordless mode has it (`Rom.py` 180041).

Both are masks and not rewrites: the player's own switch is untouched, so ticking a sword rung back on gives the requirement back. The derived setting is also what the running game is armed with, so the logic and the core never disagree about which fallback is live. The two hammer stand-ins hang off the beam reading and not the sword one: the first sword scores nothing against the seal or the last fight (both carry a zero in that damage column), so a file stuck on it is walled off as a swordless one is. A world built without the setting asks for the normal step.

## packages/randomizer/src/world/item-power/item-power.constants.ts

The catalog keys the switches occupy, and the reading each has under the reference's four steps (`Rom.py` `patch_rom` 817 to 870, 1045 to 1047). `DEFAULT_ITEM_POWER` is the normal step (`Rom.py` 862 to 868), the unmodified game. What each of the four steps did is written on the locked transcription row's own description, beside the switches it points at.

## packages/randomizer/src/world/item-usability/

Whether an owned item can be used under the world's capacity profile: the one gate the collection state consults before answering `has` and `hasAny`. An item whose record says every use spends the meter (`ItemRecord.spendsMeter`) is usable only while the meter family stands above its empty rung; every other item is always usable. Under the reference profile the meter never stands on that rung, so every reference rule reads as the source wrote it. The meter-consuming set is read once: the registry is seeded before any rule runs and never changes under one.

## packages/randomizer/src/world/location-key.type.ts

How the engine names a location. A spot the unmodified game has is a check of the dataset, so it is its record's id. Two kinds of row are named another way. A shop purchase is named after the shop, the shelf and the purchase: `kakariko-shop-shelf_left-slot_1` is the shelf's first stock and `slot_2` its first restock (n counts from 1). The shelf's first stock still has a check record and the key maps back to it; the restocks, which the depth option adds, have none. The shop slugs and shelf sides are one table. A pond rung above the pair: a pond sells a ladder as long as its setting asks for, and only the first two rungs are spots the game has, so a rung hangs off the pond's own id. A key is derived from data that owns the row, never from a display name, so a relabel cannot reach it; what a row is called is read back off the records when something is displayed.

## packages/randomizer/src/world/location-record/

The crossing between a location key and the check record that stands for it. Most locations are their record's id. A shelf's first stock is the exception with a record: its key names the shop and shelf, and its record keeps the dataset's own id, which is what detection, the tracker's rows and the display name read. A restock, a pond rung and the capacity shop's event have no record at all.

## packages/randomizer/src/world/option-description.type.ts

How an option explains itself. A setting with one thing to say says it in a sentence. A setting whose behaviour splits (a mode per value, a rule per currency) says it as a list: one line per point, each opening with the short term it is about (a mode name, a value) and then plain text saying what happens, never repeating the term. Both shapes are data. Nothing here knows about markup: a panel decides how a line looks, and the flattened "term: detail" reading is what a caption, a tooltip or a screen reader gets.

Reading a description in either shape. The listed form is what a panel renders line by line; the flattened form is the single string every plain consumer needs. Both come off the same entry, so the wording is written once. Every detail is written as a finished sentence, so the joined reading is a paragraph.

## packages/randomizer/src/world/options-capacity/

The capacity rows of the option catalog: synthetic, unlocked, group `items`. One generator per family (mode, start, max, count, curve, jumps; the meter has no curve rows), behind the master switch that turns the whole feature off, plus the one progressive switch over every Custom family (on for a new profile). The four `_mode` rows are what the creation panel renders; the value rows sit behind them. Baselines are the rows the default capacity profile writes through the one snapshot writer the creation form uses, so a fresh profile and a bare catalog freeze can never disagree; a family the profile leaves off Custom carries the values it would start from (the vanilla rung, the ladder top, the family's count). Rung 0, the empty tier, is a choice. The meter's rungs are cost tiers, not a size, so its two range rows say tier. Descriptions merge in from the descriptions table like every other row.

## packages/randomizer/src/world/options-descriptions.constants.ts

The one-line clarifier a catalog row carries when its label alone does not say what changes in play. A row whose label already says it has no entry. The locked rows all carry one: their labels are the source project's own field names, so a player has no way to know what "Beemizer" or "Scams" would do; the line says what the setting means, and the row's own tag says why it cannot be changed here. `PLACEMENT` covers the placement choices, including the two the generator cannot roll.

## packages/randomizer/src/world/options-pond/

The pond rows of the option catalog: synthetic, unlocked, group `items`, a block per pond under one switch that shares a single block across all three. Only a `pond_<id>_mode` row is meant to be read on its own; the value rows behind it are rendered by that pond's block. Every baseline is a row the pond's own default writes through the one writer the creation form uses, so a fresh profile and a bare catalog freeze can never disagree. Each counted ask row has a range the curve reads a rung's amount into; the share switch belongs to no single pond.

## packages/randomizer/src/world/options.type.ts

The full option catalog transcribed from Archipelago worlds/alttp/Options.py: every option of the reference's `ALTTPOptions` dataclass that is a question about the seed, in dataclass order, with the source default, the value this app hard-sets (baseline), and an audited `implementation` class stating what the engine does with it. Baselines of not-implemented options are their off or vanilla value, so a frozen snapshot never advertises a feature the engine lacks. The reference's display and quality-of-life block (palettes, heart colour and beep, menu speed, quickswap, music, reduced flashing, the two HUD readouts) is absent: those are settings this app already owns per profile. Also absent are the rows this app asks under a control of its own: a question offered twice is a duplicate, so the source's bundled spelling is deleted and not kept as a signpost; the guard test lists them and proves each is in the dataclass and out of the catalog. Two rows are gone for a plainer reason: the per-family order controls answer the tier-order question, and this app has no surface for hand-written game text. All entries are locked except key drop shuffle, the four dungeon-item placement rows, the three synthetic switches at the top (two scope, one dungeon prize) and the synthetic capacity rows that replace the reference's single capacity toggle. A synthetic row has no source default, so its source default is its baseline; the baselines of the unlocked rows are what a new profile starts from, and a stored snapshot missing one reads that baseline. `MEDALLION_OPTION_KEYS` names the two rows that say which medallion a sealed entrance asks for, so a consumer claims the pair by reference.

Row notes. `dungeon_prize_shuffle` is not a reference option: the reference always shuffles the ten dungeon rewards among the ten reward slots (Rules.py 204 to 211 restricts those slots to reward items), with no switch; this app offers one so a seed can keep each dungeon's own reward. The reference's own `shuffle_prizes` is a different feature (the enemy, tree-pull and bonk drop packs) and stays locked. Accessibility: the three contracts are all enforced (the fill relaxes for minimal, the self-locking allowances exist for anything but full, and the post-fill sweep asks the question the chosen mode asks); the baseline is `full`. `start_inventory_from_pool` is an items question wherever the reference files it, so it sits on the items tab. `mode`: the baseline diverges from the source default, because this app always plays the vanilla intro (the escape), which is the source's standard mode. The source asks the dark-room requirement as one three-way choice; this app asks the two questions inside it apart. The story gates replace three of the reference's own rows (the pyramid hole, the crystals for the tower and for the final boss) under the same keys. The source's four-step pool choice bundles two unrelated questions (its generous step duplicates a family's copies while its mean steps lower the ceiling); both are asked apart, with which rungs exist answered by the tier ticks. The source's four-step `item_functionality` choice is asked as separate switches. The source's blade toggle is asked per rung, and unticking every blade rung is that setting. The reference asks the whole seed one question about tier order; this app asks it per family. Retro bow is live: arrows leave the world and the bow is fed rupees as it fires; the two per-shot costs are the app's own rows, because the reference fixes them in its patcher and a cost is a number a player should be able to move. `scams` is about what a merchant tells you before you pay, so it belongs with the shops. `shop_item_slots` counts how many of the ticked slots a counted mode opens; the source's range stops at 30 (ten shelf shops of three), while this app also offers the potion seller's three cauldrons and the bomb counter's one purchase, so the ceiling is the whole canonical list, and the panel never offers more than the player has ticked. `shop_price_modifier` is live: the percentage every rolled price is scaled by before it is clamped, the reference's own range and reading, where a hundred changes nothing. The reference's single capacity toggle is gone, decided per family by the synthetic rows. The pond rows sit on top of whatever the capacity families decided, with the legacy pond as baseline. The two session rows describe a session shared with other players, not the seed; DeathLink follows the profile's own toggle, so its row stays locked.

A description entry is split into the two readings the catalog carries: the flattened string every plain consumer uses, and the lines a panel renders when the entry was written as a list. A row with no entry carries an empty description.

## packages/randomizer/src/world/pond/distinct-brackets.ts

One bracket index per rung of a kind, from that kind's rungs' curve positions (0 to 1, in rung order) over the bracket count. Inside a kind the rungs take distinct brackets in curve order while the brackets suffice, and spread evenly with repeats once they do not.

## packages/randomizer/src/world/pond/holdable-items.constants.ts

The facts an item demand's eligibility is read from. The fairy names an item and the player throws it in as proof, and the core only tests possession of the item's resolved receive id. So a demand may only name something the player keeps in hand once found, and whose id the core can test on its own. Everything else stays out, each for its reason. Junk: rupee, bomb and arrow pickups and a single arrow are spent into a counter, nothing is held. Upgrades: pieces of heart, heart containers, magic upgrades and every capacity step, wallets included, each raise a limit and leave nothing to hold up. Bottles: a bottle and every content have their own demand kind and row. Keys: small keys are spent on doors, and a big key, a map or a compass resolves to one plain id for every dungeon, so the core cannot tell which dungeon it came from. Events: triforce pieces and the woken flute are never held. A family tier name: the inventory keeps only the highest rung reached, so a named lower rung cannot be told from a higher one; the family's own pool item is eligible, read as "tier 1 or more". No native id: a record with no receive id the native tables hold (Silver Arrows, the alternate retro bow) is nothing the core can test. This keeps the seven crystals out while the three pendants, which each have their own id and bit, stay in.

The self-lock needs no row here: it keeps the named item off the rung that asks for it, which is a placement rule applied after this roll, and every pool item has other locations to go to, so it never removes a candidate. `UNHELD_ITEMS` lists holdable-looking items the player can still lose: the game keeps one inventory byte for each of three pairs, so picking up one of a pair writes over the other, and the witch takes the mushroom.

## packages/randomizer/src/world/pond/pond-ask-from-snapshot/

Snapshot values to one pond's ask, and back. The rupee row is not read from rows of its own: its two ends are the setting's ladder ends, handed in by the caller, so the range a player cuts on the panel is the range she asks over; only its tick is a row. A counted row's two ends are ordered and held inside the stops it reads. An absent rupee tick reads as ticked, because a snapshot with no ask block at all is a pond that charged rupees and nothing else. An ask for rupees and nothing else is handed back as nothing: a setting with no ask means exactly that, so a player who left the block alone and one who ticked rupees alone carry the same setting, and stored settings stay as small and comparable as before the block existed. `askOfSetting` always takes the rupee ends from the ladder, so a stored ask can never drift from the prices it names. `pondAskValuesOf` writes the rows back, minus the rupee ends the ladder owns, spelling the counted ends as the choice rows spell them.

## packages/randomizer/src/world/pond/pond-ask-keys/

The snapshot keys of one pond's ask block. Every key carries its pond (`pond_wishing_ask_bombs_max`), the way the pond's other rows do. The rupee row's two ends are the pond's ladder ends, so one key pair says what the ladder costs and what she asks for. The bottle carries a count, so it carries the same two range keys every other counted row does. `pondAskKeysOf` lists every ask key of one pond in the order the block stacks its rows.

## packages/randomizer/src/world/pond/pond-ask.type.ts

What the fairy may ask for. A pond used to charge one thing, rupees, and a setting said how many: the ladder's two ends. This opens that question, so a rung can ask for bombs, arrows, bottles of something, or one pool item held up and handed straight back. Every row reuses the shop's own price types, because a demand and a shelf price are the same question asked in two rooms: the same roll, the same access rule, and the same row component on the panel.

Every counted row is the same shape: a tick and two ends. The curve cuts the throw sequence once and each row reads the same position into its own two ends, so a rung halfway down the sequence asks for about half of whichever currency it drew. The bottle is a counted row too: its amount is how many bottles of the content she names. The rupee row's two ends are the pond's ladder ends; one key pair carries them, and a Custom setting reads the same pair for its start and final price, so the ladder a player cuts and the amounts the fairy asks for can never disagree. The item row has no number: she names one thing and wants to see it, so there is nothing to ramp. Hearts are deliberately missing: a rung sits behind the rung before it, so a heart cost compounds down the ladder into a file that cannot survive its own pond. `PondDemandView` maps a rung location to the demand that rung was rolled with, for one seed.

The rows a pond's ask block offers, and the ladders each ramps over. Rupees walk the pond's own price ladder, because the ladder is the rupee demand: its two ends are the row's two thumbs. Bombs and arrows get their own stops, which run up to the biggest bag and quiver a capacity profile can build (fifty and seventy). Bombs step through every count up to a native bag, then bag sizes; arrows coarsen as they climb. The settings cut those stops at what the profile's bag and quiver reach, and the roll holds both ends to the same reach, so a profile that shrinks a bag shrinks the demand with it. A fresh row still opens inside a native bag and quiver. The bottle row counts bottles: a file has four slots and no upgrade path to a fifth, so its stops are one to four and a fresh row asks for one. The bottle contents are the shop's own list, so the two rooms agree. Every row but rupees is off for a fresh profile, so an untouched profile asks for rupees and nothing else, as the unmodified game does. `asksOnlyRupees` is true while an ask is the one an absent ask stands for.

## packages/randomizer/src/world/pond/pond-ceilings/

The most a pond may ask of each counted currency under one capacity profile: what the wallet, the bomb bag and the quiver can reach at their biggest. The settings cut every range control at these, so a slider reaches exactly as high as the profile allows. No profile reads as a vanilla file: 999 rupees, ten bombs, thirty arrows.

## packages/randomizer/src/world/pond/pond-demand-eligibility.ts

The rule for which pool items an item demand may name, asked in one place. An item is demandable when the core can test the player holding it by its resolved receive id, and that id means this item and no other: a pendant, tested by its own bit through its own record; a progressive family's pool item, tested as tier 1 or more; an item record of a holdable category, outside any dungeon, with a receive id the native tables hold, tested by its inventory slot. A family tier name and the items the player can still lose are out before any of that is asked. Every concrete rung of a tiered family is out, because the inventory cannot tell one from a higher one. A name can carry several records, so any one holdable record counts.

## packages/randomizer/src/world/pond/pond-demand-item/

Which pool item a rung names. The player does not have to be holding it when the demand is rolled: going and getting it is the point. The access rule is `state.has(name)` and the fill's own solver makes that safe, since it reads the name as an ordinary requirement and routes or rerolls around it. The candidates are only names the player can hold and the core can test; an empty list means the pond cannot ask for an item at all, and the roll drops the kind. The candidates are ranked by where the unmodified game hands each one over along its route, earliest first, once each; two names with the same rank fall in name order, so a seed cannot depend on the order the pool was built in. A rung's position on the climb (0 is the first rung, 1 the last) picks a window in that ranking (`WINDOW_SHARE` of the whole), with the draw inside the window the one thing the rng decides. Every candidate comes from the pool handed in, so a demand can never name an item the seed does not carry, and the window is held inside the ranking. A name another rung of this pond already asks for is skipped while an unused one remains; the window widens to the nearest unused name when its own are spent. There is one draw, and only when the window holds more than one unused name, so a pond with nothing used draws exactly as before.

## packages/randomizer/src/world/pond/pond-demand-order/

How early in a run each demandable item turns up, for the curve an item demand climbs. The roll runs before the fill, so this seed's own spheres do not exist yet and cannot be the measure. What is fixed ahead of any seed is the order the unmodified game hands these items over along its standard route: the castle escape (lamp, sword, shield), the three pendants, then the seven crystals. That order is the shared sense of early and late a player carries into a seed. A seed moves every item, so this is a prior, but one that means something for items held once. Order is position in the list. A family's pool item stands where its first rung is handed over, because a demand for it asks for that rung or better. An eligible name missing from the list ranks after every listed one (the keep test pins that the list covers them all).

## packages/randomizer/src/world/pond/pond-demand-ramp/

One ramp, read by every currency. The curve cuts the throw sequence once, and a throw's position is how far down that cut it stands: 0 at the first throw, 1 at the last. Every demand carrying a number reads that same position into its own two ends, so a rung halfway down asks for about half of whatever currency it drew. The positions come from the plan's own walk down the price ladder, which is the sequence the curve already cut; a rupee demand therefore reads back onto the plan's own prices exactly, rung for rung. A flat schedule has no walk: vanilla cost charges the same hundred every throw, and a Custom ladder whose two ends are one price does the same, so the curve's own weights (the share of the whole climb standing before each throw) say where each throw stands instead. A pond that asks for no rupees paces its throws by its curve alone, never by a rupee range it does not use. In a range, both ends come down to the ceiling first, so a range whose floor stands above what the profile can hold asks for the ceiling itself and does not drop the row the player ticked. `stopIndexOf` gives the nearest stop at or above an amount, or the top stop when it runs past the ladder. `stopsInRange` is every stop between a range's two ends: the brackets one row offers.

## packages/randomizer/src/world/pond/pond-demand-roll.ts

One demand per rung, rolled once from the seed's own rng and recorded on the placement, exactly as a shelf price is: the access rules read the demand back, so a rung the file could never pay for is out of logic and the fill has to know before it places anything. The sequence comes first, then the currency, then the amount. The curve cuts the throw sequence, the rng says which ticked kind lands on each rung, and that kind reads the rung's own position into its own two ends. No ask repeats while an unused one remains in any ticked row, and a pond asking for no rupees is paced by its curve alone. The rupee range is the sequence's own two ends, never the stored row: the plan has already held that row to the wallet and the throw count, so a demand reading the row could name a price no throw charges. The bomb and arrow ends come down first to what the seed's capacity profile can ever hold. The kinds join in a fixed order, so a seed never depends on row order. A bottle ask is a count and a content, so two bottles of a bee and two of a fairy are two asks; each bottle ask names a content no other ask of the same count already names, and only repeats one once a count has used every content.

An item row needs a candidate: the item kind joins the draw only while the pool carries at least one name the player can hold and the core can test. A pond with none asks in its other ticked kinds, and a pond with no other kind ticked asks for nothing: its rungs are free. It never names an ineligible item to fill the gap. An item carries no number, so it reads no curve; it walks the rungs themselves, early names first. A pond whose prizes are its own two vanilla grants has no ladder and no throw, so it asks for nothing; only the numbered rungs carry a demand. A single choice costs no draw: with one row ticked the pick is settled before the rng is asked, so a rupee-only pond leaves the seed's stream where it found it.

## packages/randomizer/src/world/pond/pond-demand-seed/

The pond demands of one seed, and the only place they are rolled. A demand is drawn on a stream of the seed's own, never the attempt seed the fill runs on, exactly as the rolled flags are: a seed that needs a second attempt keeps the demands the profile already settled, and the options panel can show them before anything is generated. Each stream carries its own name (`<seed>:pond-demands`, `<seed>:pond-item-pool`), so no other roll on the same seed can land on it. The generator records what this returns and the panel previews it, so the preview and the seed are the same roll.

Only a custom pond asks. A pond at its native economy charges what it always charged, and the core arms a demand row for a custom pond alone, so rolling one anywhere else put a demand into the access rules that the water would never ask for: the logic could hold a rung behind five bombs while the pond took its hundred rupees. The roll, the rules, the core and the panel now all read the same mode. The item pool arrives as a thunk: only an item demand needs it, and reading it means building a pool, so a profile with that row unticked never pays for one. `NO_POND_DEMANDS` is the reading for a pond with no ladder and no demand.

## packages/randomizer/src/world/pond/pond-from-snapshot/

Snapshot values to one pond's validated setting, and back. Validation follows the capacity reader's habits: an unknown mode falls back to the legacy pond, an off-ladder price snaps to the nearest legal rung, a final price below the start clamps to the start, the counts clamp into their ranges, and a free sequence that does not sum to the span degrades to the equal curve. Every fallback is reported under the pond's own name, so the panel can say which pond it applies to. Values with no mode row for this pond read as the pond's baseline, the setting a fresh profile gives it. Every active reading is then held to the wallet the same snapshot describes, so a price the wallet can never hold is never handed to the generator: a range the wallet cannot reach reads as the reach itself. A fixed schedule's rupee ends are that schedule's. `pondValuesOf` is the inverse; unused fields keep their default.

## packages/randomizer/src/world/pond/pond-instance.type.ts

What one fairy pond is, apart from what a player sets it to. The game has three, and they share one behaviour: a fairy rises out of the water, takes what is thrown in, and hands something back. They differ in the two grants they carry in the unmodified game, and in what those grants are the only source of. The room each one sits in is on the screen its slot records are filed under.

The lock answers that last question, and it is the one the settings cannot ignore: a slot the game is the only native source of cannot be emptied without leaving a hole in the seed. A hard lock names a capacity family whose upgrades exist nowhere else at all. A tier lock names a progressive family and the rung this pond hands over, named as the reference names the item, which the pool can carry instead. A slot with no lock hands over a discrete item the pool already holds a copy of, so nothing is stranded by taking it. `PondHardFamily` is the two capacity families a pond is the game's only native source of.

A slot's `key` is its own check. At a wish pond that check is rung 1 or 2 of her ladder; at the capacity pond it is rung 1 of the family ladder it heads. `rung` counts from 1. `ladder` is set when the pond sells one ladder per answer: the capacity pond's bomb answer and arrow answer each climb seven purchases, so the slot is rung 1 of that family's ladder and not the pond's Nth prize. `vanillaGrant` is the pool item her upgrade produces at the slot, which is what a wish pond at Vanilla grants locks there; never the item she takes in trade, which the player still has to find. It is absent at the capacity pond, whose pair the capacity families decide. A pond's `label` is the one name a player reads for it: the options panel's tab, and the stem of every slot it holds ("label 1", "label 2", and on up a custom pond's ladder).

## packages/randomizer/src/world/pond/pond-instances/

The three fairy ponds, assembled from their own pond-slot check records. Each record says which pond it belongs to, which rung of that pond's ladder it is and, where the pond sells one ladder per answer, which family that rung grows. The pond's name is the rest of the slot's name once the rung, and the ladder word in front of it, are taken off, so a pond is never spelled twice. A pond has no sides, so no slot is ever a left or a right, and a wish pond's own pair is rungs 1 and 2 of its ladder: one numbered series covers the pair and every custom prize above it. The capacity pond is the exception, because it answers in two ladders, bombs and arrows, seven purchases each: its two slots are rung 1 of a named ladder, so a rung never loses which family it grows. A pond's records are ordered by rung, then by record id, which separates the capacity pond's two rung-1 ladders. `POND_IDS` is the order the panel stacks the ponds in and the order every per-pond option key is generated in; it is a presentation order, so it is stated and not read off the records. `CAPACITY_POND` is the pond whose two slots the capacity families answer to.

## packages/randomizer/src/world/pond/pond-ladder.constants.ts

The pond's own ladders and fixed schedules. `POND_PRICE_LADDER` is the price a Custom throw may cost: rung 0 is free, every other rung is an amount the game itself hands out or charges somewhere, then round thousands up to the biggest wallet a capacity profile can build (9999). New rungs only go on the end, so a seed's rung indexes never move. The settings and the seed both cut the ladder at what the profile's wallet reaches, so a vanilla wallet still stops at 999 (`POND_VANILLA_WALLET_TOP`). A Custom setting picks a start and a final rung with the two-thumb range, and the curves cut the span into one jump per further throw, so the cumulative ladder is the price list. `POND_MAX_THROWS` and `POND_MAX_ITEMS` are the most throws any mode sells and the most pool items a pond can carry.

Vanilla cost reproduces the native economy: the pond charges one hundred rupees per upgrade and a native file can buy fourteen of them (seven per counted family), so fourteen throws of a hundred is the same money for the same number of upgrades.

## packages/randomizer/src/world/pond/pond-mode-switch/

The setting a pond mode change lands on. Picking a mode says nothing about the prices or the item count it should carry, so this decides that once: the legacy mode drops every value row; the other two keep the item count the player already chose (or the default, coming from the legacy pond, which carries none) and Custom starts from the fresh price ladder. The options panel and the rule that forces the pond off the legacy mode share it, so a forced switch lands exactly where a hand-picked one does. `POND_MODES` is every mode in the order the dropdown lists them.

## packages/randomizer/src/world/pond/pond-option-descriptions.constants.ts

The clarifier each pond row carries. The mode row needs one per pond, because "vanilla cost" means a different economy at each: the capacity pond charges a hundred a throw for its upgrades, and a wish pond charges nothing for its two grants. The item count and the free sequence read the same everywhere, so those lines are shared. The switch over all three ponds has its own line.

## packages/randomizer/src/world/pond/pond-option-keys/

The snapshot keys of one pond: the mode the panel renders, the value rows behind it (the throw count, the pool-item count, the curve and its free sequence), and the ask block's rows, which carry the price range the mode row used to spell. Every key carries the pond it belongs to (`pond_wishing_items`), so the three ponds are set apart in one snapshot. Only a mode row is shown with the player's other choices; the rest are rendered by the pond block itself, as the capacity family rows are. `POND_OPTION_KEYS` is every pond row, in pond order then field order, ask block included, under the one switch that belongs to no single pond. `isPondValueKey` is true for a value row any pond block owns (everything but the mode rows).

## packages/randomizer/src/world/pond/pond-plan/

Setting to one pond's throws, prizes and locations: one derivation for the generator, the logic rules, the core arming and the panel. Capacity: nothing; the pond keeps its native purchase loop. Vanilla cost: the native economy of this pond. At the capacity pond that is fourteen throws of a hundred (seven upgrades per counted family), the first `items` of which hand over a pool item and the rest climb the family the player picked. Only the capacity pond sells upgrades, so only it has a native price to reproduce: a wish pond charges nothing and asks for nothing thrown, so it is its own two grants and no throws, and `items` still says how many of the two are shuffled. Custom: the capacity curve machinery over the price ladder, the span between the start and the final price cut into one jump per further throw, so the cumulative ladder is the price list; a range with fewer rungs than throws repeats its prices in order (the first throw keeps the first price, the last keeps the last), so a narrow range never sells fewer throws than the setting says. The first `items` throws win, in order, in every mode.

A fixed schedule is held at the setting's ceiling when it carries one: the wallet's reach, folded in on read, so no throw asks for more than the wallet can hold. Nothing here is rolled: a plan is a pure function of its setting and its pond. Prize k sits at a known throw and every earlier throw must be paid to reach it, so a spoiler states the truth and the logic reads the schedule. `rungOf` gives the rung a price sits on, or the nearest rung at or above it when it is off the ladder.

## packages/randomizer/src/world/pond/pond-profile-defaults/

The ponds' fixed settings. Legacy is the pond as the unmodified game runs it: a pond keeps its native purchase loop and its two slots answer to their vanilla grants alone. Default is where a new profile starts: every pond on a Custom ladder selling ten pool items over ten throws. Hylia Fairy asks for rupees alone, free up to 999, in ten equal steps. Waterfall Fairy mixes rupees (free up to 400, geometric), bombs, arrows and an item. Pyramid Fairy asks for one or two bottles, or an item. `DEFAULT_POND_ITEMS` is two, today's two pond checks: what a mode offers before the player moves the slider. `DEFAULT_POND_CUSTOM` (a hundred up to three hundred over seven throws) and `DEFAULT_WISH_POND_SETTING` (its own two grants at the price the unmodified game charges, which is nothing) are what a mode starts from when the player picks it in the dropdown, never stored on their own. `POND_PRICE_FLOOR` and `POND_PRICE_CEILING` are the lowest price the range control offers and the highest one under a vanilla wallet.

## packages/randomizer/src/world/pond/pond-profile.type.ts

The pond profile: what a pond hands out, and what it charges. Capacity (the legacy default) leaves the pond as the capacity families describe it: its two slots sell the native tiers and become checks only when their family is not vanilla. The other two modes turn the pond into a sequence of throws: throw t costs price[t] rupees, paid in one toss, and hands over either the next pool item or a climb of the family the player picked. Vanilla cost reproduces the native economy (one hundred rupees per upgrade, fourteen upgrades). Custom cuts a price ladder with the capacity curves. Everything derived from a setting (prices, prize schedule, locations) is a `PondPlan` and is never stored.

On a custom setting, `start` and `max` are the ladder values (rupees) of the first and last throw, and also the rupee demand's two ends. An absent `ask` means rupees and nothing else, over that ladder: the only thing a pond charged before the ask block existed, so an old setting and one that asks for nothing else read the same. `throws` is how many throws the pond sells (the price ladder has exactly this many entries); `items` is the pool items in the pond (the In Pool number), and 0 makes the pond no check at all. A fixed-schedule setting needs no wallet ceiling: its dearest throw is a hundred, and the wallet floor keeps every reachable top well above that.

On a throw, `prize` is the prize ordinal handed over, or -1 when the throw climbs capacity instead. `refund` is the rupees handed back when the throw wins nothing; no shipped mode pays one, so it is 0 throughout, and the core keeps the channel (`pond_plan.c`) for a future mode. On a plan, `throws` is empty for the legacy mode, where the pond keeps its native purchase loop; `locations` is the pool locations in prize order; `worstPriceOfPrize` is the largest single price on the way to prize k, which the wallet must hold. It is the guaranteed worst case: every earlier throw must be paid to reach this one, so no reading of it depends on luck. `totalPrice` is what the whole pond costs to empty.

## packages/randomizer/src/world/pond/pond-profiles-from-snapshot/

Snapshot values to all three pond settings, and back. One read serves the generator, the options panel and the profile writer, so the three ponds can never be read in two different orders or with two different fallbacks. `profiles` is what the seed sees: the shared switch is already applied, so a caller cannot forget it. `stored` is what the three blocks hold, which is what a panel edits and the writer puts back; the two are the same object while the switch is off. `notes` is one line per fallback applied, across every pond.

## packages/randomizer/src/world/pond/pond-profiles.type.ts

One setting per pond. The three are configured apart, so nothing outside the pond folder carries a bare `PondSetting`: a consumer that means one pond says which one (`profiles.capacity`), and a consumer that means all of them carries the whole record.

## packages/randomizer/src/world/pond/pond-region-locations/

What a pond's own region holds, in the order the pond hands it over. A pond's room is the one region whose locations are more than its check rows: a setting lets the pond sell a ladder as long as it asks for, and only the first two rungs are spots the unmodified game has. So the region's list is the whole ladder, with the pond's own records at the rungs they are and every rung above them a slot key. The capacity pond's pair heads two named ladders, so it sits ahead of the plain numbered series. The region is read off the pond's own slot records, never a name.

## packages/randomizer/src/world/pond/pond-rungs/

Each pond's prize slots, in the order that pond hands them over. Every slot is a rung numbered from one. Only the first two rungs are spots the unmodified game has, so those two are the pond's own check records and every rung above them hangs off the pond's id. A wish pond's own pair is rungs 1 and 2 of its ladder, so those keys mean her grant while she keeps her native economy and prize 1 or 2 once she sells a ladder. The capacity pond answers in two named ladders instead, so its pair sits outside the numbered series and every one of its rungs is a slot key.

There is one queue per pond and not one per side, because a pond charges before the player picks which of its two grants to take (the price prompt is its own dialogue, the choice comes after the fairy rises), so a per-side price ladder cannot exist. The side choice still decides which family climbs when a throw wins no prize. `POND_PRIZE_LOCATIONS` is the capacity pond's rungs, the only ones the world graph carries today; `POND_EXTRA_LOCATIONS` is every pond's whole ladder.

## packages/randomizer/src/world/pond/pond-share/

One switch, three ponds. With it on, the three fairies are configured once: every pond reads the capacity pond's rows, so a player who wants the same ladder and demands at all three sets them in one block. With it off, each pond keeps its own rows. The resolution lives here and nowhere else: the generator, the access rules and the options panel all read the effective settings through it, so none of them can roll or show a pond the others do not. A pond's own rows are never rewritten: sharing is a reading, so turning the switch off hands every pond the settings it always had. A snapshot with no row reads as off, the only thing three separately configured ponds could have meant before the switch existed. `POND_SHARE_KEY` is a switch over all three ponds, not a row of any one of them.

## packages/randomizer/src/world/pond/pond-slot-models.constants.ts

The randomizer's model of each pond slot, keyed by the slot's own check id. Neither half is a fact about the game. The lock is this generator's reading of what a slot is the only native source of, which decides whether emptying it would leave a hole in the seed. The grant is the pool item the slot's upgrade produces, in the pool's own words, which is what a wish pond at Vanilla locks into the slot; never the item she takes in trade. What each slot is, where it sits and what number it carries lives on its check record.

The capacity pond's pair (`check-273`, `check-274`) is the game's only source of either family, so both are locked hard, and which upgrade each hands over is the capacity families' business. At the wishing water (`check-021`) she takes the blue boomerang and hands back the red one, two discrete pool items and never a ladder, so nothing can be stranded by taking that slot. At the cursed water (`check-266`, `check-267`) the slots hand over the top rung of each of their two families. A slot with no model has no lock.

## packages/randomizer/src/world/pond/pond-spots/

Which pond slots exist as locations, and which are prize slots. A wish pond's own pair is rungs 1 and 2 of its ladder, so her two names are locations whatever she sells: her grants while she keeps her native economy, prizes 1 and 2 once a Custom setting gives her a ladder. The capacity pond's pair is named for the families it grows and follows the capacity spots: present while the family is not vanilla and the pond is at Vanilla grants, replaced by the pond's own prize rungs otherwise. `presentPondSlots` is every pond location the world holds. `pondPrizeLocations` is the narrower set the pool counts and `pondPrizeCount` reports: the prize rungs a seed sells, plus the capacity pond's fairy spots under Vanilla grants. A wish pond's own pair is not counted there, because the npc scope has always counted it.

A prize ladder needs that pond's physical seam proven deliverable first, because a rung past her pair has no vanilla item to fall back to and cannot be locked the way a fairy slot is. A pond's own pair is what the capability probe can certify, because they are the only grants with a physical seam of their own (at the capacity pond, the bomb answer and the arrow answer; at each water, the two the fairy hands over); a prize rung past them rides the same seam, so certifying the two certifies the ladder. The probe certifies all three ponds' pairs into one set, so `POND_CERTIFIED_SPOTS` is the capacity pond's slice of it. A wish pond at her native economy sells her own pair, which is not a prize rung, so she sells no rungs.

## packages/randomizer/src/world/pond/pond-vanilla-slots/

What a wish pond's mode does to her own two slots, rungs 1 and 2 of her ladder. Capacity (Vanilla grants): locked to what her upgrade produces (the slot's `vanillaGrant`), and that item leaves the pool. The item she takes in trade stays in the pool, so the player can still find it and throw it. This is its own table on purpose: the npc scope's translation of the same rows is pool accounting for its switch, and at the wishing pond it names the boomerang she consumes. Vanilla cost: untouched; the two slots are the pond's two checks and the npc scope decides them. Custom: sold as prizes once the pond carries rungs. The core shuts the pond after its last rung, so her upgrade can never run: the two names are prizes 1 and 2 of the ladder, and the npc scope no longer decides them. Her vanilla items stay in the pool, because the silver bow and the golden sword have nowhere else to come from.

A custom pond with no rung in the world (no pool item, or a seam the probe did not certify) arms nothing in the core, so the native upgrade still runs and both slots stay what the npc scope makes them. `followMode` false is the reference oracles' world: the slots answer to the npc scope alone whatever the mode says.

## packages/randomizer/src/world/pond/pond-wallet-top/

The pond held to what the wallet can hold. A throw the wallet can never pay for leaves the prize behind it out of logic, and under full accessibility an unreachable prize means no seed rolls at all. So every reading of a pond setting passes through here with the wallet family's reachable top: Custom has its price range pulled down to the highest ladder rung the wallet reaches (rung 0, free, at the very least). A vanilla wallet holds 999, above everything the pond can ask, so a profile that never touched the wallet reads as before. The wallet's top is the same number every other ceiling reads, so a rupee price, a shot cost and a throw can never disagree about what a wallet holds.

The fixed schedule needs no holding. Its dearest throw is a hundred, and the wallet floor keeps every reachable top at 599 or above, because a fixed 500-rupee purchase sits in front of the ending. Only a Custom range, which climbs to 999, can outrun a wallet. Each clamp applied adds one note.

## packages/randomizer/src/world/pond/rupee-gems.constants.ts

The six gems the game draws for a rupee amount, largest first (the order the greedy decomposition walks), each naming the item record whose art it is. The three small values share one numberless sheet and differ only by palette row; the three large ones each have their own sheet, which is why a toss can only show one of them at a time and the decomposition is spawned in volleys. Gems sharing a `decodeKey` come out of one decoded sheet and can be drawn together (with coloured rupees on, they need no different recolour). The native receipt id is not here: it is the item record's own `gameId.receiveItemId`, the same number `rupee_gem_draw.c` keys its colour table on. `POND_GEM_SLOTS` is how many gems the pond can have in the air at once: its own ancilla slots.

An amount of rupees as the gems that depict it. Plain greedy over the six denominations, largest first: the fewest gems that add up exactly, and the reading a player does at a glance (300 is one gold; 427 is one gold, one silver, one red, one blue and two greens). A negative or zero amount shows nothing. The gems then leave in volleys: the game decodes one sprite sheet at a time for a group of flying receipts, so gems that need different sheets (or, with coloured rupees on, different recolours of the shared sheet) cannot be in the air together. Consecutive gems with the same decode key travel together, at most one slot-full each, so the same amount always decomposes and leaves the same way whichever setting is on. The mirror of this is `GameHook_PondTossRupees` (`core/game-hooks/pond_toss_draw.c`); the numbers here are what its unit test pins. `describeRupees` is the readout the panel and the logs show.

## packages/randomizer/src/world/pond/share-out-kinds.ts

The brackets a pond can ask for, and how the rungs are shared out over them. A bracket is one distinct ask: one rupee price the plan charges, one bomb, arrow or bottle count inside its row's two ends, one eligible item. Every ticked row brings its own brackets, and the rungs are filled from all of them together, so the throw count never depends on one row's range (a pond asking only for bottles and items fills ten rungs from those two rows). No repeat until the brackets run out: each rung draws its kind from the rows that still hold an unused bracket. Only once every row is spent does a rung draw from all of them again; that is the filler, and it only exists when the ticked rows are too narrow. A single choice costs no draw, so a rupee-only pond rolls exactly what it always rolled.

## packages/randomizer/src/world/pool-item-overrides.constants.ts

Which item the baseline pool puts at a check, where it differs from the item the record names, keyed by the check's own id. This is translation and not a fact: the record says exactly what the unmodified game hands over at that spot; the baseline pool is stated in its own terms, and the two disagree wherever the pool models a family instead of a tier. Progressive gear stands in for the concrete tier: the four Progressive Swords cover the uncle's (`check-017`), the smithy's once the pair is reunited (`check-039`), the pedestal's (`check-072`) and the cursed water's (`check-266`); Progressive Bow covers her second grant (`check-267`); Progressive Shield covers the wishing water's second grant (`check-022`); Progressive Ocarina covers the flute spot's (`check-008`). A boss's heart container is the pool's own boss-drop item, never the pickup the game hands over (the ten boss checks). The three in-dungeon standing keys (`check-126`, `check-135`, `check-235`) name their per-dungeon key, which is removed from that dungeon's restricted set and not from the global pool. The wishing water (`check-021`) holds a red boomerang in the unmodified game, and so does the village hut's chest, but the pool holds one of each colour, so her slot takes the pool's blue one. Everything else reads its own record: a bottle gift is a plain bottle in both vocabularies, and so is every heart piece, rupee pile and key drop.

## packages/randomizer/src/world/pool/balance-filler.ts

The reference's toss and re-add loop (ItemPool.py 436 to 490) for the capacity upgrades. Every upgrade item past the spots that became checks displaces one filler item, so the pool stays exactly one item per open location. Filler is what the reference classifies as neither progression nor useful, and never an upgrade item itself, so a wallet item can never be trimmed to make room for another. The pool is edited in place. A negative delta (more open spots than items) is impossible by construction and is kept for the reference's symmetry; it re-adds the twenty-rupee filler. The default picker removes the last filler in pool order. `fillerCountOf` is how many filler items a pool can still give up.

## packages/randomizer/src/world/pool/build-item-pool/

Assembles the baseline item pool from the transcribed composition rows. It ports Archipelago worlds/alttp/ItemPool.py `get_pool_core` and `generate_itempool` for the fixed baseline options: normal pool, standard mode, boss-defeat goal, no timer, progressive on, retro off, shops off.

Dungeon-restricted items never enter the global pool. Under the baseline shuffle options every key, big key, map and compass is dungeon-local and pre-filled inside its dungeon. With the key-drop option off, the reference locks each drop location's vanilla key onto it and removes it from the dungeon set (`generate_itempool` lines 350 to 370); this port subtracts the drop table's items per dungeon. The synthetic npc-scope option reuses the same arithmetic per locked location: each locked location's vanilla item leaves the global pool, and in-dungeon standing keys leave their dungeon sets.

The capacity profile adds its families' upgrade items and trims one filler per item past the spots that became checks. The profile also decides which starting weapons are usable at the escape and whether the wallet items count as progression. The default bottle picker takes the first content: the reference randomizes bottle contents and logic does not care.

The passes run in a fixed order, and the order matters. The progressive ticks run after the scope subtraction, never before, so a tick only removes a copy the shuffle was going to carry. The per-family mode runs next on the copies that survived: a random-order family's copies stop being steps and become the rungs themselves, one name for one name, so the pool size holds. Retro follows on the same terms: an arrow pickup the shuffle carries becomes a small rupee pickup, because a retro seed has no ammunition to find. The heart ceiling comes next: a pickup the seed no longer carries becomes the stand-in rupee pickup. The copy multiples run last of the passes over a tiered family, so they multiply names the ticks and the order pass have already settled; this one grows the pool, so its count joins the capacity upgrades' filler arithmetic.

A pair slot sold as a prize rung is a location the reference counted as a vanilla grant and this world does not, while its vanilla item stays in the pool. A vanilla grant the pool had no copy of is a locked slot with nothing removed for it. One filler leaves for each.

A shelf slot the profile opened is one more spot, so the pool gains one more item for it. The reference backfills a freed slot with fifty rupees and does not put the shop's own stock in the pool (ItemPool.py 399 to 411, with beemizer off and the hundred-rupee roll's chance at zero under these options). Each restock is one more spot on the same terms. A retro seed with shuffled shops spends one of those backfills on the quiver: the shelf that used to stock it opens as an ordinary slot in the same breath, so the seed gains a spot and an item together and the balance never moves.

Standard mode assures the mentor check a usable weapon (ItemPool.py 294 to 318). The draw is skipped when that check is pre-placed (scope-locked to its vanilla sword, the source's `placed_items` guard) or when the caller supplies no picker (parity worlds load a finished placement instead).

The escaped dungeon items are appended last, after every pass that reshapes the pool, so a family leaving its dungeons cannot perturb any of them. ItemPool.py 347 to 348: only the families still named in `dungeon_local_item_names` stay out of the global pool. A family whose mode has left the dungeons joins the shuffled pool and stops being prefilled, which frees exactly one dungeon location per item, so the fill stays balanced with no filler arithmetic. Under the baseline every family stays in and the pool is byte-identical to what it always was.

When the caller supplies no explicit locked scope set, a table's toggle off locks that whole table and on locks nothing of it. Every shelf slot that is a location in the world is free for the fill: a retro seed opens the shelf that sold arrows along with them and locks nothing. Pond prize slots that are checks are those present and not locked; under the legacy pond those are exactly the present fairy slots, and a non-legacy pond adds its own prize slots, each displacing a filler back into the pool.

`PROMOTED_HEART_CONTAINERS`: ItemPool.py 496 to 509 promotes one Boss Heart Container to progression at generation time (the hearts-as-requirement branch). The pool port keeps the static classification and surfaces the promotion as this documented count.

## packages/randomizer/src/world/pool/capacity-pool-items.ts

The capacity items a profile puts in the pool. The counted families and the wallet contribute their plan's items on top of the reference rows. A fairy slot that exists but is locked vanilla keeps its vanilla one-tier item, so one such item leaves the family's items when it holds one (the npc-scope mechanism); when it holds none, the locked slot delivers its vanilla upgrade for free and the items stay.

## packages/randomizer/src/world/pool/item-classes.constants.ts

What the fill treats each pool item as: progression, useful, or the filler everything else is. The class of an item is a fact about the item, read off `poolClass` on the item records. Two groups of pool names have no record of their own and are added here. The counted families' larger jumps exist as pool names generated from the upgrade name tables, and only the first, second and whole-grid jumps are records; they are progression in the reference's own table (Items.py 113 to 121) and only enter the pool while their family is shuffled. The retro quiver is this app's own item, progression on the same terms: it is only there while retro is on and the shops are shuffled.

## packages/randomizer/src/world/pool/item-pool.type.ts

`pool` is the 153-item shuffled-anywhere multiset (ItemPool.py `total_items_to_place`). `progression`, `useful` and `filler` partition it per the Items.py `item_table` classification. `dungeonItems` maps a dungeon name to its restricted set (keys, big keys, maps, compasses), which never enters the global pool and respects the key-drop option. `prizes` fill the ten prize locations. `startInventory` is the reference's precollected list, empty for the baseline. `uncleWeapon` is the weapon removed from the pool for the mentor check; it is present only when the builder was given a picker and the check was not already locked vanilla, and the fill world pre-places it.

## packages/randomizer/src/world/pool/meter-pool-items-of.ts

The meter's first items replace the reference's fixed magic row, padded back to its length so the 153-item invariant holds. Every further meter item (a ladder opens with the empty rung, so a plan can carry one item per level) enters the pool the way the other families' items do, displacing filler. A locked meter spot needs its vanilla half-meter item somewhere in the pool for the scope subtraction to find, so it is appended when the plan carries none.

## packages/randomizer/src/world/pool/pond-grant-subtraction.ts

Pool-side arithmetic of a wish pond at Vanilla grants: each slot she keeps holds the item her upgrade produces, so that item leaves the pool, one copy per slot. One overlap is real and expected. The npc scope's own lock can already have taken the last copy: with its switch off, `Brewery` keeps a Red Boomerang, and the baseline pool carries only one. The vanilla game holds two Red Boomerangs, so both locks are right about their own slot and the pool never had a copy for the second. That slot then displaces a filler, never the Blue Boomerang the player needs to throw, and the count of such slots goes back to the caller's filler balance. A produced item missing from the pool with no scope lock holding it is a porting bug, and throws.

## packages/randomizer/src/world/pool/pool-accounting/

The real fill accounting of a snapshot. Every number comes from the fill world the generator itself builds, never from a second bookkeeping. It is pure: the mentor-check assurance runs with a fixed first-choice picker, because the count is the same whichever weapon leaves, and the bottle and filler picks are deterministic, so it is cheap enough for a live panel. The shop seed is the profile's own, which the random shop mode draws its shelves from.

The fields: `locations` is every location of the world, prizes included. `spots` is every location an item can sit in, not a prize slot; it is the ceiling of the fill, and a new kind of spot (grass, pots) raises it. `open` is what the fill may place into. `items` is the global pool plus the dungeon sets, equal to `open` by the fill invariant. `fixed` is the spots settled before the shuffle: the locked vanilla items plus the assured starting weapon. `prizes` is the ten boss-reward slots, pre-placed from their own fixed pool. `lockedVanilla` is the locations pre-placed with their vanilla item and excluded from the fill. `filler` is the filler still in the global pool, what more upgrades could displace. `upgrades` is the capacity families' items in the global pool, the meter's row included; each took a filler's place.

## packages/randomizer/src/world/pool/pool-impact/

The In Pool column: what one option contributes to the fill. For a plain option the impact is the diff of the real accounting between the snapshot and the same snapshot with the option at its neutral value (the value at which it adds nothing to the pool), so there is no second bookkeeping to keep in sync. A capacity row reports its family's plan directly (N upgrade items replacing filler, the spot as a check). A locked row is fixed by construction and reports nothing. Locations or items are negative when the option locks or removes some.

The shop neutral values are nothing shuffled, no slot open, and one item per open slot: the three values at which the shops contribute nothing, so each row's cell reads as its own delta. Every pond is listed at legacy so each row is measured and does not fall through to the no-impact default: a pond changes which spots are locked vanilla, so a diff of zero is an answer, and the day a mode does open a fill spot, the cell says so on its own.

## packages/randomizer/src/world/pool/pool-tables.constants.ts

Item-pool composition rows for the baseline seed, ported from Archipelago worlds/alttp/ItemPool.py, normal difficulty only (`difficulties['normal']`, lines 99 to 130) with the fixed baseline choices: mode standard, goal ganon, no timer, retro off, swordless off, progressive on (the reference's `want_progressives` coin flip pinned to true, per the baseline spec), entrance shuffle vanilla. `get_pool_core` (lines 595 to 762) then assembles always items, gloves, legacy insanity items, base items, bottles, the shield, armor, magic, bow and sword rows, and all five extras blocks; the extras (153 less 83 is 70) consume them exactly.

Row sources: always items are ItemPool.py 25 to 28, with the Flute carried as the ocarina family's one reference copy. Gloves are line 29 (progressive on). Legacy insanity items are line 31: entrance shuffle is not insanity legacy, so both go to the pool. Base items are lines 46 to 47 (`normalbaseitems`). Four bottles are lines 646 to 651, contents drawn per bottle from `normalbottles` at random; logic treats every bottle name identically (Items.py `item_name_groups` "Bottles"), so the port pins the plain bottle unless a picker is injected. Shield, armor, magic and bow rows are lines 104, 107, 109 and 113 with progressive on. Swords are line 111, progressive on and swordless off. The extras are lines 48 to 52, the five normal-difficulty blocks in order. The total of 153 is line 64, the fixed non-dungeon pool size.

## packages/randomizer/src/world/pool/prize-items.constants.ts

The prize pool: the ten crystal and pendant items placed on the ten dungeon prize locations (the reference's `pre_fill` in worlds/alttp/__init__.py, transcribed from the Items.py `item_table` Crystal rows). They never sit in the shuffled pool.

## packages/randomizer/src/world/pool/progression-class.ts

Progression classification under a capacity profile. The reference table already lists the counted families' upgrades and the two meter levels as progression. The wallet items join them whenever the wallet starts below the rung the priciest gate needs, because until that rung is reached a priced check is locked exactly like a check behind a missing key. A vanilla wallet starts above every price, so nothing is promoted there and the reference partition is unchanged. A progressive item is classed by its family exactly like the fixed-jump items of that family.

The dungeon keys answer here too: Items.py classes every `Small Key (...)` and `Big Key (...)` as progression and every `Map (...)` and `Compass (...)` as filler. They only reach the global pool when their family's shuffle mode takes them out of the dungeon prefill, so under the baseline this branch is never taken.

## packages/randomizer/src/world/pool/remove-scope-locked-from-pool.ts

Pool-side arithmetic of the npc-scope lock, per locked location: every locked location keeps its vanilla item, so that item leaves the pool the same way the key-drop option's locked keys leave their dungeon sets. The caller supplies the locked location set (all of the scope with the option off, the undeliverable remainder with it on). Global-pool removals are exact-name, with one tolerance: a locked plain Bottle consumes whichever rolled bottle variant the pool holds, because contents are cosmetic and logic treats the group as one item. A removal that finds nothing is a porting bug and throws. Both scope surfaces are iterated together, since a locked row can come from either. Small keys are per-dungeon and leave dungeon sets, not the pool (`scope-locked-key-counts`).

## packages/randomizer/src/world/pool/standard-escape/

Standard-mode escape assurance tables, transcribed from Archipelago worlds/alttp/ItemPool.py `generate_itempool` 294 to 317. With no starting melee weapon (the baseline has no precollected items), the mentor check must hold a weapon the escape can be fought with. The scan lists mirror the source exactly: one sword tier, first found (line 302); one bow, first found (line 306); each named arsenal item once (line 309); and the bomb pack (lines 312 to 313, the bombless start toggle is off, so the upgrade branch at 315 to 317 never applies). The escape-assist block (320 to 328) is off under default enemy health. `UNCLE_LOCATION` is the mentor's own check. `UNCLE_USABLE_WEAPONS` is every item the assurance may place, the acceptance set a stored standard placement is verified against.

## packages/randomizer/src/world/pool/uncle-usability.ts

Which starting weapons the escape can be fought with. A family standing on its empty rung when the file starts makes its weapon dead on arrival: no bombs to hold, no arrows to fire, no meter for the rod and the canes. The assurance scan and the stored-placement check both filter through this, so a weapon that cannot be used is never the one handed over. A weapon absent from the family table needs no capacity.

Retro takes the bow out on its own terms. There, arrows are not a capacity at all: the bow fires only once the quiver has been bought, and the escape happens before any shop can be reached. So a bow handed over at the start of a retro seed can never be fired, whatever the arrow capacity says. The flag is only whether shots are bought, not the whole retro setting. Vanilla start rungs with retro off admit every candidate, so the reference scan is unchanged there.

## packages/randomizer/src/world/pool/uncle-weapon/

The standard-mode starting-weapon assurance: the port of Archipelago worlds/alttp/ItemPool.py `generate_itempool` 294 to 318 for the fixed baseline (no precollected melee weapon, bombless start off). The candidate list is built by one pass over the assembled pool in pool order, exactly as the source scans it (the `possible_weapons` scan, lines 296 to 313): the first sword tier found, the first bow found, each arsenal item once, the bomb pack once. The chosen weapon leaves the pool and the caller locks it onto the mentor check. The whole draw is skipped when that check is already pre-placed (the source's `placed_items` guard, line 295; here the location is scope-locked to its vanilla sword). A usability filter drops the candidates a capacity profile makes useless at the start.

## packages/randomizer/src/world/potion-price/blocked-content-note.ts

The one sentence the rule shows, beside a content tick the shuffle has taken away, so the price block and the run view say the same thing about the same state.

## packages/randomizer/src/world/potion-price/potion-cauldrons.constants.ts

The hut's cauldrons paired with the bottle content each sells, derived from the shop-slot records: a cauldron slot whose stock names a bottle content is that content's only repeatable source. A cauldron selling something else pairs with nothing and the rule ignores it. The pairing is by canonical slot index, which is what the scope ticks, so a dataset edit that moves a slot moves this with it. `contentOfStock` turns a stock name into its content id (red potion becomes `red-potion`). `CAULDRON_CONTENTS` is the only contents the rule can ever block. A cauldron's price is what a wallet must hold to buy the content back.

## packages/randomizer/src/world/potion-price/potion-price-rule.type.ts

The rule binding the hut's cauldrons to the bottle-content prices, and the only place it is written. The hut is the one repeatable source of potions: each cauldron sells one content, over and over, for rupees. A shelf priced in a bottle content consumes that content when paid, and a restocked shelf asks again, so a price is payable only while its content can be bought back. A cauldron ticked for shuffling holds a shuffled item, which takes its content out of the game.

- Cauldron ticked, and the shops shuffling at all: its content cannot be a price.
- Cauldron unticked: its content is available again.

Unlike the capacity and pond pair this one is not symmetric: a price cannot make a potion purchasable, so the scope is always the authority and the currency rows follow it. The follow is a mask: the player's own tick stays in the choices and comes back the moment the cauldron is unticked, the same trick the capacity master switch uses, with no second copy of the answer stored. The reading is the ticked set, not the opened one: which ticked slots a counted mode opens can depend on the seed, which is fixed only at profile creation, so a ticked cauldron counts as lost whether or not this seed takes it. `reconcilePotionPrices` is idempotent. `blockedContentsOfValues` is what the generator refuses; `potionPriceStateOfValues` is the panel's reading of which rows to grey and what to say under them.

`PotionPriceSelection.prices` is the price rows as the panel holds them: a patch over the catalog baselines. In `ReconciledPotionPrice`, `prices` is the rows the seed is built from, `notes` has one sentence per content taken away, `blockedContents` is what the roll must refuse, and `blockedKeys` lets the panel grey exactly those rows.

## packages/randomizer/src/world/progressive/progression-tiers.constants.ts

What a copy of a family's pool item hands over, by rung. Ported from Archipelago `worlds/alttp/Items.py` `progression_mapping`, inverted: collecting the Nth copy of a progressive base item grants the Nth concrete tier. The rungs are the families' own, so nothing is written twice. The alternate bow row rides the same ladder as the main one, as the source map has it. The mail family is absent on purpose: its tiers are classed useful, so the source never expands a mail pickup and no rule reads a mail rung.

## packages/randomizer/src/world/progressive/progressive-display-names/

What the tier controls and rows are labelled with. The family table carries the identity the generator places (`tiers`, the reference's item names) and a short neutral word per rung (`tierLabels`). The label reads the item's own name off its record and keeps the neutral word only for a rung the family does not carry.

## packages/randomizer/src/world/progressive/progressive-families.constants.ts

The tiered families, their pool item and the tiers each copy hands over, transcribed from Archipelago `worlds/alttp/Items.py` (`progression_mapping`, lines 230 to 242) and `ItemPool.py` `difficulties['normal']` (lines 99 to 130), the row set the pool is pinned to. The mail family has no `progression_mapping` entry because its tiers are classed useful, not progression (no rule reads them), so it is here for the pool and the receipt ladder alone. Families are in the order the cards are shown.

Tier counts are the reference's normal-difficulty copy counts: four swords, three shields, two mails, two gloves, two bows. So one tick per tier is also one tick per pool copy at this difficulty, and the tick list answers both questions. The reference pool holds one Flute, woken at the weathervane in play; ticking the ocarina's second rung puts the Activated Flute in the pool as a second copy, which is why that rung is off by default.

`REPLACEMENT_ITEM` is the reference's stand-in for a copy that is not there: swordless swaps the four swords for four twenty-rupee pickups (`ItemPool.py` 76, 108, 140, 172, `swordless=['Rupees (20)'] * 4`). Using it for every family keeps the fixed 153-item pool size as transcribed. `DEFAULT_PROGRESSIVE_SETTING` is each family's default ticks: what an absent row reads as.

## packages/randomizer/src/world/progressive/progressive-from-snapshot/ and packages/randomizer/src/world/progressive/progressive-mode-from-snapshot/

The tier rows and the setting, both directions in one place (the dark-room module's contract). An absent tier key falls back to its default tick (every rung but the ocarina's second): the reference pool. `isReferenceProgressiveSetting` is true while every family is at its default ticks. `defaultProgressiveSetting` hands out a fresh copy for a creation form.

For the mode rows an absent key falls back to in order, the baseline; anything but the one recognised alternative (`random`) reads as the reference. `progressiveModeValuesOf` writes a family the setting says nothing about with nothing behind its key, on purpose: the wiring guard reads the frozen map by value, so a mode field left off the choices must show as an unwired row and not freeze as the reference reading. Absent on the way back in is what means in order, and that is the only place it should mean anything.

## packages/randomizer/src/world/progressive/progressive-mode-options.constants.ts

The per-family mode rows of the option catalog: synthetic, unlocked, group `items`, beside the tier ticks they qualify. The reference asks this once for the whole seed (`Options.py` `Progressive`: off, grouped_random, on), forcing every family to the same answer; the app asks per family, because "the swords in order, the shields in any order" is a shape a player thinks in. Every baseline is in order (the reference's `on`). `sourceValue` mirrors the reference's two live steps: on is 2 and off is 0.

## packages/randomizer/src/world/progressive/progressive-mode-pool.ts

A random-order family's copies turned into the rungs themselves. It runs after the tick pass, on the finished pool, for the same two reasons (every conversion swaps one name for one name; the mode bites on what the shuffle carries). Copies are named from the top of the ladder down. That keeps a partly locked family coherent: the copies a character check still hands over are nameless steps and resolve to the lowest rung not held, so leaving the low rungs to them and putting the high ones in the pool means the two readings never hand over the same rung twice. With the whole family shuffled that is every rung once. A family with no copy in the shuffle is left alone.

## packages/randomizer/src/world/progressive/progressive-modes/

How each family's copies reach the player. Every family defaults to `progressive`, the reference's reading. `PROGRESSIVE_MODES` is in the order the control offers them; `PROGRESSIVE_MODE_LABELS` is the short wording shared by the card control and the catalog row. `isReferenceProgressiveModes` is true while every family is on the reference reading.

## packages/randomizer/src/world/progressive/progressive-option-keys/ and packages/randomizer/src/world/progressive/progressive-mode-keys/

The catalog keys of the tier ticks and the per-family mode rows, derived from the family table so a tier or family added to the data brings its row. Tier keys are numbered from one in climb order: a key names a position on the ladder, never the item it hands over, so renaming a tier never orphans a stored snapshot. Mode keys name the family and never a tier, so they survive any change to the ladder.

## packages/randomizer/src/world/progressive/progressive-options.constants.ts

The tier rows of the option catalog: synthetic, unlocked, group `items`, each an ordinary toggle. Together they replace the reference's swordless switch, which is not in the catalog at all: unticking every sword row is that switch. Every baseline is the family's default tick. A row is titled from the dataset (`progressive-display-names`); a checkout without the record set keeps the short neutral words. The ocarina's second rung is the one off by default, so its description says what each state does.

## packages/randomizer/src/world/progressive/progressive-pool.ts

The tier ticks applied to an assembled pool. Two things make this a pass over the finished pool and not a shorter row at the start. The pool keeps its transcribed size whatever the ticks say: an unticked rung leaves the reference's stand-in behind (`ItemPool.py` 76) and does not shrink the row, which keeps the fixed 153-item total (`ItemPool.py` `total_items_to_place`) true for every tick set. And the ticks bite on what the shuffle carries, which is known only once the locked-vanilla scope is subtracted: a profile that leaves the character and world checks out of the shuffle has already taken those items off the pool, and those locations hand them over in game whatever a tick says, so a tick removing one would remove a copy that is not there. Copies are converted from the back so the earliest survive: the standard-mode starting weapon scan reads the pool in order (`packages/randomizer/src/world/pool/uncle-weapon`), so a family with any rung left still offers it, and a family with none offers nothing, the reference's swordless behaviour arrived at from the ticks. Counting the unticked rungs (and not comparing totals) makes a tick mean "one fewer of these in the seed" under every scope; comparing totals would silently do nothing whenever the vanilla givers had claimed as many copies as the ticks left. A family whose pool held fewer copies than it has tiers gains one per extra ticked tier, each in a stand-in pickup's place.

## packages/randomizer/src/world/progressive/progressive-reach/

What a tick list reaches, asked in one place. A copy hands over the next ticked tier, so unticking a middle rung shortens the ladder. Everything downstream follows: the tier map the collection state expands a pickup through, and the two sword questions the rules ask:

- Can a sword be held at all? Unticking every rung is the reference's swordless setting (`Options.py` `Swordless`), so the barriers and fights it reworks are reworked on the same condition.
- Can a beam sword be held? The second rung and up throw the beam, and a few rules ask for nothing less: the tablets, the drop into the final fight, the fight itself. With only the first rung ticked the reference has nothing to say (its switch is all or nothing), but the file would be stuck, so those rules relax onto the hammer as the reference's swordless branch does. It is a mask: ticking a beam rung back on restores every requirement.

The mail family is absent from the tier map on purpose (useful, not progression). `FAMILY_OF_POOL_ITEM` maps each family's pool item, plus the alternate spelling of the bow row. A world built without the setting reads as every tier ticked; one built before the mode rows existed reads as every family in order.

## packages/randomizer/src/world/progressive/progressive.type.ts

Which tiers of a progressive family exist in a seed. The reference asks this as one blunt toggle per family at most (a swordless switch and nothing else), which mixes two questions: how many copies of the family's item the pool carries, and which concrete tiers those copies hand over. The app asks per tier, because that is how a player thinks: "no gold sword", "keep the first shield only", "no bow at all". Unticking every sword tier is the reference's swordless setting, derived and not asked twice. A tick list is read by position against the family's tier table: entry k is the k-th tier. Pickups climb the ticked tiers in order, so unticking a middle tier leaves no hole. A shorter or absent list reads as every tier ticked.

`ProgressiveFamilyMode`: `progressive` is the reference's reading and the default: the pool carries one nameless copy per ticked rung, and each copy hands over the next rung up, so the first copy found is always the bottom of the ladder. `random` puts the rungs in as themselves: separate items found in any order, so the top of a ladder can turn up first and is that tier. A rung found after a higher one is already held is surplus, not a step down; the core answers that because it resolves against live inventory, not a count.

In `ProgressiveFamilyDef`, `label` is the card heading, `poolItem` is the item the pool carries one copy of per ticked tier, `tiers` are the concrete tiers in climb order, and `tierLabels` are short per-tier labels for the tick boxes. `referenceCopies` is how many copies the transcribed pool carries before any tick applies (omitted means one per tier); a family with fewer (the ocarina's pool holds one Flute) gains a copy per extra ticked tier, each taking a stand-in's place so the pool keeps its size. `defaultTicks` is what a new profile starts with and an absent row reads as (omitted means every tier).

## packages/randomizer/src/world/progressive/tick-consequences/

What a tick set changes about the world, one line at a time. Unticking sword rungs does more than shorten a ladder: five rules that ask for a sword have no answer left, so each relaxes onto something the seed can still hand over. Those relaxations are decided in one place (`packages/randomizer/src/world/item-power/item-power-rule`, `derivedItemPower`), which masks the matching switch on whenever the requirement could never be met. This is that same pair of conditions in words, so a panel can say what the ticks just did. The conditions: no sword at all (the swordless setting from the ticks), and no sword that throws a beam (which the first rung alone also fails, because it scores nothing against the seal or the last fight). A line is a consequence, not advice: it appears only while its condition holds, so the default tick set produces none. Each row's `field` is the switch it stands in lockstep with, so a change to the derivation is caught against this table. The rows are in the order a run meets them.

## packages/randomizer/src/world/progressive/tick-set-check/

Whether a tick set can be rolled at all, checked before any fill runs. Two rungs are load-bearing under the transcribed rules, and unticking one leaves a seed with no ending. The fill would find out on its own twenty attempts later, and only as "the goal is not reachable", so it is said here once, naming the rung to tick back on. The list is short and shrinks as stand-ins land. The sword rung was listed once and no longer is: the two places that asked for a beam sword (the seal outside the tower and the last fight) take the hammer whenever no beam sword is reachable, and a hanging cloth door can be pulled down instead of cut. Those stand-ins are armed from the tick set itself (`item-power-rule`), so a file with no sword rung still reaches the ending; the hammer is a progression item every pool carries. Everything else a tick set closes off is ordinary difficulty the fill places around. `assertRollableTickSet` throws with every reason at once.

## packages/randomizer/src/world/public-api/

Each folder is one concept of the package's public surface, and the package `index.ts` only star re-exports them. The split exists to keep the entry barrel under the barrel line cap, so a name moves between folders without changing what the package exports. Add a new export to the folder of its concept, and add a folder when a concept has none. The folders are `placement` and `reachability`.

## packages/randomizer/src/world/region-ids.constants.ts

The regions the logic helpers name directly, by id. A region is a record, so these are ids and the collection says which place each one is. `start` is the graph's own root (Menu): a place in the rules and nowhere in the game. `coldBeeCave` is the Good Bee Cave. `potionSeller` is the one shop selling unlimited green and blue potions, which is what the magic-extension branch of `can_extend_magic` reaches for. `capacityFairy` is the fairy's room where a vanilla bomb or arrow family is bought up to its top rung. `mountainShop` is the Light World Death Mountain Shop, the one region the reference's bunny pass handles apart. `desertPalaceOuter` is Desert Palace Main (Outer). `turtleRockTop` is the mountain plateau above Turtle Rock, not a room in it. `turtleRockSecondSection`, `eastDarkWorld`, `bigBombShop`, `blacksmithsHut` and `sanctuary` are what their names say.

## packages/randomizer/src/world/region.type.ts

Types of the ported world graph (Archipelago worlds/alttp/Regions.py `create_regions`, Dungeons.py `create_dungeons`). A region and an exit are still named; a location is its own key. A `RegionGraphRow` is one passage of the reachability graph: where it starts, where it ends, and the name the rule tables key its requirement by. Both ends are region ids; the passage stays named, because the reference's exits are logical, one per rule. Its `connectionId` is the crossing the record collection draws for it, where exactly one joins the same pair of regions; absent where none does (a mirror spot, a retry from the menu, a wing boundary inside one room) and where several do, because the pair alone cannot say which door it is.

On a `WorldLocation`, `kdsOnly` means it exists only with key-drop shuffle on (python `key_drop_data`); `capacityOnly` means it exists only with capacity-upgrade shuffle on (the fairy-pond slots); `pondSlot` marks a slot of a pond (one of the two fairy slots a legacy pond hands over, or a numbered prize rung every other mode replaces them with, present only while the pond carries that many prizes); `prize` is a boss prize slot (the crystal flag in the python location table), never a pool item; `vanillaItem` is the item sitting there in vanilla, for key-drop, capacity and npc-scope locations. A `WorldEvent` is a story event that happens in a region: never a location, never filled, granted by the sweep once its region is reached and its own rule holds. A `WorldDungeon` is the record's own facts with each restricted item resolved to the pool name the fill carries; `smallKeyCount` is the record's own count with key drops on. A `RegionCrossing` is one physical crossing between two different regions, as the connection records draw it.

## packages/randomizer/src/world/retro/dearest-shot-cost.ts and packages/randomizer/src/world/retro/retro-shot-wallet-need.ts and packages/randomizer/src/world/retro/retro-wallet-need.ts

`dearestShotCost` is the most one shot can ask for: the silver shot is the dear one, and a bow that has climbed to it never goes back. `retroShotWalletNeed` is what the wallet must hold at once for the shots to be worth taking: a plain shot, and the final fight's silver shots back to back (`packages/randomizer/src/world/final-fight.constants.ts`). Nothing can be farmed once that fight starts, so the term is the count times the cost. A seed that hands the quiver over as a found item is held to this, because nothing was paid for it. `retroWalletNeed` adds the quiver's asking price: a seed that sells the quiver is held to it, because a wallet that cannot hold 80 can never make the purchase.

## packages/randomizer/src/world/retro/retro-bow.constants.ts

Every number here is one the reference's patcher writes. Plain shot 10: `Rom.py` 1453 writes `0x0A` to `0x180176`. Silver shot 50: `Rom.py` 1454 writes `0x32` to `0x180178`. The quiver 80: `Shops.py` `set_up_shops` locks the single-arrow purchase into one shelf at 80 and pushes it into five more shops at 80. It is bought once (`Rom.py` 1451) and lets the bow fire at all. The reference spells it as a single arrow because that is the receipt its patched game hands over; the app calls it a quiver, with its own picture and receipt line. No item record carries it yet, so it is an unrecorded key (`item-ids.constants.ts`). Its price is a constant, not a slider. The single-arrow receipt (`0x43`) is the quiver's alias, because that receipt is what the running game reads as "the bow may fire" (`core/game-hooks/retro_bow.c`) and what the retro shelf sells as the quiver (`core/game-hooks/retro_shelf.c` `RETRO_QUIVER_RECEIPT`).

`RETRO_PRICE_CEILING` is a vanilla wallet's top: a shot costing more than a file can carry could never fire. `RETRO_ARROW_PICKUPS` are the two arrow pickups the pool carries; retro leaves none of them in it, and each becomes `RETRO_REPLACEMENT_ITEM` (`ItemPool.py` 725 to 727). The reference also strips the arrow capacity upgrades under retro (`ItemPool.py` 726); the app reaches the same pool by another door: the projectiles family reads as Vanilla while retro is on (`packages/randomizer/src/world/capacity/retro-projectiles`), so its card goes inert with the reason on it and none of its upgrades enters the pool.

## packages/randomizer/src/world/retro/retro-cost-ceiling.ts and packages/randomizer/src/world/retro/held-retro-bow.ts

How high the two shot-cost sliders may go under a profile. The seed is never asked to refuse a cost: the sliders stop where the wallet does. The plain shot may cost up to the wallet's reachable top (`packages/randomizer/src/world/capacity/reachable-top.ts`, the rung the shelf prices are capped at), held under the core's ceiling (`retro_bow.c` clamps at 999). The silver shot must be fired the final fight's count of times back to back with nothing to farm between, so its ceiling is that top divided by the count, rounded down. A stored cost above either ceiling is held at it on read, so a profile whose wallet shrank after the costs were set still rolls.

## packages/randomizer/src/world/retro/retro-from-snapshot/

The retro rows and the setting, both directions in one place. An absent switch reads as off and absent costs as the reference's two numbers. A cost is read under the wallet the same snapshot describes: a number above what that wallet can hold at once is held at the ceiling, so the generator's reading is always one the sliders would have offered. `storedRetroBowOf` is the rows as stored, before the wallet has its say. `retroBowValuesOf` writes keys with nothing behind them for a setting the choices never carried, as the mode rows do, because the wiring guard reads the frozen map by value. `defaultRetroBow` is a fresh copy for a creation form.

## packages/randomizer/src/world/retro/retro-logic/

What a retro seed asks for before a bow is worth anything: the quiver, held, and a wallet that can hold what the shots cost. How the quiver is held depends on the shops. Shuffled, it is an ordinary pool item, so the question is the item itself: the fill placed it somewhere reachable or the seed does not verify. Vanilla, it is stock on one shelf, so the question is that shelf reached and its 80 rupees affordable. Getting this wrong decides beatability, so the two readings are kept apart. The reference asks only the shop half (`StateHelpers.py` `can_shoot_arrows` through `can_buy('Single Arrow')`), because its costs are constants. The app asks the wallet too, since the costs are a setting: a wallet that cannot hold the price can never pay for a shot, and under full accessibility a rule pretending otherwise hands over a seed nobody can finish. The wallet is held to the final fight, not one shot; the plain cost is checked beside the silver one and never instead of it.

## packages/randomizer/src/world/retro/retro-options/

The two shot-cost rows of the option catalog: synthetic, unlocked, group `items`, sitting under the retro switch they qualify. The switch is the reference's own `retro_bow` row and stays where the dataclass puts it; only the two costs are the app's own question, because the reference fixes them in its patcher. Both baselines are the reference's patched bytes, so a fresh profile that turns retro on fires at 10 and 50. `RETRO_OPTION_KEYS` is every key these rows own; the panel renders them inside the retro block.

## packages/randomizer/src/world/retro/retro-pool/

Arrows out of the pool, and the quiver in. The reference swaps every arrow pickup for a five-rupee one (`ItemPool.py` 725 to 727), which is what makes retro retro: arrows stop being found because they stop being carried. Swapping keeps the transcribed pool size, as the tier ticks do. The arrow capacity upgrades are already out, one step earlier, because retro pins the projectiles family to Vanilla. With the shops shuffled the quiver becomes a placeable item and the pool carries one. It is not an extra item: the shelf it was locked to opens as an ordinary shuffled slot at the same time, so the quiver counts as one of the shop backfills the opened slots earn, and the pool still holds one item per open location (`packages/randomizer/src/world/pool/build-item-pool/build-item-pool.ts`).

## packages/randomizer/src/world/retro/retro-shelf.constants.ts

What the arrow shelf sells under retro once it has no arrows. The reference restocks the quiver's shelf, once the quiver is bought, with a random pick from a short list of shop staples (`Shops.py` `set_up_shops` `replacement_items`: the three potions, bombs, the blue shield, a heart). The app takes one, the red potion refill, and sells it at the shelf's own vanilla price, so a shelf that charged 30 for arrows charges 30 for the refill. The pick is an assumption written down here; change it and every arrow shelf follows.

## packages/randomizer/src/world/retro/retro-shops/

The shelf retro takes over: the one the quiver is sold from, and what it sells once the quiver is owned. The reference locks a single-arrow buy into a shelf at 80, pushes it into five more shops, skips it everywhere once bought (`Rom.py` 1451), and asks for it beside the bow (`StateHelpers.py` `can_shoot_arrows`). Which shelf is read from the shop-slot records: every shelf that sold arrows in the unmodified game is an arrow shelf, and the first in canonical order is the quiver's. In the unmodified game there is one: the right shelf of the shop that sells the rare shield, also the shelf the reference locks its purchase onto.

Two ways to hand it over, by the shop mode. Vanilla: nothing is shuffled, so the quiver stays on its shelf and the stock changes in the running game (`core/game-hooks/retro_shelf.c`): the shelf sells the quiver until it is owned and a refill after, at its own vanilla price. Shuffled (sequential, random, custom): the quiver is a pool item, and the shelf opens as an ordinary shuffled slot. The arrow shelves are opened whatever the mode drew, because under retro no shop may still sell arrows; the scope is spelled as an explicit set so nothing downstream re-runs a draw. A vanilla scope is left as it is.

## packages/randomizer/src/world/retro/retro.type.ts

The retro bow setting: the bow stops eating ammunition and starts eating money. What the reference's `retro_bow` is (`Options.py` `RetroBow`), read off its own patcher:

- `Rom.py` 1452 to 1454 turns on the rupee bow and writes two costs into the patched game: `0x180176`, the plain arrow at 10 rupees, and `0x180178`, the silver one at 50. Every shot is paid for when it is fired.
- `Rom.py` 1455 to 1459 takes arrows out of the world: the pot and fish prizes become rupees, the thief and the pikit steal rupees, the chest game hands over rupees. `ItemPool.py` 725 to 727 does the same to the pool, arrow capacity upgrades included.
- One purchase survives, and it is not ammunition: `Shops.py` `set_up_shops` locks a single-arrow buy into one shelf at 80 and pushes it into five more, `Rom.py` 1451 skips it once bought, and `StateHelpers.py` `can_shoot_arrows` asks for the bow and that purchase. The app gives that purchase its own name and item, the quiver: bought once, and the thing that lets the bow fire.

So the two numbers a player would want to move are the two costs per shot (`woodArrowCost`, `silverArrowCost`, rupees per plain and silver shot), not shop prices; the quiver's 80 is the reference's constant. The costs default to the reference's own. `RetroCostCeilings.wood` is the most a plain shot may cost (the wallet's top under the core's ceiling); `silver` is the most a silver shot may cost (the final fight's shots must fit the wallet at once). A `RetroShelfStock` is one arrow shelf as the running game restocks it with vanilla shops: `role` says whether it sells the quiver first or only the refill, `refillItem` is what it sells once the quiver is owned, `refillPrice` is the shelf's own vanilla price, which the refill keeps, and `quiverPrice` is the reference's quiver price or 0 for a shelf that never sells one.

## packages/randomizer/src/world/rules/bunny.ts

Transform-suppression rules: the port of the reference's `set_bunny_rules` (Archipelago worlds/alttp/Rules.py 1659 to 1788, non-inverted, no-glitches branch only). A region is affected when it carries the second-world flag. A region carrying only that flag requires the suppression item, while a region flagged for both worlds gets the option search: reach it through a chain of affected regions from a first-world-only region, carrying every crossed entrance's access rule (`get_rule_to_add`, 1696 to 1759). The reference adds the location rule once per inbound entrance; AND-composition makes that idempotent, so it is added once. Using an exit is python `state.can_reach(entrance)`: parent region plus the entrance's own rule, read when asked, so it is the one registered by then, overlays included.

Lines 1761 to 1767: affected multi-entrance interiors lock their exits; the records flag every one, and the mountain shop carries the flag too but is handled apart, as the reference handles it. Lines 1769 to 1771: the mountain shop entrance (a no-op in the open baseline). Lines 1773 to 1788: locations in affected regions need the suppression rule, and so do the story events there, which are event locations to the source.

## packages/randomizer/src/world/rules/collect/

Location collectability: `canCollectLocation` mirrors the reference's `Location.can_reach` (region reachable plus access rule). The story events have their own reading.

## packages/randomizer/src/world/rules/combat-helpers.constants.ts

The combat helpers as trees, same contract as the gear helpers: the body is the state helper the rules always called, the expansion the same question in primitive ops. The cane of byrna holds a room of five on one meter; a bigger room needs the meter extended. The bee cave is read off the world: a first-world cave never turns the player into a bunny. Five enemies is the default room the kill helpers assume.

## packages/randomizer/src/world/rules/combinators/

The small combinator set the rule tables are written in. Each mirrors one reference construct: `hasItem` and `hasKeys` are `state.has` and `_lttp_has_key` (baseline: no universal keys, so a plain count check); `canReach` is `state.can_reach(region)`; `canCollect` is `Location.can_reach`; `placedAt` and `placedIn` are `location_item_name` and `item_name_in_location_names` against the fill seam; `either` is the python conditional-expression rules; `exitRule` is the rule registered on an exit, read when asked (an unruled exit holds); `helperRule` is a named helper asked with its arguments. Which item or location a rule means comes from the data tables, as an id. Every combinator returns a rule that carries its tree. A leaf is compiled from its tree; a composite reuses its children's compiled closures, so a rule built from rules is never compiled twice.

## packages/randomizer/src/world/rules/gear-helpers.constants.ts

The equipment helpers as trees. Each body is the state helper the rules always called; each expansion is the same question in primitive ops (the rule-node parity guard asks both over random states and holds them equal). A gate's medallion is read as a setting: held, whichever one it is. The retro quiver is in hand as a pool item where the shops are shuffled, or bought off its shelf where they are not. An arrow capacity of zero fires nothing, so the capacity asked is never below one. Bombs are capped at the bag's own fifty, and a world carrying the player's record also asks that a bomb was held.

## packages/randomizer/src/world/rules/heart-capacity.ts

How many hearts a file can hold: the three it starts with, every container, and a heart per four pieces. No cap is applied, because a heart price is paid out of what the file holds.

## packages/randomizer/src/world/rules/helper-definition.type.ts

One named helper a rule tree may call. `body` is what the engine runs: the state helper as it was always written, so naming a helper in a tree changes no answer. `expand`, where present, is the same question written as a tree; a helper with none is a primitive, which an exporter's other side has to implement. The expansion is built for one world, because a few helpers read that world's own structure, and it may call other helpers by name. `params` lists the argument names in order; an argument left off takes the helper's own default.

## packages/randomizer/src/world/rules/helper-rules/

The helpers as rules, for the tables to write with: each asks the state helper of the same name and carries a `helper` leaf, so a table row reads the way it always did and still exports as data. A helper that takes an argument is a factory, and an argument left off takes the helper's own default, exactly as a bare state-helper call did. The factories port python `can_shoot_arrows(count)`, `can_use_bombs(quantity)`, `can_extend_magic(smallmagic)`, `can_kill_most_things(enemies)`, `can_kill_standard_start(enemies)`, `has_hearts(count)` and `has_crystals(count)`.

## packages/randomizer/src/world/rules/helpers-registry/

Every helper a rule tree may name, by name. The primitives are the questions only code can answer; the rest (the gear and combat helpers) carry their own expansion, so an exporter can inline them down to primitive ops. `primitiveHelperNames` lists the helpers with no expansion: what another implementation of the rules must write itself.

## packages/randomizer/src/world/rules/pond-demands.ts

A pond rung is a ladder, and this is the rule that says so. Rung k asks for three things: the pond reachable (its region rule, already registered), rung k-1 taken, and its own demand payable. The middle one is what a ladder means: to stand at rung k the player must have made every throw before it, so rung k carries the demands of rungs 0 to k, AND-composed in rung order. That is the same reading the wallet overlay already makes of a rupee ladder, widened to every currency a demand can name. Every currency is read by the shop's own price rule, so a bomb demand at a pond and a bomb price on a shelf ask for the same thing. An item demand also locks its own rung against the item it names: a rung reachable only by holding item X cannot be the rung that hands X over.

The climb runs over every rung, because a rung this world does not sell still had to be paid through; a rung past the plan, or one nothing was rolled for, demands `none` in the seed table and adds nothing. Only a prize slot the world sells, with a demand of its own, carries the rule (the `pondGated` flag). A pond handing over its own pair asks for that pair on its own terms. Every pond's ladder is registered the same way for every setting and seed; nothing rolled (every pond legacy) leaves every rung ungated. Which ponds may carry a demand is the roll's question (a custom pond and nothing else); this reads whatever the placement carries and never re-decides it, which keeps a generated seed on the rules it was verified against.

- JS side arming for the demand table all three ponds read (core/game-hooks/pond_demands.c). One row per prize rung, keyed by the pond and the rung's place in that pond's prize list, with the three lines the pond speaks for it.
- The table changes nothing the game computes: the pond plans' own gate bits decide whether a visit reads it (core/game-hooks/pond_demand_visit.c), so there is no bit to request here.
- It is host session state, emptied at every arm and every stop. The session layer composes the rows; this file is the ccall surface only. `setPondDemands` empties the table, then arms every row in one pass.
- The encoding of a row is in pond-demand-native.ts. `pond` is the core's pond key: 0 the capacity pond, 1 the wishing pond, 2 the cursed pond. `rung` is the place in that pond's prize list, from zero.
- `nativeId` is the bottle slot value or the item's receive id, 0 for a counted demand.
- `askMessageId` is the yes/no line naming the demand, `refuseMessageId` the line for a yes that cannot pay, `awardMessageId` the line she rises with. Each is -1 to keep the pond's own contact, refusal or award line.

## packages/randomizer/src/world/rules/priced-entries/

Every priced check and passage, read off the records that carry a price. The reference generator assumes an unbounded, farmable wallet and carries no price rows; with a wallet ladder that can start at 0 a price is a real gate, so each record's own vanilla price is AND-composed onto the reference rules. A wallet must hold the price at once. A shelf is left out on purpose: a shop slot carries a price like any other record, but the shop overlay applies it, because a seed may have rolled a different price and currency for that slot. Keeping shelves out also keeps `MAX_PRICE` meaning the dearest gate on the way to the goal: the wallet rung the fill must be able to reach. One priced target has no record: the cursed fairy's passage, which is an exit and never a location; it takes the price the reference's shop table lists for a fairy slot. The capacity fairy's own price is read where her shop is.

## packages/randomizer/src/world/rules/prices/

The wallet overlay: every priced check and passage additionally needs a wallet that can hold its price, read off the wallet ladder the profile and the collected upgrades reach. It is applied after coverage is closed and AND-composed onto whatever the reference registered, so the source's rule and always-open partition (and its pinned counts) is untouched, and a vanilla wallet (999, above every price) changes nothing. A row naming a fairy slot absent from this world (its family is vanilla) is skipped; any other unknown name is a porting error.

The pond is the one priced surface whose price is not fixed: under a non-legacy mode its plan says what each throw costs, so the plan's own price replaces the table's hundred for every prize slot. That price is the guaranteed worst case: the dearest single throw that must be paid to reach this prize, every earlier throw included. Only a prize slot this world sells is priced: a pond handing over its own pair charges nothing for it, and a ladder the world does not carry (its seam unproven) prices nothing, so those names keep the rules they have always had. Every pond slot this world holds is priced from the seed table (0 asks nothing), the same way for every slot, which keeps the tree the same for every setting.

Each shelf slot this world opened charges the price the seed rolled for it, or its own vanilla price when nothing was rolled. A restocked slot charges that price again and not a multiple of it: the rules express that the wallet can hold the price, and rupees are farmable between purchases, so a slot's third item needs the same wallet rung as its first. The tree reads the price off the seed table, so it keeps one shape for every seed; the item rule is a placement predicate and reads the price itself. The price also decides what the slot may hold: a shelf never sells the capacity its own price is counted in.

## packages/randomizer/src/world/rules/primitive-helpers.constants.ts

The primitive helpers: the questions no tree of primitive ops can ask, because each does arithmetic over raw state (a capacity ladder climbed, the magic meter times the bottles, the hearts summed). This list is exactly what another implementation of the rules has to write for itself; everything else a rule asks is a tree. A heart price must leave the player standing, so the heart capacity has to exceed it.

## packages/randomizer/src/world/rules/register/

The rule registration pass: the port of the reference's `set_rules` driver (Archipelago worlds/alttp/Rules.py 31 to 126) for the fixed baseline options. Tables apply their rows in source order (`set` replaces, `add` AND-composes); the transform-suppression rules attach last, as in the reference. Rules.py 61 to 62: `standard_rules` runs after the global and default tables and replaces the escape rows those set; the lamp pass follows it, as in the source. Afterwards coverage is made total: a name no table ruled asks nothing and is registered open, because a passage with no rule is an open passage. The wallet price overlay goes on over the closed registries, and the pond demands sit on top of it, because a rung is a ladder and the whole climb has to be payable, not only its own throw. Last come the values those seeded rules read: this world's prices and demands.

There is no always-open list. A passage with no rule on it is an open passage, which is what the connection record says by carrying no requirement, and a check with no rule is collectable by reaching it; listing those names a second time only let the list and the records disagree. What a switch turns off is not this pass's business either: a scoped location its switch excludes is not a location of the world at all. A shelf slot asks nothing beyond standing in the shop (the reference's `can_buy` is "the shop's region is reachable"); only the slots the bunny pass has not already ruled are opened, so a dark-world shelf keeps its transform condition, and the price lands on top as a wallet condition in the overlay.

## packages/randomizer/src/world/rules/rule-entry.type.ts

One row of a rule table: the port of a single python `set_rule` or `add_rule` call. Tables are applied in source order by the registration pass: `set` replaces whatever is registered (generic Rules.py `set_rule`), `add` AND-composes onto it (`add_rule`). The target is an exit's own name, a location's key, or a story event's check id. Item-placement rows mirror `forbid_item` (the named item may never be placed here), `add_item_rule` (only items passing the predicate may be placed) and `set_always_allow` (placement allowed even when unreachable).

## packages/randomizer/src/world/rules/rule-eval/

The interpreter: a rule tree compiled into the closure the engine calls. Children are compiled once, when the parent is, so asking a rule walks closures and never the tree. Every closure reads the world through the state it is asked with, which is the world the rule was registered on. A compiled rule carries its own tree as `.node`, so any rule the engine holds can be read back as data. `ruleOf` pairs a closure with the tree it computes; the closure must answer exactly what the tree says. A setting reading or a seed-table value is read off the world the rule is asked in.

## packages/randomizer/src/world/rules/rule-node-build/

Plain constructors for rule trees, so a tree written in code reads like the rule it is. They build data only; the interpreter turns a tree into something the engine can ask. `optionSwitch` is one tree per value a setting may take, tested in order, with a fallback for any other value: the tree form of a `switch` over a setting.

## packages/randomizer/src/world/rules/rule-node-walk/

Reading rule trees: a pre-order walk (parents before children, left to right), the helpers a world's rules reach, and the inlining that rewrites every derived helper into the primitive ops it stands for. Both are what an exporter needs: the walk to list what the other side must implement, the inlining to hand over trees that name only primitives. A helper with a setting-read argument is not expanded. `collectHelperNames` returns every helper the world's location and exit rules reach, expansions included, sorted.

## packages/randomizer/src/world/rules/rule-node.type.ts

A rule as data: the tree every access rule of the randomizer is written in, so it can be read, walked and exported as JSON (the Interpreter pattern: the interpreter compiles a tree into the closure the engine calls, and the closure is only a cache of the tree). The op set is kept to what the rules ask. A leaf that reads the collection answers one primitive question; anything that needs arithmetic over raw state (a capacity ladder, the magic meter, the hearts) is a named helper with arguments. A leaf that reads the world's settings is an option test against one named reading, so a setting that changes a rule changes it inside the tree.

Semantics, each the engine's own reading: `has` is at least `count` copies (default 1), and usable; `hasAny` is any one of the items held and usable; `hasDistinct` is how many of the listed items are held and usable, at least `atLeast`; `countGroup` is the raw summed count of the listed items, usability ignored, at least `atLeast`; `all` and `any` short-circuit, left to right; `if` is `cond ? then : else`; `region` is the region reachable; `location` is the location existing, its region reachable and its own rule holding; `exit` is the rule registered on that exit holding (an unruled exit holds); `placedAt` is the fill seam holding that item at that location; `option` is the named setting reading equal to the value; `seed` is the named seed-table value equal to the value; `helper` is the named helper asked with its arguments. A count may name a setting reading instead of a number, for the gates whose number is a setting. A count, a helper argument or the item of a `has` may name a seed-table value: the numbers the app settles for one profile before any fill (a shelf's price, a pond rung's demand), so a tree keeps one shape for every seed and the values travel beside it. Primitive helpers read raw state no primitive op can express; python implements exactly these. Derived helpers are a tree of primitives, kept by name so the tables stay readable.

## packages/randomizer/src/world/rules/rule-options/

The setting readings a rule tree may test, each read off the world the rule is asked in. A reading is the value in force, defaults and masks applied: an absent setting reads as the default the rules always fell back to, and the item-power switches read through their masks. So an `option` leaf answers exactly what the old closure computed at the same point, and an exporter can write every reading of a world out beside its trees. With the crystal kind, zero means the original number, seven. A retro reading only exists while retro is on; off, the tree never asks it.

## packages/randomizer/src/world/rules/seed-value-read.ts

One value of a world's seed table, as a seeded rule reads it. A tree names a value the table does not hold only when the table was never filled for that world, which is a wiring error, so it throws at once instead of answering a guess.

## packages/randomizer/src/world/rules/seed-values/

The seed table: every value a seeded rule reads, as one world settled it. The rules are registered with one shape for every seed; what a seed rolled, and what the settings made of a pond, lives here. `shopPrice:<slot>` is the price the shelf charges, the rolled one or its vanilla rupees. `pondPrice:<slot>` is the rupees a pond slot's wallet must hold: the pond plan's worst case for a prize slot it sells, the price table's own row otherwise, and 0 (no gate) for a slot neither one prices. `pondDemand:<rung>` is what that rung of the pond's ladder demands, `none` when nothing was rolled. `pondGated:<rung>` is whether the rung carries its ladder at all: a prize slot the world sells, with a demand of its own. A price spreads over the seeded-price fields (currency, amount, item, count, overLimit, content); every field is written, so the table has one shape too.

## packages/randomizer/src/world/rules/seeded-price/

A price as a seeded tree: the rule the shop price writes for one price, with the price itself read off the world's seed table. The tree branches on the currency the table holds and reads the amount, the item or the bottle content from it, so one tree stands for every price a seed may roll, and a `none` currency asks nothing, which is what a slot with no price reads as. Each branch is the literal rule the plain price tree writes for that currency, so a table holding price P answers exactly as the plain tree for P does. `seedKey` names the seed-table entries this game's seeded rules read; `priceField` names the fields one price spreads over, each under the price's own prefix. The counted currencies are each read by the helper their capacity answers to. The bottle branch asks for the vessels, then the seller of a content that is bought.

## packages/randomizer/src/world/rules/shop-prices/

Paying for a shelf is a requirement like any other. The wallet overlay already gates a rupee price by the wallet that can hold it; these rules extend the same idea to the other currencies, so a progression item behind a price the file can never pay is out of logic and the fill puts something else there. Rupees ask for a wallet rung that holds the price at once (rupees are farmable between purchases, so holding it once is the real constraint). Arrows ask for an arrow capacity that holds the price, which on the empty rung is none; bombs ask the same of the bomb bag. Hearts ask for enough heart containers to pay and still be alive, so the price plus one; a heart price is never the last heart. Item: the named item, in hand; it is shown and handed back, so there is no capacity to read and no stock to refill.

A bottle asks for as many bottles as the demand counts, to carry the content in, and, for a potion, the hut that sells it. A pond rung may ask for several at once and they are handed over together, so one bottle does not pay a demand of four. A price with no count of its own asks for one bottle. Paying hands the content over, and a restocked shelf asks for it again, so a repeated price needs a repeatable source: a fairy and a bee are caught in the world, but a potion is bought from one hut, and a file that cannot reach it can pay such a price at most once. The scope rule has already made sure the content is still on sale; this is the second half, that the seller can be got to. The wallet reading stays a single cauldron price however many bottles are asked for, because they are filled one at a time and rupees are farmable between refills. Reaching the seller is the same reading the meter rules make of that region, so the two agree by construction.

What the bottle count can see is the bottle count the magic-meter rule already reads, held to the four the game has slots for. There is no bottle capacity family and no upgrade ladder, so the bottles themselves are the capacity, and four is why the demand stops end there. What it cannot see is whether a bottle is full: nothing in the state tracks contents, so it reads vessels, and the content half of the rule says the player can fill them. A demand of one reads as it always has: holding a usable bottle already means the count is at least one.

For an item price, holding the named item is the whole rule. Every other currency is spent, so its rule asks what the player can hold and still afford again; this one is shown and handed back. The name is fixed before the world is built, because a price is rolled at generation time and recorded on the placement, so by the time the rules are registered the item is just another name in a requirement, and the solver reads it as one: it fills the named item somewhere reachable first, routes around this slot, or rerolls. Whether the player owned the item when the price was rolled has never been the question, because going and getting it is the point.

## packages/randomizer/src/world/rules/story-gate-rules/

The rules the story gates decide, read from the world's own settings at evaluation time. Each gate's default is the story as the game tells it, so a world that carries no setting answers exactly as the hardcoded rows did. The gate says what a moment asks for; what the moment then opens is the event's own business. Every gate is a tree over the setting readings: a `switch` over the gate's value, the count gates reading their number straight off the setting. The dark world's seven dungeons are counted by the crystal each hands over; every light world dungeon cleared is what the three pendants stand for. A count gate in Dark World dungeons counts the crystals held one by one; the crystal kind counts them raw, zero meaning the original seven. The barrier rule is what the castle barrier falls to beyond the routes that always pass it. The bomb shop rule is whether the Bomb Shop has put the Big Bomb on sale.

## packages/randomizer/src/world/rules/tables/bosses/

Boss defeat rules, ported from Archipelago worlds/alttp/Bosses.py (each `*DefeatRule`, lines 36 to 157), specialized to the baseline: swordless off (the swordless branches drop), glitches `no_glitches` (the final fight's silverless branch drops). Boss placement is vanilla (boss shuffle off), so the per-dungeon lookup reads the boss off the dungeon record (`DungeonRecord.bossActorId`) and finds the rule by that actor (Rules.py 149 to 151), plus the fixed final-tower sub-boss trio (Dungeons.py 169 to 171). Source lines per boss: armos 36 to 46, lanmolas 49 to 56, moldorm 59 to 60, helmasaur 63 to 66, arrghus 69 to 80, mothula 83 to 92, blind 95 to 96, kholdstare 99 to 118 (only the sworded branches remain), vitreous 121 to 124, trinexx 127 to 132, agahnim 135 to 136 (both tower fights share it). The three-headed boss of the mountain dungeon is three actors and one fight, so all three heads resolve to one rule; the two tower fights are one actor and resolve to one rule the same way.

The last fight takes a hammer while that switch is on, which is the reference's own swordless branch. Ganon's rule is Bosses.py 139 to 156, the strict silvers path with the swordless branch. The reference asks for arrows and stops; the last phase takes the final fight's silver shots back to back, so the arrow capacity has to hold that many at once, and under retro the wallet has to.

## packages/randomizer/src/world/rules/tables/bunny-lists/

The locations the transformed state can still pick up, from Archipelago worlds/alttp/Rules.py `set_bunny_rules` 1668 to 1673, as check ids. Two of them are story events of the world (the purple chest found, the smiths reunited), which the source keeps as event locations, so the same exemption covers them. The regions that list named (1663 to 1666, and the one shop handled apart at 1769 to 1771) are gone from here: being impassable while transformed is a fact about the place, so it is a `bunnyImpassable` flag on the region record. In order: the mentor's at the start (`check-017`), the elder's gift (`check-033`), the bedridden child's (`check-041`), the hidden clearing (`check-043`), the felled tree (`check-044`), the tiled cave (`check-047`), the cauldron room's own chest (`check-056`), the cave under the lookout (`check-061`), the standing item on the pyramid (`check-076`), the generous one deep in the cave (`check-088`), the cave under the pegs (`check-271`), the ledge past the bumper cave (`check-272`), the ruined smiths' chest found (`check-337`), the standing item on the lookout (`check-071`), the southern tablet (`check-080`), the northern tablet (`check-070`), the purple chest delivered (`check-010`), the smith's reward (`check-039`), the smiths reunited (`check-336`), the pedestal (`check-072`), the bottle seller (`check-007`), the item under the water (`check-009`), and the desert ledge (`check-059`).

## packages/randomizer/src/world/rules/tables/completion/

Goal wiring for the boss-defeat baseline, from Archipelago worlds/alttp/Rules.py: the final fight's rule (611 `GanonDefeatRule`, then 95 to 97 the second tower fight and 616 to 617 the seven-crystal requirement add on; the goal is the ledger's "Ganon beaten" event), the drop into the fight (618), the pyramid opening (734, where `open_pyramid` resolves `goal` to closed for this goal, leaving only the second tower fight), and the bomb-delivery fairy (1354 plus 1397 to 1401: the delivery shop sits at its vanilla entrance, one of the southern second-world doors). The drop asks for a blow the last fight will feel, so the hammer stands in for the beam blade on the same switch the fight itself reads. The fairy's wall is already blown open, or the shop has put the bomb on sale to blow it. Crossing the peg bridge (hammer and pearl) is Rules.py 1357 to 1358.

## packages/randomizer/src/world/rules/tables/default-overworld/

Overworld rows of Archipelago worlds/alttp/Rules.py `default_rules` (lines 623 to 734, non-inverted) merged with the `no_glitches_rules` overworld rows (lines 910 to 919) that set the same names afterwards, so only the surviving final rule is kept. Dungeon-entrance rows live in the per-dungeon tables; the goal and pyramid rows in the completion table. The first-world part runs 627 to 672, the second-world part 674 to 731, then 685 (the southern tablet), `forbid_bomb_jump_requirements` 960, and `no_glitches_rules` 911 to 916 (the rows not overriding a default row). Overrides: 669 (a nonexistent-item rule) is overridden by 919 under no glitches; 684 is overridden by 914 (no glitches drops the mirror escape); 689 is overridden by 915.

The bird comes to an active flute: the plain flute woken at the weathervane, or the Activated Flute, an item a check gives already awake. The tomb wall was dashed open once and stays open, so the act carries the boots. Three pegs hammered in behind a heavy rock open the warp tile for good. The peg field was flattened once, so the act carries the hammer.

## packages/randomizer/src/world/rules/tables/dungeon-castle-tower/

The castle tower, from Archipelago worlds/alttp/Rules.py: the barrier entrance (`default_rules` 662), the tower climb (`global_rules` 314 to 326) and the first tower fight's defeat rule (`dungeon_boss_rules` 176 to 197). Lamp requirements come from the lamp table. The barrier falls to the cape, a beam sword, or the win, and, on the switch the swordless branch arms, to the hammer; cutting it is an act the game writes down and the cape is not, because one slips past a barrier that is still standing. The seal takes a hammer while that switch is on. On 314 to 315, Rules.py `swordless_rules` adds that with no blade anywhere in the seed the entrance asks only what the fight itself asks, which the hammer and the net already satisfy.

## packages/randomizer/src/world/rules/tables/dungeon-dark-palace/

The eastern second-world palace, from Archipelago worlds/alttp/Rules.py: the toll entrance (`default_rules` 681), `global_rules` 517 to 541 (enemy shuffle off, so the bonk wall needs arrows, 519 to 520; pot shuffle off, so 527 to 529 are skipped) and the boss defeat rule. Lamp rows come from the lamp table; the two small-key self-allowances live in the item-rules table. The gatekeeper wants the real traveler, and the door is opened once, by the porter who was hired for it; no inventory says whether he was, so a world with no record to read keeps the old answer. Rows 519 to 521, 522 to 524, 525 to 526, 531 to 532, 536 to 537, 541.

## packages/randomizer/src/world/rules/tables/dungeon-desert-palace/

The desert palace, from Archipelago worlds/alttp/Rules.py: the book entrance and outer rocks (`default_rules` 640, 659 to 660) and the interior (`global_rules` 360 to 372). The stairs are open because the prayer was said, and the book is what says it, so the act carries the book and the stairs ask for the act. Rows 360 to 361, 363 to 366, then 367 to 368 (full keys, big key, a fire source and the boss fight). The prize guard (370 to 372) says the prize must not lock the keys needed to reach it. It is guarded by `not (small_key_shuffle and big_key_shuffle)`: a Choice is falsy only at value 0, so the guard drops only once both key families have left their own dungeon, at which point neither key can be locked behind the prize; otherwise the outer palace must be reachable.

## packages/randomizer/src/world/rules/tables/dungeon-east-palace/

The eastern palace, from Archipelago worlds/alttp/Rules.py `global_rules` 327 to 358 (enemy shuffle off, so the boss needs arrows, 348 to 350; enemy health default, so the pot-kill block 352 to 358 is skipped). Lamp requirements come from the lamp table; the big-key self-allowance lives in the item-rules table. Rows: 329 to 333, 334 to 335, 336 to 337, and boss access 340 to 350 (big key, both keys, the boss fight, and arrows).

## packages/randomizer/src/world/rules/tables/dungeon-final-tower/

The final tower, from Archipelago worlds/alttp/Rules.py: the crystal gate (122, since the earlier lock at 114 to 118 is immediately re-set and dead; the doors were opened once and stayed open, so the act carries the crystal count), `global_rules` 543 to 609 (enemy shuffle off, so the big-key door needs arrows, 597 to 599; the double-switch row at 552 is re-set by 564 and only the key count survives), the glitch-room hookshot requirement (`forbid_bomb_jump_requirements` 956 to 959) and `no_glitches_rules` 918 (the hookshot for the double-switch room). The chest groups are 544 to 546. Rows: 548 to 551, 555 to 556, 566 to 567, 570 to 571, 572 to 574, 577 to 578, 579 to 580, 582 to 584, 586, 588 to 593 (the bottom fight guards the big-key room), 597 to 599, 600 to 601 (the middle fight guards the torch climb), 602 to 606, 607 to 608 (the top fight guards the gap), 609 (the second tower fight), 957 to 959.

## packages/randomizer/src/world/rules/tables/dungeon-first-castle/

The first castle and its sewers: the mode-independent rows from Archipelago worlds/alttp/Rules.py `global_rules` 304 to 312 (the 309 universal-key clause is off in the baseline). The 304 to 305 guard-drop kill rule is later replaced by the standard-mode table, as `standard_rules` re-sets it after `global_rules` in the source. 307 to 311 are the sewer doors; 312 the secret room.

## packages/randomizer/src/world/rules/tables/dungeon-ice/

The lake-island dungeon, from Archipelago worlds/alttp/Rules.py `global_rules` 437 to 461 (swordless off; `can_take_damage` true collapses the spike-crossing clause of the east door, 459 to 460) plus the boss defeat rule. Rows 437 to 439, 441 to 443, 453 to 460 (the big key in the far side lowers the key need to four; the damage-tank alternative is always available in the baseline), 461.

## packages/randomizer/src/world/rules/tables/dungeon-mire/

The swamp-of-despair dungeon, from Archipelago worlds/alttp/Rules.py: the medallion entrance (`default_rules` 716; the medallion opened it once and the seal stays down, so the act carries the casting), `global_rules` 463 to 488 (`can_take_damage` true keeps the hearts alternative live) and the boss defeat rule. The Vitreous-room lamp comes from the lamp table. Rows 463, 464 to 468, 470 to 476, 478 to 482 (a key placed west is safe only when the big key locks it), 483 to 485, 486 to 488.

## packages/randomizer/src/world/rules/tables/dungeon-mountain-tower/

The mountaintop tower, from Archipelago worlds/alttp/Rules.py `global_rules` 374 to 388 (enemy shuffle off, so the big-key door needs a real weapon, 380 to 384) plus the boss defeat rule from `dungeon_boss_rules`. The small-key self-allowance lives in the item-rules table. Rows 374 to 375, 376, 377 then 380 to 384, 385 to 386.

## packages/randomizer/src/world/rules/tables/dungeon-swamp/

The swamp palace, from Archipelago worlds/alttp/Rules.py `global_rules` 390 to 410 (pot shuffle off, so 396 to 398 and 408 to 410 are skipped) plus the moat mirror requirement (109 to 110: the swamp was not moved, entrance shuffle is vanilla) and the boss defeat rule. The big-key forbid and self-allowance live in the item-rules table. Row 390, then 109 to 110 adds the mirror; 391 to 395; 399 to 403; the boss rule, then 406 to 407 add the full key count.

## packages/randomizer/src/world/rules/tables/dungeon-thieves-den/

The outcast-village hideout, from Archipelago worlds/alttp/Rules.py: the pull entrance (`default_rules` 693), `global_rules` 412 to 423 (vanilla boss, so the fight door needs keys and bombs, 413 to 414) and the boss defeat rule. The big-chest self-allowance (key-drop off only) lives in the item-rules table. The way in is a door somebody already pulled open with the gloves, and the act's own record carries that; nothing in an inventory says whether it was pulled, so a world with no record keeps the old answer. 415 to 416 follow the reference's operator precedence: three keys, or self-placed and two keys, and the hammer. Rows 417 to 418 and 421 to 423 follow.

## packages/randomizer/src/world/rules/tables/dungeon-turtle/

The mountain shell dungeon, from Archipelago worlds/alttp/Rules.py: the medallion entrance (`default_rules` 732; the medallion opened it once and the seal stays down, so the act carries the casting), `global_rules` 490 to 515 (`fix_trock_doors` is false for vanilla entrances and open mode, so the bomb-wall rows 511 to 515 apply) and `set_trock_key_rules` 1136 to 1234. Under vanilla wiring the locked-door probe resolves to: front reachable, middle, big chest and back unreachable, so the not-`can_reach_back` branch applies (1183 to 1208), no forbids fire (1211 needs an unreachable front), and the self-allowance (1232 to 1234) lives in the item-rules table. Dark-room lamp rows come from the lamp table. The front-locked chests are 1153. Rows: 490 to 491, 492 to 496, 497 to 499 (the big-key door rule is re-set identically at 1167), 500 to 501, 502 to 503, 504 to 507 (the laser bridge), 508, 509 plus 512, 513 to 515, 1170 to 1171, 1183 to 1196, and 1198 to 1208, where the keys needed depend on what sits in the chest itself.

## packages/randomizer/src/world/rules/tables/dungeon-woods/

The forest dungeon, from Archipelago worlds/alttp/Rules.py: the entrance rows (`default_rules` 694 to 695, where drops under bushes stay bunny-proof, and 715, where the thorns burned away once and stay burned, so the act carries the fire), `global_rules` 425 to 435 (all first-section doors cost the full key count, 426 to 429), the glitch-jump lockout (`forbid_bomb_jump_requirements` 961) and the boss defeat rule; 434 to 435 add the full key count after it. The big-chest self-allowance lives in the item-rules table. At 433 the hanging cloth door needs a blade to cut, unless the switch that lets it be pulled down is on, which is the reference's own swordless branch.

## packages/randomizer/src/world/rules/tables/global-misc/

Non-dungeon rows of Archipelago worlds/alttp/Rules.py `global_rules` (lines 200 to 303, and 620), baseline options: enemy shuffle off, enemy health default, pot shuffle off, `can_take_damage` true. Constant sub-terms the fixed options force true are collapsed. By source line: 216 to 221 the mountain save-and-quit spot opens once its cave dweller is reachable; 223 to 226 the water item, the purple chest found and delivered; 227 to 228 the tablet and the pedestal; 230 to 234 the smiths reunited (the ledger's event), the smith's reward, the powder, the bottle seller and the boots spot; 239 to 244 the bombs branch stays (enemy shuffle off, enemy health default); 246 the elder; 248 to 252 bomb walls; 253 to 255 bomb-or-bonk; 256 to 270 the mini moldorm cave chests; 271 to 272 bomb walls; 273 to 277 the kill room chests; 278 to 281 bomb walls; 282 to 285 the mountain shop and the two brothers house; 287 to 293 the spike cave (`can_take_damage` is true in the baseline, no OHKO timer); 295 to 302 the hookshot cave; 620 the weathervane. Any bottle at all counts, raw: an empty one is still somewhere to put the prize.

## packages/randomizer/src/world/rules/tables/item-rules/

Item-placement constraints of the baseline path, from the source Rules.py: the prize-slot restriction (204 to 211: prize slots only carry prize items; the goal lock at 203 has no row, because the final fight is a story event, never a location an item could sit at), the swamp big-key forbid (404 to 405), and every `set_always_allow` and `allow_self_locking_items` row the source installs. The reference's `allow_self_locking_items` is modelled as the always-allow predicate it installs. The swamp forbid is guarded by `not small_key_shuffle`, and a Choice is falsy only at value 0, so it exists exactly while the small keys stay pinned to their own dungeon (the glitch half of the guard is fixed at `no_glitches`).

Always-allow rows: 327 to 328 (`check-119`), 387 to 388 (`check-137`), 401 to 402 (`check-159`, self-locking), 431 to 432 (`check-186`, self-locking), 533 to 534 (`check-145`), 538 to 539 (`check-154`), 1232 to 1234 (`check-224`), and the forest-den allowance 419 to 420 (`check-178`), which exists only with the key-drop option off. The palace of darkness rows ask for five keys held. `FULL_ACCESS_ALWAYS_ALLOW` is what the reference keeps when accessibility is full: only the unconditional 327 to 328 row survives, since every other row is guarded by `accessibility != 'full'` (387, 401, 419, 431, 533, 538, 1232). The fill-facing world builder prunes the registry to this set when that is the contract in force.

## packages/randomizer/src/world/rules/tables/lamps/

The dark spots of the world: every exit and location the reference gates on light, ported from Archipelago worlds/alttp/Rules.py `add_conditional_lamps` (lines 989 to 1037, non-inverted spots) under the baseline: neither light cone is set, so every conditional spot is listed. Exits by source line: Vitreous 1003, the two dark rooms of Turtle Rock 1004 and 1005, the dark palace big key door 1006 and maze door 1007, Agahnim 1 at 1013, the old man cave and return cave exits 1023 to 1025, the old man house 1026 to 1027. Locations: `check-149` 1008, `check-150` 1010, `check-113` to `check-115` 1014 to 1016, `check-060` 1022, `check-123` and `check-124` 1028 to 1029, `check-119` 1030, `check-121` and `check-122` 1031 to 1032.

What each spot asks is not written here. The reference resolves it against one three-way option (`add_lamp_requirement`, lines 158 to 169); this app asks the same question through two settings the player owns, and every row carries the one predicate that reads them, so a spot can never be left behind on a hardcoded item check.

The three unlit spots of the opening escape (1034 to 1037: both ways into the stretch, `Sewers Back Door` and `Throne Room`, and the check standing in it) are listed too, where the source skips them in the mode this app always plays. That is the one deliberate divergence, and it goes the strict way: they are the rooms a player is most often left feeling through, so they answer to the same switch as every other dark spot. With the requirement on, a light is guaranteed before them, since the fill has only the handful of rooms ahead of the escape to place one in. With it off they open as the original does. The two remaining names inside the unlit stretch are covered by these three: both ways in are gated, so nothing beyond them is reachable without a light. The escape spots have one seam: a placement the reference generated was rolled with them ungated, so the parity harness that replays one says so through the world option. No app path sets it.

## packages/randomizer/src/world/rules/tables/region-graph.constants.ts

The reachability graph: every passage between two regions, in one table. The reference states this twice, as the exits each region owns and as the wiring that names each exit's target, across seven files. One row states it once: where the passage starts, where it ends, and the name the rule tables key its requirement by. The four parts are its four taxonomies (first world, second world, caves and houses, dungeon interiors), in their own order, because the graph's order is the order the sweep and the fill walk it in.

A row is logic, not a place. The exit name is the key the rule tables hang their requirement off. `connectionId` is the one place a row touches the map, naming the crossing the records draw for that passage where exactly one of them joins the same pair of regions; 187 of the 392 rows carry none, which is honest, because a mirror spot, a retry from the menu and a wing boundary inside one room cross no tile, and a pair joined by two doors cannot say which of them the passage is. The rows are folded from Archipelago worlds/alttp/Regions.py (`create_regions`, the exits of each region) and EntranceShuffle.py (`mandatory_connections`, `default_connections`, `default_dungeon_connections`), open mode with entrance shuffle off.

## packages/randomizer/src/world/rules/tables/standard/

Standard-mode rules, ported from Archipelago worlds/alttp/Rules.py `standard_rules` (lines 1090 to 1121) for the fixed baseline: small keys stay in their own dungeon, never universal, so the 1099 to 1116 branch applies; enemy health is default, so the guarded chest's kill clause collapses to true (1110 to 1115). The escape gating: the throne door opens only once the cell chest is collectable (1093); the two upper castle exits (1094 to 1095), the church spawn and the home's front door open only once the church is reachable through the escape (1096 to 1097). Every escape kill check uses the start-arsenal helper (StateHelpers.py `can_kill_standard_start`). The start connection itself (`Uncle S&Q`, 1091 to 1092) is a row of the first-world graph and carries no rule. Rows 1100 to 1109 and 1117 to 1119 are the castle chests; 1106 to 1107 replaces the `global_rules` 304 to 305 most-things kill. The reference gates the home spawn itself, which puts the home chest after the escape. The game opens in that house with the chest in reach before anything else, so the gate sits on its front door: the chest is sphere 0 and the fields still wait for the church.

## packages/randomizer/src/world/rules/world-rules-view/

A built world's rules as plain data: every location's tree, every passage's tree with its two ends, every story event's tree with the region it happens in, and the setting readings the trees test. Nothing here is compiled; it is the view an exporter serializes. A name no table ruled is registered open, so every location, event and exit of a registered world has a tree; one missing here reads as `true`, the same as the engine reads it.

## packages/randomizer/src/world/scope-option-keys/

The two scope switches of the option catalog, and the one reading of each off a snapshot's values. Every consumer that asks whether a scope is shuffled asks it here.

## packages/randomizer/src/world/scope-tables/

The scope tables, read off the records and keyed by check id. Which app-scope switch a location answers to is on its own check record (`scope`), so a new check declares its scope where it is written. What it holds comes from the record too, translated into the baseline pool's terms where the two vocabularies differ. With its switch off, a scoped location is pre-placed locked with the item named here and left out of the fill, the mechanism the key-drop option has always used. Row order: the two scope tables are in name order, which is the order the fill subtracts their items from the pool and locks them onto their locations; the key drops are in record order, their dungeons' order and then each dungeon's own. The prize slots are every check of kind `prize`, which is not a scope. `include_npc_checks` covers scripted givers, boss heart containers and the fairy waters; `include_world_items` covers standing in-world items, the tablets, the pedestal and the dig prizes; `key_drop_shuffle` covers the spots that exist only with that option, each holding its own key. The capacity water's pair exists only while its family is not vanilla.

## packages/randomizer/src/world/seed-locations.ts

Which rows of the dataset a seed fills, read off the record and nothing else. A row scoped `fixed` is never one: it is a real pickup the seed leaves alone, so no switch reaches it. A shop slot is never one here: a shelf opens through the shop scope, which decides how many slots a shop sells and how deep each restocks, so the world builder adds those rows from the shop surface. An event is never one: it is a thing that happened, which the tracker reads from the ledger; the few the rules ask about are found by the sweep where they happen, and none holds a reward. An NPC row is one only under a scope: a scripted giver carries `scope: 'npc'`, while a scope-less npc row reads a rung of a counter ladder (the fairy's bomb and arrow counts) and stands for no spot. Everything else is one: a chest, a key drop, a boss, a prize, a standing item, a dig spot, a pond slot. The rule replaces four transcribed lists of location names, one per half of the map; its set is pinned in `apps/desktop/tests/randomizer/world-from-records`.

## packages/randomizer/src/world/shops/shop-list-name.ts

The name a shop is listed under inside its own world's section. A world-titled heading already says which half of the overworld it covers, so the listed name drops those words. That is a presentation rule, not a fact about the shop, so it is derived here and not stored. The words are taken out anywhere in the name, because one shop wears its half inside a parenthesis; the parenthesised area that tells two same-named shops apart survives. One shop needs an exception: stripping the world words off the dark-world potion shop and the potion seller's hut leaves both reading "Potion Shop", so the hut is listed under its own name.

## packages/randomizer/src/world/shops/shop-location-keys.ts

The name every canonical slot's locations are keyed under, by canonical index. The shop slug is the shop's real name in lowercase, words joined by "-", parentheses dropped ("Cave Shop (Lake Hylia)" is `cave-shop-lake-hylia`). The shelf side is the side of the counter the slot stands on, as its check record places it; a shop that sells from one spot (the bomb counter) has no neighbour, so it takes `center`. A location key is `<shop>-shelf_<side>-slot_<n>` (`packages/randomizer/src/world/location-key`), where slot 1 is the shelf's first stock and slot n its n-th purchase. The table is append-only with the canonical order, and a key handed out never changes: the Archipelago id tables and every stored placement name slots by it. The table is written by hand so a key is plain to read and never moves with a record edit, but it is held to the rule that wrote it: a row whose slug or side disagrees with the record fails at load.

## packages/randomizer/src/world/shops/shop-price-ceilings.ts

The most a price may ask for in each counted currency: what the profile can ever hold, because a price above that could never be paid, and under full accessibility an unpayable shelf makes the seed ungeneratable. Rupees, arrows and bombs read the top rung their family's ladder reaches under the capacity profile, so a vanilla wallet caps a rupee price at 999 however wide the range, and a custom wallet that stops lower caps it lower. Hearts read the seed's heart ceiling (`difficulty/`) less the one heart a payment must leave standing: with the ceiling at its floor of three, a shelf may ask for two at most. The panel and the roll both read these, so the range shown and the range drawn from never disagree.

## packages/randomizer/src/world/shops/shop-price-currency-rule/

The rule taking a counted currency off the price list when the seed has nothing of it to pay with. Retro bow takes arrows out of the world: no arrow pickup is in the pool, every arrow prize is rupees, and the bow is fed rupees per shot. A shelf priced in arrows under retro would send the player farming drops for a currency the seed has erased. So retro on means arrows cannot be a price, and retro off gives the arrows row back. It is a mask, like the potion rule: the player's tick stays in the choices. The panel greys the row and says why; the plan refuses the currency from the snapshot alone, so a snapshot the app did not write cannot roll an arrow price under retro either.

## packages/randomizer/src/world/shops/shop-price-native/

A price in the terms the running game understands: a currency tag and one number. Counted currencies pass their amount through, hearts in whole hearts (the core multiplies by the eight units a heart is worth). A bottle price passes the byte the game stores in a bottle slot (2 is an empty bottle), so the core compares against the player's own bottles with no table of its own. The currency tags are shared with `core/game-hooks/shop_overrides.c`. An item price has no native form: it is shown and handed back, so nothing is deducted and no counter is compared, and the caller drops the override. `priceLabelOf` is human wording for the spoiler and the plan log; the item label is the only one naming a thing, because that price is shown and kept.

## packages/randomizer/src/world/shops/shop-price-options/

The shop-price rows of the option catalog: synthetic, unlocked, group `shops`. One opt-in per currency plus the two ends of the range a roll is drawn from, and the bottle set as an opt-in plus one row per content it may demand. The panel renders each currency as one row (a checkbox and a two-thumb range), the way the capacity families render their value rows, so these keys stay out of the plain option list. Every currency and the bottle set are ticked for a fresh profile (`ROLLED_BY_DEFAULT`), over the full range each offers; a snapshot with none of the rows still reads as nothing rolled, so every shelf it froze charges the unmodified price. The reference's own price percentage (`shop_price_modifier`) rides in the same block but is a real source option and keeps its place in the catalog's dataclass order, so only its key and bounds are named here; 100 means the ranges exactly as set.

## packages/randomizer/src/world/shops/shop-price-plan/

Snapshot to price model, and the seeded roll that turns it into one price per opened shelf. A roll is clamped to what the profile can ever pay: both ends of a range are brought down to the ceiling, the minimum included, so a range whose floor stands above what the profile holds rolls the ceiling itself and does not drop the currency the player ticked. With no currency ticked nothing is rolled and the caller keeps the shelf's vanilla price, so the baseline snapshot is the unmodified game.

The reference's percentage is folded into each range, not onto the rolled amount. Scaling the ends and scaling every price they can produce give the same set of prices, and doing it once keeps a single place where a price can be made dearer: the clamp still has the last word, so a percentage turned all the way up piles prices against what the profile can pay, and the access rules see the scaled number with nothing to re-derive. The percentage is held inside the source's own bounds, so a snapshot cannot widen them. Scaled ends are floored: half a rupee is not a price.

Two refusals are made from the snapshot alone: a bottle content whose cauldron the same snapshot handed to the shuffle (`potion-price/`), and arrows while retro bow is on. The panel already switches those rows off, so they matter only for a snapshot the app did not write. A heart price never asks for the last heart. Every enabled currency is equally likely, and a bottle price counts as one more option. The item currency is never drawn: the plan carries no item row and `CURRENCY_ROWS` is typed to the counted four, so adding one would be a compile error.

## packages/randomizer/src/world/shops/shop-price.type.ts

What a shelf charges. A price is rolled once, at generation, from the seed's own rng and recorded on the placement, so the spoiler, the access rules and the running game read the same number; a price is part of the seed and never re-derived. Four counted currencies carry an amount (rupees, arrows, bombs, or whole hearts). A bottle price carries a content, and a count only where the asking room counts bottles (the ponds do, the shelves do not; an absent amount is one bottle). An item price is paid by showing: it names one pool item, the player must hold it, and it goes straight back into the pack, so it carries no amount and takes nothing. With every currency off, prices stay as the unmodified game charges them and nothing is rolled. Bottle prices carry no range, only which contents a shelf may demand. `heartCeiling` is the seed's heart ceiling less the one heart a payment must leave standing; the other three ceilings come from the capacity profile at roll time, but this one is a snapshot row, so the plan carries it. `CurrencyRow.defaultMin` and `defaultMax` are where the range opens for a newly ticked currency.

## packages/randomizer/src/world/shops/shop-scope-from-values/

Catalog values to the shop scope and back: one reading shared by the generator, the pool accounting and the creation panel, so the control, the In Pool column and the seed never disagree. A missing tick row reads as its baseline, not as off. The scope's seed is the placement's own seed; only the random mode reads it, and it is stored on the scope so the session rebuilds the identical opened set. `NO_SHOP_SCOPE` opens nothing. A brand-new profile starts on every default tick, shuffled as exactly that set, two deep. `TOTAL_SHOP_SLOTS` is the ceiling any control may offer.

## packages/randomizer/src/world/shops/shop-scope.type.ts

What a profile asks of the shops. The scope is self-contained on purpose: it is frozen onto the placement and read back at session time, and both readings must name the same slots without consulting anything else, so the seed the random mode draws from rides inside it. Modes: `vanilla` shuffles nothing; `sequential` opens the first `slotCount` ticked slots in canonical order; `random` draws `slotCount` ticked slots from `seed`; `custom` opens exactly the ticked slots and ignores the count. `enabled` is the canonical indices the player ticked, ascending: the set every mode draws from, so a mode can never promise a slot that does not exist. `depth` is the purchases each opened slot carries, 1 to 5.

Scope to the canonical slots it opens. Two rules do all the work: the ticked set is the only thing a mode may draw from, so no mode opens a slot the player switched off; and the count is clamped to the size of that set, so the slider can never promise more slots than exist. Everything downstream (the locations, the pool accounting, the slider's own maximum) reads those rules from here. The random mode draws from the scope's own seed (`<seed>:shop-slots`), so the same profile always opens the same shelves; the placement is re-read at session time and must name exactly the slots it was generated with. The opened indices come back ascending even for the random mode: which slots it drew is random, the order they are named and armed in is not, so a spoiler reads the same way every time. `normalizeEnabled` gives the canonical spelling of a ticked set: deduplicated, in range, ascending.

## packages/randomizer/src/world/shops/shop-self-lock.ts

A slot never sells the thing its own price is counted in. A price is gated on the ceiling the file can hold (`packages/randomizer/src/world/rules/shop-prices`), so a slot charging five bombs asks for a bomb bag first. Put that family's own upgrade on that slot and the shelf sells the capacity its price is measured in. The fill takes it, because the assumed state owns every copy still unplaced, and only the post-fill sweep can tell whether another copy was reachable first: when none was, the seed is rerolled, and when the answer is yes by a thread the player reads a spoiler telling them to buy a bomb bag with bombs. Two playtest seeds died on this shape (issue #219), so it is refused at placement. A bottle price reads the same way: the vessel demanded may not be the vessel sold. Hearts have no upgrade item in the pool, so a heart price locks nothing out. An item price is the plainest case: the slot may not hold the item it names.

## packages/randomizer/src/world/shops/shop-slot-facts/

The shop surface, read off the shop-slot check records. Every fact about a purchasable spot lives on its own record: the shelf price, the sprite subtype the seam matches on, the room and door that tell two shops sharing a shelf apart, what the unmodified shop sells there, and the canonical index that is both the id of its sold counter and the order the sequential mode opens slots in. This module shapes those records into the flat row the engine reads, and derives two things a record need not repeat: the shop's own name (the slot's name with its shelf position taken off the end) and the half of the overworld it stands in (the world of the screen it is filed under).

Canonical order is append-only: `shop.slot` is the order, not the order records load in, so a placement stored before a shop was added still names the same slots and reads the same counters. Eleven buildings, five rooms, one discriminator: nine shops sell from a shelf, and a building is only a door; the interior is an indoor room, and one room is reused by several doors. So a shop is keyed by room, entrance and overworld area, and a slot inside it by the sprite's subtype. The other two sell from their own sprites (the cauldrons and the bomb counter) and have seams of their own. All of that is on each record's `gameId.shopSeam`. `SHOP_IDS` lists every shop in the canonical order of its first slot; `SHOP_WORLD_LABELS` is what a list headed by world calls each half.

## packages/randomizer/src/world/shops/shop-slot-options/

The shop-scope rows of the option catalog: the shuffle mode, one tick per canonical slot, and the two counted rows the mode reads (how many slots, how deep each stocks). Synthetic, unlocked, group `shops`. The tick rows are generated from the shop-slot records, so a shop added there brings its own controls. A fresh profile shuffles exactly the ticked slots, two purchases deep; a snapshot with neither row still reads as it always did (the mode as Sequential, the depth as one). A slot's catalog key is built from the shop's name and shelf position, not its canonical index, so a stored snapshot says in plain text which shelf it ticked. A shelf with no recorded stock reads as "nothing recorded" and not blank. The potion seller's hut starts unticked: it is fully supported, but a cauldron holding a shuffled item is a bigger surprise than a shelf doing so, so it is opt-in; that is a default, not a fact about the shop. The panel renders all of these as one block (`ShopSlotsBlock`), so they stay out of the plain list.

## packages/randomizer/src/world/shops/shop-slot.type.ts

`ShopSlotFacts` is one purchasable spot, everything the engine asks of it in one flat row. `shopName` is what a location name reads before its shelf position. `region` is the region its own check record names. `vanillaItem` is what the unmodified shop sells there; `price` is what it charges (the price a purchase keeps costing). `entrance` is the door's vanilla entrance value, or null when the room alone names the shop; `owArea` is the overworld area the door opens from, or null when no overworld door reaches it. `canonicalIndex` is the slot's 0-based index across every shop: its stable id and its sold counter. A `ShopSlotLocation.depthIndex` is the 0-based purchase order within the slot (0 is the first sale). A `ShopSlotRow.defaultOn` is the baseline of the row's toggle, what an absent value reads as.

## packages/randomizer/src/world/shops/shop-slots/

Shop slots as randomizer locations. A slot opens as a location only when the profile asks for it; which slots open is the scope's business. A scope that opens nothing leaves the world as it is. The depth option multiplies each opened slot: at depth N the slot restocks N times and carries N locations bought in a fixed order. Only the first is a spot the unmodified game has, so only the first maps back to a check record. A slot can carry at most five purchases, the first plus four restocks. `ALL_SHOP_SLOT_LOCATIONS` is every key a slot could ever take, at any depth: the membership set.

## packages/randomizer/src/world/small-keys/

Every small key the dungeons own, handed over as a full ring. The tracker's "Small Keys" switch is answered the way the Big Keys one is: by putting the keys in the state's hands. A rule counts keys found, and a player standing past a locked door has already spent some, so the count can say a room is out of reach while the player is in it. With the switch off every key door reads as open. `MOST_KEYS_ASKED` is the most small keys any rule asks for: the upper floors of Ganon's Tower ask for eight.

## packages/randomizer/src/world/state-helpers-capacity/

Capacity-aware readings of the collection state, over the family ladders: the file's starting rung plus every collected item's jump, clamped to the top of the ladder (rung 0 is the empty tier: no capacity, no magic). A vanilla family keeps the reference's fixed-option arithmetic (StateHelpers.py `can_use_bombs` and `can_hold_arrows` with the capacity shuffle off): the vanilla rung, plus the whole grid once the capacity fairy's shop is in reach and paid for. A family in the pool counts its items instead and gets no shop bonus, the reference's own on-mode divergence. A progressive item is one step of the family's plan: k copies collected reach the plan's cumulative rung k, whatever the fill order, with the jumps from the same plan the pool used and cached per setting object, because the rules ask on every evaluation and the plan never changes. The wallet holds the vanilla 999 or the ladder rung reached. The meter's uses multiplier is how many uses one full meter affords relative to full cost: 1, 2 and 4 for the three native levels, 0 on the empty rung (no magic at all), the reference item names outside Custom. The wallet reading and the meter's empty-rung test feed the price overlay and the item usability gate; the reference has neither. `walletRungFor` gives the first wallet rung that holds a price at once.

## packages/randomizer/src/world/state-helpers-world/

World and combat helpers ported from Archipelago worlds/alttp/StateHelpers.py (python `is_not_bunny`, `can_bomb_clip`, `has_crystals`, `has_triforce_pieces`, `can_activate_crystal_switch`, `can_kill_most_things`, `can_kill_standard_start`, `can_get_good_bee`, `can_retrieve_tablet`, `has_misery_mire_medallion`, `has_turtle_rock_medallion`, `can_boots_clip_lw`/`dw`, `can_get_glitched_speed_dw`). The world is never inverted; enemy shuffle is off; enemy health is default; the goal is boss defeat, so no treasure-piece threshold applies. Non-inverted, the transform is suppressed by the pearl or by first-world ground. The bomb clip and boots clip helpers are glitch helpers, unused under no glitches, ported for table completeness. Enemy health default means the bomb fallback applies to most-things killing (`BOMBS_PER_ENEMY`), and the byrna path needs magic extension from `BYRNA_ENEMY_LIMIT` enemies up. The standard-start kill helper is the standard-mode escape version, where the escape assist covers the ammo paths.

`canRetrieveTablet` is python `can_retrieve_tablet`. The reference's swordless branch is asked as a setting instead of a mode: the hammer wakes a tablet when the player asked for it, and always when no beam blade could ever be found, which would otherwise leave the tablets behind a requirement nothing can meet. `canUseMedallion`: Rules.py `swordless_rules` 1076 to 1077, the medallion doors take no blade under the reference's swordless mode; asked as the setting that mode implied, so a seed with no blade can still open them.

## packages/randomizer/src/world/state-helpers/

Equipment and capacity helpers ported from Archipelago worlds/alttp/StateHelpers.py (python `has_sword`, `has_beam_sword`, `has_melee_weapon`, `can_lift_rocks`, `can_lift_heavy_rocks`, `has_fire_source`, `can_melt_things`, `can_shoot_arrows`, `can_hold_arrows`, `can_use_bombs`, `can_bomb_or_bonk`, `bottle_count`, `heart_count`, `has_hearts`, `can_extend_magic`, `can_buy`, `can_buy_unlimited`). Baseline options are fixed: normal difficulty and normal `item_functionality`, bombless start off, swordless off. Retro bow is a setting read off the world. The capacity readings come from the world's capacity profile, so the reference's shuffle-on and shuffle-off branches both live there. `BASELINE` is the normal-difficulty logic limits (python ItemPool `difficulties['normal']`).

Swordless is off in the baseline, so the medallion path of melting needs a sword. Shop purchases are out of scope (no shop pool): the python `can_buy` and `can_buy_unlimited` walk the shop objects, so anything that reaches for them is a porting error until shops are modeled. Arrows: with retro on there is no ammunition to carry, so the quiver becomes the question (held as a placed item where the shops are shuffled, bought off its shelf where they are not); with retro off an arrow capacity on the empty rung holds no arrow to fire. Bombs: the explosives capacity reached, against the 50 cap; a world carrying the player's own record asks one thing more, because the capacity is non-zero from the first frame and a player who has never found a bomb cannot throw one. A fill has no record, so there it is the reference reading exactly. Four pieces make a heart. The total magic check (python `can_extend_magic`, StateHelpers.py 70 to 84): 8 units at full cost, 16 at half, 32 at quarter, 0 without magic. The purchase branch (77 to 83): with an unlimited green or blue potion seller reachable, each carried bottle refills the meter; under normal `item_functionality` that multiplies base magic by bottle count regardless of the full-refill flag (the hard and expert reductions are off the baseline). The only such seller under default shop inventories is the one shop region named in the data table, so `can_buy_unlimited` reduces to reaching it.

## packages/randomizer/src/world/story-gates/story-gate-from-snapshot/

The story gate rows and the setting they stand for, both directions in one place. An absent row reads as the default. The pyramid row keeps the reference's own values: `closed` is the original, `goal` reads the same here, `auto` follows the tower count.

## packages/randomizer/src/world/story-gates/story-gate-option-keys/

The catalog keys the story gate rows occupy, one per field. The count rows reuse the reference's own keys where it has them (crystals for the tower and for Ganon, the pyramid hole), so a stored value keeps its name.

## packages/randomizer/src/world/story-gates/story-gate-options.constants.ts

The story gate rows of the option catalog: synthetic, unlocked, group `goal`. Every baseline is the story as the game tells it. The three the reference already asks (crystals for the tower, crystals for Ganon, the pyramid hole) keep its keys and replace its locked rows.

## packages/randomizer/src/world/story-gates/story-gate-word/

The story gates as gate word 5 fields (`core/zelda3/src/features.h` `kFeatures5_*`): the bit layout the core reads, and the setting folded into it. `STORY_BIT` and `STORY_FIELD` must stay in lockstep with that enum. It is pure, so the seed's word and the settings' word come from the same function on both sides. The event ledger and the re-offer reading always ride along. A count gate on the crystal kind at seven is the original, so its field stays zero. `DEFAULT_STORY_WORD` has every scene gate on, the ledger recording, and every count at the original number.

## packages/randomizer/src/world/story-gates/story-gate.type.ts

Which recorded event each of the game's story gates reads, and what the count gates ask for. Every gate defaults to the story as the game tells it: the event reading for the scenes, the original numbers for the counts. The item reading the unmodified game uses is not a choice here; Vanilla Safe alone restores it (`core/zelda3/src/features.h`).

- `pedestalScenes`: the Sanctuary, the Loyal Sage, the overworld music and four hint lines follow the pedestal, never the sword.
- `sahasrahla`: what the eastern sage asks for before his gift.
- `bombShopAsksSmiths`: the original also asks for the Smiths reunited; off waives that part.
- `CountGate.count` is 0 to 7. Zero with the crystal kind is the original number, seven.
- `heraMusic`: the Tower of Hera boss music follows Moldorm, never the pendant.
- `vaneScene`: the weathervane scene and Stumpy follow the weathervane, never the Flute.
- `mountainRespawn`: the Death Mountain respawn follows the Old Man's rescue, never the Mirror.

## packages/randomizer/src/world/story-gates/story-gates.constants.ts

The default story gates: the story as the game tells it. The scenes read their recorded event, the counts are the original numbers. A snapshot with no row reads the same way.

## packages/randomizer/src/world/update-reachable-regions.ts

Region reachability sweep: the port of the reference generator's `update_reachable_regions` and `can_reach` semantics (python BaseClasses, as exercised by Archipelago worlds/alttp/Regions.py). The sweep starts from the start region and repeats full passes until no new region is admitted: a rule may read the partially built reachable set (event logic), and the retry passes mirror the python blocked-connection retries. Rules are monotone in collected items and reachability, so the fixpoint terminates. `computeReachableRegions` runs a fresh sweep and returns a copy of the reachable set.

## packages/randomizer/src/world/world-dungeon.ts

One dungeon as the rules and the fill see it, read off its record. The engine used to keep its own copy of every dungeon's keys, map, compass, small-key count and wings; those are facts about the dungeon, so they live on `DungeonRecord` and this shapes them into the flat row the rules and the fill read. The record collections are read directly, because this module is imported by world building, which runs before anything seeds the registry. The regions keep the record's own array order, which is the order the prefill pushes the dungeon's items in.

## packages/randomizer/src/world/world-from-records/

The world, read off the records. The region collection is the engine's region list: `regionRecords` hands over all 239 rows, and the world builder keys its graph by their ids. Nothing states a region, its world or its type twice, and a region fact the rules want (the transform suppression flag) is read off the record. Regions are sorted by id, which is the order the reference's four taxonomies list them in; load order would follow the registry seeding one record file at a time, and the graph's own order has to be the reference's because the prefill and the normal placement both walk it. The keep test pins the two orders together.

`checksByRegion` reads each check's own `regionId`, which is why it is exact: a screen could not answer for it, because the reference's partition is finer than a screen where it splits one room into wings, and sixteen regions have no screen at all. A check standing for no place (a held item, a status, a combined event) belongs to no region here. Which rows a seed fills is one rule over the record.

`crossingsByRegion` is the other direction and stays a measurement. It draws the passages the connection records make, which are the game's physical crossings, while the graph's passages are logical ones. Both ends have to name a region, so a crossing into a room no wing owns is absent. A graph row names its crossing only where one crossing joins the same pair of regions; the rest have none, because a mirror spot, a retry from the menu and a wing boundary inside one room cross no tile. `apps/desktop/tests/randomizer/world-from-records` pins the gap: it can only shrink.

## packages/randomizer/src/world/world-zones.ts

World-zone marking: the port of `mark_light_world_regions` from Archipelago worlds/alttp/Regions.py. Two rule-free sweeps: one from every first-world overworld region that refuses to enter second-world overworld regions (setting `isLightWorld`), and the mirror sweep for `isDarkWorld`. Cross-world interiors may end up marked as both, and the transform-suppression logic in the helpers handles that case, per the source comment.

## packages/randomizer/src/world/world.type.ts

The assembled world model and its options: the seam between the graph and the access rules that attach to it. An exit is looked up by name, a location by its own key. An absent rule means unconditional access, mirroring the reference generator's default `access_rule` (Archipelago worlds/generic/Rules.py `set_rule` semantics); the rule registration pass makes absence explicit, so every target ends up either ruled or registered open. `placedItems` is the fill seam: the reference's `location_item_name` reads resolve against it, and it is empty until a fill populates it, which makes every placement-conditional rule take its conservative branch.

A `Rule` is a closure the engine asks, carrying the tree it was compiled from; the tree is the rule and the closure is its cache, so the two always answer alike. A `SeedValue` is one value of the seed table: a number, a currency or content name, an item key, a flag. An `ItemRule` is python `add_item_rule` and `forbid_item`: may this item be placed here; absent means every item is allowed. An `AlwaysAllowRule` is python `set_always_allow`: placement allowed even when unreachable (self-locking key allowances). `seedValues` holds what a seeded rule reads (each shelf's price and each pond rung's demand, as this world settled them), filled by the registration pass, so the trees carry no value and keep one shape for every seed. `isBeaten` is python `completion_condition`: the goal's story event has happened (Rules.py 51).

World option defaults when absent: `keyDropShuffle` false leaves the key-drop locations out of the pool view. `includeNpcChecks` absent means true, the fully shuffleable world the oracles were generated against; `includeWorldItems` absent mirrors it, since the single earlier toggle covered both. `capacity` absent is the reference profile: no fairy-slot locations, the half-meter item in the pool, nothing else. `capacityProgressive` absent is false, the fixed-jump pool. `shops` absent means no shop location exists. `shopPrices` absent means every shelf charges its vanilla rupees. `ponds` absent means every pond legacy, with no further prize slot a location. `pondLocations` is every pond slot in this world, in pond then prize order; a pond slot is a location only when listed, so an empty list is a world with no pond slot. `pondPrizeLocations` is the narrower set of prize slots: the rungs a pond sells, and the capacity pond's fairy spots while it is at Vanilla grants; a wish pond's own pair is not one, because the npc scope has always counted it, and the pool's arithmetic reads this list. `pondPairAsPrizes` is the wish ponds' own pairs this world sells as prize rungs: still locations as rungs 1 and 2, losing the vanilla item the npc scope would lock them to. `lockedPondGrants` is the wish ponds' vanilla slots locked at Vanilla grants, each to the item her upgrade produces there, which leaves the pool. `pondDemands` absent means every rung keeps the wallet reading of its own price. `darkRooms` absent is the reference reading (light required, the lamp alone providing it). `storyGates` absent is the story as the game tells it. `progressiveTiers` absent is every tier; `progressiveModes` absent is every family in order. `difficulty` absent is one copy per rung and the game's own twenty-heart ceiling. `retroBow` absent is off. `itemPower` absent is the reference's normal step. `unlitEscapeExempt` is a parity seam set only by the reference-oracle harness: the reference leaves the opening escape's unlit spots ungated in the mode this app always plays, so a placement it generated may hold the light behind them; absent keeps those spots under the dark-room requirement. `dungeonItems` absent pins every family to its own dungeon. `accessibility` absent is `full`, which also decides which of the reference's self-locking allowances exist, since every one but Rules.py 327 to 328 is guarded by `accessibility != 'full'`. `actTokens` present means the world answers from what happened: an act it does not list has not happened, and one the rules cannot judge from an inventory reads as not done; absent (every fill) means such an act is assumed available.

## packages/randomizer/tests/key-drop-size.keep.test.ts

The core matches a drop override on room and drop size, so a key drop armed at the wrong size
never fires and the vanilla key is granted. A drop whose vanilla item is its dungeon's Big
Key is armed large, every other one small.

## packages/randomizer/tests/plan-covers-placement.keep.test.ts

Every location a placement names must appear in the physical plan as an entry or an explicit
error; that gap once let shuffled dungeon prizes vanish between generation and the session.
Shop slots reach the session through seams of their own (the hut and the bomb counter too),
so every mode and both depths are pinned, and a shelf slot must never be an error row.
