<!-- @layer docs @kind doc -->
# Code notes: packages/game-data

Facts about `packages/game-data` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/game-data/data/msu-track-names.json (package root)

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
- The file is JSON, typed where it is read (`msu-track-names.constants.ts`).

## packages/game-data/src/controls/bindings/bindings.type.ts

- `DeviceFamily` selects the controller icon set.
- `InputApi` says which API a controller uses for button and axis reading. `hid` is decoded state through SDL3, for every gamepad on every platform that has SDL3 (desktop only; see the platform hosts). `webapi` is the keyboard's own DOM key events.
- `KeyboardBinding.code` is a `KeyboardEvent.code` such as `KeyZ` or `ArrowUp`; `label` is a display override such as `Z`.
- `GamepadButtonBinding.index` is a Standard Gamepad button index (0 to 16). `GamepadAxisBinding.axisIndex` runs 0 to 3.
- `ButtonIcon.key` is an icon id such as `xbox-a`, `ps-cross`, `switch-b`. `path` is the asset path, or null until icons are provided. `label` is the text fallback.
- `ButtonMapping.icon` null means no icon is shown and the layout is unchanged. `sourceVid` and `sourcePid` are the VID and PID of the device that created the binding, used for icon resolution.

## packages/game-data/src/controls/scheme/scheme.type.ts

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

## packages/game-data/src/controls/snes/snes.constants.ts

- `SNES_BUTTON_BITS` are the bitmask positions matching `g_input1_state` in emscripten_main.c.
- `SNES_BUTTON_LABELS` are the button names in the Nintendo layout. `SNES_ACTION_LABELS` say what each button does in game.

## packages/game-data/src/data/ (generated files)

The files below are written by a script. Never edit one by hand: change its source and run
the script again. A generated file carries the gate's `@layer`/`@kind` header and no other
comment, so what it comes from is written here. Its name follows the structure rules like any
other file: tables are `*.constants.ts`, unions are `*.type.ts`.

