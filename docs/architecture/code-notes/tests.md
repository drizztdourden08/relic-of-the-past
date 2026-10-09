<!-- @layer docs @kind doc -->
# Code notes: tests

Facts about the test suites that the code cannot say on its own. Each heading names the
file or folder the note belongs to, relative to `tests/`.

## dataset-guard

`describeDataset` marks a suite that reads real record content. The records are tracked in
the repository, so it never skips today; it stays as the marker for those suites.

On an empty registry the suite body is replaced, not skipped. `describe.skip` still runs its
callback, and several suites build fixtures in the body outside any `it`, which would throw.
The placeholder registers one skipped test so vitest does not report the file as empty.

A suite over records it builds itself keeps plain `describe`.

## asset-extraction/alttp-asset-set.keep.test.ts

The byte identity case compiles with full options on purpose. The cheap variant
(`skipDialogue`, `skipMusic`) only proves identity for a blob the app never ships.

## asset-extraction/gba-alttp-supplement.keep.test.ts

The base game ROM is found by its `(USA).sfc` suffix, never named, because its filename
carries the trademark. The USA image is the one the extractor validates.

The `.sav` fixture is a live save the reference emulator writes during play, so its slots
hold whatever the tester last did. The test asserts the shape of the decode, never story
state.

## data-inspector

Several suites import `buildSchema` from its own module, never from the `@ds/data` barrel:
the barrel pulls in the view state binding, which touches `window` at module load. For the
same reason, suites that render the inspector stub `window` and then import the component
fresh after `vi.resetModules()`, because the binding reaches `lib/storage` and the log bus.

### data-inspector/accept-all-certain.keep.test.ts

Batch accept is a loop, never a `Promise.all`: two findings often land in the same source
file, and every write reads, waits for the IPC round trip, then writes back. Overlapped, one
edit is lost; the contrast case shows it. The gate is `certain`, because `likely` evidence
only proves presence and must not be written unreviewed.

### data-inspector/accept-recommendation.keep.test.ts

Accepting writes first and records the verdict second; a verdict before the write would
mark done a finding nobody applied. The four collaborators are mocked because each really
writes to disk or to the store. An update is keyed by `targetId`, the identity the store
reconciles on.

### data-inspector/collection-sources.keep.test.ts

Every id is `<prefix>-<digits>`; the prefix is the kind name except `item-group` (`ig`) and
`enumeration` (`enum`), see `KIND_ID_PREFIXES`. Default column sets are typed by hand, so a
typo would open a column that renders nothing. Editor groups may name a path no row
carries, so the check is that no path is claimed twice: the layout would render it in the
first group and drop the other.

### data-inspector/comparison-view-sync.keep.test.ts

The comparison panes read as one view: the same tab and the same scroll offset. `DetailTabs`
is fully controlled, so both panes take the same `{tab, onTabChange}`. Scrolling uses the
`ScrollArea` guard: the side the user scrolled leads, the other follows, and the follower's
programmatic scroll is swallowed, so each real scroll makes one programmatic move.

### data-inspector/data-inspector-render.keep.test.ts

Server side render smoke tests. The active collection is React state that SSR cannot drive,
so the detail panel renders once per collection on each tab. Clicking a row or an id
reference, switching collection and anything portalled are not covered. The id reference
attributes are the half of the click contract a renderless test can check.

### data-inspector/module-init-order.keep.test.ts

`record-writers`, `id-ref-options` and `collection-sources` form an import cycle. A cycle
only faults when something is read during module evaluation, so each module must be safe to
import first in a fresh graph, with `RECORD_WRITERS` populated. The first import loads the
whole data graph cold, about three seconds alone, hence the long timeout.

### data-inspector/open-recommendation.keep.test.ts

`openRecommendation` is the one call that brings a finding on screen from outside the
inspector. The shell registers how to bring the inspector forward (its `useAppNavigation`
effect), the caller hands over what to show, and the view consumes the request once. The
request is stored before the page opens, because a shell may render the inspector
synchronously. The opener is not store state, so registering it again notifies nobody.

### data-inspector/proposal-draft.keep.test.ts

A reviewer may amend a proposal before accepting. The editable copy never reaches the store,
where a new detection would collide with a half made edit. Revert drops the amendment; it is
no undo history. The amendment is keyed to its finding, so selecting another drops it.

### data-inspector/recommendation-cache.keep.test.ts

The renderer's read model never merges an edit of its own: a verdict goes to the main
process and the answer replaces the cache whole. The flattened snapshot must stay the same
array between changes, because `useSyncExternalStore` compares it.

