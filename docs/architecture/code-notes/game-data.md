<!-- @layer docs @kind doc -->
# Code notes: game data

Facts about `shared/game/data/` that the code cannot say on its own. Each heading names a file
under `shared/game/data/`. The records hold the data; this page holds the why.

## records/actors/bosses.ts

- Sprite type 0x09 is the giant Moldorm, the mountain tower's boss. Sprite type 0x18 is the small
  common Moldorm. Upstream's sprite name table has the two swapped; the decompilation's function
  names settle it, and room 51 is a boss room in `kBossRooms`.
- Trinexx has three heads: 0xCB is the rock head, 0xCC the fire head (it adds the fire garnish), and
  0xCD the ice head, by elimination.

## records/actors/enemies.ts

- Sprite type 0x24 runs the same handler as 0x23: the blue Bari is a color variant of the red one.
- Sprite type 0x5C runs the same handler as 0x5B: it is the counter clockwise spark.
- Sprite type 0x80 is the common fire snake, a different enemy from the Lanmola boss (0x54).
- Sprite type 0x17 is the hoarder, a crab hiding under a rock that drops rupees.
- Sprite type 0x8D is the fuzzball Arrghus throws.
- Sprite type 0xAA, the Pikit, steals items.
- Hardhat Beetle (0x26), Deadrock (0x27), the yellow Stalfos (0x85), Pengator (0x99) and Medusa
  (0xC5) hurt the player, so they are enemies even though they look like scenery.

## records/actors/npcs.ts

- Sprite type 0xB7, the blind maiden, is the Thieves' Town boss in disguise.

## records/actors/objects.ts

- Sprite type 0x7F has no decompiled name. It is taken as the counter clockwise fire bar because
  0x7E is the clockwise one.
- Sprite type 0x95 is named `LaserEyeLeft` in the decompilation. The direction labels of the laser
  eyes were never checked one by one.
- Sprite type 0xB4 is the purple chest as a prop. The merchant who unlocks it is a different
  sprite (0x39, the locksmith).

## records/actors/obstacles.ts

- The hammer peg tiles (sub index 150 and 189) answer only when the hammer is in hand
  (`HandleItemTileAction_Dungeon` in player.c). That is why both are cleared by the hammer.

## records/actors/triggers.ts

- Room tags 0x01 to 0x13 are one full "clear the room" cycle of `kDungTagroutines` (seven quadrant
  gates, the quadrant trigger, the room trigger), and the table repeats it at 0x29 to 0x32.
- A repeat runs the same handler, but the raw tag is 0x29 or higher, so `RoomTag_QuadrantTrigger`
  and `RoomTag_RoomTrigger` reveal a chest there instead of opening a trapdoor. Tags 41, 42, 43 and
  50 occur in real rooms, so each has its own record: `roomTag` holds one number, never a set.
- The cell lock (object sub index 24) is drawn and tracked like a chest, but through
  `dung_num_bigkey_locks_x2`, the counter the big key unlock checks. It appears only in Zelda's cell
  in Hyrule Castle, so the big key that clears it is that dungeon's.

## records/dungeons

