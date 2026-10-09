<!-- @layer docs @kind doc -->
# Code notes: game data

Facts about `shared/game/data/` that the code cannot say on its own. Each heading names a file
under `shared/game/data/`. The records hold the data; this page holds the why.

## Generated files

A file whose name holds `.generated` is written by a script. Never edit one by hand: change
its source and run the script again. The generated file carries the gate's `@layer`/`@kind`
header and no other comment, so what it comes from is written here.

- `records/checks/events/event-bits.generated.ts`, from the `EventId` enum in
  `core/game-hooks/events/event_ids.h` (the event ledger's bit order), by
  `pnpm run generate` (`scripts/generate-from-records.mjs`). The order is frozen, so these
  numbers are save file facts. A new event is appended at the end of the header, never
  inserted. The boss killed and prize taken runs are arrays indexed by the palace index, the
  Skull Woods front entrances by entrance number. `LAST_EVENT_BIT` is the entry before
  `kEventCount`, the highest bit the core's list holds.
- `taxonomy/screen-tags.generated.ts` and `.generated.type.ts`, from every tag record that
  applies to a screen, by the same script. This is our own vocabulary for sorting screens, not
  a game value. A screen's tags are read through `tags/screen-tag-keys-of.ts`.
- `taxonomy/connection-tags.generated.ts` and `.generated.type.ts`, from every tag record that
  applies to a connection. Direction is read off `canExit` (`connections/derive.ts`), so the
  retired `dir:one-way` and `dir:two-way` terms have no replacement here.
- `taxonomy/check-content-tags.generated.ts` and `.generated.type.ts`, from every tag record
  that applies to a check. A check's content is the one check tag family no other record
  states, so it is stored and not recomputed on every read.
- `enumeration/enumeration.generated.type.ts`, one union per category of `ALL_ENUMERATION`
  (`records/enumeration/enumeration.ts`), by `pnpm run generate:enum-types`
  (`scripts/generate-enum-types.mjs`). The dev editor's enumeration writer runs it after
  every write.

`pnpm run generate:check` writes nothing and fails on a file that differs from a fresh run;
`tests/game/data/generated-mirrors.keep.test.ts` runs it, and
`tests/game/data/enumeration-generated-types.keep.test.ts` does the same for the unions.

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
  number. `checks/indexed-event-bits.constants.ts` names those runs of the generated
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
  `CATEGORY_TYPE_NAMES`. `packages/game-data/src/logic/queries/progress-tier.ts` says what each tier means.
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

## The dataset core (registry, bootstrap, facade, indexes, session-records)

- `bootstrap.ts` is the only seeding path. Every kind is filled the moment it is first imported:
  synchronous, no network, no second source. The records are typed `.ts` files compiled into the
  bundle, so every consumer gets real data with no await. `index.ts` imports it first.
- `recordsIn` is what each loader calls on its own `import.meta.glob`: the record tree is hundreds
  of files deep, so a glob loads them and this flattens every exported array of every module, since
  each record file names its array after its own place in the tree. Vite sorts glob keys by path, so
  the order is stable; where order matters a loader sorts by id (the checks loader does).
- The facade is the only door into the dataset: nothing outside it imports a data file, and an
  ESLint rule enforces that outside the zone.
- Getters take a plain `string`, because most callers hold a runtime string (live game state, a set,
  a map key) with no brand. The branded id types stay on the records, where the id is made.
- A getter that misses throws. The records are in the repository and seeded before any getter runs,
  so a miss is a bug in the caller or a dangling reference, which the integrity and ROM facts tests
  catch first. A caller that may hold an id the dataset never had (the simulator keys places on the
  game's numbers, `room:80`) asks with `get`, which answers `undefined`.
- `PLACEHOLDER_AREA_ID` (`area-000`) and `PLACEHOLDER_LOCATION_ID` (`location-000`) are the area and
  location of the one screen that sits nowhere: the menu and save and quit pseudo screen. They mean
  "no place assigned", and the integrity test names them as its one exemption.
- The indexes are reverse lookups from the game's own values (room, chest index, sprite type) to
  records, rebuilt once by `rebuild()`, so there is no scan per call. Native code only knows native
  values, never the app's ids.
  - A sprite type byte is not unique: the game reuses one entity type for actors the dataset keeps
    apart. The single value maps keep the first registered record; `actorsByGameSpriteType` answers
    every record for the byte, for a join that cannot pick one.
  - `checkByGameId` tries the most specific fact first: chest index, progress buffer bit, event
    threshold, bare room mask, overworld mask, sprite type. Two records can share a fact (a boss kill
    and its prize flip the same room mask bit); `disambiguate` narrows by sprite type, room and world,
    then returns the first registered. A boss and prize pair is named reliably by the dungeon's
    `bossCheckId` and `prizeCheckId`.
- `session-records` folds a write back into the live session for every kind whose only store is the
  registry. Tags, item groups and enumeration keep their own lookup maps, so each owns its fold back.
  These run after the write has landed on disk, and the indexes are rebuilt each time, so a record
  whose native values moved stops answering from the old table. Records are taken as `{ id }`, since
  the editor holds a row, not a typed record.
- `check-standard-name.ts` is the one place a location's name is derived: `<dungeon> - <check>`, or
  the sub area instead of the dungeon, or the bare name when the sub area is empty. The generator,
  the tracker's rules and a stored seed all key by this string.

## Loaders, lookups and relationships

- Each collection folder (`areas`, `actors`, `items`, `screens`, `connections`, `dungeons`,
  `locations`, `regions`, `tags`, `item-groups`, `enumeration`) globs its own records into one
  constant list. Tags, item groups and enumeration also keep lookup maps, built off that list (not
  the registry, so seeding order does not matter), and their register, replace and unregister
  functions update the list, the maps and the registry together after a write has landed.
- Tags: records store tag ids, but every rule is written against the key (`barrier:small-key`), so
  the conversion lives in `tags/`. An id or key with no record is dropped, never replaced by a stand
  in. The `*TagKeysOf` readers narrow to the taxonomy unions without proof, on purpose: the taxonomy
  tables seed the vocabulary but do not bound it, and a test pins the seeded terms.
- `item-groups/ids.ts`: the seven group ids, keyed by name so a call site reads
  `ITEM_GROUP_IDS.Crystals`. They are resolved at compile time, so they live in code even if the
  group records were ever absent.
- `connections/derive`: a connection is one point on one screen. `toScreenIdOf`, `directionOf` and
  `isReachable` derive what the old two ended record carried, through `toConnectionId`, which always
  resolves for stored pairs. `toScreenIdOrNone` serves the recommendation probes, which read a pair
  the inspector is still editing and must ask without throwing. A crossing is two way only when
  both ends can exit.
- `connections/pair-join.ts`: whether a stored crossing links two screens, asked once for the audit
  and the completeness badge. Either point of a pair proves the link, so the answer depends neither
  on which side is held nor on `canExit`.
- `connections/pending-partner`: a proposed connection needs its partner's id, and a brand new
  crossing has none until the write path allocates the pair. The sentinel `connection-pending:<screen>`
  is shaped like a connection id so it fits `toConnectionId`, but it never reaches disk: the create
  writer checks for it and mints both ends.
- `relationships/`: reverse references for the delete guard, read off the registry so they stay
  correct as data changes. Every field a record carries today is walked, including requirement trees
  and presence conditions, which is where a dangling id would hide. Tags and item groups are
  answered in `reference-index`, the six other deletable kinds in `dataset-references`; a kind that
  gains a delete path adds a row to `REVERSE_INDEX`. A `tags` field is read defensively, since it is
  optional on some kinds.

## record-file-targets/

- One tree convention for screens, connections and checks:
  `<collection>/<world>-world/<overworld|interiors|dungeon>/<area or floor>.ts`. A record's world,
  area or dungeon, and floor pick the path, so the files for one place sit at the same relative path
  in each collection. Every table is keyed by a frozen id or a dungeon's file stem, never a display
  name, so a rename never moves a file.
- `AREA_FOLDERS` is the one table the convention still needs: an area record has no folder name of
  its own, and a folder made from its display name would move on a rename.
- `DUNGEON_FLOORS`: a tower whose floors are single rooms keeps them in one `floors.ts`; other
  dungeons get a file per floor, or per pair where the game pairs them. `SPLIT_BY_HALF`: Skull Woods
  files one floor in two halves by which way a room is reached, and nothing on a room says which, so
  a new room there is refused.
- A screen with no real area, or a `special` interior, files under `interiors/special`. A connection
  point files with its own screen, so the connections tree mirrors the screens tree.
- `dungeonForPalaceIndex` matches the dungeon's own palace index first, then the palace index its
  rooms carry, which resolves the two palace values the first castle reports.
- Items: a dungeon's own map, compass and keys file with the dungeon. An item with no native receive
  id and no vanilla counterpart is seed only and files in `randomizer.ts`; everything else files by
  category. The mountain area spans both worlds and files with the light side.
- A region files by world: a dungeon wing with its dungeon, a cave or house with the interiors,
  anything else with the overworld.
- Events file by the number block their number falls in; a dungeon's stage events file with the
  dungeon. A new event with no number yet goes to `story.ts` when it is a story or status event, and
  is refused when its group spans two files.
- `recordArrayName`: a new file's array is named from its path (world, place, collection), so the
  loader's glob picks it up. Event files are named after the events instead.

## record-codegen/

- Turns a record into TypeScript source for the dev editor's write path. The input is a real record,
  so an emitted literal cannot carry a stale shape. Each kind's field order list is checked against
  `keyof` at compile time, so a field added to a record shape is a build error until the order lists
  it, and an unknown key throws instead of being dropped.
- Output matches the committed files: one field per line, nested values on one line while they fit
  the 118 column width the files were written at. `review` is always last, a footer under the facts.
- A pending record has no id yet; the allocator adds it. Tags and item groups are only ever replaced
  in place, never minted by this path.

## types/

Each record shape lives in `types/<name>/<name>.type.ts`, re-exported by the folder's `index.ts`
and by `types/index.ts`. `types/index.ts` also re-exports `SoundNameRecord`, whose shape lives with
its loader, because the vault dataset imports it from there.

### types/ids

- `SpriteId` names an extracted picture, never an entity; anything that acts in the world is an
  actor. `ItemGroupId` (`ig-NNN`) is the leaf of a count requirement. `EnumerationId` is `enum-NNN`.
- `ID_PAD_WIDTH` is 3 and stays 3: every id is already written that way, and a fourth digit would
  give a second spelling of the same number. The connections passed 999 records, so `makeId` lets a
  longer number through unpadded (`padStart` never truncates). Count records with a query, never a
  table of counts.
- `KIND_ID_PREFIXES`: each kind mints under its own name, except `item-group` (`ig`) and
  `enumeration` (`enum`). Read it instead of assuming the kind name.

### types/actor and types/combat

- One record kind for every living or interactive entity: enemies, bosses, NPCs, objects,
  obstacles, triggers. "Sprite" is kept for graphics.
- `gameId.spriteType` is the native sprite type byte; `objectSubIndex` the dungeon room object sub
  index (0x18 is the cell lock); `roomTag` the room header tag byte. `clearedBy` is what removes an
  obstacle or opens a lock, the mechanism side of a connection's `gatedBy`.
- Combat facts are read from the game's own tables (sprite.c, ancilla.c): `kSpriteInit_Health`,
  `Flags4`, `enemy_damage_data`, and `kAncilla_Damage[ancillaType]` for a weapon (0x09 is the
  arrow). An `estimated` range, or a `contact` range with `sourced: false`, is flagged, not measured.

### types/check

- `gameId`: a chest reads `save_dung_info[roomId]` with the chest's open mask; a room mask check
  reads `save_dung_info[roomId] & mask`; an overworld check reads `save_ow_event_info[owScreen] &
  mask`; `bufferIndex` indexes the progress flags buffer. `flagType`, `flagMask`, `itemId` (the
  native receive index), `spriteType` and `postGfx` describe an NPC's trigger and how it looks once
  done. `room` and `owWorld` tell apart an NPC sprite type that spawns in several places. `roomFlag`
  is an NPC whose completion is a chest open bit. `eventBit` indexes the event ledger
  (core/game-hooks/events/event_ids.h), for events the game never records itself.
- `shopSeam` is where the port arms a shop substitution, never a completion flag: the game records
  nothing for a bought shelf item. Four dark world doors share entrance 0x60 into one shelf room and
  two cave doors share 0x58 into another, so the seam is (room, entrance, overworld area, subtype),
  using `overworld_area_index_exit`, which the game keeps for the whole indoor visit. `null` matches
  anything for a field the earlier ones already decide (core/game-hooks/shop_table.h).
- `CheckShop.slot` is the slot's index across every shop: the index of its sold counter in the save
  block (`SRM_SHOP_SOLD`) and the order the sequential mode opens slots. It is append only, so a
  stored placement keeps naming the same slots. `position` is also the order the game spawns the
  sprites. Each `seam` kind has its own sprites, purchase gesture and call site.
- `CheckPond.ladder`: the capacity pond sells one ladder per answer (bombs and arrows climb seven
  purchases each), so its slot is rung 1 of that ladder; other ponds sell plain prizes.
- `Requirement` is the one requirement type. Leaves are ids, never names: an item, a check (events
  are checks), or a count of an item group. `impossible` is a gate that can never open (an unmapped
  save and quit spawn).
- `PresenceCondition` decides whether an NPC is there at the current progress. The story status
  leaves come from `WasmGetStoryStatusBytes` (core/game-hooks/story_status.c) and read false when
  the snapshot has none.
- `regionId` cannot be derived from `screenId`: the partition splits some rooms into wings, and
  sixteen regions have no screen of their own. A row that stands for no place carries none.
- `subArea`: the part of a dungeon a row is named after ("Sewers"); an empty string means no
  prefix (the sanctuary, a boss fight); absent means the dungeon's name.
- `scope` says which switch makes a row a location of the seed. With the switch off, the row is
  locked with its vanilla item. `key-drop` rows exist only under that option, `capacity` rows only
  while their family is not vanilla, and `fixed` is a real pickup no seed ever fills. A row without
  a scope is decided by its kind (randomizer/world/seed-locations.ts).
- `isGuaranteedReward` marks a virtual location with no vanilla item that still hands over a real
  one, so an empty `vanillaItemIds` is not read as "no reward".
- `derived` is a combined event, evaluated after the native sweep in record order, so it may only
  name earlier records. `fallback` is what a plain file answers from when the game keeps no flag.
  `now` is the live side of a reversible event, shown as a status and never unticking the row.
  `statusOnly` rows have no "ever" fact. `derivedDungeon` completes when every record of a dungeon
  of the listed kinds, or with the tag, is complete. `visualNote` and `sourceFunc` are
  documentation only.

### types/connection

- `holeIndex` is which of the cartridge's 19 `kFallHole_*` slots a hole or landing is. A hole two
  tiles tall fills two slots sharing one entrance id; the record carries the lowest.
- Every feature is stamped by a map16 room object, so a rect is at least one 16px block (`w` and
  `h` of 2 or more base tiles). `rect` is the bounding box of `tiles`, kept for cheap hit testing.
  `tiles` lists every base tile of the point, contiguous: a cliff that splits a border into two
  gaps makes two points. `layer` is BG1 or BG2; indoors a door and the stair under it can share
  tiles.
- One record sits on one screen. `toConnectionId` is always present: every crossing registers both
  ends, even one way ones, and a landing is a `drop` naming its `hole`. `canExit` is false for a
  receive only point; a crossing is two way when both ends can exit.
- `gatedBy` is the mechanism actor; what the player needs goes in `requirements`. `gameId` is absent
  on connections derived from the flood. Tags carry no direction; it comes from `canExit`.

### types/dungeon

- `smallKeyCount` is the number of small keys with every key drop shuffled; with drops off, one key
  per drop location stays out of the pool. A missing big key, map or compass is `null`.
- `fileStem` names the folder of the dungeon's screen and connection records, so a destination
  path comes from the id and a rename never moves a file.
- The first castle has no boss; the two tower dungeons have no prize. `bossActorId` is what a
  defeat rule is looked up by (rules/tables/bosses.data.ts).
- The order of `regionIds` matters: it is the order the reference creates the regions in, and the
  fill's prefill pushes the dungeon's restricted items in that order, so reordering moves items.

### types/enumeration and types/review

- An enumeration category labels a closed set of values that stay plain literals on their records.
  `progress-tier` never becomes a generated union, because the field it labels holds a number.
- A review mark records what a person looked at and how, on the record itself. It gates nothing.
  A record with no mark reads as untouched, so an `untouched` mark is never written. `source` is who
  looked: a person in the inspector, the cartridge check, or the running game.

### types/item

- `receiveItemId` is the native `Link_ReceiveItem` index; synthetic items (pendants, crystals,
  events) have none. `tier` is the progression level of swords, shields, gloves and mail.
- `poolClass` absent reads as filler, which is what the reference means by listing only the first
  two.
- `spendsMeter`: every use costs magic, so on the empty meter rung owning it grants nothing (the
  collection state reports it absent). A meter upgrade never carries it.
- `aliasOf` is what a chest pays instead of an item already held (`kReceiveItemAlternates`): the
  lamp pays 5 rupees, the blue boomerang 10 arrows, the red boomerang 300 rupees. Only chests swap.
  `sharesSlotWith` lists items in the same inventory slot, which count as held for the swap, and
  `usualChestId` is the chest a normal file takes the item from first.

### types/region, types/screen, types/tag, types/item-group, types/inventory

- An area is a broad zone, a location one structure or landmark inside one area, and a region what
  a player can walk without asking for anything (one level of a mountain, one side of a ledge, one
  wing of a dungeon). Regions are transcribed from the reference generator's four taxonomies, in
  its order and with its names.
- Membership is not on the region: a screen points up with `regionId`. `headScreenId` is the area
  head the game records the region's area events on. `bounds` is a pixel box on one overworld
  screen. `bunnyImpassable` marks a multi entrance interior the bunny cannot cross.
- A screen sits in one world; `both` exists only for areas. `gameId.entranceId` (RAM $010E) tells
  apart rooms that share an index; `palaceIndex` comes from `cur_palace_index_x2`.
- A screen's `regionId` is absent for a variant of another screen and for the places the reference
  splits differently (tests/game/data/regions.keep.test.ts lists them).
- `variant.progressTier` (one tier or an inclusive range) must agree with a `progress` condition;
  `screenBlockers` refuses a screen where they disagree.
- `triggerIds` are the room header's tag mechanics, joined to trigger actors by `roomTag`. `spawns`
  come from the per room sprite table.
- A tag reads `namespace:value`. `name` repeats the two joined because it is the string the app
  matches on and it keeps the collection searchable on disk; a test keeps the three in step.
- An item group is what a count requirement counts against.
- An inventory slot's `trackerItemIds` are checked in order; the first one held wins.

## Receive ids (the folders named `*-receive-id`, `capacity-*`, `wallet-jump-table`)

These are the TS half of contracts in `core/game-hooks/`. The grant tables of the game hold 76
entries, so 0x00 to 0x4B are the only native receive ids: the chest path also treats a high bit id
as its "did not open" sentinel, and the direct grant export refuses anything past 0x4B. Every id a
resolver hands to an override or a delivery must pass `isNativeReceiveId`, or be one of the virtual
ranges below, which the core resolves at every substitution and receipt seam.

| Ids | What | Contract |
| --- | --- | --- |
| 0x50 to 0x57 | explosives upgrade, jump of 1 to 8 tiers | upgrade_grants.c |
| 0x58 to 0x5F | projectiles upgrade, jump of 1 to 8 tiers | upgrade_grants.c |
| 0x60 to 0x61 | magic meter upgrade, jump of 1 or 2 levels | upgrade_grants.c |
| 0x62 to 0x66 | progressive sword, shield, glove, mail, bow | progressive_grants.c |
| 0x67 to 0x76 | wallet, slots 0 to 15 of the session's jump table | wallet_grants.c |
| 0x77 to 0x7A | progressive capacity, one per family | capacity_progressive.c |
| 0x7B to 0x81 | crystals 1 to 7 | prize_grants.c |
| 0x82 | progressive ocarina | progressive_grants.c |
| 0xC0 to 0xFD | dungeon items, targeted at a palace | dungeon_item_ids.h |

- The capacity upgrades have no native id: their vanilla grants are silent counter bumps inside
  scripted handlers. A virtual id is grantable through every override table and the receipt export,
  but it is not a native id, so keep the two guards apart where it matters.
- The step families carry the jump in the id (a jump never exceeds their eight rungs). The wallet's
  100 rupee ladder needs jumps up to 100, so its sixteen ids are slots into a per session table of
  jump sizes. The table is the sorted distinct jumps of the pool, so the host, the receipt export
  and the core always rebuild the same one. A partition of 100 has at most 13 distinct sizes
  (1 + 2 + ... + 13 = 91), so sixteen slots are enough.
- The progressive equipment ids exist because the native receive routine sets a tier instead of
  raising it, so a copy resolved to a fixed native id would set the same tier every time. The core
  maps the id to the next tier's native id from the live inventory at the last moment; past the top
  tier it hands over the reference randomizer's replacement, twenty rupees. The ocarina came after
  0x62 to 0x66 had filled, so it takes 0x82, the first free id above the crystals.
- A progressive capacity id carries no jump: the core climbs to the next planned rung from the save
  bytes, and the plan is armed per session (capacity-session.ts). The family order is explosives,
  projectiles, meter, wallet.
- Pendants need nothing special: each has its own native id and a fixed bit. All seven crystals
  share native id 0x20 and the room decides which bit banks, so a crystal placed elsewhere would bank
  the wrong one. The crystal ids carry the crystal; the core banks it and hands the receive flow
  0x20. `VANILLA_PRIZE_GRANT_ID_BY_NAME` is the id a boss hands over, which is what a substitution
  table matches on.
- Dungeon items: every small key shares one native id (36), as does every big key (50), map (51)
  and compass (37), and the native grant credits the dungeon the player stands in. So the target
  travels in the id, the one channel every delivery shares: `0xC0 | kind << 4 | palace`, with kind 0
  small key, 1 big key, 2 map, 3 compass, and the palace index halved (the dataset stores it doubled,
  as the core does). The guard is pure arithmetic with no dataset import, because the record facade
  is built on these id modules; resolving a name needs the records and lives in
  `dungeon-item-target`.
- `dungeon-item-target`: a family is whatever carries one of the four native ids, and its target is
  the dungeon its own `dungeonId` names. No name parsing, so a renamed record still resolves; the
  universal key has no dungeon and so no target.
- Capacity names: the reference randomizer names a jump of one tier, two tiers and the whole span,
  and the two meter levels; the other jump sizes are this app's names in the same shape. Index is
  jump minus 1. Wallet names carry the rupee value of the jump (100 per step, the first rung is 99).
  A progressive plan ships one name per family, with no jump in it.
- The capacity families are explosives and projectiles (an eight tier native grid each), the meter
  (three levels) and the wallet (a hook owned 100 rupee ladder). Everything is keyed by the family
  id, never by a game name.

## Sounds and music (ambient-reach, game-sounds, sound-names, msu-*)

- The ambient channel is one byte, but only twelve ids are ever written: exactly 12 appear as
  literals in `core/zelda3/src` (0x01 to 0x17, odd ids only, counting the two raised through
  `SpriteSfx_QueueSfx1WithPan`); the only other writer is `overworld_music[...] >> 4`, a four bit
  nibble; and `Ancilla_Sfx1_Pan` is dead code. A `bed` starts a loop, the one `control` id clears the
  bed (silence), and a `cue` is a one off stinger.
- `game-sounds.data.ts` is transcribed from the decompilation and can be regenerated. The id is the
  low 6 bits of the channel write (bits 6 and 7 carry stereo pan). `triggers` are the functions that
  raise the sound, busiest first, and `sites` how many call sites do. A pack replaces a sound by
  claiming its id; anything unclaimed plays from the chip. Channel ports: ambient APUI01, sfx1
  APUI02, sfx2 APUI03. The names are not derivable, so they live in the sound name records and are
  merged in on read; a sound with no name shows the function that raises it.
- `msu-deluxe-remap`: Deluxe packs redirect a vanilla slot reused in many places to a per area or
  per entrance track (37 and up), so the remap needs the track and the area or entrance. Port
  of the core's `RemapMsuDeluxeTrack`. `TRACK_REMAP_KIND` per slot: 0 keep, 1 by overworld area, 2
  by entrance. 242 in `ENTRANCE_TRACKS` means no replacement. `DELUXE_TRACKS` is derived from the
  tables: a number neither table names can never play.
- `msu-track-repeat`: fanfares and stings play once, music loops. A classic MSU-1 pack has no per
  track metadata, so this table is the only source; tracks past it (the Deluxe range) loop.
- `msu-track-names`: only the names are records. The panel counts the vanilla range itself, so a
  slot with no name still shows, as its number.
- `palace-names`: the palace labels are a keyed table, not a list of records, so they are picked by
  name; a palace index with no label answers with the raw index.

## sprite-manifest/

- `definitions.json` pairs each sprite's label with the ROM tile offsets it is cut from, so it is
  game derived and lives in the private companion repo. Without it there is nothing to extract, the
  same state as a user with no ROM. The schema beside it describes the shape, so it stays here.
- Our own definitions (capacity composites, recoloured gems, drawn art, ground tiles) ride on the
  extracted set: they need it or are only ever extracted with it, so with no definitions the whole
  list stays empty and a set never appears half there.
- `SPRITE_BOX_BY_FILE` gives each sprite its real box by default (`intrinsic-size.ts` reads it).
  `boxForExtract` derives the box from the same recipe the extractor reads: a single tile 8x8, a run
  of tiles 8px per tile (cropped to `width`), an unpaired dialogue glyph 8x16 (the decoder's own
  `GLYPH_W` and `GLYPH_H`, kept by hand to keep ROM decoding out of this module). Every other method
  yields the default 16x16, so it returns nothing.
- `dialog-sprites.ts`: the message box frame is three tiles (`kText_BorderTiles`, messaging.c): a
  corner, a horizontal and a vertical edge, on BG3 palette 2 (palette in bits 10 to 12, as every HUD
  tile). The other corners and edges are flips.
- `ground-tiles.ts`: surfaces the HUD layout preview tiles under the HUD, because "invisible against
  its surface" is the defect it exists to catch: turf, indoor floor, sand, shallow and deep water.
  Each is a real map block cut with `bg-tile`: the eight background sheets its screen loads, the four
  tilemap words, the palette selection (main mode, then aux 1 to 3), and `upper`, the sheets widened
  into the upper half of their palette row.
- `hud-wallet.ts`: the game draws the rupee counter as a bare number, so the wallet picture is our
  own 16x16 drawing. Its capacity variants belong to the randomizer.
- `pool-sprites.ts`: each multiworld game's icon is our drawing with the Archipelago badge stamped
  bottom right (`art-badge`), so the drawings stay usable unbadged. The fallback is the Archipelago
  mark itself and carries no badge. A Link to the Past has no icon: played here it is our own world,
  and someone else's copy falls back to the mark.
- `pool-game-icons`: lookup drops case and punctuation, so spellings like "Link's Awakening DX"
  match without loose matching. An unknown name falls back to the Archipelago mark, so a mistake
  here costs a generic icon, never a broken one. Ship of Harkinian and 2 Ship 2 Harkinian are the PC
  ports of Ocarina of Time and Majora's Mask.
- `randomizer-sprites.ts`: items this app invented have nothing in the ROM to cut, so they are our
  drawings; file names match the item's sprite id without the `sprite-` prefix. The price symbols
  follow the order the in-game binary holds them.
- `rupee-sprites.ts`: purple, silver and gold gems recoloured from the plain green receipt gem
  (`palette-swap`), using the pairs the core's coloured gem swap paints (rupee_gem_draw.c): the violet
  pair of sprite palette row 4, the grey pair of row 1, the gold pair of row 4 (the magic jar's gold).
- `rupee-gem-files`: the app always shows the numberless gem in its denomination's colour for a rupee
  reward, since the numbered art is unreadable at icon size. These are app surfaces, so they do not
  follow the in-game gate (`kFeatures3_ColoredRupees`). 0x34 is 1, 0x35 5, 0x36 and 0x47 20, 0x41 50,
  0x40 100, 0x46 300. The sprite query reads this table before a record's own sprite.
- `title-sprites.ts`: the title screen pictures (logo, sword, triforce, background) and the four
  story legend pictures, each extracted whole from the ROM.
- `upgrade-sprites.ts`: one capacity upgrade sprite per family, an existing sprite or drawing with the
  up arrow badge stamped bottom right (`upgrade-composite`).
- `picture-glyph-sprites`: the dialogue alphabet mixes letters with picture characters written as a
  bracket run. This maps a base alphabet token to the sprite cut for it, derived from the manifest
  and the alphabet so the two cannot drift. A sprite holding two halves draws on `first` and skips
  `second`. A localized alphabet that splits a picture differently resolves to nothing and falls
  back to text.

## dialogue-context/

What opens each dialogue entry, and for a prompt, where its options lead.

### Index convention

- Ids are 1 based over the normalized 397 entry array, the `DialogueLine.id` the editor shows. The
  core's own counter (`dialogue_message_index`) is 0 based over the same array: id equals that index
  plus 1.
- A ROM that decodes to 396 strings is missing one that is really there; the pipeline puts it back
  at array position 4 (`normalizeTexts`) before packing the blob the core reads. So the core always
  indexes the 397 entry array, and every number here was read off it.
- Proven against an independently decoded 397 string ROM: position 4 (id 5) is the very string the
  pipeline injects; misc.c 586 picks 0x184, or 0x185 once an upgrade is held, which are ids 389 and
  390, the two and three option forms of the start location prompt; messaging.c 2648, 2720, 2742 and
  2762 swap in the caret only overlays at ids 2 to 3, 7 to 9, 10 to 11 and 12 to 13. Spot checks:
  index 3 is the post death save menu (id 4), 0x7A the locked door notice (id 123), 123 the out of
  power notice (id 124).
- Ids 1 (the empty leading string), 5 (the control string no call site names), 39 and 40 (call
  path not found) have no context; `contextFor` returns null for them.

### Triggers and choices

- `DialogueTrigger`: `talk` (a character, on contact or when spoken to), `sign` (a placed marker),
  `telepathy` (remote speech from a floor marker), `item-get` (while a pickup is held overhead),
  `menu`, `cutscene`, `system` (a game rule), `choice-cursor`, `unknown` (no evidence, left
  unlabelled on purpose).
- `choice-cursor` entries are not prose: they are caret only overlays the prompt renderer swaps in
  to redraw the selection. They are never shown alone, and their layout must survive translation.
- The renderer's arithmetic (`dialogue_message_index = t + 1` and the like) only swaps in a cursor
  overlay. The real outcome is decided by the caller, which reads `choice_in_multiselect_box` and
  opens its own message; `choices.ts` records those branches. `outcomes` is sparse: an option whose
  branch opens nothing is absent, and an option that opens different messages by game state has one
  row per branch, each with its `when`. `option` counts from 0, top to bottom.
- `table-groups.ts` holds entries whose trigger comes from a lookup table (the per area sign table
  `kOverworld_SignText`, the per room telepathy table `kDungeonRoomTeleMsg`, the receipt message
  tables); `site-groups.ts` pins entries to single lines of the core, as entry id and line pairs.

### Trigger sources (trigger-source.ts)

- Which concrete key opens each entry, so an editor can show who says it. `kSpriteActiveRoutines`
  and `kSpritePrep_Main` (sprite_main.c 466 and 714) are function pointer arrays indexed by the
  sprite type byte, so they are the type to handler join. Every write to the message index was
  collected (direct writes and the five helpers in sprite.c), each expression resolved to its
  constants, and each site attributed to the types whose handler reaches it.
- Two rules narrow a shared handler: a handler that passes one type straight to another routine
  and returns is not that type's source, and a routine gated by a single type test belongs to that
  type alone.
- The other rows come from lookup tables: the receipt tables (ancilla.c), the per area marker and
  per room telepathy tables (in the extracted asset blob), and the follower tables (tagalong.c).
- Precedence: nine entries have two true sources because the game reuses one string in two
  mechanisms. A row keeps one, in this order: cursor overlay, item, place, room, follower, actor,
  engine. Table keyed sources come first because their key is exact.
- `areaId`, `roomId` and `itemId` name the lowest area, room or receipt index carrying the entry.
- For an `actor` row, `alsoTypes` lists other types that can open the same entry, and `actorId` is
  the dataset record for `spriteType`, or null when none covers that type yet.
- Ids 1 and 5 have no row.

## player-sheet/

- A player sheet is 0x7000 bytes of 4bpp tiles (16 columns by 56 rows, 896 tiles) holding every
  pose, plus a palette in two layers: `original` (as imported, or the stock colours) and `override`
  (a sparse diff of edits). Reverting drops the diff, so an edit never destroys what it replaced.
- `PlayerSprite_Apply` (core/game-hooks/player_sprite.c) reads four outfits of 15 colours (pixel
  indices 1 to 15; 0 is transparent) and then two glove colours. The stock asset's fifth outfit is
  the flash palette used while zapped; no sheet format carries it.
- `bunny` is its own art; the other three outfits are recolours. A glove level of 1 or 2 picks one
  of the two glove colours, and the glove colour lands on row entry 13 (CGRAM 0xFD in the core).
- `authorShort` is a third string in the file, the short ASCII credit; `basedOn` credits the
  Hookshop original of an installed copy.
- `STOCK_GLOVES` is the literal `kGlovesColor` (load_gfx.c), not an extracted asset. A sheet with no
  glove words falls back to it, as `PlayerSprite_Apply` does.

## pause-names/default-names.ts

- The seed name table for the pause menu: the English strings, keyed to item records so a language
  set can retitle them. Item keys are `<item record id>-<tier>`, tier counting from 1 (the base
  pickup). Multi word names are one space joined string; line breaks are decided at render time.

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