### data-inspector/recommendation-rows.keep.test.ts

Columns are the same for every kind, since one findings list mixes collections. Rows sort
certain first, then oldest first. A decided finding leaves the list, which is what makes
Reject remove it from view. A missing target or screen stays `null`: a placeholder string
would be sampled, fail the id pattern and turn the column into plain text.

### data-inspector/recommendations-shell.keep.test.ts

The folded detail column is hidden by CSS and stays mounted, so folding never discards a
half made amendment. The shell knows nothing about recommendations; a plain collection's
detail pane uses it too.

### data-inspector/record-creators.keep.test.ts

One adapter per collection's `Allocate*` shape. Each folds the record into the live
registry, publishes it as an id reference option and rebuilds the collection source.

### data-inspector/record-links.keep.test.ts

The Recommendations `targetId` column points at a different collection per row, so it has
no single target kind and each id resolves by its own prefix.

### data-inspector/tag-consistency.keep.test.ts

The `isTagKey` gate in `create-tag.ts` never runs on a direct edit, so `writeTag` checks that
`name` reads `namespace:value` and refuses the save before the write channel.

## electron/recommendation-files.keep.test.ts

Every recommendation operation reads, changes and writes a whole collection file. The per
kind queue must wrap the whole operation: queueing only the save still lets two decisions
read the same snapshot, and a batch accept depends on it. Without the queue, either the
later write overwrites the earlier verdict, or the two writes collide and the file reads
back empty, which is why the unqueued case only asserts fewer than two verdicts.

## features/all-off-vanilla.keep.test.ts

With every enhancement off, the bridge sends all zero feature words so the engine runs the
verbatim vanilla path. `hudStyle: 'vanilla'` is the default Original HUD; a host drawn
style arms the host menu gate bits.

The init time texture height follows the INI `extend_y`, which only applies with
`extendedRendering`. The live Height240 PPU flag must agree, or the draw loop overruns the
buffer. `extendY` defaults to true, so a vanilla profile with extended rendering off must
still render the stock 224 lines.

## features/bundle-flags-parity.keep.test.ts

The split bug fix flags are generated into both the C header and the TS registry from one
catalog (`scripts/build/gen-bundle-flags.mjs`). The word 3 gate bits in `features.h` and the
host menu and modern controls bits in word 2 are hand written on both sides, so they are
checked the same way. Word 3 has no free bit left, which is why those two gates live in
word 2, above `kFeatures2_HandAuthoredFloor`.

The C headers mention flag names in prose comments, so the scan strips comments first. An
enum value is either a literal or a shift; anything else is skipped. Both word 2 gates
change what the game computes (the menu takeover and the item register), so both must be
in the Vanilla Safe mask, and they are asserted by name so a removed entry fails.

## features/hud-style-scheme.keep.test.ts

The HUD style is the one choice and the control scheme follows from it. A stored profile
from before the rename carries the two old keys, `controlScheme` and `hudStyle`. The
migration runs on every profile read, so it must be idempotent and exact: a profile must
never lose the modern scheme it was saved with. A profile written after the rename has no
`controlScheme`, so one carrying `enhanced` is never promoted again.

## features/resolve-features.keep.test.ts

The rendering requirement tree: `extendedRendering` then `linearWorldTilemap` then
`ultrawideRendering` and `tallRendering`; `cameraLockToViewport` requires
`extendedRendering`; `smoothTransitions` requires `cameraLockToViewport`. A child never
resolves on while its parent is off.

## features/vanilla-safe-lock.keep.test.ts

Vanilla Safe leaves nothing enabled that diverges from the stock cartridge, asked of the
registry so new features are covered. The fixpoint matters more than the per feature flag:
it protects a future feature that depends on a parity feature without being flagged
itself. Haptics and developer tools only observe, but both have `GameHook_*` call sites in
vendored game code, so Vanilla Safe locks them too.

## game/aspect-ratio.keep.test.ts

The widest custom ratio is about 4.27, the 1024 px linear world width. The tallest is
256/480, about 0.533. A 5:4 screen now fills at its own ratio and is no longer clamped to
4:3.

## game/one-rules-path.keep.test.ts

The generator answers where a row is reachable. What this side keeps is the join from its
regions to dataset screens, plus the two inputs the file's settings hand the rows. Turning
Big Key doors off hands over only the big keys. Normal logic counts the lamp alone as light,
so the Fire Rod does not light a dark room.