- The two Agahnim fights (castle tower and Ganon's Tower) grant no item. Their boss check is the
  ledger's "Agahnim beaten" event, and both use the same actor, so they share one defeat rule.
- Trinexx is three actors. The dungeon names the rock head, the form the fight opens as.

## records/enumeration/enumeration.ts

- One row per value of each closed label category. The record fields these describe stay plain
  literals; this is a label source, never a foreign key.
- `scripts/generate-enum-types.mjs` loads this file with Node's own type stripping and no bundler,
  so its imports must stay `import type`. That is why `ALL_KINDS` is kept by hand in step with
  `KIND_ID_PREFIXES` instead of imported.
- `world` serves both the two value screen world and the three value area world (`both` for the
  mountain area).
- A `connection-kind` is a transition the game performs itself, taking control away to move the
  player between screens. How a crossing is reached or cleared (walk, swim, ledge, bomb, hookshot)
  stays a tag.
  - `edge`: a scroll across a boundary (overworld border, a big room's section boundary).
  - `door`: a doorway between rooms. Shutter, key and bomb doors are the same kind, gated.
  - `entrance`: the threshold between the overworld and an interior (the entrance and exit pair).
  - `stairs`: a staircase between rooms or floors (the native stair table).
  - `hole`: any fall through, a pit to the room below or an overworld hole into a cave.
  - `drop`: the landing side of a hole. Nothing leaves through it, but the flood reads it as the
    spawn tile a fall resolves to. Its pair partner is always a `hole`.
  - `teleport`: warp tiles, whirlpools, cross world portals.
- `progress-tier` labels the four values of the save's progress indicator byte, which the engine
  branches on for sprite lists, ambient sound, sign text and world access. The field it labels holds
  a number, and an enumeration value is a string, so the category is left out of the generator's
  `CATEGORY_TYPE_NAMES`. `shared/game/logic/queries/progress-tier.ts` says what each tier means.
- `review-status` is the status of a record's own review mark. Every collection carries one and
  nothing gates on it.

## records/item-groups/item-groups.ts

- The groups are what a count requirement (`{ count: { groupId, n } }`) counts against.
- The crystal and pendant members are the items the dungeon prize checks grant, never the unused
  duplicates in the junk table.

## records/items

- `keys.ts` holds only the universal small key, the one key that belongs to no dungeon. Each
  dungeon's own keys sit with that dungeon.
- A pendant has its own native receive id and the native grant sets a fixed bit for it. The seven
  crystals share one native id and the room decides which bit banks, so the crystal records carry no
  receive id.
- Two native receive ids give 20 rupees: 54 (`Rupees (20)`) and 71 (`20 Rupees`). The names differ
  on purpose, because the item name is the join key randomizer delivery uses, so two records can never
  share one. Which native id the multiworld data package means by that name is not settled.
- The refill rows (bee, potions) fill a bottle already in hand; the bottle rows hand over the bottle.
- The progressive items in `randomizer.ts` (capacity families, the flute) carry no receive id: the
  core picks the rung from the live inventory. They still need a record, or a seed that places one
  shows "???" in a virtual slot and the wrong vanilla item in a real check.

## records/names/msu-tracks.ts

- Tracks 1 to 34 are the vanilla music slots every MSU-1 pack uses. There is no track 35 or 36.
- Tracks 37 to 58, 110 and 112 come from inverting `OVERWORLD_AREA_TRACKS`: each area index was
  resolved to a screen record, and the track is named for the region those areas share.
- Tracks 59 to 107 and 114 come from inverting `ENTRANCE_TRACKS`, resolved against the ROM's
  entrance tables (room at $82C813, palace at $82D48B, default music at $82D82E) and the overworld
  door and hole tables ($9BB96F, $9BBB73, $9BB826, $9BB84C). A group whose entrances all carry a
  palace index takes its name from `PALACE_INDEX_NAMES`, the rest from the areas their doors open on.
- A room number can hold several unrelated interiors in different quadrants (entrances 0x69 and 0x6A
  both land in room 0x10E), and interior screen records carry no quadrant. Where an interior could
  not be pinned down, its name states how it was derived.
- The file has no type import: the loader (`msu-track-names.ts`) casts it where it is read.

## records/names/palaces.ts

- Keyed by the raw value at RAM $040C (`cur_palace_index_x2`), which is doubled because the game's
  dungeon tables are indexed by that value shifted right once. Caves and houses report 0xFF.
- These are display labels only. `dungeonForPalaceIndex` resolves a palace index to a dungeon.

## records/names/sounds.ts

- Names come from the community RAM map of the sound queue registers ($7E012D to $7E012F), checked
  against the call sites in the decompiled source. Where the two disagreed the call sites won.
- sfx1 0x3C is the refusal noise played when an item use is denied.
- The ambient channel stops at 0x17: the game raises twelve ids there as literals, and its only other
  route to that port is a four bit nibble from the overworld music table.
- The file has no type import: the loader (`sound-names.ts`) casts it where it is read.

## records/screens and records/connections

- `interiors/special.ts` in each world holds the screens, and their connections, that no area owns.
- Skull Woods is filed in two halves: `front.ts` is the part reached from the four surface
  entrances, `back.ts` the part reached through the burned skull.
- A screen with no check and no reference name is named after its dungeon and room number
  (`Ganon's Tower room 0x9C`). Screen 354 has no room number either: room 0x3C is the Hookshot Cave
  on the cartridge, and the dungeon map draws no room there, but the four crossings the screen
  carries are real.
- The grave behind the sanctuary (hole slot 18) drops into room 0x11, the secret room's own room, on
  the near side of its bombable wall. Screen 102 carries the same mouth as an entrance id, so one
  reading of it sits on each screen.
- The opening scene of room 0x104 has no door of its own, so it carries no entrance id. Its
  `variant` picks it, and the variant branch of screen detection reads that.
- Paradox Cave: entrance 30 opens into room 0xFF, the front, where the shop shelves also stand. Room
  0xEF holds the five chests. Room 0xEF's header staircases link 0xDF, 0xEF and 0xFF.
- A room reached only by falling (0xFD under 0xED's hole, 0xFE under 0xEE's) has a landing screen
  with no door of its own.
- Several rooms have more than one door: room 0x112 (the dark sanctuary and the two cave shops),
  room 0x11C (the bomb shop's screen and the village), room 0x103 (three doors; the bush stands in
  front of entrance 68). A record carries one of the doors; the others reach the same place.
- Overworld 0x0F is the river country east of the castle, not the mountain.
- The Mimic Cave ledge (region 32) is reached with the mirror from the dark mountain, but it is
  walked in the light world, so its region is a light world one.

## records/tags/tags.ts

- The tags were seeded from the taxonomy tables in namespace order, then declaration order, so the
  numbering is reproducible. A tag added later is appended by the id allocator and lives only here.
- Every tag reads `namespace:value`.
