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

## records/checks (item checks)

- A dungeon's reward pickup has its own ledger bit, separate from the boss.
- Some pickups have no flag in the game: it tests the item itself (the mushroom, the flute spot, the
  library book). Their rows read the same way on a plain file, through `fallback`. The mushroom
  leaves the inventory at the witch's, so her powder and her own check also count. The mushroom
  spot stays empty only while the powder is held (`SpritePrep_Mushroom`); until then it grows back,
  so the taken row reads "not now".
- Some gifts have no flag either (the wishing pond, the tablets, the flute boy). A seed has its own
  bit for them in `gameId`; a plain file answers from the item held, or from the item that later
  replaces it (a better shield, the flute that replaces the shovel).
- A check whose vanilla item has a stand in (the lamp, the blue boomerang) pays out once the real
  item is held, through the item's `aliasOf`.
- The lumberjack tree's heart piece sits on top of the tree, reached by dashing into it once
  Agahnim has fallen. The door at its foot leads under the ledge.
- Paradox Cave: the five chests are the upper room; the two behind the bombable wall by the lowest
  mouth are the lower room.
- The smiths temper the sword once the two of them are back together (the story's own record).
- The digging game lends a shovel for the round, so it needs none.
- The Brewery and the chest game share room 262, told apart by chest bit (0x10 against 0x400). The
  chest game row is the top prize of the once only minigame roll (`OpenMiniGameChest`).
- There is no "Blacksmith Ruins Rupees" pickup on the cartridge: overworld 0x63 carries no sprite,
  and the bushes on the ruins (0x62) hide green rupees that come back.
- Two Ganon's Tower chests (check 657 on) are in the native chest table but in no reference: each is
  the only chest of its room, so room and slot are the whole key. Both are fixed, real pickups no
  seed fills.
- Happiness Pond (room 0x115): each upgrade family sells seven tiers. The save byte counts 0 to 7
  (variables.h), and there is no chest or sprite table entry, so completion reads that byte. Only the
  first tier of each family is a location of the randomizer world; the other twelve show on a normal
  profile alone, because placement drops any check it does not name. Each family is numbered as one
  ladder of the fairy's, and the family word in the name matters: the pond's own prize rungs are
  named "fairy N", so a tier named that way would collide with a rung.
- The cursed pond in the dark world uses the same sprite (0x72) and grant as the Waterfall Fairy,
  one room over; the room tells them apart.
- Shops (`gameId.shopSeam`): room 0x10F is one shelf room that four dark world doors open onto (the
  lake, the lumberjacks, and two in the village), and room 0x112 is shared by the lake cave and the
  dark mountain cave. In both, the overworld area the player walked in from tells the shelves apart.
  A room that holds one shop alone (the village shelf, the shield shop at 0x110) names it by room.
  The mountain shelf reached by an inner stair has no overworld door of its own, so its room names
  it.
- The witch's three cauldrons are a shop of their own sprites, listed in the order the handler
  dispatches their subtypes, which is not where each pot stands. The powder trade in that room is a
  separate check.
- The bomb shop's refill is sold from its own sprite. Subtype 2 in the same room is the story bomb,
  which starts a follower instead of handing an item over, so it is not a slot.

## checks/ and records/checks/events

- Events are written as numbered rows (`EventSpec`, in `checks/event-spec.type.ts`), never as full
  records. The checks loader (`checks/checks.constants.ts`) turns each row into a record with
  `eventRecord`, and passes a row that is already a full `CheckRecord` through untouched, because
  the dev editor's writer can append one to an event file. The loader then sorts every check by id:
  the derived pass reads the list in order, and a derived record only names lower numbers.
- An event's id is its number plus 300 (`check-300` upward, after the item checks). The number
  blocks: 0 to 59 the story and its statuses (`story.ts`), 60 to 199 ten per dungeon plus the
  dungeons' extra stages (`dungeons/`), 200 to 307 the held items, fairies, areas, places and
  combined rows (`world.ts`), 310 and up the overworld acts (`acts.ts`). Numbers 1, 4 and 5 are left
  unused so the others keep their ids.
- `event-screens.data.ts` and `event-regions.data.ts` are generated: the screen each event lists
  under, and its region (the one its screen carries, or for a dungeon stage the wing its dungeon is
  entered through; number 37 keeps the region the reference gives it). An event that stands for no
  place (a held item, a status, a combined row) has no entry. The event names live in the rows, the
  screen names in the screen records.
- A dungeon stage event that happens in one room lists under that room (rooms by the number the
  game reads, `event_receipts.c`), so it opens with the room and not at the front door. The two
  Turtle Rock ledges outside its side doors are reached only from inside the dungeon.
- The boss and prize ledger bits are indexed by palace, and the Skull Woods front entrances by
  number. `checks/indexed-event-bits.constants.ts` builds those tables from the generated
  `EVENT_BIT`, so the rows can read them as data (`BOSS_KILLED_BIT[2]`).
- `EARLY_STORY_EVENTS` are the seven story moments the tracker recorded before the events' range
  existed. They keep their old ids, so they are written as full records.
- A story beat inside a dungeon files under it with an empty sub area, so it keeps its bare name:
  the standard name orders the seed's locations, and a prefix would reorder the fill.
- Story facts:
  - The jail is the castle's big key door: the jailer's key opens it.
  - Aginah: the game's own flag (progress flags 0x20) is set when his sprite first runs, on
    entering the cave. The ledger bit is one of his lines on screen.
  - "Bottle bought from the merchant" is named for the purchase; the man's own row is the item check.
  - The smiths take whatever sword is in hand, none included; only a tempered one is refused, and a
    seed lifts that. So the reunion is the whole requirement for tempering.
  - The weathervane's overworld bit is written when the flute releases the bird. That is also the
    flute's activation, and the randomizer's activated flute slot sits on this row. The activated
    flute replaces the plain one, so either satisfies it.
  - The floodgate lever has a ledger bit because the game erases its own dam bits on the next
    overworld load.
  - Three pegs behind a heavy rock, hammered in order, open the warp to the dark mountain top.
  - "Dark World reached" counts the first step in from anywhere, the mountain warp as much as the
    castle gate.
  - The frog and smith rows carry the flag fields the simulator writes when it talks to the sprite
    (`Smithy_Frog`, `Smithy_Homecoming`), found by sprite type.
  - "Purple Chest found" is picking the chest up, before the smith opens it.
  - The desert statues keep no flag: they step aside while a live flag is up, and it drops when the
    desert screen is left. The ledger keeps that the prayer was ever said.
  - Statuses are things true for a while. "Kakariko guards on alert" has an ever side (stage 2
    reached); the other three have none, so they are `statusOnly`.
  - Uncle (`check-002`) is found wounded and hands over his sword and shield; he survives.
  - The throne room shelf needs Zelda following, since she pushes it with the player.
  - The map marker stage keeps climbing after Sahasrahla's quest, so it is read as "at least".
- Overworld acts open a cave mouth for good. The game writes each to the overworld event byte of
  the area the mouth stands on, always the head of a large area: bit 0x20 when a staircase is
  uncovered by lifting or dashing, bit 0x02 when a wall is bombed. Every area is the one the ROM's
  secrets table names, and fourteen were checked against the saves of a real run.
  - The desert and dark Death Mountain are large areas: the mouths sit on 0x31 and 0x46, the byte is
    the head's. Kakariko too: the bomb hut sits on 0x20.
  - The two rupee caves share one interior room; which area holds which name is not settled.
  - The lumberjack tree falls on the exit from the first Agahnim fight, not on the dash.
  - A dark world act needs the moon pearl: a bunny lifts nothing and sets nothing.
- `world.ts`: the game keeps only the bomb count; the ledger keeps that a bomb was ever held. Room
  0x10C is shared by the Hookshot fairy cave and the Mimic Cave; the game marks both quarters (0x0A)
  as soon as the player walks in, so the far side of the water is recorded by the core from where the
  player stands (`event_watch.c`). Two open regions are a pocket behind a rock on a screen anyone can
  walk onto, so each is read from the cave the pocket leads into. The places block starts at 290 so
  it does not run into the combined rows; "Path to Zora" is open country in front of the rock.
- A Swamp Palace stage: the locked door at the top of the big chest room opens with the key under a
  pot across the water in that room, a hookshot away (check 170). Everything north of it is behind it.
- Hyrule Castle has no boss: its stages are the escape.

## requirements/helpers.ts

- No item record stands for "can use bombs". The first bomb pickup (`item-041`) stands in for it.
- `canSeeInDarkRooms` is a rule of comfort: the game lets a player walk a dark room blind. The
  tracker's resolver swaps this exact object for the lights the file accepts, or for nothing when
  dark rooms are not asked to be lit, so it must stay one shared object. Read on its own it is the
  lamp.
- The medallion rules are the vanilla ones: Misery Mire wants Ether, Turtle Rock wants Quake.

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

## records/native-tables and native-tables/

The native tile tables transcribe the original engine. `native-tables/index.ts` reads every export
of `records/native-tables/` by name (`pickNativeTable`), since the folder holds about twenty
differently shaped tables, not one collection. Export names are unique across the folder. Every
table is keyed by byte, so a missing table falls back to an empty one, which takes the same miss
path as an absent entry. `hasNativeTables` says whether the tables are there at all.

### Tile behavior and tile visual

- `tile-behavior.ts` and `tile-visual.ts` (with their `-structures.ts` halves) are lists of groups.
  One group is one `case` group of `TileDetect_ExecuteInner` (tile_detect.c, lines 261 to 525), so
  the list can be diffed against the C by eye and no entry claims a distinction the engine does not
  make. `{ from, to }` is a run the engine writes as one long case run. `buildAttrMaps` turns the
  groups into the outdoor map and the indoor map.
- The dispatcher's only context input is `is_indoors`, so the two maps are the complete keying: no
  palace, theme or entrance matters. A group carries an `interior` value only where the switch
  really branches on that flag. Seven of its eight such branches change the class (C lines 271,
  277, 284, 424, 506, 512, 518); the eighth (263) only sets an outdoor bookkeeping bit.
- All 256 bytes are covered: the switch ends in `assert(0)` (C line 523), so a missing byte would be
  one the engine treats as impossible.
- Facts about single cases:
  - 0x0B is a second deep water byte (high nibble flag), solid indoors. 0x6C to 0x6F are an unnamed
    case, solid indoors and inert outdoors. 0x04 is tall grass outdoors, collision indoors.
  - In the slope cases (0x10 to 0x13, 0x18 to 0x1B) the low two bits pick one of four directions
    inside the case; there is no face or edge split.
  - 0x20 and the run 0xB0 to 0xBD are one pit case.
  - 0x22 and 0x30 to 0x37 (`TileHandlerIndoor_22`) raise only the visible stair flag, no
    transition. 0x3D to 0x3F (`TileHandlerIndoor_3E`) is a fifth staircase case that raises the
    in room staircase flag in the high nibble, which selects another submodule (player.c 4297).
  - The diagonal ledge cases interleave: even bytes north, odd bytes south.
  - 0x44 is a spike that hurts (spikes or cactus), not a dig patch. 0x4B is the warp; 0x49 is not.
  - 0x60 is a rupee tile indoors only; outdoors it is plain ground.
  - 0x42, 0x4C to 0x4D and 0x4E to 0x4F are outdoor only: indoors their body is skipped. The last
    two feed the ledge hop checks next to the real ledge flags (player.c 5182), so they read as
    ledges.
  - 0x70 to 0x7F is one case (`TileBehavior_ManipulablyReplaced`) with no low and high split.
  - The door cases skip bytes: 0x80 to 0x8D leaves out 0x82 and 0x83 (their own case), and the
    manual door case 0xA0 to 0xA5 leaves out 0xA2 and 0xA3 (a shutter). The layer and dungeon
    toggle shutter case spans two runs, 0x98 to 0x9F and 0xA8 to 0xAF.
  - A case named `...ShutterDoor` also raises the second collision nibble (a door opened for the
    player); `...ManualDoor` and the two `TileHandlerIndoor_8x` cases do not.
  - None of the structural cases branch on `is_indoors`, even though only interior screens stamp
    them.
- Visual labels coalesce: many behaviors look alike (every door that is not a shutter reads as a
  door frame), and the four staircase cases share one staircase graphic. One case is split instead:
  `TileBehavior_Liftable` (0x50 to 0x56) is told apart downstream by `kTile50data` (tile_detect.c
  392) and `kGetBestActionToPerformOnTile_a` (player.c 5553), the glove level compared against
  `link_item_gloves`: 0x50 and 0x51 are bushes (bare hands, dashable), 0x54 is a sign (the byte the
  read action keys off), 0x52 and 0x55 light rocks (first glove), 0x53 and 0x56 dark rocks (second
  glove).
- The overlay mask cases 0x0C and 0x1C feed the same pair of layer change flags (player.c 4206 to
  4218), so both read as steps.

### records/native-tables/tile-attrs.ts

- `OVERWORLD_TILE_ATTRS` is the navigation map outdoor screens read; `INTERIOR_ATTRS` lays the
  indoor overrides of `TileDetect_ExecuteInner` over it. The accessors live in
  `navigation/overworld-attrs.ts` and `navigation/interior-attrs.ts`.
- `req: 'lift.1'` on bushes, signs and pots is a real requirement and must stay: it gates the flood
  and shows on the overlay.
- Slopes and cliff edges are impassable, and cliff jumps extend through them. Cliff faces start
  blocked and become ledges in cliff preprocessing.
- 0xD0 to 0xEF are walkable dungeon floor variants.
- Indoors: 0x58 to 0x5D are the chest and lock family, 0x63 the minigame chest, 0x67 a crystal peg.
  0x70 to 0x72 are liftable pots; 0x73 to 0x7F share that case but are pushable blocks, shoved aside
  with no item, so they never block. 0x80 to 0x8D are the open doorways stamped by
  `Dungeon_LoadDoorAttribute`, which the flood must pass. Shutter doors set no collision bits. 0xC0
  to 0xCF are torches, solid until lit. 0xF0 to 0xFF are flaggable doors, solid until a flag is set;
  in practice the bombable walls, so they are a bomb gated obstacle.

### records/native-tables/cliff-attrs.ts

- These byte lists gather what three call sites used to hardcode (cliff preprocessing, indoor
  ledge directions, the overlay's dot drawing). Each list is kept byte for byte as its call site
  had it; the lists disagree with each other on purpose and none was unified.
- The engine groups 0x10 to 0x13 as one slope case and 0x18 to 0x1B as another, with no face or
  edge split. This project cuts them into faces (0x10, 0x12, 0x18, 0x1A) and edges (0x11, 0x13,
  0x19, 0x1B), because the cliff preprocessor needs that split: a face extends a ledge run when the
  player jumps into it, an edge does not.
- `CLIFF_TRIGGER_BYTES` are the straight jump triggers; the diagonal ones (0x2C to 0x2F) run
  through the diagonal pass (`VERTICAL_CLIFF_DIRS`). Indoors only 0x2F has a fixed direction; the
  straight triggers are resolved per tile (`HORIZ_LEDGE_BYTES`, `VERT_LEDGE_BYTES`). Outdoors all
  four straight triggers have one fixed direction.
- The indoor wall list adds 0x04 because thick grass is a wall indoors.
- `DIAG_EDGE_BYTES` is empty on purpose: diagonal cliffs never seed a south run.
- `CLIFF_BORDER_BYTES` holds only the south and east faces (0x10, 0x18).
- `VERTICAL_CLIFF_DIRS`: the tile decides north or south; which side resolves from the approach.
- `DRAW_DOTS_LEDGE_BYTES` is a different, broader list: every trigger, the outdoor wall list, 0x11
  and 0x19, and 0x3D, whose meaning there is not known.

### records/native-tables/traversal-tokens.ts

- It bridges item ids and the navigation's traversal tokens. Keys are item ids: display names
  dropped two rows (no record is named "Bombs" or "Magic Hammer").
- Bombs are a traversal item: interior bombable walls ask for `bombs`, and the well's own chests
  hand over the bombs that open its top room. No record holds bomb capacity, so the bomb pickup
  stands in.
- Both native bow rows grant `bow`. Keys are handled elsewhere.
- `IMPLIED_TOKENS` carries progression: `lift.3` implies the rungs under it. Bare hands (`lift.1`)
  is granted to every run from the start.
- `BARRIER_TO_TOKEN` is the fallback when a connection has no `nav.requirements`. `barrier:gloves`
  is `lift.2`. Medallion, crystals, event and glitch barriers cannot be resolved from an edge alone,
  so they map to `event:unmapped-barrier-*` tokens that keep the edge blocked.

### records/native-tables (other tables)

- `door-barriers.ts`: door kind to barrier tag, for the recorder's dataset suggestions. `null` means
  no barrier (a normal door, or a trap door the simulator does not model).
- `game-enums.ts`: display names over the engine's own enumerations, one to one with upstream's
  `kEffectNames` and `kCollisionNames`. There is no room kind map: the game has no cave or house
  field. `MANIPULABLE_NAMES` keys are `dung_replacement_tile_state` values for the 0x70 to 0x7F
  family.
- `room-tags.ts`: names indexed like `kDungTagroutines` (0x00 to 0x3F). Unnamed stubs are left out
  and shown as hex. 0x01 to 0x13 (the clear the room family) are handled by the simulator's accessor.

### native-tables/player-pose-atlas

- The JSON transcribes six tables of the decompilation (player_oam.c, misc.c); regenerate it
  instead of editing it. Facing indices follow `link_direction_facing >> 1`: 0 up, 1 down, 2 left,
  3 right.
- The engine draws the player as two 16x16 halves per frame: an upper half at an offset the frame
  chooses, a lower half eight pixels below the origin. Each half reads four tiles from `off`,
  `off + 0x20`, `off + 0x200` and `off + 0x220`. Either half can be hidden, so a frame has two quads,
  one, or none. A frame with none is a real frame: the fall into a hole uses three of them for the
  beats after the player is gone, and dropping them breaks the timing.
- Frames are addressed by slot: 511 pose ids share 303 slots. A state that does not vary by facing
  stores only facing 0. `bounds` is the union of every frame, so one canvas fits every pose.

### native-tables/player-state-labels

- The decompilation numbers the player actions but never names them. Each label was read off the
  branch in `LinkOam_Main` that selects the id, and `from` quotes that condition so a label can be
  checked. Frame counts come from the atlas.
- Actions 0x01 and 0x28 and up never appear: 0x08 aliases 0x01's frame range in the offset table,
  and the table stops at 40. An action the list lacks still renders, labelled by its id.

### types/native-tables and types/tile-attrs-types

- The shapes stay here even where the tables are absent, because a type is erased at runtime and
  consumers still compile against it.
- `DoorKind` mirrors the simulator's `SimDoor['kind']` without importing the engine type.
- `TileReq`: `lift.1` bare hands (bush, pot, sign), `lift.2` first glove (light rocks), `lift.3`
  second glove (dark rocks), `hammer` pegs, `boots` bonk rocks, `flippers` deep water, `hookshot`
  posts across gaps, `bombs` cracked walls.
- `TileAttrDef.labels`: the first label is the primary one, the rest are equivalent names. `req`
  applies only when `pass` is not `free`. `hookTarget` marks a tile the hookshot can grab.
- `TileBehavior` uses the engine's own `TileBehavior_*` names, so conformance can be checked by eye;
  `indoor-stairs-3e` is named after its handler since it has no name of its own. `TileVisual` is
  kept apart on purpose: two tiles can share a behavior and look nothing alike.

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