## game/overworld-area.keep.test.ts

A 2x2 overworld area shares one sprite table across its four screens, with every spawn
relative to the head (top left) screen. Screens lay out 8 per row, so head 24 has area mates
25, 32 and 33. Dark World screens reuse the Light World head layout at an offset of 64.

## game/ui-bridge-parser.keep.test.ts

The UI buffer is read up to byte 124 and only the main module byte (offset 0) drives the
mode here. Module 20 is the attract demo; modules 0 to 4 are the title and the file select,
copy, erase and name menus. None of them is gameplay, so the main HUD stays hidden.

## widgets/live-data-inspector-records.keep.test.ts

`recordsFor` returns every record relating to the current screen. It replaced a lookup that
showed only the first connection, so the cases use real screens with several records,
including two spawns of the same sprite type.

## widgets/screen-record-draft.keep.test.ts

The screen editor sends this record to `screenEditor:writeScreen`, the one place the
dataset tooling writes a record into a source file. A dungeon room's file is its floor, so
an interior without a floor is a separate blocker (see `record-file-targets`).

## game/recommendations

Several suites build a `contextFor` whose `context.screenId` and `observations.match` name
the same screen, mirroring `use-screen-observations.ts`, where the two always agree. Probes
that read "the screen we are on" read it off `observations.match?.screen.id`.

### game/recommendations/actor-combat.keep.test.ts and actor-spawns.keep.test.ts

One `strategy:actor` detector covers both findings. The spawn finding's key is
`spawn:<n>`, the set probe's noun plus live key. With no native combat row supplied, a new
actor is classified `object`, never a guessed enemy, npc or boss.

### game/recommendations/check-presence.keep.test.ts

The fixture is the interior a fresh save opens in (room 260), whose single chest is the
earliest check in the game. The chest table's contents byte is a raw receive id, so it
resolves to the catalogued reward. The dataset is restored after each case.

### game/recommendations/connection-add-parity.keep.test.ts

A bare room index can be ambiguous (a castle room and a cave can share one), so the fixture
only uses rooms that `resolveRealDestId` resolves back to themselves. A new crossing has no
partner yet, so the destination lives in the finding's key and `proposed.toConnectionId` is
a placeholder. A covering record is found through its partner's screen, so the fixture's
partner must be a real registered record. An unresolvable room proposes a screen create
graded `likely`, because the palace is unknown.

### game/recommendations/connection-remove-parity.keep.test.ts

An outdoor edge is never proposed for removal: the flood proves presence, never absence. An
indoor edge can be, once both `walkBoundaries` and `doorBoundaries` were read. A one way
record is judged only from the screen that can observe it, which `canExit` states. A delete
proves an absence, so removals are graded `likely`, never batch writable. Every fixture
registers a real partner record, because a connection needs a resolvable `toConnectionId`.

### game/recommendations/connection-strategy-parity.keep.test.ts

Direction derives from `canExit`. A partner no record carries has no screen, so its own id
stands in for the screen id, which the editor reads as an unknown screen. Flood evidence
proves presence only, so a nav proposal is never `certain`. The unresolvable endpoint case
filters to the nav probe's own findings; the crossing probes flag that record separately.

### game/recommendations/diff.keep.test.ts

The diff covers the shapes real records have: an array (tags), a union (requirements), a
nested object and a deeply nested one. A union variant that appears or vanishes reports its
leaves, so a comparison view has a path for every line it marks.

### game/recommendations/item-grants.keep.test.ts

The create side is three set probes (chest contents, native receive count, tracker inventory
delta) because confidence and evidence source are fixed per probe; the alias side is two
field probes. All five share one detector id, so the tie break (chest beats grant) comes
from `runDetection`'s dedup and the registration order. That dedup is in `runDetection`, so
the suite drives the strategy through `registerDetector` and `runDetection`, as `runPass`
does. The enumerable native table outranks a single observed grant.

### game/recommendations/registry-store.keep.test.ts

A pass scopes reconciliation to what ran; without that, a pass on one screen resolves every
finding about every other screen. `wire-detector` must be imported after
`strategy-detectors`. A screen carries two detectors: the comparison strategy against live
memory, and `screen:geography`, which checks the record against the rest of the dataset.

### game/recommendations/screen-strategy-parity

`WRONG_PALACE` is a palace index no record uses, so the disagreement is real for every
screen. The indirect entrance case points entrance 0x2B at another room, which is how a
stale entrance id looks after walking in from another indoor room.