- `records/checks/events/event-bits.constants.ts`, from the `EventId` enum in
  `core/game-hooks/events/event_ids.h` (the event ledger's bit order), by
  `pnpm run generate` (`tooling/generate-from-records/generate-from-records.mjs`). The order is frozen, so these
  numbers are save file facts. A new event is appended at the end of the header, never
  inserted. The boss killed and prize taken runs are arrays indexed by the palace index, the
  Skull Woods front entrances by entrance number. `LAST_EVENT_BIT` is the entry before
  `kEventCount`, the highest bit the core's list holds.
- `taxonomy/screen-tags.constants.ts` and `screen-tags.type.ts`, from every tag record that
  applies to a screen, by the same script. This is our own vocabulary for sorting screens, not
  a game value. A screen's tags are read through `tags/screen-tag-keys-of.ts`.
- `taxonomy/connection-tags.constants.ts` and `connection-tags.type.ts`, from every tag record that
  applies to a connection. Direction is read off `canExit` (`packages/game-data/src/data/connections/derive`), so the
  retired `dir:one-way` and `dir:two-way` terms have no replacement here.
- `taxonomy/check-content-tags.constants.ts` and `check-content-tags.type.ts`, from every tag record
  that applies to a check. A check's content is the one check tag family no other record
  states, so it is stored and not recomputed on every read.
- `enumeration/enumeration.type.ts`, one union per category of `ALL_ENUMERATION`
  (`records/enumeration/enumeration.ts`), by `pnpm run generate:enum-types`
  (`tooling/generate-enum-types/generate-enum-types.mjs`). The dev editor's enumeration writer runs it after
  every write.

`pnpm run generate:check` writes nothing and fails on a file that differs from a fresh run;
`apps/desktop/tests/game/data/generated-mirrors.keep.test.ts` runs it, and
`tooling/generate-enum-types/tests/enumeration-generated-types.keep.test.ts` does the same for the unions.

The same script splices one C table, `kVanillaPrizeItem` in `core/game-hooks/prize_presentation.c`,
between a pair of `generated: begin` and `generated: end` block comments, in the file's own line
ending, and leaves the hand C around it alone. Four tables are not generated, because no record
holds what they state; each is a record gap first:

- `core/game-hooks/events/event_areas.h`: 22 of its 56 head rows are the extra area heads a large dark world
  region covers, which no record lists, and 13 of its 19 entrance rows need an `overworldIndex`
  that 56 overworld screens do not carry.
- `kSubstitutionBits` in `npc_overrides.c`: the (byte, mask) allocation is a save layout fact
  owned by `save_bytes.h`, and three of its keys are ids no game value backs.
- `inventory-layouts/*.ts`: a slot needs a save slot, a display name and one icon for the whole
  tier family, and an item record carries none of the three.
- `records/native-tables/*.ts`: these transcribe the decompilation's switch statements and display
  words, not a byte table in the cartridge, so there is no address to read them from.

## packages/game-data/src/data/ (registry, bootstrap, facade, indexes, session-records)

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

## packages/game-data/src/data/ (loaders, lookups and relationships)

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

## packages/game-data/src/data/ (the receive id folders, the capacity folders and wallet-jump-table)

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
  bytes, and the plan is armed per session (apps/desktop/src/game/randomizer-client/capacity-session). The family order is explosives,
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

## packages/game-data/src/data/ (sounds and music: ambient-reach, game-sounds, sound-names and the msu files)

- The ambient channel is one byte, but only twelve ids are ever written: exactly 12 appear as
  literals in `core/zelda3/src` (0x01 to 0x17, odd ids only, counting the two raised through
  `SpriteSfx_QueueSfx1WithPan`); the only other writer is `overworld_music[...] >> 4`, a four bit
  nibble; and `Ancilla_Sfx1_Pan` is dead code. A `bed` starts a loop, the one `control` id clears the
  bed (silence), and a `cue` is a one off stinger.
- `game-sounds.constants.ts` is transcribed from the decompilation and can be regenerated. The id is the
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

## packages/game-data/src/data/checks/ and packages/game-data/src/data/records/checks/events/

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
- `event-screens.constants.ts` and `event-regions.constants.ts` are generated: the screen each event lists
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

## packages/game-data/src/data/dialogue-context/

What opens each dialogue entry, and for a prompt, where its options lead.

### Index convention

- Ids are 1 based over the normalized 397 entry array, the `DialogueLine.id` the editor shows. The
  core's own counter (`dialogue_message_index`) is 0 based over the same array: id equals that index
  plus 1.
- A ROM that decodes to 396 strings is missing one that the ROM holds; the pipeline puts it back
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

## packages/game-data/src/data/native-tables/player-pose-atlas.type.ts

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

## packages/game-data/src/data/native-tables/player-state-labels/

- The decompilation numbers the player actions but never names them. Each label was read off the
  branch in `LinkOam_Main` that selects the id, and `from` quotes that condition so a label can be
  checked. Frame counts come from the atlas.
- Actions 0x01 and 0x28 and up never appear: 0x08 aliases 0x01's frame range in the offset table,
  and the table stops at 40. An action the list lacks still renders, labelled by its id.

## packages/game-data/src/data/player-sheet/

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

## packages/game-data/src/data/record-codegen/

- Turns a record into TypeScript source for the dev editor's write path. The input is a real record,
  so an emitted literal cannot carry a stale shape. Each kind's field order list is checked against
  `keyof` at compile time, so a field added to a record shape is a build error until the order lists
  it, and an unknown key throws instead of being dropped.
- Output matches the committed files: one field per line, nested values on one line while they fit
  the 118 column width the files were written at. `review` is always last, a footer under the facts.
- A pending record has no id yet; the allocator adds it. Tags and item groups are only ever replaced
  in place, never minted by this path.

## packages/game-data/src/data/record-file-targets/

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
- A screen with no real area, or a `special` interior, files under `interiors/special.ts` of its world. A connection
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

## packages/game-data/src/data/records/actors/bosses.ts

- Sprite type 0x09 is the giant Moldorm, the mountain tower's boss. Sprite type 0x18 is the small
  common Moldorm. Upstream's sprite name table has the two swapped; the decompilation's function
  names settle it, and room 51 is a boss room in `kBossRooms`.
- Trinexx has three heads: 0xCB is the rock head, 0xCC the fire head (it adds the fire garnish), and
  0xCD the ice head, by elimination.

## packages/game-data/src/data/records/actors/enemies.ts

- Sprite type 0x24 runs the same handler as 0x23: the blue Bari is a color variant of the red one.
- Sprite type 0x5C runs the same handler as 0x5B: it is the counter clockwise spark.
- Sprite type 0x80 is the common fire snake, a different enemy from the Lanmola boss (0x54).
- Sprite type 0x17 is the hoarder, a crab hiding under a rock that drops rupees.
- Sprite type 0x8D is the fuzzball Arrghus throws.
- Sprite type 0xAA, the Pikit, steals items.
- Hardhat Beetle (0x26), Deadrock (0x27), the yellow Stalfos (0x85), Pengator (0x99) and Medusa
  (0xC5) hurt the player, so they are enemies even though they look like scenery.

## packages/game-data/src/data/records/actors/npcs.ts

- Sprite type 0xB7, the blind maiden, is the Thieves' Town boss in disguise.

## packages/game-data/src/data/records/actors/objects.ts

- Sprite type 0x7F has no decompiled name. It is taken as the counter clockwise fire bar because
  0x7E is the clockwise one.
- Sprite type 0x95 is named `LaserEyeLeft` in the decompilation. The direction labels of the laser
  eyes were never checked one by one.
- Sprite type 0xB4 is the purple chest as a prop. The merchant who unlocks it is a different
  sprite (0x39, the locksmith).

## packages/game-data/src/data/records/actors/obstacles.ts

- The hammer peg tiles (sub index 150 and 189) answer only when the hammer is in hand
  (`HandleItemTileAction_Dungeon` in player.c). That is why both are cleared by the hammer.

## packages/game-data/src/data/records/actors/triggers.ts

- Room tags 0x01 to 0x13 are one full "clear the room" cycle of `kDungTagroutines` (seven quadrant
  gates, the quadrant trigger, the room trigger), and the table repeats it at 0x29 to 0x32.
- A repeat runs the same handler, but the raw tag is 0x29 or higher, so `RoomTag_QuadrantTrigger`
  and `RoomTag_RoomTrigger` reveal a chest there instead of opening a trapdoor. Tags 41, 42, 43 and
  50 occur in real rooms, so each has its own record: `roomTag` holds one number, never a set.
- The cell lock (object sub index 24) is drawn and tracked like a chest, but through
  `dung_num_bigkey_locks_x2`, the counter the big key unlock checks. It appears only in Zelda's cell
  in Hyrule Castle, so the big key that clears it is that dungeon's.

## packages/game-data/src/data/records/checks/ (item checks)

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

## packages/game-data/src/data/records/dungeons/

- The two Agahnim fights (castle tower and Ganon's Tower) grant no item. Their boss check is the
  ledger's "Agahnim beaten" event, and both use the same actor, so they share one defeat rule.
- Trinexx is three actors. The dungeon names the rock head, the form the fight opens as.

## packages/game-data/src/data/records/enumeration/enumeration.ts

- One row per value of each closed label category. The record fields these describe stay plain
  literals; this is a label source, never a foreign key.
- `tooling/generate-enum-types/generate-enum-types.mjs` loads this file with Node's own type stripping and no bundler,
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
  `CATEGORY_TYPE_NAMES`. `packages/game-data/src/logic/queries/progress-tier` says what each tier means.
- `review-status` is the status of a record's own review mark. Every collection carries one and
  nothing gates on it.

## packages/game-data/src/data/records/item-groups/item-groups.ts

- The groups are what a count requirement (`{ count: { groupId, n } }`) counts against.
- The crystal and pendant members are the items the dungeon prize checks grant, never the unused
  duplicates in the junk table.

## packages/game-data/src/data/records/items/

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

## packages/game-data/src/data/records/items/randomizer.ts

- JS side chest item override hooks that talk to the WASM core.
- `messageId` is the pre rendered contextual receipt line for the grant (session dialogue), or -1 to keep the core's item class template fallback.
- The chest path bails on high bit ids and the grant tables hold 76 entries, so an out of range override would open as an empty chest. It is refused before the call.
- kFeatures3_ItemOverrides is armed alongside writing the table. The write itself is ungated (it only records, see item_overrides.c), but the gate must be requested then so it has latched into WRAM (SyncGateWords, next frame) by the time a chest applies the table. It stays open only while the table has entries (itemOverridesActive in packages/game-core/src/live-settings-flags), so no leftover table can reapply outside an active randomizer session.
- Clearing empties the table, then closes the gate. Closing the gate keeps it from reopening for stale data if something else fills the table without going through setChestSlotOverride.

## packages/game-data/src/data/records/names/palaces.ts

- Keyed by the raw value at RAM $040C (`cur_palace_index_x2`), which is doubled because the game's
  dungeon tables are indexed by that value shifted right once. Caves and houses report 0xFF.
- These are display labels only. `dungeonForPalaceIndex` resolves a palace index to a dungeon.

## packages/game-data/src/data/records/names/sounds.ts

- Names come from the community RAM map of the sound queue registers ($7E012D to $7E012F), checked
  against the call sites in the decompiled source. Where the two disagreed the call sites won.
- sfx1 0x3C is the refusal noise played when an item use is denied.
- The ambient channel stops at 0x17: the game raises twelve ids there as literals, and its only other
  route to that port is a four bit nibble from the overworld music table.
- The file has no type import: the loader (`packages/game-data/src/data/sound-names`) casts it where it is read.

## packages/game-data/src/data/records/native-tables/

The native tile tables transcribe the original engine. `native-tables/index.ts` reads every export
of `records/native-tables/` by name (`pickNativeTable`), since the folder holds about twenty
differently shaped tables, not one collection. Export names are unique across the folder. Every
table is keyed by byte, so a missing table falls back to an empty one, which takes the same miss
path as an absent entry. `hasNativeTables` says whether the tables are there at all.

### Tile behavior and tile visual

- `tile-behavior.ts` and `tile-visual.ts` (with their structure halves, `tile-behavior-structures.ts` and `tile-visual-structures.ts`) are lists of groups.
  One group is one `case` group of `TileDetect_ExecuteInner` (tile_detect.c, lines 261 to 525), so
  the list can be diffed against the C by eye and no entry claims a distinction the engine does not
  make. `{ from, to }` is a run the engine writes as one long case run. `buildAttrMaps` turns the
  groups into the outdoor map and the indoor map.
- The dispatcher's only context input is `is_indoors`, so the two maps are the complete keying: no
  palace, theme or entrance matters. A group carries an `interior` value only where the switch
  branches on that flag. Seven of its eight such branches change the class (C lines 271,
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

## packages/game-data/src/data/records/native-tables/ (other tables)

- `door-barriers.ts`: door kind to barrier tag, for the recorder's dataset suggestions. `null` means
  no barrier (a normal door, or a trap door the simulator does not model).
- `game-enums.ts`: display names over the engine's own enumerations, one to one with upstream's
  `kEffectNames` and `kCollisionNames`. There is no room kind map: the game has no cave or house
  field. `MANIPULABLE_NAMES` keys are `dung_replacement_tile_state` values for the 0x70 to 0x7F
  family.
- `room-tags.ts`: names indexed like `kDungTagroutines` (0x00 to 0x3F). Unnamed stubs are left out
  and shown as hex. 0x01 to 0x13 (the clear the room family) are handled by the simulator's accessor.

## packages/game-data/src/data/records/native-tables/cliff-attrs.ts

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

## packages/game-data/src/data/records/native-tables/tile-attrs.ts

- `OVERWORLD_TILE_ATTRS` is the navigation map outdoor screens read; `INTERIOR_ATTRS` lays the
  indoor overrides of `TileDetect_ExecuteInner` over it. The accessors live in
  `packages/navigation/src/pathfinding/overworld-attrs.ts` and `packages/game-data/src/data/native-tables/tile-tables.constants.ts`.
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

One tile attribute map is the single source for collision, item requirements, labels and categories. The tables live in `data/native-tables` (`OVERWORLD_TILE_ATTRS`, `INTERIOR_ATTRS`); this folder derives helpers from them.

- `tileAttrsFor`: the engine's own tile dispatcher (`TileDetect_ExecuteInner`, `core/zelda3/src/tile_detect.c`) branches on one `is_indoors` bool. House, cave and dungeon interiors all read the same table, so indoors or not is all a caller has to say.
- `TILE_ATTRS` is the same table as `OVERWORLD_TILE_ATTRS`, kept for older callers; new code uses `OVERWORLD_TILE_ATTRS`.
- `isDoorPassageAttr`: a door threshold Link can walk through. Plain passages are 0x80 to 0x8D and the layer toggle shutters 0x90 to 0xAF. Neither is floor, but both are crossable. `isPassableAttr` is floor (0x00) or such a threshold.
- `HOOKSHOT_TARGET_TILES` are the overworld tiles the hookshot grabs, pulling Link to them from range.

## packages/game-data/src/data/records/native-tables/traversal-tokens.ts

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

## packages/game-data/src/data/records/screens/ and packages/game-data/src/data/records/connections/

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

## packages/game-data/src/data/records/tags/tags.ts

- The tags were seeded from the taxonomy tables in namespace order, then declaration order, so the
  numbering is reproducible. A tag added later is appended by the id allocator and lives only here.
- Every tag reads `namespace:value`.

## packages/game-data/src/data/requirements/helpers.ts

- No item record stands for "can use bombs". The first bomb pickup (`item-041`) stands in for it.
- `canSeeInDarkRooms` is a rule of comfort: the game lets a player walk a dark room blind. The
  tracker's resolver swaps this exact object for the lights the file accepts, or for nothing when
  dark rooms are not asked to be lit, so it must stay one shared object. Read on its own it is the
  lamp.
- The medallion rules are the vanilla ones: Misery Mire wants Ether, Turtle Rock wants Quake.

## packages/game-data/src/data/sprite-manifest/

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

## packages/game-data/src/data/types/

Each record shape lives in `types/<name>/<name>.type.ts`, re-exported by the folder's `index.ts`
and by `types/index.ts`. `types/index.ts` also re-exports `SoundNameRecord`, whose shape lives with
its loader, because the vault dataset imports it from there.

## packages/game-data/src/data/types/actor/ and packages/game-data/src/data/types/combat/

- One record kind for every living or interactive entity: enemies, bosses, NPCs, objects,
  obstacles, triggers. "Sprite" is kept for graphics.
- `gameId.spriteType` is the native sprite type byte; `objectSubIndex` the dungeon room object sub
  index (0x18 is the cell lock); `roomTag` the room header tag byte. `clearedBy` is what removes an
  obstacle or opens a lock, the mechanism side of a connection's `gatedBy`.
- Combat facts are read from the game's own tables (sprite.c, ancilla.c): `kSpriteInit_Health`,
  `Flags4`, `enemy_damage_data`, and `kAncilla_Damage[ancillaType]` for a weapon (0x09 is the
  arrow). An `estimated` range, or a `contact` range with `sourced: false`, is flagged, not measured.

## packages/game-data/src/data/types/check/

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
  a scope is decided by its kind (packages/randomizer/src/world/seed-locations.ts).
- `isGuaranteedReward` marks a virtual location with no vanilla item that still hands over a real
  one, so an empty `vanillaItemIds` is not read as "no reward".
- `derived` is a combined event, evaluated after the native sweep in record order, so it may only
  name earlier records. `fallback` is what a plain file answers from when the game keeps no flag.
  `now` is the live side of a reversible event, shown as a status and never unticking the row.
  `statusOnly` rows have no "ever" fact. `derivedDungeon` completes when every record of a dungeon
  of the listed kinds, or with the tag, is complete. `visualNote` and `sourceFunc` are
  documentation only.

## packages/game-data/src/data/types/connection/

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

## packages/game-data/src/data/types/dungeon/

- `smallKeyCount` is the number of small keys with every key drop shuffled; with drops off, one key
  per drop location stays out of the pool. A missing big key, map or compass is `null`.
- `fileStem` names the folder of the dungeon's screen and connection records, so a destination
  path comes from the id and a rename never moves a file.
- The first castle has no boss; the two tower dungeons have no prize. `bossActorId` is what a
  defeat rule is looked up by (packages/randomizer/src/world/rules/tables/bosses/bosses.constants.ts).
- The order of `regionIds` matters: it is the order the reference creates the regions in, and the
  fill's prefill pushes the dungeon's restricted items in that order, so reordering moves items.

## packages/game-data/src/data/types/enumeration/ and packages/game-data/src/data/types/review/

- An enumeration category labels a closed set of values that stay plain literals on their records.
  `progress-tier` never becomes a generated union, because the field it labels holds a number.
- A review mark records what a person looked at and how, on the record itself. It gates nothing.
  A record with no mark reads as untouched, so an `untouched` mark is never written. `source` is who
  looked: a person in the inspector, the cartridge check, or the running game.

## packages/game-data/src/data/types/ids/

- `SpriteId` names an extracted picture, never an entity; anything that acts in the world is an
  actor. `ItemGroupId` (`ig-NNN`) is the leaf of a count requirement. `EnumerationId` is `enum-NNN`.
- `ID_PAD_WIDTH` is 3 and stays 3: every id is already written that way, and a fourth digit would
  give a second spelling of the same number. The connections passed 999 records, so `makeId` lets a
  longer number through unpadded (`padStart` never truncates). Count records with a query, never a
  table of counts.
- `KIND_ID_PREFIXES`: each kind mints under its own name, except `item-group` (`ig`) and
  `enumeration` (`enum`). Read it instead of assuming the kind name.

## packages/game-data/src/data/types/item/

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

## packages/game-data/src/data/types/native-tables/ and packages/game-data/src/data/types/tile-attrs-types/

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

## packages/game-data/src/data/types/region/ and packages/game-data/src/data/types/screen/ and packages/game-data/src/data/types/tag/ and packages/game-data/src/data/types/item-group/ and packages/game-data/src/data/types/inventory/

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
  splits differently (apps/desktop/tests/game/data/regions.keep.test.ts lists them).
- `variant.progressTier` (one tier or an inclusive range) must agree with a `progress` condition;
  `screenBlockers` refuses a screen where they disagree.
- `triggerIds` are the room header's tag mechanics, joined to trigger actors by `roomTag`. `spawns`
  come from the per room sprite table.
- A tag reads `namespace:value`. `name` repeats the two joined because it is the string the app
  matches on and it keeps the collection searchable on disk; a test keeps the three in step.
- An item group is what a count requirement counts against.
- An inventory slot's `trackerItemIds` are checked in order; the first one held wins.

## packages/game-data/src/dialog/box-geometry/

Where the message box sits, in game pixels, from the BG3 word address the engine chose.

The frame is 24 tiles wide and 8 tall: `RenderText_DrawBorderRow` writes 24 entries per row over 8
rows. The text area starts one tile in and one tile down and spans 21 by 6 tiles: three glyph rows
of 16 pixels each, 168 pixels wide. The tilemap is 32 entries per row from word 0x6000, so 0x6125
is column 5, row 9 (the top slot) and 0x6244 is column 4, row 18 (the bottom slot).

- `INK_OPTICAL_OFFSET_Y`: the glyph bitmaps leave more blank rows under their ink than above it,
  so a pixel down evens the look.
- `BoxSizeMode`: `full` keeps the game's frame, `message` sizes it once to the whole message, and
  `fit` follows the rows in use. `BoxPlacement` adds `native`: the game's own frame and text
  origin. A screen the game lays out around the text (a cursor beside each row) needs the text
  where the game drew it, so it takes `native`.
- `BoxLayout.textOrigin` is where the text block starts, centred in the frame so a wide box
  holds its text in the middle. `textWidth` is the block's width at 1x, magnification excluded.
  `visibleRows` is the rows the layout shows; in fit and message mode the frame is sized to them.
- `LayoutOptions.fontScale` is the text magnification; 1 draws the rows at the game's size.
  `padX` is the game pixels between the frame's side edges and the text (the game's own box
  keeps one tile). `padY` is the space above and below. `messageWidth` and `messageRows` are the
  whole message's extent for message mode; 0 falls back to the rows in use.
- `contentOf`: full and message mode take the whole message's measure when the engine has one,
  so the block does not grow and the text does not creep while the message types. Fit mode
  follows the rows drawn.
- `layoutBox`: full mode keeps the vanilla frame and only grows when magnified text would not fit.
  Message and fit mode shrink the frame to their content, centred on the vanilla frame's centre
  both ways, so the box stays where the game placed it. The block sits in the middle of the frame
  both ways; in a frame sized to it that middle is the pad.

## packages/game-data/src/dialog/box-style/

The enhanced message box's look, as the settings name it: the border around the text, its
corners and corner marks, and the texture drawn on the ground. Every choice is a closed ladder, so
a segmented control can list it and a stored value never drifts off it.

- Borders: the game's own tiles, nothing, one line, or a thin line inside a thicker one.
- Corners: square, rounded, or cut at a diagonal (a chamfer).
- Corner marks sit inside each corner. The triforce mark points at its corner.
- The texture is the repeating pattern on the ground behind the text. Its animation slides it
  sideways, drifts it diagonally, makes cells appear and fade at random, or makes the whole field
  breathe.
- `strokeWidthsOf` gives stroke widths in game pixels: the outer line, the thin inner line of a
  double border, and the gap between them.

## packages/game-data/src/dialog/dialog-frame.types/

`DialogFrame` is what the text engine has on screen, as the host's message box needs it. It is
built from the core's dialog mirror snapshot (`core/game-hooks/dialog_mirror.c`), one frame at a
time.

- `DialogCell` is one drawn glyph: its id in the language's alphabet, and its pen x and width in
  text area pixels. `highlight` is the span it was drawn in: 1 primary, 2 secondary, absent or 0
  for plain text.
- `DialogWait` is what the engine is parked on, if anything.
- `DialogKind`: `box` is the bordered box, `floating` is `[Window 02]` text (telepathy and story
  lines), `story` is the attract mode story crawl, and `menu` is the death and select menus that
  run through the same engine without a border.
- `topleft` is the BG3 tilemap word address the core chose for the frame's top left tile.
- `rows` holds the three visible rows, in draw order.
- `scrollStep` counts the pixels a `[Scroll]` has shifted the rows up so far, 0 to 15.
- `renderState` is the engine's `kText_Render` state, 0 to 4.
- `nativeHidden` says whether the core withholds the native box for this message. It is decided
  once as the message opens and held for its life (`core/game-hooks/dialog_suppress.c`), so the
  host box draws only where the native one stands down and the two are never both up.
- `generation` counts messages started since boot, modulo 256. Loading a state does not advance
  it.
- `layerScrollX` and `layerScrollY` are the text layer's live scroll in game pixels, as the
  renderer draws it. The story crawl moves its words this way.
- `messageWidth` is the whole message's widest row in text area pixels, measured when it loaded.
  `messageRows` is the most rows any screen of the message shows, 1 to 3. Both are 0 when
  unknown.

## packages/game-data/src/dialog/dialog-kind/

The kind of message comes from the snapshot's flags and the frame position the engine chose. The
death and select menus are the one case the position tells apart: they force their own top left
and do not take one of the two gameplay slots. `RenderText_PostDeathSaveOptions` forces
`MENU_TOPLEFT`, and `DisplaySelectMenu` shares the engine.

## packages/game-data/src/dialog/dialog-prompts/

The button prompts a message box shows, from what the engine is doing and which controls are on.
A choice asks for a direction and a confirm. A page that waits asks for the next press. A page
that is still typing offers the controls that act on typing: B to complete it, and holding A to
speed it up, each only when its setting is on and it would change something. Holding A only
helps when the held speed beats the typing speed; instant text has nothing left to speed up. The
story crawl takes no input, so it never shows a prompt. The game over menu has written its lines
and waits on the fairy cursor.

- `DialogPrompt.hold` marks a button that acts while held, so the prompt reads "Hold".
- `PromptControls.speed` is the text speed stop: 1 is the game's pacing, 0 is instant.
- `TYPING_RENDER_STATE` is the engine's pump state while it types (`kText_Render[3]`).

## packages/game-data/src/dialog/dialog-wait.ts

The `TEXT_CMD_*` values are the engine's own text command ids (`kTextCmd_*` in
`core/zelda3/src/messaging.c`) that park it, mapped to what the player is waiting on.

## packages/game-data/src/dialog/dialogue-charset/

What one language's message box can draw: its alphabet, plus the extra glyphs
(`extra-glyphs.constants.ts`) laid into the font's spare slots.

The sheet holds 128 glyphs (the core has 256 tiles, a top and a bottom tile per glyph). A
language uses the slots its alphabet and its width table cover; the rest are spare. The
characters the alphabet lacks take the spare slots in the extra glyphs' priority order, and a
character with no slot left falls back (`packages/game-core/src/session-dialogue/dialogue-text.ts`). A composed line
writes an extra glyph as a private use token that carries its slot, so the encoder can turn it
into the core's escape bytes and the wrapper can measure it by its slot like any other glyph.

- `TOKEN_BASE` is the first private use code point of the slot tokens, clear of the highlight
  markup at U+E000.
- `DialogueCharset.alphabet` maps a glyph code to the text that encodes to it: alphabet entries,
  then a token per extra slot. `widths` maps every glyph code to its pen advance in pixels.
  `extras` lists the extra glyphs this charset draws, by slot.
- `alphabetChars` takes the single characters an alphabet draws. A bracketed entry is a picture,
  never typed text.
- `withExtras` grows the alphabet to every slot: an empty entry where no glyph is, and the fill
  at each extra slot.
- `displayAlphabetOf` is the alphabet as a reader sees it: each extra slot holds its own
  character (the modern font's lookup). `readableText` turns every slot token in composed text
  back into its character.

## packages/game-data/src/dialog/extra-glyph-tiles.ts

An extra glyph's pixel rows as the font sheet stores a glyph: two 8x8 2bpp tiles, the top 8 rows
then the bottom 8, 32 bytes in all. Each pixel row is two bytes, bit plane 0 then bit plane 1,
leftmost pixel in bit 7. This is the SNES layout the engine reads (`messaging.c`
`VWF_RenderSingle`). A space maps to the ground entry, `.` to the edge and `#` to the body.

## packages/game-data/src/dialog/extra-glyphs.constants.ts

Glyphs the dialogue fonts lack, drawn in the game's own style, so any name another game sends
shows as it was typed. The core writes each one into a spare slot of the active font
(`core/game-hooks/dialog_extra_glyphs.c`) and the composer encodes the character to that slot.

Every glyph is the font's own cell: 8 columns by 16 rows, the top 8 rows one tile and the bottom 8
the next. In the rows, a space is the transparent ground, `.` the dark edge (palette entry 1) and
`#` the letter's body (entry 2). The body is one pixel wide like the game's letters, starts on
column 1, and sits on the same lines: capitals from row 2, the baseline on row 12, descenders to
row 14. The edge rings the body on every side, the way every glyph in the sheet has it. The width
is the pen advance (1 to 8, as the font's width table stores it): the body plus one edge column on
each side. Every edge pixel lies inside it because the engine draws only that many columns.

The list is in priority order. A font with fewer spare slots than missing characters takes them
from the top, so the characters that turn up most in player and item names come first. The left
and right pointers are drawn as the US font's own.

## packages/game-data/src/dialog/frame-geometry/

The shapes a drawn message box frame is made of, as plain strings the renderer hands to SVG and
CSS: the outline path of a box with square, rounded or chamfered corners, the clip that gives the
ground the same corners, and where the four corner marks sit and which way they turn.

- `CornerPlacement.sx` and `sy` are mirror factors: the top left mark is drawn as is, the others
  are its reflections.
- `cornerAtInset` gives the corner size of an outline inset inside one with a given corner size,
  so the two run parallel. A concentric arc loses the inset from its radius, and a chamfer cut
  moved inward by the inset shortens by the inset times (2 minus root 2).
- `triforcePath` draws a triforce of the given height centred on the origin, apex up: the outer
  triangle split into three.

## packages/game-data/src/dialog/highlight-color.ts

`hexToSnes15` turns a `#rrggbb` colour into the game's 15 bit colour word (5 bits a channel, red
lowest), each channel snapped to the nearest of its 32 levels. The core draws highlighted letters
with this word, and the host box paints with the same word expanded back, so both boxes show one
colour.

## packages/game-data/src/dialog/pacing/

The dialog pacing ladders. Text speed is a multiplier over the game's own pacing, with 0 meaning
instant (the ROM's own "Speed 00" convention). Speed stops run slowest first, and instant sits at
the end. A stop below 1 only slows typed lines. The hold ladder is the multiplier applied while A
is held. The font scale ladder sizes the modern font of the enhanced box, as a multiple of the
game's glyph height. The stroke widths are the outline around a modern glyph in game pixels; 0
draws no outline.

- `toQ4` converts a stop to the core's quarter tick fixed point: 1 becomes 4, 1.5 becomes 6, 4
  becomes 16, and instant stays 0.
- `nearestStopIndex` finds the stop closest to a stored value, so an odd value still lands on the
  ladder.

## packages/game-data/src/dialog/picture-glyph.ts

An alphabet entry that names a picture and does not spell a character: an arrow, a button face, a
heart piece, the ellipsis run. The modern font has no face for these, so a row renderer draws
them from the glyph sheet.

## packages/game-data/src/events/

Event names for the bridge between the game core and the React app.

## packages/game-data/src/events/events.constants.ts

The bridge for `window.__onTransitionSettled` (`GameHook_ModuleFrameEnd` in
`transition_events.c`). The core fires it once per frame on which a module or dungeon
submodule transition has just finished, gated on the Developer Tools setting; subscribing while
the setting is off is harmless, since the core never calls in. Kinds, from the dungeon
submodule that just finished (module 7 is the dungeon, 9 the overworld): `room` is an inter
room doorway (submodule 2), `quadrant` an intra room scroll (1), `doors` shutters, unlocks and
cracked walls (4, 5, 9), `stairs` inter or intra room stairs (6, 8, `0x0E`, `0x10` to `0x13`),
`entered` the player entering a gameplay module (submodule 0, in or out of a dungeon), and
`other` any remaining submodule returning to 0.

## packages/game-data/src/index.ts

The old screen types in `./types` are re-exported for consumers that have not moved to the
records in `./data`. The old names that collide with the new records (`BitState`,
`PresenceCondition`, `InteriorKind`, `Requirement`, `ScreenVariantInfo`, `VariantCondition`,
`World`) are not re-exported, because `./data` is the authoritative source for those.

## packages/game-data/src/logic/check-place.ts

Whether the place a check happens at has been reached. An item check has one screen. An event
that marks the first of several places reached (the dark world, from any of its regions) names
them all in `reachAny`, and any one of them opens it. A dungeon's stage event has no screen of its
own: it happens somewhere inside, so any room of its dungeon opens it and its own rule does the
rest. A combined row is a sum of other rows, never something to go and do, so it has no place.

## packages/game-data/src/logic/check-status.type.ts

What the tracker says about one row: taken, in reach, or not yet.

## packages/game-data/src/logic/evaluate-requirement.ts

Whether a dataset requirement is met by what is held and what is done. This is the dataset's own
small language (an item, an earlier check, `allOf`, `anyOf`, a count over an item group, or
impossible) and nothing more. It is not a rules engine and never decides where a player can go:
detection reads a record's `derived` and `fallback` with it (`packages/navigation/src/tracker/derived-checks.ts`), the
simulator reads a boss gate with it, and the rows no world holds a location for are judged with it
(`logic/record-statuses.ts`).

## packages/game-data/src/logic/hero-idle/

The idler: what the character does in the pause menu portrait when nobody is asking. Pick a
sequence, play it out, pick again. A view needs `startHeroIdle`, `advanceHeroIdle` and
`heroPoseAt`; the rest is exported for the table's tests and for retuning.

Vocabulary: a sequence is a named thing the character can be seen doing, like standing, pacing,
swinging. A take is one performance of a sequence: the sequence, a facing, and the exact beats it
resolved to this time. A beat is one drawn pose held for a whole number of game frames, the only
clock the source animation understands. Beats carry their own facing, not the take, because a
sequence may turn part way through. Looking around is exactly that, and one facing on the take
would make it a different sequence per direction.

- `HeroSequenceKind` picks the builder that turns a table row into beats. The tunable numbers
  stay in the table; the shape of the motion is the game's own and lives in code.
- `HeroSequenceDef.weight` is a relative likelihood; only ratios matter. `frames` is the inclusive
  range the take's length is sampled from, in game frames, omitted where the game's own tables fix
  the length (a sword swing is as long as the swing is).
- `HeroBeat.action` is the pose atlas action id (`stateFor`). `frame` indexes
  `framesOf(state, facing)`. `vx` and `vy` are the drift in pixels per frame.
- `HeroTake.frames` is the sum of every beat's hold. `endFacing` is the facing the next take
  inherits. `HeroIdleState.startedAt` is the clock value the take started on, in game frames.
- `HeroPose` offsets are SNES pixels from the anchor.
- `HeroRng` returns a uniform value in [0, 1). It is injected so a test can hand in a seeded one
  and replay a take exactly; the view hands it `Math.random`. `seededRng` is mulberry32: small,
  fast, and good enough for choosing between six rows. `pickInt` is inclusive at both ends.

The machine is pure and clock driven. Nothing owns a timer or a frame loop: the caller passes the
current value of a game frame clock and gets back the state and the pose that belong to it, so the
whole behaviour can be stepped by hand in a test. Every take starts and ends on the anchor, so the
machine never carries a position between takes: the offset is a property of where you are inside a
take and is zero at both ends.

- `chooseSequence` never picks the row just played unless that row may repeat. The same sequence
  twice reads as a stutter and not a choice. Standing is the exception (`REPEATABLE`): two rests
  in a row is just a longer rest.
- `advanceHeroIdle` returns the same object while the current take still runs, so a caller can
  compare by identity. It loops (up to `MAX_CATCH_UP_TAKES`) because a menu left open in a
  background tab can come back with several takes of clock to catch up on.
- `heroPoseAt` clamps to the take's last beat and does not fall off it.
- `FACING_TOWARD_VIEWER` is where the idler starts, and where it returns after the flourish, which
  has no facing of its own.

The table (`sequence-table.ts`) is the whole behaviour: one row per thing the character can be
seen doing, so retuning the idle means editing numbers there and nothing else. Frames are game
frames at 60 a second. It paces most of the time, stands and swings often, and does the two
flourishes rarely enough to still be a small surprise the twentieth time the menu opens: walk
34/91 (about 37%), swing 22/91 (24%), stand 14/91 (15%), look 10/91 (11%), spin 8/91 (9%), raise
3/91 (3%). The walk range is quantised to whole out and back pairs by the builder, so its numbers
are the outer bounds it rounds inside: one pair (68) to two (136), 1.1 to 2.3 seconds.

Facings use the engine's own `link_direction_facing >> 1`: 0 up, 1 down, 2 left, 3 right. That
pairing makes `facing ^ 1` the about turn, because up and down are neighbours and so are left and
right, and that is the whole mechanism behind a pacing take landing back where it started. A look
around never picks the direction already faced; turning to it is not a turn and looks broken.

Takes with no sword:

- Standing is drawn from the walk action's standing frame (frame 0), the pose the engine itself
  parks on. A look take turns its head two or three times.
- Pacing returns by construction, not by arithmetic. The return leg is the out leg's beats with
  the facing turned about and the step negated, so the two legs cancel exactly whatever length was
  sampled; there is no drift to correct and no snap at the end. The excursion is capped at
  `MAX_LEG_CYCLES` walk cycles (17 pixels each, 34 at most) so the character paces around the spot
  it stands on: it is drawn at the live player's position, and a stroll of a hundred pixels would
  contradict the one fact the portrait is there to state. The sampled length is quantised to whole
  cycles first, because half a cycle is a foot left in the air and half a step of drift that never
  comes back.

Takes with a blade, each the engine's own button sequence played back with nobody pressing:

- A swing is what a tap does: the draw (action 0x27, nine frames on `kSpinAttackDelays`), then the
  single swing pose the engine draws at `button_b_frames == 9`, then the release.
- A spin is what a hold does: the same draw, then the held pose looping for the 48 frames
  `link_spin_attack_step_counter` needs to reach the charge threshold, then the twelve step
  release. The hold runs whole loops, because stopping half way through one would cut short a pose
  the engine never cuts short.
- Neither travels: the engine halts the character for both (`HaltLinkWhenUsingItems`).
- The flourish is the blade held overhead, the pose the engine reserves for the moment a sword is
  claimed, drawn for 11 frames. It has no facing in the atlas, so the facing passed only decides
  where the take leaves the character looking.

## packages/game-data/src/logic/hero-idle/native-timings.constants.ts

The engine's own animation clocks, transcribed from the decompilation, not chosen: an idle that
invents its own timings looks like a different character. The engine expresses a hold two ways,
and both are folded to frames the pose stays up: a counter that counts up to the table value
(`++c >= tab`, walking), so the hold is the table value; and a timer that counts down past zero
(`sign8(--t)`, every sword clock), so the hold is the table value plus one.

- Walking: `Link_HandleMovingAnimation`'s `tab3` on the normal speed branch
  (`x = link_animation_steps`, no dash, no drag). These are the holds. Step 0 is the standing frame
  and is only entered once (the cycle wraps 8 to 1), so the loop is frames 1 to 8 and lasts 17
  frames.
- The character covers one pixel per frame at normal walking speed, so a cycle is 17 pixels, a
  little over a tile. That lets a pacing take be measured in cycles and land back on the pixel it
  left.
- Drawing a sword: `LinkItem_Sword` advances `button_b_frames` 0 to 8 on `kSpinAttackDelays`, and
  `LinkOam_Main` draws action 0x27 at that index; each hold is the delay plus one. The swing
  itself (action 0x02) is the single frame the engine draws at `button_b_frames == 9`, before the
  release resets everything. The source note for `SWING_HOLD` reads: `kSpinAttackDelays[9]` is 0,
  plus one.
- Holding after the swing: `Player_Sword_SpinAttackJerks_HoldDown` walks `button_b_frames` 10 to
  12 and wraps, and `LinkOam_Main` draws action 0x03 at `button_b_frames - 10`.
  `kSpinAttackDelays[10..12]` is 3, 3, 3.
- `link_spin_attack_step_counter` must reach 48 before the release is a spin, and it ticks once
  per frame while the button is down.
- The spin: `Link_HandleSpinAttack` walks a 12 step counter, drawing
  `kLinkSpinGraphicsByDir[facing * 12 + step]` (the shared 16 frame action 0x0f) on
  `kLinkSpinDelays`, a count down timer, so plus one.
- Raising the blade (`link_unk_master_sword`, action 0x17): the engine drives it off a cutscene
  counter, not a table. Three frames a pose is the rate that counter runs at.

## packages/game-data/src/logic/pause/

The pause menu logic: cells, ladders, screens and the reducer.

`pause.type.ts`:

- `PauseContext.owned` covers the 24 item cells and `bottles` the 4 bottles. `gear` is what is in
  force on each ladder. The three tier fields are the tier itself. `bow` is the arrow type the
  launcher register stands on (0 plain, 1 silver), or `NO_ARROW_TYPE` when nothing is held, never
  the raw register, because the ammunition half of that byte is not the menu's business. Absent
  means the same as nothing held, so a context built before the arrow row existed leaves it inert.
  `activeItem` is the hud item id the core has equipped, if known: the cell to open on.
- `PauseEvent` `focus` is a pointer saying where the cursor is, which no directional event can
  express. It still lands through `clampCursor`, so the rule that stops a d-pad walking onto a cell
  that does not exist stops a click too. `screen` is a jump straight to a screen, the tab strip's
  own verb. It is not a focus with cursor zero: a screen entered lands where that screen opens. A
  click on the gear tab that landed on tier zero once armed a confirm that would take the blade
  off, as the d-pad's screen step once did.
- `ItemCell.hudItem` is the core's new style hud item id, 1 to 24. `saveIndex` is the inventory
  save slot the cell reads (15 for every bottle cell). `sprite` is always set, with tier one art
  when `owned` is false. `PauseNameKey` keys the pause name table: items by `<recordId>-<tier>`,
  bottles by value.
- `GearKind` holds the three ladders whose field carries one fact, so tier 0 is a real rung.
  `GearLadderKind` adds the arrow row, in the order the cursor walks them. `GearTierCell.sprite`
  is empty when the tier means nothing equipped; `owned` is true at or below the high water mark.
- `RowSegment.start` is the first cursor value in the run and `column` the visual column of its
  first cell.
- `ConfirmVerb` is what a confirm does, in the one word the legend has room for. The unequip
  target only exists for the three one fact fields; the arrow row has no such rung.
- `AssignPlan` `ignored`: the cursor is on nothing assignable, which is not an error. `refused`:
  the save does not hold it. `assign`: write the target to the pressed slot after clearing every
  slot number in `clear`. `ConfirmPlan` mirrors it: `equip` writes the tier (the caller holds the
  bridge), `exit` leaves the menu the chosen way and the reducer moves to `closing` for it.

The item grid (`build-item-cells.ts`, `item-cells.constants.ts`) has 24 cells, six columns by
four rows. The cells are the twenty inventory save slots with the two changes the core's new style
lookup makes: the digging tool and the wind instrument share one save slot but get a cell each,
and the single current bottle slot is replaced by four bottle cells. 20 + 1 - 1 + 4 = 24. Cell
order is the core's new style hud item order (ids 1 to 24), never the save order. Id 13 is the
instrument, id 16 the digging tool, ids 21 to 24 the four bottles. The ids come from the core's own
new style table.

- Silhouette rule: an unowned cell still carries a sprite, the tier one sprite for its slot, with
  `owned: false`, and the renderer draws it flat. The outline says something goes here without
  revealing which upgrade tier is still out in the world. Drawing the real tier would leak
  progression into a menu the player opens constantly, and drawing nothing would leave the grid
  unreadable. The name key follows the same rule.
- Sprite filenames resolve through the record dataset (`spriteId`). The only literals are the two
  variants the dataset has no sprite for. Bottle values 1 and 2 both draw the plain bottle.
- The two cells sharing save slot 12 use the core's thresholds: under the new style lookup it
  answers the tool for any value at or above one and the instrument only from two up, so the tool
  stays owned after the trade that raises the slot. Reading the tool as `value === 1` would
  silhouette a cell the core still lets the player equip, the one disagreement this grid must
  never have with the register it drives.
- `buildItemCells` reads both arrays defensively, so a short array yields unowned cells and does
  not throw.

The gear screen ladders (`gear-tiers.constants.ts` and the files beside it). Three are upgrade
ladders: blade 0 to 4, guard 0 to 3, armour 0 to 2. Tier 0 is nothing equipped for the first two
and the starting armour for the third, which is why only armour has art at tier 0.

The fourth is not an upgrade ladder. The launcher register holds two facts in one byte (which
projectile, and whether any are on hand), so its rungs are the two projectile types, plain and
silver, and there is no bare rung. Writing 0 there would not mean nothing nocked; it would mean no
launcher, deleting an item from a row about which ammunition is loaded and taking the carrying
half of the byte with it. A later equip could never restore that without handing out free
ammunition or emptying the quiver without a word. The other three fields carry one fact each, so
their tier 0 can be undone; this one cannot, and that is why it has two rungs and not three.
Confirming the type already in force is nothing at all, where on the other three it unequips.
`arrowTypeOf`: register values 1 and 2 are the plain pair and 3 and 4 the silver pair, so the type
is the step of two and the odd or even half is the ammunition the row never touches. 0 holds no
launcher and answers with a rung no ladder has, which leaves the row inert.

Ownership is a high water mark, passed in and never read here: a tier at or below the highest
ever seen on that ladder is selectable, anything above it is a silhouette. That makes going down a
tier (and back up) safe, so a player can drop to a weaker tier for a challenge run and climb back
without the game keeping a separate unlocked set. The arrow row answers the same rule with its own
mark, so silver is a silhouette until the save has held it. Tier 0 is always selectable because it
is always reachable.

The screens and all cursor arithmetic (`screen-rows.ts`, `move-cursor.ts`, `clamp-cursor.ts`).
Nothing else decides where the cursor goes; the reducer delegates here and the views only render.
A screen is a list of visual rows, and a row a list of segments, each a run of one section's cells
from a given visual column. That one shape covers every rule: left and right walk the row across
segment boundaries and wrap at its ends; up and down step to the adjacent row (wrapping top to
bottom) and land on the nearest column there. It also makes the item grid and the bottle row one
thing: the twenty item cells fill three rows of six and leave two in the fourth, so the four
bottles sit beside them in that row. Moving down out of the grid spills into the bottles, and up
out of the bottles returns to the cell above, with no special case. Nearest column is also the
clamp: a cursor never lands where no cell exists, because every position returned comes from a
real segment. A cursor is a cell index, so anything but a whole number names no cell and is clamped
away. The gear rows are driven off `GEAR_LADDER_KINDS`, so a ladder cannot arrive without a row to
walk. The status actions are drawn side by side in one strip along the foot of the panel, as the
published wireframe shows, so they are one row: left and right walk between them, and up and down
find no other row.

Where a screen opens (`opening-cursor.ts`): the cell the cursor lands on when a screen is entered,
not walked into. Every screen used to open on its first cell, which on two of three was a
destructive default. Items opened on cell zero, almost never the equipped tool, so the first slot
press landed on whatever lived there, usually an unowned silhouette. Gear opened on tier zero of
the blade ladder, the no blade rung, so switching to gear and pressing confirm took the sword off.
Tier zero stays reachable, because dropping to a weaker tier (or none) is a choice the ladders
offer; it must not be the rung a confirm falls on by default. So a screen opens on what is in
force: the equipped item, the worn tier, the first cell where nothing is. The rule is written per
section, so all three ladders answer it. The answer lands through `clampCursor`, so a context
reporting a tier or item id no cell exists for is snapped onto a real cell. The arrow row answers
with the type in force, or the rung no ladder has when nothing is held, which `clampGearTier` snaps
onto the first rung. An equipped id outside 1 to 24 means the core has nothing the grid can point
at (a fresh save, or a register the host has not driven yet), and the first cell is as good as
any. Hud item ids 1 to 20 are the tools and 21 to 24 the bottles.

What a slot press means (`plan-assignment.ts`), decided once for every way of making one. A pad
press comes through the input router and a mouse click from the menu's own overlay, and the two
must do the same thing. They used to disagree: one refused an unowned item silently and left a
duplicate standing, the other said so and cleared the duplicate. The rule lives here, as a plan
the caller performs:

- Nothing under the cursor is not a press. The gear screen's guard and armour rows have nothing a
  button could fire.
- An unowned cell refuses, and says so. The grid draws every cell whether the save holds it or
  not, so a player will press a button on a silhouette. Doing nothing reads as a broken menu; a
  refusal reads as an answer.
- One meaning, one button. Assigning anything a different slot already holds clears that other
  slot. Two buttons firing the same thing is a button the player has lost without being told. This
  once applied to items only, on the argument that two buttons swinging the blade are just two
  ways to swing it. They are not: the second does nothing the first did not, and holding it costs
  everything else that button could carry. The blade is no different for being a verb. The reach
  verb goes the same way: the two gameplay verbs sit on two rows of one screen and are assigned by
  the same press, so a rule that held for one and not the other would be a difference the player
  could only find by trying it. Two items match only when they are the same item; the two verbs
  have nothing to compare, so matching kinds is the whole test.

What the cursor points at for an assignment (`assign-target-at.ts`). An unowned item still reports
as an item; refusing is the caller's call. The two verbs live on the gear screen, on the two rows
where a confirm means nothing else: the blade ladder assigns the sword (as the published wireframe
places it), and the passive row assigns the action, because the four abilities drawn there are the
ones the action button performs, it is the one gear row with no tier to equip, and the verb has to
be reachable somewhere. The guard and armour ladders assign nothing: their cells already mean wear
this tier, and there is no guard verb for a button. The status screen assigns nothing either. Its
two rows are the ways out of the game; the only reason they once answered `action` is that the
section is spelled `actions`. A slot press that silently rebound a button while the cursor sat on
save and quit would be a second, invisible meaning for that cell.

What a confirm means (`confirm-target-at.ts`, `plan-confirm.ts`, `confirm-verb-at.ts`), decided
once for every way of making one, for the same reason as assignment. A pad press, a keyboard press
and a mouse click must reach the same outcome. They did not: confirm reached nothing, a click on a
gear tier called the bridge straight from the view, and a click on a status row closed the menu
through an event only the mouse raised. The rule, as a plan the caller performs:

- The arrow row is the one ladder that never unequips. Its rungs are the two projectile types, and
  the byte behind them also carries whether any are on hand, so no rung means none and confirming
  the type already nocked is nothing. A save holding no launcher offers nothing there: conjuring
  the thing that fires it is not a meaning a confirm on that row may take.
- A gear tier equips. At or below the high water mark it is worn; above it the press is refused
  and says so, as an unowned item cell does. The mark is the same `isGearTierSelectable` the ladder
  is drawn from, so what looks selectable and what is selectable cannot drift.
- The tier already worn unequips. Confirming what is already on could only ever be a no op, so it
  is the natural home for taking the piece off, a choice the ladders exist to offer. It writes tier
  0, the rung the ladder already draws as nothing worn, so both routes to that state end the same.
  Both are called an unequip, because the word describes the state the press leaves behind; one
  outcome under two names on two rungs of one ladder is the drift this rule stops. The tier to
  write is worked out first and the target named from that: a write of 0 is an unequip from
  wherever it was asked, and a press that would write the tier already on is nothing. The worn
  tier is clamped first, so a context reporting a tier the ladder lacks cannot make an ordinary
  rung look worn. Taking a piece off is always available: tier 0 is the one rung every save holds.
- A status row activates. The two rows are the two ways out of the game, and confirming one
  chooses it; the second row (`SAVE_QUIT_CURSOR`) saves before it goes. The reducer turns that
  into the `closing` phase and the store performs the exit.
- Everything else is nothing. An item cell, a bottle and the passive row have nothing to activate,
  because items fire from a slot, not the cursor, so the legend drops its confirm glyph and does
  not promise a control that does nothing.

Every position lands through `clampCursor` first, so a cursor left out of range by a shrinking
screen confirms the cell it would have been snapped onto. The legend reads its verb from
`confirmVerbAt`, off the same target the press is planned from, so the bar cannot advertise an
action the plan will not perform. It replaced a bare `canConfirmAt` boolean: a strip that only
knows that a confirm does something has to guess what, and it guessed one fixed word for three
outcomes. A faded tier is the one deliberate exception, matching the item grid: the bar offers what
the cell is for, and a cell the save never held answers with a refusal the player can read.

The reducer (`pause-machine.ts`, `reduce-browsing.ts`) is pure state, no writes. It decides where
the cursor is, never what the game does about it. A confirm on a gear tier moves nothing but the
selection; the caller performs the write, because only the caller holds the bridge. A slot press
returns the state untouched and leaves "what is under the cursor" to `assignTargetAt`. Confirm is
the same shape, asked of `confirmTargetAt`: the one case that is a real state change (a status row
choosing a way out) becomes the `closing` phase, and every other confirm meaning is a write the
store performs from the same answer. A screen entered lands where that screen opens
(`openScreen`), and every door into a screen comes through it so none can drift. Backing out of a
nested section returns to the screen's first section; backing out of the first section closes the
menu.

## packages/game-data/src/logic/queries/area-locations/

The link between areas and locations is stored one way only: a location record names its `areaId`, and an area record lists nothing. So the reverse read scans. The collection is a few dozen records and is rebuilt on every dataset change, so a plain filter beats an index that would need invalidating with it.

`locationsInArea` returns an empty list for an area nothing has been placed in yet. That is a real answer, not a miss. `areaOfLocation` returns undefined only when no record holds that id: a dangling reference and a location with no area are different faults.

## packages/game-data/src/logic/queries/bundles/

A screen bundle groups overworld screens into one logical area.

- `screens` lists every screen index in layout order: NW, NE, SW, SE for a 2x2 area. `head` is the top left screen.
- `QUAD_POSITIONS` names each slot. Slot 0 is the head, slot 1 is head + 1, slot 2 is head + 8 and slot 3 is head + 9, because the overworld grid is 8 screens wide.
- `subNames` holds each screen's quadrant name, and `screenNames` its full name.
- `roomShape` is the indoor room shape when a room has boundaries inside it. `activeQuadrant` is the quadrant Link stands in, for a room of several screens. `effectiveLayout` is the width and height, in map cells, that the room covers on the dungeon map.
- `screenByIndex` builds its map of overworld records by `overworldIndex` once, on first use.

## packages/game-data/src/logic/queries/check-contents/

What a row holds, in one order, for every surface that shows one: the tracker's list, its cards, and the toast a check raises as it completes. One shared order keeps a check from reading three ways at once.

The order, first match wins:

1. `override`: an item the caller already resolved, as when a row holding several items is split into one entry per item.
2. What this run placed there. On a seed this outranks everything below it.
3. What a swap chest holds right now (`chest-stand-ins`), a fact about the live file.
4. `receipt`: what the game just paid at this row, for a swap chest it has paid out this moment.
5. The record's own contents. With `expand`, a record holding several items gives one entry each.

Step 5 is skipped on an online run. The server hands locations over one at a time, so nothing here knows what this one holds, and the original item is a claim, not an answer. A single undefined entry means "not known here". `shownItemOf` is for a surface that never expands a row.

## packages/game-data/src/logic/queries/check-grouping/

Groups, filters and labels checks for the tracker. World, area, location and dungeon values read the screen, area and dungeon records directly.

- `RunContext` is what the run in progress adds to grouping, filtering and display. `kind` absent reads as the plain game, where every check holds its own contents. `placedItems` maps a check id to the item placed there. `foreignItems` maps a check id to the name of another player's item placed there (online only). `spheres` maps a check id to its verification sweep sphere. `liveItems` maps a check id to what a swap chest holds right now; it is set on a normal profile too.
- `GroupNode.stats` counts over every check under the node.
- `FilterState.activeFacets` holds ids from `CHECK_FACET_DEFS`: a world, location or area facet, or a content tag key. `tagMode` `all` needs every facet to match, `any` needs one. `showMode` picks item checks, events or both; absent reads as items.
- `bigKeyDoors` and `darkRoomsNeedLight` absent read as on. `smallKeyDoors` absent reads as off on the plain game, which has never gated on key counts, and on for a seed (`smallKeyDoorsOf`).
- `shopShelves` absent reads as off: on the plain game a shelf is a shop item to buy, not a check to hunt. A seed's roster already holds only the shelves its shop scope opened, so this never touches one.
- `SPHERE_DIMENSION` only means something with a run loaded, so it is not in `GROUP_DIMENSIONS`. A caller that has spheres appends it, and the widget without a run never offers a dimension that would put every check under "outside the sweep".
- Death Mountain is the one area that spans both worlds. Its label and its area facets split by the check's own screen: one facet per side.
- A dungeon event with no screen of its own sits in its dungeon's world, read from the dungeon's first room.
- Content facets come from the tag collection (`tagsFor('check')`) and test the real tags on `CheckRecord.tags`. `CHECK_FACET_DEFS` is built once, when the module loads.
- `matchesSearch`: with a run loaded, the item a reader searches for is the one the run placed there. Matching the vanilla contents would answer "where was the lamp", not "where is it".
- `isListedRow` decides whether a row is in the list at all, before any search or facet: the Items, Events or Both switch, and on the plain game the shop shelves. The summary counts over the same answer, so the totals say what the list shows.
- `buildGroupTree` nests 0 to 5 levels. Spheres sort by number. Other groups sort by name with "Other" and "Overworld" last.

## packages/game-data/src/logic/queries/chest-stand-ins/

What a swap chest holds right now. A chest whose item names a stand-in (`ItemRecord.aliasOf`) pays that stand-in when the player already holds the item, so the same chest reads two ways over a file's life. An open chest follows the inventory. A taken one paid the real item only if it is the chest a normal file takes it from first, or if that chest is still closed.

There are six such chests: Link's House, the Secret Passage and Zelda's Chest (Lamp), the castle's Boomerang Chest and the Chicken House (Blue Boomerang), and the Brewery (Red Boomerang).

The Red Boomerang has no usual chest, only its one chest. That chest paid the stand-in when the player holds a slot mate and not the item itself. Holding the item says nothing, because it has other sources.

## packages/game-data/src/logic/queries/describe-screen/

Turns a screen reference into words: a name when the dataset has one, the game's own hex numbers when it does not, and a combined label for reasons and evidence lines.

It accepts a dataset `ScreenId` or a `GameScreenId` straight off the live registers. The game gives an overworld screen's position within one world (0x00 to 0x3F). The dataset's unified numbering puts the dark world copy of that position at the same number plus 0x40 (`DARK_WORLD_OVERWORLD_OFFSET`). A caller holding a per world number passes `world`, and the offset is applied here once. With `world` omitted the number is read as already unified.

`hexLabel` (`room 0x104`, `screen 0x2c`) is always present, even with no record. `label` is `<name> (<id>)` when a record resolves, `hexLabel` otherwise.

## packages/game-data/src/logic/queries/detection/

Reverse lookups from a game index (overworld screen or dungeon room) to the screen record, with variant resolution: several records can share one room and are told apart by game state.

- `VariantGameState.readFlag` reads one WRAM bit. `entranceId` is the entrance used to enter the room. `progressTier` is 0 based.
- `ScreenLookup.byDungeonRoom` is keyed `palaceIndex:roomIndex`. `byCaveRoom` keeps the first match only, so it is lossy for shared rooms; `byCaveRoomAll` keeps every screen sharing a cave room. `byRoomAny` is the first screen holding a room, palace or not, for a last resort match.
- `byEntranceId` maps an entrance to every screen that mouth enters. The cartridge reuses one entrance for several mouths (the generic fairy and hint caves), so it is a list.

Indoor resolution order:

1. The entrance the player came in by, only for the room they stand in. It is the precise answer when two screens share a room, and no answer once they have walked on, because `which_entrance` keeps naming the mouth they used.
2. The exact `palace:room` key.
3. A palace scan over every dungeon screen for the room (`palace-fallback`).
4. Cave or house, resolved by variant.
5. When the palace is unknown (0xFF), the room may still belong to a dungeon, so a palace scan runs last.

Steps 2 and 3 run only when `palaceIndex >> 1` is at most `LAST_DUNGEON_INDEX` (12); step 5 only when it is above. `palaceMismatch` on a palace scan holds the palace the dataset expects and the one the game reported.

## packages/game-data/src/logic/queries/dungeon-group/

The dungeon group id is what the simulator's per dungeon ledger keys on, in place of a raw palace index. Every dungeon stands alone under its own index except one: the sewers (dungeon index 0) are reachable only through the castle above them (dungeon index 1). A run that leaves through the castle and comes back through it must find the sewers' owed checks under the same ledger entry. No other palace shares this property. It is a single named exception, not a general grouping rule.

`palaceIndex` is the raw `cur_palace_index_x2` a screen carries. The game's own dungeon tables, and this ledger, index by `palaceIndex >> 1`.

The `screenId` taken here is the simulator's traversal id (`room:N`, a native room number, optionally region and door qualified), not a dataset screen id. Overworld ids carry no room and give null.

A room's dungeon is the dungeon whose `roomScreenIds` claims it, not something inferred from geography. The group still comes from the screen's palace index, which is what folds the sewers in with the castle. When this keying was introduced the data was checked: 193 dungeon screens, no room claimed by two dungeons, no room missing from its dungeon's `roomScreenIds`, and group to dungeon one to one across all 13.

`dungeonGroupName` reads the name from the dungeon record, so no game name is spelled out in code. A group spanning two palace indices takes the name of the dungeon that claims its rooms. It falls back to the bare number.

## packages/game-data/src/logic/queries/dungeon-values/

Palace index display labels. The index is the raw value of RAM $040C (`cur_palace_index_x2`): which dungeon the game considers the player to be in. Caves and houses report 0xFF (`PALACE_NONE`). The value is doubled, because the game's own dungeon tables are indexed by `cur_palace_index_x2 >> 1`. Dungeon palaces run up to 0x1A (`LAST_DUNGEON_PALACE`).

The labels are transcribed game wording, so they live in the record dataset. `getPalaceName` falls back to the raw index for a value the dataset has no label for.

## packages/game-data/src/logic/queries/game-id/

The link between our screen ids and the identifiers the game uses. A game id is an overworld index, or a room with an optional palace.

`screenForGameId` tries, in order: the exact `palace:room`; any palace holding that room; then a cave or interior by room alone. The second step is a safety net for a dataset `palaceIndex` that disagrees with the live `cur_palace_index_x2`. Without it a dungeon room could resolve to a cave sharing its room number.

Use `screenIdForGameId` to get our id string, never a hand formatted one. `gameIdLabel` falls back to the raw hex numbers when nothing maps.

## packages/game-data/src/logic/queries/item-duplicates/

The vanilla duplicate item rule (`Link_HandleChest`, player.c:3850): a few chest items swap to an alternate when the primary is already owned. The lamp chest hands out 5 Rupees once the player has a lamp.

Four things name a chest's contents: the simulator's delivery, the sim log, the overlay annotation and the C hook. The first three apply this rule from here, or the overlay would promise a Lamp the run never delivers. The C hook applies the same rule as a backstop.

The alternate lives on the item record (`ItemRecord.aliasOf`). `itemId` is the native receive index (the chest's own byte). `owned` is the tracker's set of dataset item ids.

## packages/game-data/src/logic/queries/item-sprites/

Sprite URLs of the extracted set: the base the active ROM's files are served from, and the revision of the set behind it. A set is rewritten in place: a background re-extraction clears the folder and writes it again under the same names, so every URL on screen points for a moment at a file that does not exist. Carrying the revision in the URL (`?v=N`) makes a rewritten set a new source, so the image is fetched again instead of keeping the failure it latched during the rewrite. Revision 0 means the set as found.

- `spriteFilename` strips the `sprite-` id prefix down to the PNG's file name.
- An item shows a rupee reward's coloured gem (`rupee-gem-files`) ahead of the record's own sprite, which for the large values names the game's numbered art.
- `getPoolGameSprite` gives a multiworld pool game's badged icon, `pool-<slug>.png`. A game with no drawing gets the Archipelago mark (`pool-game-icons`).
- `getCapacityUpgradeSprite` gives a family's stamped capacity upgrade sprite, `upgrade-<family>.png`.

## packages/game-data/src/logic/queries/palace-fallback/

The palace scan safety net for indoor screen detection. A dungeon screen is keyed by `palaceIndex:roomIndex`, so a screen whose dataset `palaceIndex` disagrees with the live `cur_palace_index_x2` misses the exact key. Detection then matches on the room number alone, which finds the right screen because room numbers are unique across dungeons.

The scan must not hide the mislabel: every hit is recorded, keyed `livePalace:room`, so a wrong `palaceIndex` can be reported. `describePalaceMismatch` turns one into a developer facing line naming the room, both palaces and the screen to fix; the renderer logs it. `clearPalaceMismatches` exists for tests that start from a clean slate.

## packages/game-data/src/logic/queries/progress-tier/

The save's progress indicator byte, the game's coarsest story clock. The engine branches on it directly (`< 2`, `>= 2`, `== 2`, `< 3`, `>= 3`), so the tiers are the engine's own, not a reading of the plot. The byte goes up to 3 (`MAX_PROGRESS_TIER`), because the dark world is the last thing it counts.

- 0: the opening. The storm is up, no sword has been given, and the overworld runs the first sprite list (overworld.c:302-306) with the rain ambience (overworld.c:481, `< 2`).
- 1: the passage scene has handed over the sword and shield (sprite_main.c:5739, `Uncle_InPassage` case 1 `GiveSwordAndShield`). The storm and its sprite list are unchanged: everything the engine keys on still tests `< 2`, so 0 and 1 share the same overworld.
- 2: the princess has been delivered to the sanctuary and the priest scene has run (sprite_main.c:6343; the simulator writes the same value in `core/game-hooks/sim_triggers.c`). The storm lifts, sprite list 1 takes over and the sign text changes.
- 3: the tower boss is down and the dark world opens (dungeon.c:2504, on the exit that also flips `savegame_is_darkworld`). Sprite list 2 takes over.

The labels live with the rest of the dataset, as the `progress-tier` enumeration category, so a tier reads the same in a HUD chip, a record editor and a log line. Nothing else may declare its own table of them. `progressTierLabel` is undefined for a value the dataset does not describe, and the caller shows the raw number, because a checkout without the private dataset has no rows at all.

## packages/game-data/src/logic/queries/room-screen.ts

The one room index to screen resolution, for callers that hold a bare room number and no palace context. A room number alone is ambiguous, because a palace room and an unrelated cave can share one. So the order matters: the record with no palace first (the exact meaning of "a room with no palace"), then the cave index, and only then any record holding that room. Every step is an indexed lookup off the cached screen lookup.

## packages/game-data/src/logic/queries/screen-validity/

The one owner of "is this screen filled in enough to be a real record". Every validator that guards a screen reads its rules from here, so a screen the editor accepts cannot be one a query then fails to resolve. The rules are noun phrases the callers join into a sentence ("this proposal still needs ..."), which keeps them poolable across callers.

`ScreenCandidate` is a stored record or a draft. Geography is optional and widened to `string`, because a form holds an empty pick until somebody chooses, and that is one of the states being judged. `id` is absent until the screen's id is allocated. The floor in `position` decides which dungeon file the record lives in.

- Index: an overworld screen is addressed by its overworld index and every indoor one by its room index. A dungeon room also needs the palace index, because a room number alone can be both a dungeon room and a cave. Without these the screen resolves to whatever sits at index zero.
- Geography: a screen carries an area and a location, picked from two separate lists, and the location record already names its area, so the two can disagree. Only a real pair is judged for that: a placeholder on either side is reported as its own missing piece first.
- Home: where the record belongs on disk is the `record-file-targets` question. Its `unresolved` reason is passed through, not restated. A candidate with no area is handed the placeholder area, which that resolver reads as "no geographic area"; the missing area is already reported by the geography rule.
- Variant: a variant states its tier twice, as `progressTier` and as a `{ type: 'progress' }` condition. Only the condition is read at runtime, so a disagreement is silent. Both are read as an inclusive range (an omitted bound is open to the end of the scale, as the evaluator reads it) and must describe the same set. A variant gated on anything else is not judged: a flag or a check is a different fact that merely tends to hold from some tier onwards.
- A grid position is the editing form's own affair: only a form can hold half of one, so only a form refuses it.

## packages/game-data/src/logic/record-statuses.ts

The status of a row from the dataset's own record: is its place reached, and is what it asks for
met. Only the rows no world holds a location for come here, which is every event and the fairy
rungs no pond sells (`packages/navigation/src/tracker/tracker-statuses/tracker-statuses.ts`). Where the player can be is handed in,
derived from the one engine's regions (`logic/regions/reachable-screens.ts`), so this carries no
graph and no rules of its own. `reachableScreens` holds dataset screen ids. `checkOverrides` holds
rows whose requirement the file's own settings decide (`packages/navigation/src/tracker/record-row-inputs/record-row-overrides.ts`).

## packages/game-data/src/logic/regions/reachable-screens.ts

The screens a player can stand on, derived from the regions the one engine says they can reach.
The engine answers in region ids and knows nothing about screens. Every screen points up at the
region a player walks it from, so this reads that pointer. A region that names a dungeon brings
the dungeon's whole room list with it, because a dungeon reached is a dungeon whose rooms can be
walked, and what each room then asks for is the row's own business. A region with no screen
contributes nothing; that is what the menu is: the graph's own root, a place in the rules and
nowhere in the game.

## packages/game-data/src/logic/run-kind.type.ts

Which run the app is answering for. There are three, not two, and that is the point of the type:
a seed loaded from disk and an online multiworld are both randomized, but only the first can say
what any location holds. Asking whether there is a placement answers the first question and gets
the second wrong, which is how an online session came to be read as plain play.

- `normal`: the unrandomized game with everything on. Every location holds what it always did.
- `seed`: a placement generated here, so every location's item is known up front.
- `online`: a multiworld session. The server hands locations over one at a time, so nothing here
  knows what a location holds until it is collected.

## packages/game-data/src/manifest/msu-manifest.type.ts

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

## packages/game-data/src/pathfinding/nav-data.types/

These types ride on the dataset as optional `nav` fields: `RegionNavData` on a screen, `ConnectionNavData` on a connection. The analysis pass fills them and the pathfinder reads them. They extend the existing records and never replace them.

- `TraversalRequirement` is every requirement the flood can test. Tested in the classifier: `lift.1`, `lift.2`, `boots`, `flippers`. Not yet tested in game: `hammer`, `hookshot`, `bombs`, `sword`, `boomerang`, `mirror`. The rest are progression, not tile level.
- `RequirementSet` is OR of AND. `[['sword'], ['boomerang']]` needs a sword or a boomerang, `[['hammer', 'lift.1']]` needs both, `[]` needs nothing. `[['lift.1']]` is the base lift Link has from the start.
- `ConnectionTransitType`: `walk` is a screen border crossing, position for position. `door` enters or leaves a building. `passage` goes through a building between two overworld areas. `hole` is a one way fall. `staircase` joins floors inside. `ledge` is a one way jump. `mirror` warps from the dark world to the same spot in the light world. `flute` flies to a fixed point. `dungeon_enter` and `dungeon_exit` join the overworld and a dungeon's first room. `whirlpool` is a water warp and `warp_tile` a dungeon warp pad.
- `RegionNavData.totalTiles` is 4096 on the 64 by 64 overworld grid. `freeTileCount` is the tiles walkable with no items from the primary entry, `maxReachableTileCount` the tiles reachable with every item.
- `ConnectionNavData.overlapTiles` (walks only) is the border positions, 0 to 63, where both screens have reachable border tiles: the real corridor. `weight` is the tile distance for a walk and 1 for an instant transition. `validAfter` names the progression event it waits for. `invalid` is set by the analysis (no overlap, unreachable).
- `ConnectionPointData` is a bundle of tiles that forms one logical way in or out. A cliff that splits a border into two gaps makes two points. Its `id` reads `{world}-{screen:hex}-{type}-{dir}-{index}`, for example `lw-38-edge-e-0`, `lw-29-door-0`, `int-011f-exit-e`. `tiles` are columns on a north or south edge and rows on an east or west edge, always contiguous. `requirements` are what it takes to reach the point from the screen's walkable interior. `position` and `entranceIndex` (the game's own entrance index) are for entrances.
- `NavObstacle.tileAttr` is the raw ROM tile attribute byte. `gatesPoint` names the connection point it blocks, if any.

## packages/game-data/src/quiet-receipts/

Rupees, bombs and arrows the randomizer hands over can go straight into the wallet, the bomb bag
or the quiver, with no hold up and no message. There is one switch per kind, stored with the rest
of the profile's settings. It applies to every randomizer delivery, local or online. A profile
that never saved a switch reads as the default.

- See packages/game-data/src/quiet-receipts. With a kind's option on, a rupee, bomb or arrow the randomizer delivers goes straight to the wallet, bag or quiver (the quiet_receipt delivery, WasmGrantQuietReceipt), and a placed one is armed with the silent line, so its pickup shows the game's own nothing.
- Each option rides its own gate word 5 bit, so the bit the core reads and the one read here never disagree.
- Under the retro bow the single arrow is the quiver itself, never ammunition, so arrows are never quiet there.
- RECEIPT_KIND lists the native receipts of each kind (ancilla.c Ancilla_AddRupees, misc.c AncillaAdd_ItemReceipt).
- QUIET_RECEIPT_MSG is kReceiptMsg_Silent (game_hooks.h): no dialogue line has this id, and the seam shows no text for it.
- `quietMessageFor` gives the line a placed grant is armed with: the silent one for a quiet receipt.

## packages/game-data/src/sdl-buttons/sdl-buttons.constants.ts

- Button indices are positional. SOUTH is the bottom face button and EAST the right one on every pad, whatever letter the vendor prints on it. One vendor labels the bottom button A, another B; binding by position lands both right.
- Presets index into the positional button array the native layer emits. An older scheme used bare numbers from two sources (browser gamepad order and per-device byte layout), which meant different buttons once the source changed.
- Triggers are analog and arrive as axes (SDL_AXIS), never as SDL_BUTTON entries.
- SDL_GAMEPAD_TYPES lists the families SDL itself reports.

## packages/game-data/src/store/based-on/based-on.type.ts

- The credit a copy of an installed item keeps to the original: which store item, its name, its author's display name, its licence and the version it was copied from. Every pack format carries it the same way, as an optional `basedOn` in its own metadata.
- `license` is a licence id from packages/hub-contracts/src/store/licenses.

## packages/game-data/src/title/title-frame.type.ts

`TitleFrame` is the intro's clock as the core reports it each frame, from
`core/game-hooks/title_mirror.c`. Every field is a counter the game keeps itself. The host never
counts frames of its own for the choreography.

- `inidisp` is the screen brightness, 0 to 15. The boot fades it out and the story fade brings it
  down again.
- `swordY` is the falling sword's base. It comes to rest at 30.
- `sparklePhase` is 0 for none, 1 for the sparkle on the hilt, 2 for the glint running down the
  blade.
- `flashLeft` counts the frames of the clang flash left. The flash is lit on three frames of every
  four.
- `fade` is the palette fade countdown. It runs 31 to 0, one step every other frame, first for the
  logo and then for the scene.
- `pieces` holds the top left corner of each of the three 64x64 triangle sprites.
- `TitleProgress.fromSlot` is the save file the pick came from, or null when no file is valid.

## packages/game-data/src/title/title-layout.ts

Positions in the 256x224 frame, measured from the ROM with the title extractor
(`packages/asset-extraction/src/title-screen`) and the intro's own sprite tables (`ending.c`).

- `LOGO_AT` is the logo's top left corner, the drawn extent of the BG1 tilemap.
- `SWORD_X` is the sword picture's left edge. `SWORD_TOP_FOR_BASE` is the row its top lands on
  for a sword base of 0. `SWORD_REST_BASE` is the base the sword comes to rest at.
- `HILT_SPARKLE_AT` and the `GLINT_*` values place the hilt sparkle and the glint that runs down
  the blade (`Intro_PeriodicSwordAndIntroFlash`).
- One triangle piece is a 64x64 picture. The third piece is drawn mirrored.
- `HORIZON_Y` is the first of the two water line rows the trees stand on. `CASTLE_TOP` is the
  castle's top row; its stone foot stands in the water below the line.
- `COPYRIGHT_AT` is the copyright sprite's spot, kept for a mark of our own in the same place.
- The blade runs through the logo's first letter: behind its top and bottom bars, in front of the
  diagonal between them. `LOGO_BARS_OVER_BLADE` holds those two bars, in logo pixels, across the
  blade's columns.
- The confirm prompt sits under the picture, and the smaller story prompt sits below it.

## packages/game-data/src/title/title-phase/

The phase and the fade amounts are read straight from the core's counters, so a skip or a state
load lands on the right picture (`Module00_Intro`, `ending.c`).

- The palette fade runs 31 steps. The logo layer turns on when 13 are left, so the logo fades in
  during submodule 5 from that step and is solid after it.
- The lake and castle fade in during submodule 7.
- The sword shows from its drop on (submodule 6). The triangles show from the moment the poly
  thread starts (submodule 3).
- The clang flash lights three frames of every four while it runs.
- `brightness` reads the INIDISP register that the boot and the story fade drive.

## packages/game-data/src/title/title-progress/

The title shows the sword tier and the world of the profile's most advanced battery save file.
The code is pure over the 8 KiB save. The slot geometry and checksum come from the caller, so it
stays free of the host's storage.

- `SWORD_OFFSET` and `PROGRESS_OFFSET` are block offsets in a save file (`variables.h`): the sword
  byte and the progress indicator.
- `SECOND_HALF_AT` is the progress indicator's value once the tower's keeper falls and the second
  half begins.
- `TIER_OF_SWORD` is indexed by the sword byte. No sword yet, and no save at all, show the game's
  own title sword.
- `SlotReader.validSlots` returns 0-based slots. `blockOffset` is the byte offset of a slot's
  valid block.

## packages/game-data/src/title/title-swords/

The swords the title can plant, in the order the setting steps through them: the save's own pick,
then one per tier. All four tier pictures are efracrafting's. `nextTitleSword` wraps to the first.

## packages/game-data/src/types/game-state/

- `HUDState.maxRupees`, `maxBombs` and `maxArrows` are the current caps a counter can reach right
  now, after upgrades and settings.
- `InventoryState.items` holds the 20 item slots, bow through mirror. `bottles` holds the 4 bottle
  contents. `order` is the 24 byte inventory grid order.
- `CountdownState` is the HUD countdown that the digging game and the Super Bomb share. `seconds`
  is stored as the game stores it, with the sign bit set while no countdown runs. `frames` counts
  the frames left in the current second and reloads to 62 when a second comes off.
- `HostMenuState` is the host owned pause menu, in bytes 131 and 132 of the UI state buffer.
  `holding` is true while the takeover is in force and the core's gate allows it.
- `HostMenuState.activeItem` repeats `hud.equippedY` (byte 14) on purpose. Byte 14 is the HUD's
  equipped item readout. `activeItem` is the host's own register read back, so the host can see
  when the native menu moved it and write it again. It does move: the menu's own init walks the
  21 entry grid before the hold engages, and that replaces any id the grid has no row for. Its
  range is 0 to 24, in the new style ids while held.

## packages/game-data/src/types/screen.type.ts

The old screen data model.

- `ScreenType` names the three screen contexts. `overworld` is an outdoor screen, 64 per world,
  indexed 0x00 to 0x3F. `dungeon` is an indoor room that belongs to a dungeon, keyed by palace
  index and room. `interior` is every other indoor room: caves, houses, shops, fairy fountains.
- `OverworldContext.gridX` and `gridY` place the screen in the 8x8 overworld grid.
- `DungeonContext.palaceIndex` is the runtime `cur_palace_index_x2` (0x00 to 0x1A), the canonical
  dungeon identifier. `dungeonForPalaceIndex` resolves the dungeon from it. `floor` runs -2, -1, 0,
  1, 2 and up. `gridX` and `gridY` place the room in the dungeon's map grid.
- Several variants of one `roomIndex` can coexist. The first whose `VariantCondition` is true at
  runtime wins; a definition with no variant is the fallback.
- `ScreenVariantInfo.progressTier` is one progress indicator value or an inclusive `[from, to]`
  range. What each tier means is under `logic/queries/progress-tier` below.
- A `ScreenBundle` groups screens that are one area in the game: the Lost Woods (4 overworld
  screens), the Two Brothers house (2 rooms), or a large dungeon room spanning several
  supertiles.
- `ScreenBase.location` is the structural parent: every screen sharing a location is one place.
  `area` is the broad zone shown on the notification's second line.
- `entranceId` is RAM `$010E`, which tells apart rooms that share a room index.
- `ScreenConnection.entranceId` is set for an overworld to indoor transition, `stairIndex` (0 to 3)
  for a stair between rooms, `exitId` for an indoor to overworld transition.