## game/data

The writer suites (`dataset-record-writers`, `enumeration-writer`, `item-group-writer`) run in
a throwaway workspace shaped like `shared/game/data/...`, because the id allocator scans that
shape and the path resolver refuses to leave it.

### game/data/check-content-tags.keep.test.ts

The check content tags (key, big key, map and compass, boss item) are a seeded
`CheckRecord.tags` array, no longer computed on read. A few known checks are pinned so a
seed edit shows as a diff.

### game/data/connection-pairing.keep.test.ts

One record is one point on one screen; `toConnectionId` names its partner (see
`shared/game/data/connections/derive.ts`). Two invariants do not hold today and stay as
`it.todo` with the violators named.

Same screen pairs: `connection-896` and `connection-1143` both sit on `screen-236`, from the
data before the migration, and neither carries `ctx:internal`. The check to restore:

```ts
const violators = ALL_CONNECTIONS.filter(c => {
  const partner = getConnection(c.toConnectionId);
  if (c.screenId !== partner.screenId) return false;
  return !hasTagKey(c.tags, 'ctx:internal') && !hasTagKey(partner.tags, 'ctx:internal');
});
expect(violators.map(c => c.id)).toEqual([]);
```

Tile footprints: 8 pairs (16 records) share tiles on one screen, a door and the stair or
entrance beneath it on different layers. `ConnectionPlacement.layer` exists for this, but
the migration had no data to fill it. The pairs: 324/325 (`screen-051`), 212/243
(`screen-103`), 228/244 (`screen-122`), 230/245 (`screen-123`), 232/246 (`screen-124`),
002/366 (`screen-204`), 382/383 (`screen-190`), 404/405 (`screen-031`). The check to
restore:

```ts
const byScreen = new Map<string, Map<string, string>>();
const collisions: string[] = [];
for (const c of ALL_CONNECTIONS) {
  const sig = tileSig(c);
  if (!sig) continue;
  const seen = byScreen.get(c.screenId) ?? new Map<string, string>();
  byScreen.set(c.screenId, seen);
  if (seen.has(sig)) collisions.push(`${seen.get(sig)} vs ${c.id} on ${c.screenId}`);
  else seen.set(sig, c.id);
}
expect(collisions).toEqual([]);
```

### game/data/dataset-integrity.keep.test.ts

The dataset held against itself, exhaustively: every reference resolves to a record of the
right kind, ids are unique and prefixed, a screen agrees with its area, location and region
about its world, and every event row owns a ledger bit. It replaced a sampling suite, because
a dangling id hides in the one row nobody sampled. Every failure names the record and field.

The menu and save and quit pseudo screen is nowhere in the world, so it carries the two
placeholder ids (`area-000`, `location-000`) and nothing answers for them; a second entry
would mean a record lost its place. The reference walk only grows (11765 references when
written); the four named fields are the easiest to lose to a type change. An area that spans
both worlds agrees with a screen in either. The floodgate's twin rows were merged into one
event. A location and an event row may share a bit (a dungeon reward pickup and its "reward
taken" row), but never two locations on one bit or a location on a bit no event owns.

### game/data/dataset-record-writers

The fixture parks one record in a file its own resolver would not name (a vanilla junk item
with the randomizer items, an enemy with the bosses). `tree-layout` forbids that in the real
tree; here it proves an update or delete finds a record by id wherever it sits. `recordsIn`
reads a written file back by evaluating its array literal, since the emitter writes plain
data.

### game/data/enumeration-generated-types.keep.test.ts

`generated-types.ts` is committed, so an edit to `ALL_ENUMERATION` without
`npm run generate:enum-types` would go unnoticed; the suite regenerates it in memory and
compares byte for byte. A category earns a union only when the field it labels stores a
string; the progress tier labels a numeric field, so it is left out of the code generation.

### game/data/enumeration-writer.keep.test.ts

The writers also regenerate `generated-types.ts` from the real repo's `ALL_ENUMERATION`
(`generate-enum-types.mjs` reads a fixed path). That is harmless here because the real
`enumeration.ts` never changes, so the run is a no op.

### game/data/generate-enum-types-root.keep.test.ts

`generateEnumTypes` takes an explicit `root`. Its default guess is relative to the script's
own file, which is wrong from the bundled `dist/electron/main.js`, so every production launch
once hit `ERR_MODULE_NOT_FOUND`. The fixture seeds one row per category, which
`buildGeneratedTypesSource` needs; every other real category is absent on purpose, proving
the read came from the temp root. The seed is read from the record tree and the union is
written beside the lookup that consumes it.

### game/data/generated-mirrors.keep.test.ts

`scripts/generate-from-records.mjs --check` rebuilds each generated file in memory and
compares it to disk, so a hand edit fails and is named. The generator is the only writer of
those files, which keeps the records the one source for tables restated in TypeScript or C.
The check runs as a child process through vite's SSR runner, the same path as the CLI. It
needs the dataset, since three targets are built from records.

### game/data/item-group-writer.keep.test.ts

The seven group ceiling is gone, so an eighth group mints a real `ig-NNN` id.

### game/data/record-file-targets.keep.test.ts

Every check record must resolve to the file it is committed in, exactly; nothing is split by
size, so there are no sibling files to fall back on. Items, actors, dungeons, areas and
locations are filed one file per category, kind, dungeon or world. An event record is written
as a numbered spec, so its file holds `n: <id minus 300>`. A few story rows name neither a
dungeon nor a screen, and event groups spanning two files are refused by design.

### game/data/record-references

Every id one record holds for another, collected off the live registry, each carrying the
record and field it came from. Requirement and presence trees are walked to their leaves,
because a dangling id inside nested `allOf` and `anyOf` hides from the eye.

### game/data/reference-index.keep.test.ts

`referencesTo` backs the delete guard. `check-072` requires three pendants and `check-041`
one bottle, in their own data. No record bakes a Swords group leaf into its static
requirements today, so Swords has no references.

### game/data/regions.keep.test.ts

A region says what a player can walk without asking for anything, so the claims are about a
screen agreeing with its region, never about geography. The region count (239) is one row per
region of the reference generator's four taxonomies. 11 regions carry the boxes of
`kAreaBoxEvents` and 15 the heads of `kAreaHeadEvents`.

The two exception lists are work left undone; shortening them is progress, lengthening one
means a record got worse. The screens with no region outside a dungeon are second readings of
a place held once (the rain, the light world side of the pyramid ledge, the spot the desert
palace east door stands on) or the graph's root. The dungeon rooms no wing owns are rooms two
wings both reach, because the boundary is inside a room the dataset holds whole, or rooms
whose only record is a staircase no room header carries. Wings with no screen are split out
of a room held whole, or corridor wings with no locations. A cave is one place behind one set
of doors, so a cave region's screens share one area; overworld regions are exempt.

### game/data/rom-facts

Every native id on a record, held against a US ROM; without one the suites skip. Nothing here
transcribes a number.

- `CHEST_ROW_EXCEPTIONS` (`check-270`): the chest game's chests are room objects, not rows of
  the native chest table. `OpenMiniGameChest` (dungeon.c:5834) spends a credit, then picks a
  prize by random index. Rooms 0x00 and 0x18 read a rupee table by the room's low byte; every
  other minigame room draws 0 to 7 from `kDungeon_MinigameChestPrizes1`, refuses the index it
  gave last, and treats index 7 as a one time keepsake guarded by bit 0x4000 of
  `dung_savegame_state_bits`. The truthful key is the room plus that mask. The row's screen
  carries room 0x106, which the four chest game doors and the brewery share.
- `SCRIPTED_ENTRANCES` (0): the opening room is entered from the intro script, never a
  doorway, so no slot of the 129 carries it.
- `MOUTHS_NO_SCREEN_CARRIES` (118, 121): fall hole mouths whose landing room a door already
  reaches. Entrance 118 drops into room 0x58 (door entrance 42); 121 into room 0x56 (door
  entrance 40).
- Every room a door opens into is held by a screen. The East Death Mountain caves were the
  last: Paradox Cave holds 0xDF, 0xEF and 0xFF, Spiral Cave 0xEE and 0xFE, Fairy Ascension
  Cave 0xED and 0xFD, and Bumper Cave 0xEB and 0xFB.
- `MOUTH_AREA_EXCEPTIONS` is empty; a new entry means an area is wrong.
- `KEY_GATED_CROSSINGS` counts sides, not doorways: `Dungeon_ProcessTorchesAndDoors`
  (dungeon.c:5069 to 5094) reads the door type of the room the player stands in, so one
  doorway can ask for a key one way and the big key the other.
- `BOSS_TAGS` are the room header tags 37 ("kill enemy to clear level") and 56 (Agahnim).
- A screen with no entrance id is a variant of a room, never a claim on a door. An overworld
  screen with no native index cannot hold a mouth. A room the dungeon map leaves out is an off
  map room.

### game/data/rom-fixture

The ROM is never committed, so `describeRom` replaces the suite body the way
`describeDataset` does. Candidate folders are the ones a checkout keeps a ROM in, plus
`ROTP_ROM`. A file counts only when its SHA1 (after the 0x200 SMC header strip that
`loadRomFromBuffer` does) is `ZELDA3_SHA1_US`.

### game/data/tag-migration.keep.test.ts and tag-records.keep.test.ts

Every tag a record holds resolves to a term its collection may carry, with no raw term left.
The tag seed is complete and lossless: every taxonomy term has exactly one record under the
same label. A missing tag id throws and names the id.

### game/data/tag-writer-convention.keep.test.ts

The writer is what stands between a bad key and the file. Every refusal returns before a file
is read or an id allocated, so a rejected term never burns a number; the root does not exist,
so touching the filesystem would throw.

### game/data/tree-layout.keep.test.ts

One convention: `<collection>/<world>-world/<overworld|interiors|dungeon>/<area-or-floor>.ts`.
Nothing is split by size; a trailing number is a floor, which only a dungeon folder's files
carry. One dungeon is filed in halves (`SPLIT_BY_HALF`), so its rooms resolve to no single
file and must sit in one of the two it declares.

## game/navigation/cliff-preprocessing.keep.test.ts

Room 0x71: lone 0x28 jump triggers beside a staircase produced 1 wide up arrows that Link's
2x2 body can never use. Indoors, a trigger is a real jump only when a perpendicular
neighbour trigger infers the same direction. In the staircase model, row 22 holds triggers
at columns 12 and 13; column 12 is walled three deep on both sides (ambiguous, so it falls
back to south) and column 13 has a wall to the north only, so it infers north with no
matching neighbour and yields no ledge. The fan case is room 0x72's north jump.

## game/navigation/connection-audit-resolve.keep.test.ts

Tag inference for a real crossing the dataset does not map, now done by `inferTags` in
`points.set.ts`. A travel transition is a warp room door destination (header slots 3 and 4,
emitted only when the room has a warp type door), so a walk tag would be wrong on any record
minted from it.

## game/navigation/connection-issues.keep.test.ts

`screen-028` and `screen-043` are `lw-00` and `lw-01`, looked up in
`scripts/generate-ids/output/id-manifest.json`.

## game/navigation/connection-nav-from-flood.keep.test.ts

`ROUND_TRIP` is a compile time guard: the shape the serializer emits must be a valid
`ConnectionRecord.nav`, so a drift in `ConnectionNavData` fails the type check.

## game/navigation/constrain-void-tiles.keep.test.ts

Room 0x72: the lower floor on layer 1 reaches the grid edge through an open south passage, a
bare 0x00 corridor flanked by walls. The void flood used to seed from every boundary 0x00,
walk up that corridor and wall the whole floor (309 tiles). Narrow, wall flanked boundary
gaps are exits and must not seed the void; wide spans must. The model is a void everywhere,
a walled floor in the south half and a 4 wide exit corridor to the south edge.

## game/navigation/dual-layer-ledge.keep.test.ts

Tagging ledge tiles as traversal once made `expandLedgeCross` return no landing cell, so a
ledge drop drew its arrow but never flooded the layer 1 area below (room 0x72). The north
jump case is room 0x72's west walkway: a 1 deep trigger line, where the old check wanted the
whole 2x2 body on ledge tiles; now the leading edge must be fully on ledges.

## game/navigation/palace-index-dungeon-name.keep.test.ts

Pins `cur_palace_index_x2` to dungeon record to destination file stem. The values are the
game's own, doubled (its tables index by `cur_palace_index_x2 >> 1`). Ground truth is the
ROM's dungeon map floor layout table at SNES `$8AF605` (14 entries), corroborated by
`kDungeonCrystalPendantBit`. The editor picks the destination file from `fileStem`, so a
shifted table writes screens into the wrong file; it once shifted by one dungeon from 0x08
up. The first castle has one dungeon record and two palace values (0x00 and 0x02).

## game/navigation/screen-detection-palace.keep.test.ts

A dungeon screen is keyed by `palaceIndex:roomIndex`. On a mismatch the detector still finds
it through the room only palace scan fallback, so a wrong label costs only the exact key.
The three blessed nav baselines (`.claude/nav-baselines/<state>/dump-nav.json`) are pinned to
an exact match. `screen-133`, `screen-119` and `screen-061` are `hc-0x80`, `hc-0x51` and
`lw-13`. Room 0x80 belongs to palace 0x02; the mismatch case reports palace 0x00.

## input/haptic-gates.keep.test.ts

Two gate layers must both pass for an in game event to rumble. The C master gate is
`kFeatures0_Haptics` (bit value 1048576, matching `features.h` and
`live-settings-flags.ts`), reached through the boot INI `Haptics` key and the live push.
Then seven granular gates in the haptic service, one per event category. Spin attack
release shares the sword swing toggle, death shares damage taken, and the mirror warp
polling path shares environmental effects.

The suite advances `performance.now` by a large step on every read, so the per pattern
cooldowns (module state that persists across cases) never block a fire. It asserts gating,
not debounce timing.

## input/slot-list.keep.test.ts

Slot numbers are contiguous, so removing slot 2 makes the old slot 3 the new slot 2. The
assignment table is keyed by number, so `remapAssignments` must move each assignment with
its slot, or an item lands one button up without warning.

## input/slot-migration.keep.test.ts

`fixtures/spc2-profile.json` and `fixtures/spc2-assignments.json` are a real profile written
before slots were numbers: twelve slots keyed by SDL position and eight assignments keyed
the same way, four of them on shoulders and triggers. `fixtures/sdl-order-profile.json`
stores its list in SDL device order (SOUTH first). The fixtures sit in the tracked
`tests/fixtures/` folder so every clone has them.

Position is display only; the slot number is the identity. A binding and a position need
not describe the same device (slot 1 is drawn as NORTH and driven by the W key). The slot
list is migrated when the profile is read and the assignment table when the settings are,
so the second call sees a list whose old ids are gone; old ids are rebuilt from `position`
and from a key binding. The boot path runs the migration more than once, so it must be
idempotent. A list that already carries numbers is the player's own order and is never
sorted again.

## input/slot-prefill-order.keep.test.ts

A HUD layout and a control scheme are joined only by the slot number. The built in HUD
documents put slot 1 on the north face button through slot 8 on d-pad right. SDL reports
its buttons from SOUTH, with the d-pad before the face cross is finished, so prefilling in
device order would draw every shipped layout with the controls permuted.

## input/vibration-shaping.keep.test.ts

Shaping compensates for how each pad's rumble feels and only touches magnitude, never
duration. Xbox dual rumble is linear and soft at low magnitudes, so it boosts onto a floor
(0.3 plus 0.85 times the magnitude, clamped at 1). Switch HD rumble already feels strong, so
it stays unchanged.

## parallel/automation-launch.keep.test.ts

The automation predicate decides whether a launch may write the shared configuration
(default profile, window position). It must answer yes for every automation flag, even a
run without `--instance`; a false no lets an agent run repoint the user's profile. The two
shared files are `app.json`, written by `loadProfileForGame` on the `--auto-state` and
`--screenshot` paths, and `window-state.json`, written on close.

## parallel/link-deps.keep.test.ts

`git worktree remove --force` walks into a junction and deletes what it points at; it once
emptied the real `.claude`. Links must be detached first, without touching their contents,
and the test detaches before its own cleanup for the same reason. The production
`LINKED_DIRS` list is empty now, so the test passes a made up directory name explicitly.

## parallel/verdict.keep.test.ts

The case that matters is the refusal: uncommitted or unlanded work must never come out as
claimable or deletable.

## story-events/core-harness

The headless core harness loads a built core in node with no window. It gives RAM reads and
writes, save state loads, frame exact scripted input and a hash of the game state. Two cores
load side by side (this build and a master baseline) and run the same script, so "same
result" is a byte compare. SNES WRAM is 128 KB and the battery block sits inside it at
0xF000. A frame refused by the developer tools gate throws. `hash` can zero ranges out of
the digest, such as the event ledger.

## story-events/t1-parity.keep.test.ts

With every story field at zero, this build and a master build produce identical WRAM after
the same scripted input on every save state fixture: off, nothing observable changed. The
script idles, walks, acts and idles, enough to cross a transition on most fixtures, and the
frame counter at 0x1A must move so the script provably ran.

The baseline core is built out of band and the suite skips without it. Point
`ROTP_BASELINE_WASM_JS` at a master build's `zelda3.js`, or build one into
`.user-data/baseline-core` with
`git archive origin/master core scripts/ensure-wasm.mjs package.json | tar -x -C .user-data/baseline-core`
and then `node scripts/ensure-wasm.mjs` inside that folder, with the emsdk environment active.

## story-events/t6-tracker.keep.test.ts

The tracker's event records resolve from a synthetic heap: ledger bits, vanilla bits, the
derived pass and the older file fallbacks, with no game. A ledger event answers from its own
bit alone; a later story beat never stands in for it.

## platform/primary-modifier.keep.test.ts

On macOS and iOS the primary modifier is Cmd alone; a bare Ctrl means something else there.
An unknown OS accepts either key, because the web host reports `os: 'unknown'` and guessing
Ctrl would break Safari on a Mac.

## regression

The regression net. `run-snapshot` records what every save in the corpus reports into
`.user-data/net/<ROTP_NET_LABEL>.json`; `run-compare` holds the current snapshot to the
baseline, allowing exactly the rows `expected-changes.data.ts` declares. Take the baseline
with `ROTP_NET_LABEL=baseline` before a change and `ROTP_NET_LABEL=current` after, then run
the compare with `ROTP_NET_BASE` set. Without a label the snapshot writes nothing, and without
`ROTP_NET_BASE` the compare skips, so a bare `vitest run` never compares two stray files.
Both only read saves.

Everything is keyed by id, never by name, so a rename cannot hide a behaviour change; the
`names` map is the one name column and is compared on its own. A placement is compared by
id for the same reason.

### regression/corpus

The save states and seeds the net runs over are discovered, never listed: every quick and
manual save of every profile under `.user-data`, and every save state fixture. The four npc
and four world item spots in the key drop seed are the ones the net proves deliverable, and
every pond's own pair is proven deliverable so no pond is held back. Seeds are append only:
removing or editing one makes every stored baseline unreadable for that seed.

### regression/expected-changes.data.ts

The rows the current step may move and the names it may change. A refactor step leaves
every list empty and must move nothing. A behaviour step writes its rows here before it
runs, so the change is reviewed next to the code. A difference is never accepted by
regenerating the baseline; the baseline would learn whatever the bug did. `save: '*'` covers
every save, and `because` is read in review, not by the test.

The current baseline is `story-events-floor`, captured on 2026-09-27 after the Archipelago
merge. The story events stopped being locations of the world, so their rows read the
dataset's own record like every other event row (`lib/game/tracker/tracker-statuses.ts`).
`check-335` (Frog found) now asks for the Titan's Mitt, where the seed engine asked for heavy
lifting from what the seed's completed locations handed over; seeds only. `check-329`
(Agahnim 1 beaten) asks for a sword and sight inside the tower, where the engine also asked
for the tower's four small keys.

Dropped locations are taken out of the baseline's locations and spheres (an emptied sphere
goes too) and out of the stats counts. New checks are dropped from the completed list so a
new record that steals an existing row's bit is still caught. The `reachableScreens` column
may move wholesale only for a step that changes how it is derived. Declared screen additions
are allowed; a screen leaving the column is a loss and is never declarable.

### regression/run-snapshot.keep.test.ts

The core is armed as the app arms it: gate word 3 gets the tracker query export (1024) and
gate word 5 the default story word. Normal reads through the same engine as a seed, over the
placement where nothing moved. The event ledger is handed to availability, as every app path
does; without it an act reads as done the moment its means are in reach.

## search/catalog.coverage.keep.test.ts

The compile time guard for the catalog is `PROFILE_HUB_TABS: Record<ProfileHubTab, ...>`;
this suite checks the built catalog at runtime. The title bar menu reads
`window.api.isDev` while the catalog builds, so the suite stubs `window` in the node
environment.

## storage/sprite-set-freshness.keep.test.ts

An extraction clears the sprite folder before writing it again under the same names, so
every image on screen fails meanwhile and the image primitive remembers the failure per
source. A rewritten set therefore needs new URLs, or its rows stay on placeholders for the
rest of the session.

## storage/ui-views.keep.test.ts

The ui-views module keeps its cache and timer as private module state, so each test
imports it fresh after `vi.resetModules()`. That also defers the log bus's
`window.addEventListener` until `window` is stubbed. Loading another key rides the shared
in-flight load, which flushes the pending cold start write before it resolves.

## snapshot.spec.ts

A visual snapshot driven by environment variables. The app loads the current profile and
save state slot `SNAPSHOT_SLOT` (default 2), then its auto test hook writes
`tests/screenshots/<SNAPSHOT_NAME>.png`. `SNAPSHOT_WAIT` is the time given to the app to
finish (default 20000 ms). Run it with `npx playwright test tests/snapshot.spec.ts`.
