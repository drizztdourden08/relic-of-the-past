<!-- @layer docs @kind doc -->
# Code notes: tests

Facts about the test suites that the code cannot say on its own. Each heading names the
file or folder the note belongs to, relative to `apps/desktop/tests/`, or by its full path for a
suite that lives in a package or in `scripts/`.

## dataset-guard

`describeDataset` marks a suite that reads real record content. The records are tracked in
the repository, so it never skips today; it stays as the marker for those suites.

On an empty registry the suite body is replaced, not skipped. `describe.skip` still runs its
callback, and several suites build fixtures in the body outside any `it`, which would throw.
The placeholder registers one skipped test so vitest does not report the file as empty.

A suite over records it builds itself keeps plain `describe`.

## packages/asset-extraction/tests/alttp-asset-set.keep.test.ts

The byte identity case compiles with full options on purpose. The cheap variant
(`skipDialogue`, `skipMusic`) only proves identity for a blob the app never ships.

## packages/asset-extraction/tests/gba-alttp-supplement.keep.test.ts

The base game ROM is found by its `(USA).sfc` suffix, never named, because its filename
carries the trademark. The USA image is the one the extractor validates.

The `.sav` fixture is a live save the reference emulator writes during play, so its slots
hold whatever the tester last did. The test asserts the shape of the decode, never story
state.

## data-inspector

Several suites import `buildSchema` from its own module, never from the `@ds/data` barrel:
the barrel pulls in the view state binding, which touches `window` at module load. For the
same reason, suites that render the inspector stub `window` and then import the component
fresh after `vi.resetModules()`, because the binding reaches `apps/desktop/src/storage` and the log bus.

### data-inspector/accept-all-certain.keep.test.ts

Batch accept is a loop, never a `Promise.all`: two findings often land in the same source
file, and every write reads, waits for the IPC round trip, then writes back. Overlapped, one
edit is lost; the contrast case shows it. The gate is `certain`, because `likely` evidence
only proves presence and must not be written unreviewed.

### data-inspector/accept-recommendation.keep.test.ts

Accepting writes first and records the verdict second; a verdict before the write would
mark done a finding nobody applied. The four collaborators are mocked because each
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

The `isTagKey` gate in `apps/desktop/src/data-inspector/record-creators/create-tag-record.ts` never runs on a direct edit, so `writeTag` checks that
`name` reads `namespace:value` and refuses the save before the write channel.

## design-system

These suites tested RotP's own copy of the design system. The copy was replaced by Tessera
(`@drizztdourden08/tessera`), which owns and tests those parts in its own repository, so the
suites went with it.

## e2e

`apps/desktop/tests/e2e/README.md` describes what each permanent spec guards. The notes below hold what
the code itself used to say.

Every automated launch here leaves the owner's session alone: its own `--instance`, its own
copy of `.user-data` at a short path where one is used (a long path breaks `app-sprite://`),
`--no-focus --muted`, and nothing saved. A widget button is pressed with
`dispatchEvent('click')`, never `click()`: Playwright's click calls `Page.bringToFront()`,
which raises the window on Windows and steals focus.

### e2e/isolated-app

Every permanent spec launches through `launchApp` (or `startApp` for a launch that ends by
itself, like `--dump-nav`). Each launch gets its own fresh `--user-data` folder under the OS
temp directory, seeded from nothing but the checkout: the ROM and asset blob come from the
worktree's `.user-data/Data` or `test-roms/`, the profile files are written whole, and the
fixture save states are copied in with a fresh manifest. Nothing from an earlier run or from
the real `%APPDATA%` can be present, and the folder is deleted on close (set
`ROTP_E2E_KEEP_USER_DATA` to keep it). The folder name is short on purpose: a long path
breaks `app-sprite://`.

The app opens a splash window before the main one and closes it, so `firstWindow()` can
return a page that is about to vanish. `waitForMainWindow` waits until no `splash.html`
window is open, then takes the first window that is neither the splash nor a widget window
(`?widget=` in the URL). Every spec reads its page from there.

A spec seeds the profile it needs through `ProfileSeed`: the id (also `--instance`), the
display name, the settings written to `config.json`, stored modern slots, whether the profile
opens on launch, and which fixtures to copy. The modern-controls profile in
`hud-style-drives-scheme` is seeded with `hudStyle: 'modern'` and four stored slots.

### e2e/state-harness and e2e/state-readers

`withState` boots the built app on a named manual save with the navigation widget open,
waits 16 s for the core to report live memory, hands the body a reader and always closes. A
missing build or fixture skips. The keyboard codes per SNES button follow
`packages/input-mapping/src/keyboard-default.ts`. Input is gated on the active profile's device map, so
`enableKeyboard` binds the default layout in the live input manager, in memory only. A press
must outlast one input poll.

The readers anchor on section title text ("States", "On this screen"), since the widget
renders inline styled divs: a restyle cannot break them, only a rename. Every poll waits on a
predicate. Order matters: groups, rows, tags and the check summary report nothing until the
flood has run, and reading them first looks exactly like the regression the specs catch. A
multi screen area sums its sub screens, so the flood total climbs for a moment before it
settles.

### e2e/flood-parity.keep.spec.ts

The widget, the simulator's runner and the `--dump-nav` dumper must flood a location to the
same number. They once disagreed (Jail Cell: dumper 590, widget 608) because the dumper used
an empty inventory and a fixed interior tile context. `--dump-nav` writes the dump and exits
by itself, so the spec polls for the file.

### e2e/hud-layout-options

The rig for pressing every option of the HUD Layout panel in the built app. `readShape`
reads every control of one section as tags, names and rectangles, without each control's own
lit or checked state, which is the one thing an option may change about itself.
`readPlaced` reads every node's placed box off the stage. The page readers are self
contained functions, because `page.evaluate` does not carry a closure. A tall viewport keeps
a whole section in one capture; `element.screenshot` paints black past the viewport.

The rule: press an option, and its section comes back with the same controls, rectangles and
box (`stable`), while the option's own state did move (`flipped`), or the case is vacuous.
`stageState` includes the overlay's cell boundaries: a grid whose outer tracks are `auto`
around a `fill` track answers add, insert and gap by resizing the fill track, so no child
rectangle moves while the cells do (they come from `stageCellRects`). A grid line paints its
background and a flex slot its border, which is why the overlay colour reads one or the
other. An inserted `auto` column is empty and solves to zero width, so a track edit is judged
by the occupancy map it rewrites (children are renumbered). Pressing an alignment tile that
is already lit writes the value it had, so nothing may move.

The screen root is the subject because alignment, flow and distribution only show in a
container with room to spare; the root is the full play field with three children and can
take either engine. Each spec is one serial `describe` sharing one app, so the cases depend
on order (the flex spec starts by flipping the engine). In the grid spec, the alignment case
first sizes column 1 and row 1 to `fill`, because `auto` tracks hug their content and leave
nothing to align. Sizing a column that was `auto` to `px` then `%` carries the number zero,
so `%` moves no pixel and is exempt from the solve check. Wrap on a flex row whose children
already fit moves nothing; what wrap does when it applies is pinned in
`hud-layout-engine.keep.test.ts`. A flex overlay draws one slot per child and no lines. The
gap field's formula promotion floats the control and must not reflow its row.

### e2e/hud-style-drives-scheme.keep.spec.ts

The hub's side navigation shows labels only while open, so a tab is picked by its accessible
name. The slot list sits inside the column's own scroller, so the shot scrolls the last row
into view and clips to the visible rows. The modern profile is stored as
`hudStyle: 'modern'` with four assignments keyed by slot number, and the Style row and the
slot list must show exactly that.
Original is pressed first so a rerun never depends on how the last run ended, and every
setting changed is changed back.

### e2e/ledge-baseline.keep.spec.ts

Four states pin every ledge kind (see the README). Counts are asserted per direction, because
these bugs move a jump between directions while the total holds. A diagonal hop is not 45
degrees: `LinkHop_FindLandingSpotDiagonallyDown` (player.c:1115) steps x by 8 and y by 9, so
the row delta may exceed the column delta by one; a hop spanning many columns came from
running along the face.

### e2e/state specs

- `state-big-screen`: the castle exterior is a four screen area (0x1B, 0x1C, 0x23, 0x24); one
  screen is 64x64 = 4096 tiles, so the total must be 16384.
- `state-intro-bed`: the sleep handler waits for a button, so beats need taps; A and B
  alternate so a stuck auto repeat cannot stall. The tap budget is a ceiling, checked before
  each tap. The first frame is the zero baseline for progress flags.
- `state-jail-cell`: the flood now reaches past the cell, so the summary counts a third
  check outside it, already done; the two behind the lock are what the state guards.
- `state-links-house`: a follower in tow is what makes this the intro and not a later visit.
- `state-sanctuary-grounds`: the single screen outdoor case, on purpose.
- `state-secret-passage`: room 0x55 is claimed by two screen records (a dam room and a
  castle passage). Neither carries an entrance id or variant, so resolution returns
  `screen-170`, not `screen-171`; the spec asserts what the widget renders today.
- `state-tag-room`: the flood derives the annotations, so it runs first; the tag must decode,
  not show raw 0x08.
- `state-throne-room`: the state is saved without a follower, so the push wall
  (`nativeType 0x14`) must read shut.

## electron/recommendation-files.keep.test.ts

Every recommendation operation reads, changes and writes a whole collection file. The per
kind queue must wrap the whole operation: queueing only the save still lets two decisions
read the same snapshot, and a batch accept depends on it. Without the queue, either the
later write overwrites the earlier verdict, or the two writes collide and the file reads
back empty, which is why the unqueued case only asserts fewer than two verdicts.

## packages/features/tests/all-off-vanilla.keep.test.ts

With every enhancement off, the bridge sends all zero feature words so the engine runs the
verbatim vanilla path. `hudStyle: 'vanilla'` is the default Original HUD; a host drawn
style arms the host menu gate bits.

The init time texture height follows the INI `extend_y`, which only applies with
`extendedRendering`. The live Height240 PPU flag must agree, or the draw loop overruns the
buffer. `extendY` defaults to true, so a vanilla profile with extended rendering off must
still render the stock 224 lines.

## packages/features/tests/bundle-flags-parity.keep.test.ts

The split bug fix flags are generated into both the C header and the TS registry from one
catalog (`scripts/build/gen-bundle-flags.mjs`). The word 3 gate bits in `features.h` and the
host menu and modern controls bits in word 2 are hand written on both sides, so they are
checked the same way. Word 3 has no free bit left, which is why those two gates live in
word 2, above `kFeatures2_HandAuthoredFloor`.

The C headers mention flag names in prose comments, so the scan strips comments first. An
enum value is either a literal or a shift; anything else is skipped. Both word 2 gates
change what the game computes (the menu takeover and the item register), so both must be
in the Vanilla Safe mask, and they are asserted by name so a removed entry fails.

## packages/features/tests/hud-style-scheme.keep.test.ts

The HUD style is the one choice and the control scheme follows from it. Each style is kept as
stored, the two host drawn styles force the overlay on, and a fresh profile is Original and so
Classic.

## packages/features/tests/resolve-features.keep.test.ts

The rendering requirement tree: `extendedRendering` then `linearWorldTilemap` then
`ultrawideRendering` and `tallRendering`; `cameraLockToViewport` requires
`extendedRendering`; `smoothTransitions` requires `cameraLockToViewport`. A child never
resolves on while its parent is off.

## packages/features/tests/vanilla-safe-lock.keep.test.ts

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

## game/recommendations

Several suites build a `contextFor` whose `context.screenId` and `observations.match` name
the same screen, mirroring `useScreenObservations.ts`, where the two always agree. Probes
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
a throwaway workspace shaped like `packages/game-data/src/data/...`, because the id allocator scans that
shape and the path resolver refuses to leave it.

### game/data/check-content-tags.keep.test.ts

The check content tags (key, big key, map and compass, boss item) are a seeded
`CheckRecord.tags` array, no longer computed on read. A few known checks are pinned so a
seed edit shows as a diff.

### game/data/connection-pairing.keep.test.ts

One record is one point on one screen; `toConnectionId` names its partner (see
`packages/game-data/src/data/connections/derive`). Two invariants do not hold today and stay as
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

### scripts/tests/enumeration-generated-types.keep.test.ts

`packages/game-data/src/data/enumeration/enumeration.type.ts` is committed, so an edit to `ALL_ENUMERATION` without
`npm run generate:enum-types` would go unnoticed; the suite regenerates it in memory and
compares byte for byte. A category earns a union only when the field it labels stores a
string; the progress tier labels a numeric field, so it is left out of the code generation.

### game/data/enumeration-writer.keep.test.ts

The writers also regenerate `packages/game-data/src/data/enumeration/enumeration.type.ts` from the real repo's `ALL_ENUMERATION`
(`generate-enum-types.mjs` reads a fixed path). That is harmless here because the real
`enumeration.ts` never changes, so the run is a no op.

### scripts/tests/generate-enum-types-root.keep.test.ts

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
`connection-crossing-probe.ts`. A travel transition is a warp room door destination (header slots 3 and 4,
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

## hud

The HUD layout editor suites. Section numbers (§50, §55 and so on) in test names refer to the
design passes of the layout editor plan.

### hud/layout-bands.harness

The Layout section measuring rig, shared by `hud-grid-strip` and `hud-layout-bands`: SSR the
real components, load the real token, primitive and editor stylesheets into headless Chromium,
and read the boxes at three rails. The rails are the widths that exist: 188 was measured until
the rails became draggable, but `PANEL_MIN_WIDTH` is 220, so no gesture reaches anything
narrower; 220 is the floor, 232 the narrow case, 320 the default.

- The composed block had five bands (title, settings panel, strip, lattice, legend) and now
  has three: the strip, the lattice, the legend. The settings are `LayoutSection`'s own flat
  sub sections, which the `section` cases render whole.
- The block is composed here instead of driven, because SSR renders the initial state and
  nothing in the harness can click. It mirrors `GridEditor.tsx` band for band, and
  `hud-layout-bands` greps that file to prove it still does.
- `probe` runs in the page through `page.evaluate`, so it may close over nothing; every
  constant it needs is declared inside it. A box paints when it has a non transparent
  background or any visible border, and only the section's own chrome is asked; controls are
  meant to be drawn. The legend's key strip is a deliberate sideways scroller, so what is
  inside it is exempt from the overflow check, but the strip itself is not.
- One toolbar row is a 26px button plus 2px of padding above and below. It was 32 while the
  strip wore the toolbar's border; the strip is flat now, so the border went with it. The
  guarantee is unchanged: one row, the same in every state.

### hud/hud-layout-bands.keep.test.ts

The totals half of the Layout section, measured; the geometry is `hud-grid-strip`.

- A grid section measured 689.5 / 689.5 / 637 (§50), 474.5 / 414.5 / 399.5 (§51), 579 / 579 /
  564 (§54), 447 / 447 / 433 (§55), then 455 / 455 / 413 (§56): 8px taller at the two narrow
  rails and 20px shorter at the default. It spent width on section one's three labels and two
  32px alignment tile rows where the 3x3 pad was one 82px square; it bought every piece of
  section one on one line at 320. At 220 and 232 the pieces need two lines, and the gap
  field's 28px is 2px more than the 26px rows beside it. A layout packed by measured width is
  supposed to answer differently at a different width.
- A flex section measured 152 / 124 / 124 (§51 and §54), 150 (§55), 164 then 198 (§56), then
  362 / 362 / 334 (§58), and 358 / 358 / 330 once the strip's 2px sunken well went. The growth
  is a flex manipulation section (title, strip, child cells, legend), Flow as its own titled
  section (because `direction` turns the alignment tiles and a section may not rearrange itself
  when one of its own options is pressed), and section one's second gap cell and Overlay piece,
  which make it the same section under both engines. The grid's numbers did not change.
- Nothing escapes the rail, down to 220.
- The block's band order is grepped out of `GridEditor.tsx`, so a band added, moved or dropped
  fails here instead of the numbers measuring something no longer on screen. §51's
  `persistent` prop, §54's settings panel, its heading box and the strip's old `controls` slot
  must stay gone. `LayoutSection.tsx` mounts four sections in the order Layout, Flow,
  Alignment, manipulation; both manipulation components hang off one slot titled for the
  engine in force, and the two wrappers §54 needed are mounted from nowhere.

### hud/hud-grid-strip

The geometry half, on the same rig. Each claim is one of the maintainer's requests turned into
a rectangle:

- Its own section means a title with a gold rule and the content under it: three titled
  sections under a grid, four under a flex container, named by concern. Flow is its own section
  because `direction` turns the alignment diagrams.
- No box around anything: nothing in the section's own chrome paints a background or border.
  §54 drew three nested surfaces (the block's card, the settings well, the alignment pad's
  well); the only thing that paints now is the sub section rule, a border on the title.
- Section one keeps labels (Type, Overlay, Gap), the same three under either engine, packed
  into as few lines as their measured widths allow: two lines at 220 and 232, one at 320. Lines
  are counted by overlapping vertical ranges, since the 28px gap field is centred against the
  26px icon rows.
- No empty space: the gap piece reaches the section's right edge, within 1px since a `1fr`
  track can land on a half pixel. A grid's two gap fields share one line and clear 50px each
  (54 at 320, 98 at 220); §55 had stacked them because the alignment pad was still in this
  section.
- Every alignment tile has one size, in full lines: a grid's two axes are a line each, and a
  flex container's six main axis values fold into two lines of three above the cross axis.
- The add column and add row `+` sit at the very end of their header strips.
- A flex container has the same two gap fields and the same overlay box as a grid; §57 showed
  the flow engine always spent a gap on each axis and `guide` belongs to any container.
- The toolbar strip is one row in every selection state at every rail. A track used to add an
  81px size field to five buttons behind its chip, 287.4px against a 224px strip at 232, so it
  wrapped; the size moved onto the track's own header. The lattice never moves between states.

### hud/hud-data-compile-expr.keep.test.ts

`compileExpr` is the piece everything above it assumes cannot fail: it never throws, never
hangs, and never lets a document smuggle real JavaScript past the arithmetic the plan promised.
Every nasty input the phase one plan names has its own case. One correction to the plan:
expr-eval uses the words `and` and `or` for logic, not `&&` and `||`; the plan's worked examples
use the wrong dialect, the fixture's `last-heart-gate` is the corrected form, and
`javascript-and` proves the original spelling fails.

- `||` concatenates strings in expr-eval. Left enabled, `life_current || 0` with life at 11
  produced "110", which numeric coercion turned into 110: a wrong number with no error. `&&`
  has no meaning in the grammar and says so.
- `random()` parses and evaluates but gives a different number every call, so a layout using it
  cannot be previewed, diffed or drawn the same twice. It is refused after the parse, because
  expr-eval has no per function switch and deleting it would only turn it into an unknown name
  failing at evaluate time. It is refused nested and as a bare name too.
- An unknown variable name is syntactically fine; which names are known is `validate-value`'s
  job. A second compile of the same text adds nothing to the cache and returns the same object.

### hud/hud-data-resolve-value.keep.test.ts

`resolveValue` is the seam a bad expression cannot get past: whatever `compileExpr` and
`evaluate` produce, this is where `1/0` stops becoming a repeat count of `Infinity`. Each case
asserts the documented clamp or proves the function never throws, since nothing downstream
catches.

### hud/hud-data-validate-value.keep.test.ts

`validateValue` is the hook in `validate-layout.ts` for the phase that gives a `HudBox` field a
real `Value` type. Nothing on the document schema calls it yet, so it is tested directly. An
unparseable expression and an unknown variable are both refused with a message naming the
field and, where one exists, the column, and it never half succeeds.

### hud/hud-data-variables.keep.test.ts

The flat variable table: the fifteen names the plan's data surface lists, the three countdown
names §62 added (for a formula or a switch to read), the three scope extras kept out of the
table, and the scope builder that turns the HUD's vitals fields into the numbers an expression
evaluates against.

### hud/hud-engine-switch.keep.test.ts

Switching a container's engine converts it and cannot crash the editor. The editor applies edits
through `patchNode`, which shallow merges. The switch handed it a new flex container, so
`layout: 'flex'` was laid over the grid, leaving `columns`, `rows`, `justifyItems`, `alignItems`
(unsavable, the validator refuses them) and a grid gap where flex then read one `Value`.
`resolveValue` read `.expr` off an object with none and threw inside the layout pass; nothing
catches above the stage, so clicking flex took the editor down once a gap had been set. Both
halves are pinned: the conversion leaves nothing of the other engine, and the resolver keeps its
never throws promise on the malformed shape, so the next merge bug costs a wrong gap, not the
screen. Since §57 `gap` is `{ x, y }` under both engines (x horizontal, y vertical) and `guide`
belongs to any container, so both pass straight through in either direction and flipping back
restores the grid exactly. The round trip never strands a child outside the new grid.

### hud/hud-keyboard-move

Phase 6 of the HUD drag and drop plan: the keyboard path, last only because it needed the intent
producers final, and not optional. The fixture is a screen column holding `hud` (a column of
`hearts`, a row of two pips, then `magic-bar`), `vault` (a row holding `coin`) and `loose`.

- The announcement and the ghost say the same thing: `apps/desktop/src/hud-layout-editing/drop-ghost` is a pure function of the
  document and one intent, so the `aria-live` region is its lines flattened, and the test asserts
  against the ghost's own model instead of writing the sentence twice. A refusal names both nodes
  once.
- The four keys are the third intent producer, not a fourth code path: each is an intent computed
  from the tree and handed to the same `applyDrop`. Up and down reorder; out promotes to the
  grandparent right after the old parent (as in every outliner); in demotes into the previous
  sibling, appended.
- Nowhere to go is not a refusal: `null` shakes the row and announces nothing (the list already
  shows you are at the top), while a refusal announces a sentence; both write nothing. Null cases:
  already first or last, a parent that is the screen, no previous sibling, a previous sibling that
  is a leaf, and the root, which has no array to be spliced from.
- Bare arrows and Ctrl+Shift or Ctrl+Alt arrows are left alone, since a row that swallowed them
  would eat text selection or another control's keys.
- The context menu is where the keys are learned: it prints each shortcut, opens from Shift+F10
  and the ContextMenu key and a right click, closes on one Escape through the dismiss stack
  at `menu`, runs the same operation, and dims items with their precondition named instead of
  hiding them.
- In `CellPicker` (moved from `GridEditor` in §50, since co placing is a child's edit) an occupied
  cell is a destination: hatched, named with its occupant, and placeable, because co placing is
  legal (§42) and the only way an overlay is authored. The node's own cell is never counted as
  someone else's.

### hud/hud-layout-documents.keep.test.ts

A built in and a custom layout are the same document. Every shipped arrangement goes through the
loader a player's saved layout uses, so built in is a label, not a second authoring path; if a
built in ever needed something a saved layout cannot have, the format is too short, which the
first case checks by turning a built in into a custom layout and getting identical pixels. A bad
document fails loudly, at the wrong path, and never half draws. Cases edit documents as loose
JSON because they stand in for a hand edited file. `$comment` is documentation for readers and
does not survive into the model. A band is a direct child of the screen (what a `regions` entry
became in §42), so its own alignment is what can be wrong, not an anchor name. The glyph and
sprite cases walk to the first real `glyph` and `sprite` leaves; `hearts` is an id already used,
for the repeated id case.

### hud/hud-layout-bindable.keep.test.ts

Bindable boxes (phase 2 of the HUD data binding plan): `size`, `scale`, `opacity`, `gap` and
`visible` take a `Value` resolved against `MeasureContext.scope` before measuring. The acceptance
proof is the magic bar authored with no new element kind: a sprite whose `size.w` is
`magic_current / 128 * 24`. Its painted rect is asserted through a childless container sibling,
because an element is always contained to its intrinsic aspect while a container's placed rect
equals its resolved box; `measureBox` proves the same width box side. The test screen is three
bands each way with the root in the top left cell, what `anchor: 'top-left'` used to say. A
hidden bar takes its gap with it.

### hud/hud-object-catalogue

Phase 3 of the HUD data binding plan: the four objects (`text`, `repeat`, `switch`, `button`)
and `expand.ts`, the pass that turns a dynamic tree into a static one before measuring. The
worked example is the hearts: a `repeat` over containers with a per heart `switch` choosing the
sprite, two levels of dynamic behaviour from the two new kinds. Expressions use `and`, `or` and
`not`, never `&&` or `||` (contract §22.6). Repeat widths stay at or under 16, the leaf's natural
size, so the box width is always the constraint of contain and centre. A switch with no match and
no `otherwise` places only the wrapping row. A runaway count clamps to `MAX_REPEAT_COUNT` (200),
and a NaN count is zero instances. The budget validator refuses two nested repeats of 200 (40,000
worst case nodes) by name. Text resolves literal strings as given and pads bound numbers; the game
font snaps to multiples of its 16px design size; a sprite face is a fixed 8px row. A button's slot
bind derives `dimWhenEmpty` from its index, a missing state face falls back to idle, and state
priority is pressed, held, unassigned, idle.

### hud/hud-presets.keep.test.ts

Phase 5 of the HUD data binding plan: the eight prebuilt subtrees and the
`shape` leaf they lean on (a heart and the magic bar, which a sprite and tint composition cannot
draw; see `packages/hud/src/types/hud-shape`). Two inserts of the same preset never collide in ids, with each other
or the template. Original mode rounds a heart's fill up to the next quarter as the console does.

### hud/hud-appearance-controls

Phase 8 of the inspector UX review, Appearance measured at 289 / 232 / 188 px with the stylesheets
walked (this phase added `apps/desktop/src/theme/hud-layout-editor/appearance.css`).

- The claim to prove is height. The case for `SubsectionGroup` is that closed, the redesign is one
  screen tall; the section was about 1800px of flat scroll with everything on. SSR renders the
  initial state, every group collapsed, so the measurement needs no mocks or clicks. The rail is
  the window less the editor chrome (16px padding twice, an 8px gap, a ~34px toolbar: H minus 74);
  on a 768px laptop that is 694px, the Inspector label and eight other headers take ~180, so
  Appearance's body has ~500px. Against `expanded`, the same six groups open (the old shape), the
  closed groups are under a third of the height; the unconditional rows (visible, opacity, radius,
  clip, dim when empty) are excluded because they would only dilute the ratio. The open bodies use
  today's controls, which are shorter than the old ones, so the comparison understates the win.
- Each header is one line whatever its value (the summary ellipses, since a wrapping header costs
  what opening would), states its value closed, and carries a 16px colour chip (a gradient paints a
  real gradient).
- Every colour row clears 100px of hex at 188 (seven times §34's 13.9px, against about 50px for
  `#rrggbb` at `--text-sm`): background, border, outline, tint, both shadows, and a gradient stop
  nested inside the ramp. All are the same `ColorField`. The hex is found by the aria-label
  `ColorField` writes, scoped to a case because a group's editor labels its colour plainly.
- The border sides are a 46x34 box instead of four checkboxes, the gradient ramp takes the full row
  at 18px tall, the paint kind is three 26px icons (82px) instead of a `Select` taking 75% of the
  row, and four slot chips fit one row at the default rail.
- The probe keys elements by their `hud-` class, since `Text`, `Flex` and `Box` prepend their own
  primitive class. Nothing escapes the rail and every label stays on one line.

### hud/hud-appearance-escape.keep.test.ts

The prerequisite of the appearance phase, checked against what was built. The inspector UX
review blocked `SubsectionGroup` because Escape closed the whole `FullScreenLayer` instead of the
popover in front of it, losing the editor to close a colour picker. §33 fixed the mechanism on a
stand in popover (`escape-layered-surfaces`); this suite proves it on the real chain, reached by
clicks: `FullScreenLayer`, `AppearanceSection`, a `SubsectionGroup` opened from its header (a
collapsed group renders only its summary), `ColorField`, and the `ColorPickerPopover` its swatch
opens. One press closes the picker and leaves the layer; the second closes the layer. The picker
mounts long after the layer, so ordering alone proves nothing; the layer and picker are two
stack entries and closing the inner pops one. A `SubsectionGroup` is not a dismissable surface,
so with no picker open Escape goes to the layer; a group that ate Escape to collapse would put
the editor back where §33 found it. jsdom has no `ResizeObserver`, which the radius row's
`SegmentedControl` builds on mount, so a no op stands in; widths are measured in real Chromium by
`hud-appearance-controls`.

### hud/hud-cell-picker.keep.test.ts

`CellPicker` (§50) is the child's own control and the only place in the panel where clicking a
cell writes anything. It looks like `GridEditor` and means the opposite: it writes a child and
cannot touch a track, while `GridEditor` writes tracks and cannot touch a child. Each says which
it is in its own header. Nothing is written while the pointer travels.

### hud/hud-container-gap.keep.test.ts

§57: a gap is `{ x, y }` under both engines, and `x` is always horizontal. Section one holds the
container's Type and what is true of any container, and pressing Type changed the gap beside it
(two fields for a grid, one for flex). The model was wrong, not the panel: `place-flow.ts`
already spent the one number on two gaps, between items along the main axis and between wrapped
lines (`packages/hud/src/engine/flow` `linesSize`). What is new is that the two axes can differ on a flex
container, pinned at exact positions and turning with `direction`: a row separates items by `x`
and lines by `y`, a column the reverse. A row that does not wrap has no second line, so only the
item gap is spent.

### hud/hud-countdown-node.keep.test.ts

§62: the HUD countdown as a layout element. The kind validates and refuses at the right path; it
measures as the pixel pie's 44x44 box, and both pie compounds agree; it is not placed while
nothing counts, leaving a flex line and a grid as `visible: false` does; a `switch` reads the
three new variables through `expand`; its drawn origin snaps to whole game pixels (an odd view
width centres it on a half pixel) for this kind only; and a parsed UI state buffer reaches a
rendered pie in the shipped layout with no store. It spans the whole screen grid only so it sizes
no track, so it is not counted as a grid occupant (that would mark all nine cells taken, found on
the grand merge test run), except in its own cell picker.

### hud/hud-drag-timers

Phase 5 of the HUD drag and drop plan: auto scroll and spring load, both loops. The claim worth
testing is that they stop: a frame loop surviving a drop keeps panning a list nobody drags over,
and a dwell timer surviving one opens a row after the gesture ended. Each exit has its own case
(drop, Escape, `pointercancel`, unmount), and the frame queue is stubbed instead of faked so
"nothing pending" is a readable number. The fixture is deep enough that the drag cannot reach the
bottom, with one container low down for the spring to open.

What is not proved: the outline runs over a stubbed `elementFromPoint` answering from y alone
(§44.7), which does not model scrolling, so rows never move as `scrollTop` changes. Proved is that
the right scroller is found (walking up from a row to the list), the ramp gives the right delta,
the loop is pointer driven and re-emits the pointer each frame (so it keeps running under a
stationary cursor), and every loop is cancelled; new rows arriving under the cursor need a real
layout engine. jsdom lays nothing out, so the scroller is given a real box (its bottom band is
y 176 to 200).

The ramp is linear across the band (0 at the inner lip, the full rate at the edge, half way in is
half speed), because a constant rate is a cliff and depth is the one control the gesture offers.
Spring load waits 500ms with the caret turning (the only animation, which tells waiting apart
from nothing happening), then expands. A drop elsewhere or a cancel re-collapses the row, since a
drag that leaves folders open has damaged the view; a drop inside it leaves it open, since folding
would hide the move. Leaving before the dwell resets it.

### hud/hud-drop-intent.keep.test.ts

Phase 1 of the HUD drag and drop plan tests the resolver headless: every refusal reason and the
outline vocabulary before a pointer event exists, since the resolver is cheap to get wrong and
expensive to debug through a gesture. The fixture is a screen grid of three columns holding
`hud` (a row: `hearts` with three pips, then `magic`), `wallet` (a leaf in cell 1,3), `rep` (a
repeat of 8 whose template `tpl` holds `fill`) and `sw` (a switch of `full` and `empty`).

- Inserting at the front of a container is newly possible. The old `resolveDrop` answered the end
  of the children for every `inside`, so the front of a collapsed container or of the screen was
  unreachable; it is reproduced verbatim so the defect is a fact. It also left the screen (a row
  with no siblings) a dead quarter row zone. The screen's own child order is now the whole paint
  order, so putting a backdrop behind everything has a gesture. A leaf has no inside band.
- Validity never retargets: a refusal names both nodes and stops instead of walking out to a
  legal ancestor. Dropping `hud` onto a pip resolves to `hearts`, still inside the subtree, so it
  is refused as a descendant. A switch is locked, but its container descendants are ordinary
  targets, which is how a heart's inner arrangement is authored. A bound repeat count has no
  literal, so the worst case is `MAX_REPEAT_COUNT`: 200 passes of 33 nodes is 6,600, over the
  5,000 budget, and the refusal is found during the drag so the ghost never lies.
- A node leaving the screen grid for a flex parent drops its cell (zero is absent, per
  `apps/desktop/src/hud-layout-editing/offset`); reordered inside its own parent it keeps it.
- `moveNode` has exactly one caller, the same structural check §37.1 used for `margin.left`.

### hud/hud-layout-grid.keep.test.ts

Phase 4 of the HUD data binding plan: the grid placement engine beside the flex flow.
`packages/hud/src/engine/place-grid` and `packages/hud/src/engine/grid-cells` own the arithmetic; this proves explicit placement, auto flow
(which starts at 1,1 and ignores a partial column), spans, `fill` tracks and per item alignment.
Row templates are explicit unless a case is about implicit rows, because a childless cell is 0x0
and an `auto` row off empty fixtures would collapse to zero and leave the flow. Cells are
childless containers so their placed rect equals their box. Two children may name the same cell
(an overlay); paint order puts the second on the first. `alignSelf` overrides both axes for its
child (one field, by design), so the child needs its own height once it is not `stretch`.
`gridCellRects` returns every cell, empty ones included, because an editor must name a column with
no child in it; §44 factored `solveGrid` out of `childBoxesGrid` so there is one track solve, and
the cells are the ones children were placed by. §46 removed its only caller but kept it for the
coming cell highlight overlay. A grid grows rows, never columns, so one implicit row past the last
is offered (40px of a 60px grid with one 20px row) and no fourth column.

### hud/hud-drag-indicators.keep.test.ts

The drag's own marks, measured in headless Chromium with the real stylesheets, walked rather
than listed (§36.9: a list silently measures an unstyled control the day a sheet moves). §46
removed §44's stage drop surface, the most visual part of the plan (the 2px insertion line and
caps, the cell wash, the co place hatch, the band ring), so none of it is asserted. What remains
is what the outline draws: a 24px pan band at each end of the scroller (a zero height sticky
child and a pseudo element, costing no layout, because undrawn auto scroll is the version nobody
understands), the ghost's offset from the cursor and its corner flip (which keeps it on screen),
and the cell hatch. A sibling occupied cell is a destination and wears a hatch instead of a fill
or a dim, since landing there stacks the two; that hatch moved from the stage (§45) into the
lattice (§48) and into `CellPicker` (§50), the only control that places a child, as its
`occupied-selected` state. The fixture child spans both columns of row 1, so one cell is shared
and hatched and the other is its own. The probe keys boxes by the first `hud-` class anywhere in
the list, because a design system `Button` puts its own classes first, plus the lattice's
`data-state`, or every cell would collapse onto one entry.

### hud/hud-layout-engine.keep.test.ts

The layout pass's rules that the built ins do not exercise. An element is contained and never
stretched, whatever box it gets; no code path writes a width and height independently, so two
fill boxes of 100 each draw their 16px sprites centred. An invisible node leaves the flow instead
of holding a hole. An overlay (one grid cell, every child in it, what `stack` became in §42)
moves children only by their margins, and its auto track is sized off their outer size,
negatives included. The three space distributions at exact pixels (§56): three 16px children in
a 96px row leave 48px; `between` gives ends 0 and inner 24 (0, 40, 80), `around` ends 8 and inner
16 (8, 40, 72), `evenly` 12 everywhere (12, 40, 68). The middle child is at 40 under all three, so
the difference is at the ends, which is what the panel's three tiles draw. A line of one falls
back to start, as `between` always has. A sprite's own `box` (the 16x8 bomb and arrow counters)
declares a non square aspect; a heart is always 8x8 and the magic bar 80x16, since the row that
repeats hearts is what grows. The screen's 3x3 bands reproduce the nine anchors' numbers.

### hud/hud-motion

Phase 6 of the HUD data binding plan (Motion): `animation` and `transition`, plus the reflow
warning the validator reports as data. The two proofs the plan named: staggering with
`delay: 'index * 80'` in a repeat (each instance bakes its delay to a different literal, 0, 80,
160, 240, 320, so one shared clock samples different points and the hearts do not pulse in
lockstep), and `steps(n)`, discrete instead of interpolated, the mechanism that replaces a GIF for
anything reactive (four 16px frames land on exactly four rungs). The last heart pulse gates on
the last heart that is neither full nor empty. Before its delay an animation sits at the rest
pose. Expressions use `and`, `or` and `not` (contract §22.6): the plan's own `&&` spelling is
refused. `index`, `count` and `item` exist only inside a repeat's child. Width and height
animating inside a flow container warn; the six safe properties do not, and nothing warns inside
an overlay (children sharing one grid cell, what replaced `stack` in §42), since nothing reflows.

### hud/hud-motion-controls.keep.test.ts

Phase 10 of the inspector UX review is Motion. What the new controls write is a question about
the document, so it is proven without a browser (`hud-inspector-collapsed-fields` owns the
widths). A key drag writes `at` rounded to two decimals, so a saved document carries no sub pixel
noise, and keys cannot cross: a middle key stops a minimum gap short of a neighbour and the outer
keys answer to the track's ends. Keys stay sorted, so `sampleKeyframes` never sees a swap. The
easing picker only emits strings `packages/hud/src/layouts/validate-motion` accepts and never `steps(0)`, which the
validator refuses. Thumbnails sample the engine's own `easingFn`: `ease-in` sits below the
diagonal at the midpoint and `ease-out` above it (a smaller SVG y). With nothing bound the
property list is still all six and nothing is driven; `position` is driven by being inside a
repeat. Unchecking the last property keeps the enter; clearing the enter too collapses the
transition. An enter only transition now validates (properties had to be non empty, so a fade in
alone could not be expressed). A reflow warning names the animated property, so the section can
put the note under the right card.

### hud/hud-drag-ghost

The drag ghost and the four states it must say. §44 shipped five, the fifth being the stage's
nudge; §46 removed the stage's drop surface, so the outline's card is what is left. The words are
tested, not the pixels: the plan's check is that the card's content makes a sentence (otherwise
the ghost is decorative), and the `aria-live` announcement is the same lines flattened; geometry is
`hud-drag-indicators`. The vocabulary is §42's: row, column, grid NxM, overlap, screen, never
stack; overlap is the editor's word for a grid whose children share a cell, recognised by shape,
while the document still says grid. A grid with one placed child is a grid (`isOverlay` is true of
it for the reflow warning, but wrong as a name).

- A flex drop names its position among the children it would have, counted after the removal when
  the node already lives there (2 of 2, never 2 of 3).
- An empty grid cell names the cell and `empty`; on the screen root this drop is the old anchor
  picker (cell 3,1 is top right) with a one crumb path. A shared cell says `with` its occupant.
- `refused` is the case it exists for. §43 recorded that a refused drop gave no feedback, and the
  outline's row highlight was removed on the understanding that the ghost would answer it. A
  refusal turns the whole card, names both nodes, keeps the breadcrumb (which tells how far out to
  move), and lights no row.
- Line 3 warns when a drop lands in a repeat template drawn N times.
- The card sits +14, +18 from the cursor and flips above left within 150px of an edge by a
  translation, so it never has to be laid out to learn its width and never lags.
- The outline is driven end to end, working around the jsdom gap §43.8 recorded: `rowUnder` asks
  `document.elementFromPoint`, which jsdom lacks, so every row of the flat fixed height list gets
  a rect and the lookup is answered from y. That is not browser hit testing (no overlap, scroll
  or occlusion), but it is the question `rowUnder` asks. Nothing shows before the slop threshold.

### hud/hud-drag-gesture.keep.test.ts

Preview, then commit: a drag writes the document once. §37's stage nudge called `onOffset` on
every pointer move, so a one second drag was dozens of writes and relayouts, and would be dozens
of undo entries. §43 closed it in `apps/desktop/src/hud-layout-editing/useDragGesture.ts`. The stage nudge is gone (§47), so
the gesture is driven through the outline's drop, the hook's remaining caller: twelve live frames
write nothing while the ghost card says what the release would do, and `onDrop` fires exactly
once, after release. Cancel is free: Escape mid drag leaves the document untouched and reaches
the drag first (§33's `drag` level). jsdom has no `PointerEvent`, pointer capture or
`elementFromPoint`, so a `MouseEvent` under the pointer event names carries `clientX` and
`clientY`, capture calls are optional by design, and the hit test reads a flat list of fixed
height rows as `hud-drag-ghost` does.

### hud/hud-motion-preview.keep.test.ts

Phase 10's stage integration, mounted: the scrub reaching the clock, and the Escape interaction.
Everything else in Motion is what gets written to the document, answered as pure functions by
`hud-motion-controls`. The transport is a `requestAnimationFrame` loop on a shared clock and a
key eight surfaces used to fight over. A playing preview registers on the dismiss stack at
`dialog`, so Escape stops playback and the editor stays up; a second press closes the editor.
With no transport use the stage gets `null`, not 0, so it runs its own free clock and existing
animations never freeze at t=0. `matchMedia` is stubbed because jsdom has none and
`useReducedMotion` reads it; one case turns reduced motion on, and then the stage gets no
override and holds the rest pose. The hook is imported from its own file, because the renderer
barrel pulls in the art layer, the input libraries and `window.api`.

### hud/hud-node-style.keep.test.ts

Phase 4 of the HUD data binding plan: the box grows a face. The document side has
`validateLayout` refuse a bad `style` and a grid container's own fields; the render side has
`resolveNodeStyle` turn a validated style into CSS, with `outline` and `tint` combined into one
`filter`. The outline width cap makes 999 and `OUTLINE_MAX_WIDTH` resolve to the same filter.

### hud/hud-stage-select-only.keep.test.ts

The stage selects and nothing else (§47). After §46 the maintainer could still drag on the full
layout preview; §37's margin nudge and the corner scale handle are both gone (a resize is a drag),
and `scale` and `offset` are edited in Size and Box and Placement. Absence of a test cannot prove
the stage no longer drags, since a `pointermove` handler could return unnoticed, so the gesture
is still driven (a press, six frames of 6 display pixels, a release) and the suite asserts no
write, the node still selected, and no snap guide, scale handle, drop surface or ghost.
`StageSelection` is mounted with no write prop at all, so a drag would have to grow a prop, which
is a review. A click is a click: an unselected box, a container and the screen root all select on
pointer down the first time. The source may contain no other pointer handler and neither drag
hook; it still names `apps/desktop/src/hud-layout-editing/offset` in prose, so only the import is forbidden.

### hud/hud-editor-step.keep.test.ts

§55 built `StepNumberInput` (a `ValueInput` with its spinner hidden and its own buttons) so a gap
could move by the editor's step; `ValueInput` already took a `step`, so it was replaced. The
editor step context reaches `ValueField`; an explicit `step` beats it, since a 0 to 1 fraction
nudged by 8 is as broken as a gap nudged by 1; the default outside a provider is 1, as before
the context existed. Every `ValueField` call site is read off disk and checked: a value in HUD
pixels takes the session step, and anything else (a count, an angle, a duration, opacity, an
amount) passes its own. The lists are the review, kept as code so the next field must join one.
`StepNumberInput` stays deleted and the CSS rule that hid the spinner went with it.

### hud/hud-layout-section-controls

Phase 7 of the inspector UX review: what the Layout section's controls write (widths are
`hud-inspector-layout-widths`). Each claim was a stated hole in the review.

- One tile per value the engine has (§56). The 3x3 pad crossed two positions, so `between` and
  `stretch` rode beside it as lone toggles. The set is exactly the engine's: four per grid axis,
  six on a flex main axis, three on its cross axis, and no flex `stretch` (`packages/hud/src/types/hud-node` never
  stretches under the flow engine and `place-flow.ts` reads a stray `stretch` as `start`, so a
  tile would do nothing). Flex rows are named main and cross, not by arrows, because a column's
  main axis is vertical, so its diagrams turn with `direction`; a grid's two axes never move.
- A track list round trips: add, size, reorder and remove, then through JSON and the real
  validator into placed rectangles (the 30px track moved first, so the second cell starts at 30).
  A move past either end is refused, not clamped; rows empty back to implicit; every
  extent shape prints on a chip.
- The screen root chooses its engine like any container (§42 lifted §38.4's lock, which existed
  only while the screen was a `stack` pretending not to be a grid). `LayoutSection` has no
  `isScreen`; Size and Box keeps its lock (§29, §37). The engine switch goes through the real
  conversion, `engineSwitchPatch` (§53), because building a container by hand for a merging
  `onPatch` left a grid's keys on a flex node; the no op case is in `hud-engine-switch`.
- The guide colour reaches the overlay, pinned end to end because an earlier pass read the wrong
  property. Grid lines come from the solved cells, so an empty column still gets its boundary
  (three lines for two columns, at 0, 40 and 80 display pixels). Since §57 a flex container's
  overlay draws each child's placed slot, so the gap shows as daylight; since §58 slots are inset
  a pixel and dashed (§57.8 photographed the first slot under the gold selection outline, reading
  as one box). Nothing on the overlay is a click target, the stage being select only (§47).
- The toolbar offers Row, Column, Overlay and Grid, and no Stack; the Overlay preset is a 1x1
  grid that hugs (start, start).
- The editor view store is mocked because zustand serves `getInitialState` as the server
  snapshot, so a `setState` before `renderToStaticMarkup` is not seen; what is tested is the
  colour, not the toggle. The guide colour lives in a constant because the raw colour lint rule
  flags a hex on a `color` property, and this is a document value. A grid mounts `GridEditor`,
  whose selection hook asks the platform for the modifier key's name.

### hud/hud-layout-section-one.keep.test.ts

Section one is byte for byte the same section under both engines, except which Type button is
lit (§58). The maintainer's rule: nothing in a section may change when another option in the
same section is pressed. §56 asserted the breakage as a feature (a different gap cell count and
a grid only overlay), which is why six rounds passed every gate and were rejected. So section one
is rendered for a grid and a flex container, the two `aria-pressed` flags and the lit class are
stripped, and the markup must be identical. The cut is at the second sub section's wrapper,
because that wrapper carries the next section's label (Alignment or Flow). Alignment belongs to
section three. §57 gave `ContainerOverlay` a flex drawing, so the overlay is offered under both
engines. Both engines mount a manipulation component that asks the platform for the modifier
key's name, hence the platform stub. Behaviour is `hud-grid-settings`, geometry is
`hud-grid-strip`, and the stage's reaction is the e2e layout options specs.

### hud/hud-grid-editor

§50's grid editor, driven.

- A press on a cell writes nothing: a click, a modifier click, a Shift click and a drag all leave
  the document byte identical (the selection changes, which is what a press is for). §48 armed a
  placement on the selected child, so picking a cell to insert a column beside it moved the child.
- There is no child in the table: no state offers place, move, span, clear span or self alignment,
  and the component takes no prop that could write a child. This is structural, because a deleted
  assertion cannot prove absence; the capability would return with a prop. Occupancy is still
  drawn, so a track edit's blast radius shows, with `pointer-events: none` so the drawing is not a
  target.
- One table drives the toolbar and the legend (`gridActions`), so neither is compared against a
  second copy of strings. Since §54 there is no persistent group (the properties are the settings
  sections); with nothing selected only the pointer gestures appear. A cell range offers insertion
  around it and nothing about its occupants (a range over one child's origin used to grow a span
  row). A track offers reorder, insert and remove but not size (§55): the size lives on the track
  header, where the extent is already printed, which lets the strip fit one row at 232px. The
  first column's move earlier and the last's move later are disabled in place, not removed, so the
  next button never slides under the cursor, and they carry no run or shortcut. The legend shows a
  key cap per shortcut and a mouse glyph per gesture, with the platform's own modifier on the cap.
- The keyboard looks each action up by the cap the legend prints (`apps/desktop/src/views/HudLayoutEditor/sub-components/GridEditor/behavior/grid-keys.constants.ts`), so the real
  presses are asserted: left arrow reorders, Delete removes. Delete on an occupied column works and
  the children follow onto the track that took its index; §48's refusal is gone, checked end to end
  through the validator and engine. The only refusal left is the structural floor of one column.
  Shift extends from the anchor the modifier click left, giving one column of three cells.
- Escape clears the selection and leaves the editor up, through a real `FullScreenLayer` (the
  lattice sits on the dismiss stack at `popover`).

### hud/hud-grid-editor-metrics

§50's lattice measured in headless Chromium at 188 / 232 / 320 px. The maintainer's claim: cells
must match their row and column in size, or it does not look like a grid. §48 drew every address
as a uniform square, so the screen's `[auto, fill, auto]` root (narrow, wide, narrow) drew as three
equal squares. Now cells carry the engine's solved proportions on both axes, read from the same
solve the stage uses (`apps/desktop/src/hud-layout-editing/grid-solve-lookup.ts`).

- Against a 398x224 view the screen root solves to columns 16, 382, 0 and rows 16, 192, 16: the
  third column holds no child, so its `auto` measures 0. That empty track is drawn at the 24px
  floor and its header is marked, because drawing 0px at 24px silently would lie about its size.
- Every cell of a row shares a height and every cell of a column a width, and each header sits
  exactly over or beside what it labels; one CSS grid holds both, so this is a property, asserted so
  the two cannot drift.
- Proportion never squashes a track below WCAG 2.2 SC 2.5.8's 24px target. Twelve columns by ten
  rows (twelve 24px floors alone do not fit 320px) scroll instead of shrinking, the lattice caps its
  own height (at most 220px) instead of pushing the legend away, and both header strips stay pinned
  (sticky, moving at most the lattice's 2px padding over 120px of travel), because the strips are
  what identify a cell; frozen panes, as in a spreadsheet.
- The four cell states (empty, occupied, selected, selected on occupied) are four computed paints;
  the crossed one is §45.7's hatch, since landing on a sibling is a destination (§42.3). The
  `CellPicker` fixture is the one control with a selected state under SSR: one cell shared with a
  sibling, one the child's own, one a sibling's, one empty.
- The stage echo is `gridCellRects`' own answer to the pixel, solved in game pixels with the host's
  unit of 1 and only then scaled for display; this test once passed the display scale as the unit,
  agreeing with the echo's own mistake (§52). An echo nearly right would teach the wrong cell. It
  never takes the pointer, since §46 removed the clickable surface it replaces.
- The editor view store is mocked to a fixed echo selection, because zustand serves
  `getInitialState` as the server snapshot; the selection itself is proved in `hud-grid-editor`.

### hud/hud-grid-settings

The Layout section's sections, driven in jsdom, re-pinning the guarantees §51 and §54 won against
the §55, §56 and §58 arrangements so none was spent buying the new one.

- The property sections are byte identical in all four selection states (nothing, a cell, a
  column, a row), reached by real presses; matching HTML, not just the same controls. Since §58
  there are four sections by concern (a grid has no Flow section; an absent section is fine, a
  piece appearing inside one is not). The baseline itself asserts that the sections hold the gap,
  the overlay, the engine and a tile, or the comparison would go vacuous. The settings components
  cannot read a selection: grepped with comments stripped, because a capability returns with a
  prop. Nothing is boxed in a `Field` (the labels are the section's own text), and section one
  leads with the type.
- The toolbar holds no property and no input in any state, asserted by name; the extent field
  was the last input and made the strip two rows deep at 232. It leads with a chip naming the
  selection (column 2, 3 cells) or a hint, and offers only the selection's own actions, never size.
- Add column and add row are the lattice's own trailing `+`s, through the one document rule with
  the children remapped (an append changes no address, §50.3). The selected track's header turns
  its extent label into the four item size menu; unselected it only prints its extent.
- The gap is an ordinary `ValueField` with its own spinner (§56): `StepNumberInput` and the rule
  hiding the spinner are gone. The editor step reaches it as a context default, so the case stands
  in for the View providing 4; decrement clamps at 0 because a gap cannot be negative. A literal
  writes one axis on change, a formula only on commit (Enter; blur defers to an open completion
  menu), and a stored expression reads back with its `=` and no spinner.
- The engine flips from section one. Every alignment tile writes exactly its own value on its own
  axis in every selection state; the 3x3 pad wrote both axes on every press because a cell is a
  pair, and a rebuilt option table most often breaks by one entry writing its neighbour's value.
  The guide colour is a bare swatch opening the picker, with no separate hex box.

### hud/hud-grid-track-edits.keep.test.ts

§50's document rule: a track edit just happens and the children follow. §48 refused to remove a
column a child started in and told the author to move the child first; the maintainer's rule
puts the obligation on the document instead. Each case is one sentence of the rule, and the last
two are the invariant: after any sequence of edits every child's `place` is in range, every span
fits, and `validateLayout` accepts the result. What sits before a removed track does not move,
which a naive subtract one from everybody gets wrong; a child in a removed column lands on the
track that took its index. A collapsed span loses the key entirely, since a key present and
undefined survives a JSON round trip. Columns keep one track; rows empty back to implicit. A grid
with no declared rows still shows the rows its children reach, so those are materialised before
an insert, which must mean what the eye saw.

### hud/hud-inspector-collapsed-fields.keep.test.ts

Phase 1 of the inspector UX review covers finding F2, flex rows with no `min-width` collapsing
fields to zero. The claim is about layout, so declarations prove nothing; the rows render in
headless Chromium against the real stylesheets (the tokens index is skipped because it only
lists `@import`s, which `setContent` cannot resolve) and are measured. A control gets the rail
less 32: 289px at the 320 default, 188px at the 220 minimum. Every threshold was 0 before the fix.

- Transition duration: `.select-trigger` is `width: 100%`, a 100% basis on a flex item, so the
  easing Select took all 281px. Phase 1 gave 68.3, phase 3's compact tier 104.3, phase 4's
  removal of the mode switch 172.6 at 289; 11.3, 47.3, 115.6 at 232; 0, 3.3, 71.6 at 188. The
  easing `Select` sits in its own non extent `Field` so it stays content sized.
- A committed formula has the whole row now that the "+ var" Select is gone (`FormulaMenu` is a
  popover on the f chip): 237.5 / 180.5 / 136.5.
- The paint row (behind background, border, shadow, outline, tint and text colours, the most
  rendered row in Appearance) was 13.9px at every rail, photographed under F1 as a colour clipped
  to `#0`; phase 8 made its flat branch a `ColorField` with the kind on its own icon row, reached
  by the `background hex` label: 253 / 196 / 152 against phase 1's 166.1 / 109.1 / 65.1.
- The keyframe row carried `at`, the value, an easing `Select` and a delete button on one line;
  `at` and the `Select` both had 100% bases, so the value's `flex: 1 1 0` had no free space and
  stayed 0 through phases 1, 3 and 4 (removing the switch let `at` absorb the space instead).
  Phase 10's `KeyframeTrack` edits one key at a time with three full width rows: the value is
  242 / 185 / 141 and `at` became a `Slider` with 251 / 194 / 150 of track. A range input has an
  intrinsic ~129px width acting as a flex minimum and has no `aria-label`, so it is found by its
  class.
- Nothing escapes the rail at any width.

### hud/hud-inspector-content

The behaviour half of phase 9 of the inspector UX review; widths are in
`hud-inspector-content-width`.

- A reference shows its referent for all five kinds, and picking one round trips through the
  document unchanged. The real editor is mounted, the real control clicked, the real picker
  opened, and the written patch read back. The control is the artwork (an image, not the token in
  a box); the button state row has no free text sprite slug left; a subtree reference says go
  (an arrow caret) because the subtree is edited in place. `nodeArtOf` is the shared answer both
  call sites render. Round tripping means the validator accepts the document and a JSON reload
  gives the same tree.
- The text mode switch discarded expressions: `TextContent` carried an outer text or formula
  `SegmentedControl` whose text branch wrote `''` over a bound value. The test is the property it
  broke: with a formula in the field, clicking every button in the section writes no `value`.
  That fails on the old file and knows nothing about the switch, so it keeps working as controls
  are added. A bare `24` is a number (so `format.digits` and `pad` still mean something), `==24`
  is the literal string `=24`.
- The live match marker is the engine's own answer, checked against `expand()` for the same
  scope, not a second reading of the rule. Over a repeat it counts instances.
- A slot number past the previewed scheme is still legal: drawn empty, explained in one line,
  still the number typed. The old standing disclaimer, true of every slot and printed as a hint
  at three fields, is gone from every field (the model's file headers still state it), and no
  field asks for a slot with a bare spinner.
- `window.api` is stubbed before the imports because the glyph art resolver reaches the custom
  glyph store, which reaches the desktop bridge at module scope; `ResizeObserver` is a no op
  because jsdom has no layout for `SegmentedControl`'s indicator.

### hud/hud-inspector-content-width.keep.test.ts

Phase 9 of the inspector UX review, measured; the behaviour half is `hud-inspector-content`. Most
of these controls are read, not typed into, so what is measured is that the artwork is drawn at an
identifiable size (2rem and 1.25rem against the design system's 13px root: 26 and 16.3px, with
`flex-shrink: 0` so a long label eats the name, never the picture), that the name gets exactly
what the picture and caret leave (186.1 / 129.1 / 85.1; at the minimum it ellipsises after
"Silver arrow i", the trade `min-width: 0` buys to keep the caret on screen), that a reference is
one row (32 and 22.5px) in both densities, and that nothing overflows at 188px, including the
slot field's out of range note (two wrapped lines, 30px). The bounded track has 277 / 220 / 176px:
at the minimum, 20 steps of 0.05 are 8.8px each, coarse but still a handle, and the number beside
it (141px) types an exact value. The text value is typed into: 263 / 206 / 162px for
`= bomb_current`, which two mode switches once clipped to `bomb_curre`; it is wider than §36.7's
formula row because it has no spinner and no half width sibling. The glyph editor is rendered
whole because its source and shows switch carries phrases, and a wrapping `SegmentedControl` would
be a new F2. A jsdom `window` with an `api` proxy satisfies modules `glyph-art` reaches at import
(the log bus, a device store); the measurement still runs in real Chromium.

### hud/hud-inspector-geometry

The behaviour half of phases 5 and 6 of the inspector UX review: what each geometry control
writes and refuses to write. Typing drives a real `input` event through React's own value setter,
the only way past the controlled value cache, because an emptied field deleting a key is a claim
about an event handler. Placement mounts the parent's `GridEditor` (§48), whose modifiers ask the
platform for the primary modifier, so the platform provider is part of the chain.

- A node's position is `margin.left` and `margin.top`, and one function (`apps/desktop/src/hud-layout-editing/offset`)
  writes it. Zero means wherever the parent put it, so it deletes instead of writing 0, and a
  round trip back to the origin leaves the document as found. §37 had the stage's nudge and the
  field compose to the same write; §44 moved the stage writer into a gesture hook, §46 back into
  `StageSelection`, and §47 removed the drag, so the field is the only writer and a grep stops a
  second appearing.
- `order` is gone from Placement because the outline is the ordering control; its prose still
  says why. A band moves by writing its cell (`place`), the same patch as any grid child (§42
  retired the nine anchor `Select`); §50 put that gesture on the child's own `CellPicker`. Under
  a flex parent the cell group stays visible under a scrim stating the reason and offering the
  parent's Layout, because a property that vanishes when a switch flips stops being trusted.
  Self alignment is two axes under a grid (`alignSelf` speaks for both alone; `justifySelf` takes
  the inline one back for a corner cell) and one under flex; the labels are shorter than §42.4's
  (align down, align across) because the child's name is in the heading and the old label wrapped
  at 220px.
- A limit is cleared by emptying its field, which deletes the key (a present undefined key
  survives JSON as a key, and `min.w = 0` is a different document); the last axis drops the
  group. §36.9 deferred this here.
- In the box model, margin left and top are read only because Placement owns them; the other
  edges are ordinary. A lone `-` does not commit, or a negative margin could never be typed.
- The screen root cannot be given a size by any path: size and limits sit under one inert scrim
  saying it is always exactly the view, all four margins and the scale are locked, and padding
  stays live.

### hud/hud-inspector-geometry-width

Phases 5 and 6 of the inspector UX review, measured at 289 / 232 / 188 px with the stylesheets
walked (§36.9). The one to prove is the box model at 188: §35.6 measured the four margin edges as
four spinners in a row at 3.0px of typing surface each and concluded no arrangement of four
spinners fits, naming `BoxModelField` as the answer. Nested rings with no spinner column give
every edge over 18px at the minimum (two digits and a minus sign), growing with the rail; a padding
edge never measures wider than its margin edge, or the rings would have collapsed into a row. The
whole Size and Box section, which the plan estimated at about 850px before (a node with a size, a
margin and four paddings), is 398px and does not change with the rail because nothing wraps. The
other controls are checked for what killed their predecessors: no overflow, no wrapped label. The
offset pair (the section's top row, two numbers in `PositionInput`'s shell) stays typeable, the
limits keep one row per axis, and the lattice's six cells clear 24px on both axes (§48: they were
57.3 x 12, failing WCAG 2.2 SC 2.5.8 on the short axis).

### hud/hud-inspector-layout-widths

Phase 7 of the inspector UX review: the Layout section's controls measured at 289 / 232 / 188 px,
stylesheets walked (this phase added `apps/desktop/src/theme/hud-layout-editor/layout.css`).

- `AlignmentTiles` at 188 (§56) is the one to prove. The 3x3 pad it replaced was a fixed 82px, so
  the only question was whether it fit; a row of tiles is elastic. Round 10 drew a flex
  container's six main axis tiles at 30px beside three 48px cross axis tiles, so every tile in a
  component is one size (the track count is the widest row's). Round 12 let six values wrap
  freely into three ragged lines with the cap floating mid block; round 17 held six on one line
  at about 26px, where between, around and evenly differ by a pixel. So a row longer than four
  folds at a fixed count, positions over distributions, every line full. Tiles stop growing at
  72px instead of letterboxing.
- The track strip is gone (§48): one `GridEditor` replaced `TrackListField`'s chip strips and its
  44px miniature, so the lattice's 24px floor per cell is measured instead (the old drawing was
  57.3 x 12 at 188, failing SC 2.5.8). §50 made cells proportional; the floor survived. Three
  columns fit at every rail, so nothing scrolls; twelve is `hud-grid-editor-metrics`.
- The picked track editor (rebuilt here, since SSR cannot click a header) keeps a typeable extent
  field beside its four 26px tools at 188.
- Labels and hints stay on one line; the pad's self explaining label is the longest.
- `ColorField` gives a hex 253 / 196 / 152px; the old raw hex box beside a swatch with no
  `min-width: 0` had the paint row's 13.9px shape.
- The direction control is two 26px buttons and a 2px gap, 54px at every rail; it was 82 with
  three until §42 gave `stack` back to the grid.

### hud/hud-inspector-property-rows.keep.test.ts

Phase 3 of the inspector UX review covers finding F3: a design system with a `Field`, and a panel
that never used it. The source half is grep shaped and covers every row; the layout half reuses
the collapsed fields harness at 289 / 232 / 188 px.

- No file under `HudLayoutEditor/` puts a property label in anything but a `Field`.
  `.hud-inspect__label` (group headings) and `.hud-inspect__sub` (per property labels) became the
  `Field` label; two card headings remain (a switch case's number, a button state's name), which
  title a card instead of naming a control. The duplicate id error and the expression parse error
  (`.hud-inspect__error`, `.hud-expr__error`) and the loose hint lines go through `Field`'s
  `error` and `hint` slots.
- Every control passes `size="sm"` itself, because `Field` deliberately does not write the shared
  control variables (contract §32.3).
- The inspector sheet's hand written `--space-2xs` count fell from 21 (contract §32.1) to 10, then
  9 when a button state's face became a `ReferenceField` (§40); what remains is what a primitive
  cannot express (paddings, a Button gap, gaps on elements carrying a popover `ref`, which `Flex`
  does not forward). Down is the direction it should move.
- Self alignment belongs to the child's own section again (§50): one axis under a flex parent
  (align down), both under a grid (align self, align across). The box model names each edge, and
  min and max share one hint.
- `sm` had never been on screen before phase 3. Every `SegmentedControl` option set fits the
  188px minimum; the track is `flex-shrink: 0`, so a set that did not fit would push its row wide.
  The widest is none, loop, ping-pong at 155.1px; then uniform, per corner 129.6; fixed position,
  slot 124.4; game sprite, font 117.8; glyph, image 97; verb, slot 78.2; flex, grid 76.2; text, fx
  68.9. The old 123, fx set (66.3) is gone with the mode switch.
- Every label stays on one line; `bottom` in a 42px edge column is the tightest. Nothing escapes
  the rail: the min and max row once escaped by 75px because `.field--inline .field__control` had
  `flex: 1` without `min-width: 0`, fixed in the field stylesheet. The four border side checkboxes fit one
  row at 188.
- The margin edges (four spinners, 28.3 / 14.0 / 3.0px of typing surface) moved to
  `BoxModelField`, measured in `hud-inspector-geometry-width`; `EdgesInput` and
  `MinMaxExtentField` stay deleted.
- The duration and delay pair, at `md` 138.5px each against 141.3 needed (contract §34.4), at
  `sm` 31.2px at the default, is now 99.5 / 71 / 49 per field after the mode switch's removal.

### hud/hud-inspector-value-input

Phase 4 of the inspector UX review: the one value field and the aids that make it writable.
Everything but its width (`hud-inspector-value-input-width`), needing no browser.

- The leading `=` rule is data: a bare numeral is a number, a marked one an expression, the
  marker is never stored (every shipped layout loads unchanged), `==` escapes it, and whether the
  field steps as a number is a predicate over the text, so the spinner and arrow keys vanish the
  moment `=` is typed with no mode to reconcile.
- The error table feeds the shipped parser's own message to the translator and asserts the
  English; the raw strings were probed by instantiating the parser as `compile-expr.ts` does, and
  each is asserted beside its translation since the table is worthless if they drift. An unknown
  name keeps `validate-value.ts`'s wording minus its path prefix and column. `||` used to parse and
  answer 1120 for 112 and 0 with no error, until `concatenate: false`. The three deliberately
  disabled features (lists, assignment, `in`) are told apart by reading the source, since the
  lexer reports `in` with the same string as two adjacent values. `check-expr.ts` restates the
  name rule of `validate-value.ts` (which formats for a file report), and a table guards that
  both agree on whether a formula is broken.
- `random()` is refused at parse time with a sentence; every other function compiles.
- The formula menu is a claim about a list: `index`, `count` and `item` are offered only inside a
  repeat and shown disabled with a reason outside; `delta` only where `packages/hud/src/layouts/validate-motion` passes
  it; `&&` and `||` appear only in the notes on `and` and `or`, never as entries; and no listed
  function is a dead end (the parser enables `length`, `join`, `map`, `filter`, `fold`, `indexOf`,
  `fac` and `gamma`, but the scope is a flat object of numbers).
- The worked starting points compile; the `_current` and `_max` fractions are generated from the
  variable table; repeat only shapes appear only inside a repeat.
- A formula in a repeat produces one value per instance, with scopes shaped like
  `packages/hud/src/engine/expand.ts`'s, so the heart formula reads fourteen full and six empty instead of one
  sample.

### hud/hud-inspector-value-input-width.keep.test.ts

Phase 4 of the inspector UX review, measured in headless Chromium at 289 / 232 / 188 px (the 320
default rail less 32, the wireframe width, and the 220 minimum less 32). Deleting the value mode
switch gave back 66.3px of `SegmentedControl` plus its 2px gap on every numeric row, turning the
duration and delay pair (the same shape as the grid gap pair) from 31.2 / 2.7 / 0 into 99.5 / 71
/ 49; at `md` (contract §34.4) two fields sharing 281px got 138.5 each against 141.3 needed. The
stylesheets are walked, not listed, because `ValueInput.css` lives in its own folder and a listed
set measured an unstyled control while still passing. A half width formula stays half width at
rest; its sibling sits to the right (tops differ only because the row aligns to flex end and the
formula's result line makes its field taller). Promotion (§58) is an overlay: the field keeps its
height (`--promote-height`) and its control floats over the row, so the sibling never moves. §36
promoted with `flex: 1 0 100%`, which reflowed the pair and broke the maintainer's rule that
touching a control may not rearrange what is beside it. The probe applies the class with the
four numbers the overlay promotion measures, mirroring its `boxFor`, since an SSR page
cannot focus; the real hook runs in the e2e layout options spec. The promoted width is 233.5 /
176.5 / 132.5, 4px under §36 for the 2px padding each side that makes it read as a card on the
row.

### hud/hud-screen-grid.keep.test.ts

§42: two engines, not three, and a screen root that is a real grid. The bar is pixel identity: the shipped HUD must not move, so the real numbers off the shipped document are pinned: the
three bands' corners (top left, bottom left, top right), the face button diamond (four satellites
round a centre, each sprite on its glyph, which a `stack` read as a column would have split), and
the d pad cross. If one moves, the layout engine changed. The
old overlay `stack` (children moved by their own margins, a negative one hanging outside) is now
an `auto` track sized off its items' outer size. The rules the collapse rests on: an explicit
cell is never refused for being taken and auto flow walks past one; two screen children may
overlap; paint order for co placed children is `order`, then document order; and the screen's
rectangle is not a question it can answer. The §62 countdown is centred with its box bottom 12px
up, so the disc (4px in) is two tiles up; the shipped document minus its countdown places
everything else unchanged.

### hud/hud-screen-root.keep.test.ts

The screen: the document's one root, always exactly the view. It is not a special case: it is
placed like any container, passes opacity to what sits on it, and its padding is the one inset
everything sits inside (398 minus 8 padding minus a 10px marker is 380). It carries a background
like any box; the test uses a token so the inline style lint rule never has to tell the document
apart from real inline styles. The screen has no size to author, and a document that tries is
refused by name, since a silently dropped key is how a hand edited file starts lying. Its engine
is not locked (§42, reversing §38.4): it is a grid whose `[auto, fill, auto]` template is the nine
anchors.

### hud/hud-stage-cells.keep.test.ts

The stage's grid drawings cover the grid they draw. `gridCellRects(container, box, unit, ctx)`
wants `box` and its answer in one space, with `unit` that space's pixels per authored pixel. The
stage echo and grid overlay passed the game pixel rect with the display scale as `unit` and
painted the result as display pixels. Fixed tracks came out right; the area a `fill` track shares
stayed in game pixels, so the grid drew at `1 / displayScale` of its size, 72% at the editor's
~1.39. The older echo test missed it twice: it computed its expectation with the same wrong call
and had no `fill` track. So the property is asserted against a rectangle that does not come from
the solve: all cells together are exactly the container's placed rect at the display scale. One
case shows what the old convention produced. A grid inside a scaled subtree (the compact layout
at 0.75) solves with its own unit: a 124px authored band is 93 game pixels wide.

## packages/input-mapping/tests/haptic-gates.keep.test.ts

Two gate layers must both pass for an in game event to rumble. The C master gate is
`kFeatures0_Haptics` (bit value 1048576, matching `features.h` and
`packages/game-core/src/live-settings-flags`), reached through the boot INI `Haptics` key and the live push.
Then seven fine-grained gates in the haptic service, one per event category. Spin attack
release shares the sword swing toggle, death shares damage taken, and the mirror warp
polling path shares environmental effects.

The suite advances `performance.now` by a large step on every read, so the per pattern
cooldowns (module state that persists across cases) never block a fire. It asserts gating,
not debounce timing.

## packages/input-mapping/tests/slot-list.keep.test.ts

Slot numbers are contiguous, so removing slot 2 makes the old slot 3 the new slot 2. The
assignment table is keyed by number, so `remapAssignments` must move each assignment with
its slot, or an item lands one button up without warning.

## packages/input-mapping/tests/slot-prefill-order.keep.test.ts

A HUD layout and a control scheme are joined only by the slot number. The built in HUD
documents put slot 1 on the north face button through slot 8 on d-pad right. SDL reports
its buttons from SOUTH, with the d-pad before the face cross is finished, so prefilling in
device order would draw every shipped layout with the controls permuted.

## packages/input-mapping/tests/vibration-shaping.keep.test.ts

Shaping compensates for how each pad's rumble feels and only touches magnitude, never
duration. Xbox dual rumble is linear and soft at low magnitudes, so it boosts onto a floor
(0.3 plus 0.85 times the magnitude, clamped at 1). Switch HD rumble already feels strong, so
it stays unchanged.

## scripts/parallel/tests/link-deps.keep.test.ts

`git worktree remove --force` walks into a junction and deletes what it points at; it once
emptied the real `.claude`. Links must be detached first, without touching their contents,
and the test detaches before its own cleanup for the same reason. The production
`LINKED_DIRS` list is empty now, so the test passes a made up directory name explicitly.

## scripts/parallel/tests/verdict.keep.test.ts

The case that matters is the refusal: uncommitted or unlanded work must never come out as
claimable or deletable.

## packages/input-mapping/tests/primary-modifier.keep.test.ts

On macOS and iOS the primary modifier is Cmd alone; a bare Ctrl means something else there.
An unknown OS accepts either key, because the web host reports `os: 'unknown'` and guessing
Ctrl would break Safari on a Mac.

## randomizer

### randomizer/ap-fake-core

An `OnlineCore` that records what the client asked of it. Its poller runs the real baseline
decision (`poll-rebaseline.ts`) once, as the first tick would, over the checks the test
declares complete in the save. A queued item is granted at once unless `holdGrants` is set;
then it waits until `grantNext()`, as the delivery queue holds it until the player can
receive. `notReady` names items the game cannot take until `becomeReady()`. A save swap
(`setInPlay`, `swapSave`) fires the client's `onSaveSwap` listener, as a state load or an
entered file does. A delivery with a null sender is an item the server itself sent. A kill
while `down` answers `down` and is not counted.

### randomizer/ap-fake-module

A stand in for the Emscripten module that records every `ccall` and every file written to its
virtual FS. What a session arms is exactly this record, so two sessions recording the same
calls set the game up the same way. Reads (`WasmGet*`, `WasmCanReceive*` and the like) are
kept apart. `WasmLoadSessionDialogue` adopts the last blob written to its file and returns
its line count, as the core does. Every `_Wasm*` export exists, so an export probe answers
yes. The bridge's own setter is passed in, because importing the bridge here would load it
too early.

### randomizer/ap-fake-server

An in process multiworld server: every socket the client opens lands here, and it answers as
a real room does (RoomInfo on open, the data package, Connected then the full ReceivedItems
list, scout answers, Sync, data storage reads, `!players`). A Connect with the Tracker tag
makes a tracker socket answered with the named slot's own locations; a second socket while
the game's is up counts as a tracker until its Connect says otherwise. A Get of
`_read_client_status_<team>_<slot>` returns the slot's status, or null when the room fills
none. `!players` through Say returns the chat echo, then the CommandResult line. Every
message crosses on a microtask, like a network hop. Nothing touches a disk or a profile.

### randomizer/ap-protocol-harness

The shared setup of the multiworld client tests: a two player room, a client booted against
the fake server with a recording core, fake timers and a stand in `localStorage`. Each test
file still mocks the log bus itself, since a mock is hoisted per file.

### randomizer/ap-solo-room.ts

A local placement served as a one player room: the slot data a world package would send
(options, rolled values and, when given, the deliverable spots) and a scout answer holding
every location's item under the frozen Archipelago ids. It is what a solo multiworld of the
same seed looks like to the client.

### randomizer: suites in node

Several suites stub `window` with an `addEventListener` before a dynamic import, or mock
`@app/lib/log-bus`, because the real log bus installs window error handlers on import and
node has no window.

### randomizer/ap-deathlink.keep.test.ts

DeathLink follows the slot data over the profile flag, and a slot from another world package
version is refused. Only bounces tagged DeathLink count; the network ping is a Bounce too.
When a fairy revives Link, the core reports nothing and clears its room kill flag.

### randomizer/ap-ids.keep.test.ts

The Archipelago id tables are complete (every location of the widest world and every item any
option can pool has an id; no story event has one), unique, and frozen: a digest over the
first `FROZEN_*` ids of each table pins them. Appending ids leaves the digest alone; editing,
reusing or removing one fails, because generated seeds carry those numbers. After an append,
raise the count and the digest together. The location digest was repinned once for a rename
that kept every id and name: the 155 shop keys moved from a shelf's check id and its restocks
to `<shop>-shelf_<side>-slot_<n>` (previous digest
`736690669490347d1fa78bcf312613bccf0ef65db28c5f02c7978f1ebb55c9d9`).

### randomizer/ap-online-core.keep.test.ts

The real online core runs against the recording module. The online bits of gate word 5 live
exactly as long as the session. A location holding another player's item arms the icon id of
that player's game (Ship of Harkinian plays Ocarina of Time, so the ocarina's picture, at
`0xB0` plus its place) with a line naming the item and who it went to. The sentinel and the
icon ids are pinned to the core's own definitions in `foreign_item.c`. A queued grant reports
itself granted only when the core confirms it. The room's checked locations show done in the
tracker and leave the poller for good, with no game flag written: a shelf's first stock ticks
the shelf's record, its restock has none to tick, and the poller's baseline never reports a
suppressed key. Modules that call the bridge at load are imported first, so the bridge
finishes loading before those calls.

### randomizer/ap-session-parity

A local seed and a one player room serving the same seed must set the game up identically.
Both sessions run against the same recording core. Every override, gate, table and file the
core is handed, plus every receipt line composed and every icon set applied, is the armed set.
The two sets must match call for call and argument for argument, in any order.

The one planned difference is the online bits of gate word 5: each online write carries
`kFeatures5_ApOnline`, and with it masked off the word is the local one. A room names the
item and its owner in a foreign line, which a local seed cannot, so the names are replaced
before comparing. The room recounts its spheres over the items it holds, so a handed away
case skips the sphere count.

The shipped defaults already open character checks, world items, key drops, a custom capacity
pond and progressive custom capacity, so the other cases each move one of those. The last
case carries its spots through slot data the way a player file hands them to the server, as
every other probed spot, so a client that ignored them would arm more. The quiver has no
record: it is placed like any item and arrives as the single arrow receipt (`retro_shelf.c`),
which the game reads as the bow's quiver. The foreign case puts another player's item on every
pond rung, every pond prize and the first shop shelf; the local seed carries `item-foreign`
at the same spots and no setter may refuse the sentinel. No pool icons load, so the room arms
the plain sentinel, the id a local seed arms. Composed dialogue and icon sets need a real
asset blob and ROM, so they are mocked; what the session hands them is what must match. The
preload API answers every call with an empty list, so no file or profile is touched.

### randomizer/progressive-tier-generation.keep.test.ts

A returned placement is the proof of beatability: `generatePlacement` returns one only after
the sweep collected every location and reached the goal, so a tick set that rolls thirty seeds
in a row plays. A set that cannot be rolled is refused up front, naming the rung, because a
load bearing rung left out would make a seed with no ending. The blade rungs used to be on
that list. The core now has the stand ins of the reference's swordless mode: a hanging cloth
door can be pulled down, and the hammer breaks the tower's seal and lands on the last fight.
All four blade copies are vanilla items of character checks, so with those checks out of the
shuffle the pool never carries one and a tick has nothing to take. Only with both scope tables
shuffled can the blade ticks reach anything.

### randomizer/pond-core-probe

A headless probe of the rupee pond's seams. The built wasm loads in node with the user's
asset blob, a save state fixture puts the game in a room, and every seam runs with the pond
gate on and then off. Each file loads its own core, since every case arms its own gate and
plan. Skips without the wasm, the asset blob or the vault fixture, so a clone without them
stays green.

- Price, amount taken, bank income and purchase wait are the plan's values with the gate on
  and the vendored expression's values with it off. An empty plan under the gate leaves the
  pond native.
- The plan every case reads has three throws: a prize, a capacity sale, a throw that wins
  nothing. Host lines are left unarmed (`-1`), so a seam that shows a message shows the
  vanilla one from the baked dialogue blob; the line seams are pinned through the read only
  probes. The purchase seam restores the module bytes its message moves.
- Throws resolve in order and the save counter climbs once per throw, so a prize is handed
  over once. An exhausted pond names a price no wallet holds (`0x7fff`), so the handler
  closes it. A taken prize reports its ordinal in the high half of the result.
- A capacity sale climbs the tier. At the ceiling it hands back nothing, since the vanilla
  hundred rupee refund would make a cheap pond a money press. A throw that wins nothing hands
  back its refund, which is below its price, so it cannot be farmed either.
- The gems a throw shows decompose the amount paid: 427 is one gold, one silver, then red,
  blue and two greens, three decoded sheets, so the toss waits 240 frames. One volley carries
  every denomination sharing its decoded sheet, each under its own receipt: 75 is a violet
  alone (it needs its own sheet), then red and blue together; 27 is red, blue and two greens
  in one volley. The pond's ten flying gem slots (`variables.h`) fill from the top down.
- The vanilla cost prompt quotes the plan's price in the BCD its number commands read (75 is
  `0x75`, not the native `0x50`). The baked line holds two digits, so a price past 99 leaves
  them as vanilla wrote them and the composed prompt states it. Exhausted, or with the gate
  down, the digits stand untouched.
- The award line says whether the water still holds a prize. A throw that sells a capacity
  level keeps the vanilla question, because the choice is real. With nothing composed the
  vanilla question stands for every throw.
- The purchase holds the player still through its closing palette fade. The prize goes out
  through the receipt ceremony, whose cleanup frees the player, and walking out of the fade
  leaves the room's colours in the player's palette row for good. An exhausted pond still
  holds the player, because the plan still owns the pond.
- A losing throw carries its own consolation, because the vanilla line promises a flat
  hundred back and this one hands back half. The plan's lines replace vanilla wording only
  where one was composed. Only an exhausted pond takes the closing line; a wallet too light
  for the current price keeps the vanilla "not enough rupees yet" refusal (`0x14c`).
- WRAM addresses come from `variables.h` and the hook owned registry in
  `core/game-hooks/save_bytes.h`.

### randomizer/pond-generation

Generation with the pond in the shuffle. Every slot is a real location named for its pond and
its number, every mode is beatable over many seeds, the prize slots carry pool items, and the
wallet rule gates them. A placement that comes back at all is beatable, because the sweep
inside the generator already proved full access and the goal.

- A wish pond's own pair is rungs 1 and 2 of her ladder, so a check record answers to those
  two names, and her candidates are her ladder and nothing else. The capacity pond answers in
  two named family ladders instead, so none of its plain rungs may be a record's name, or a
  tier and a rung would share one. The vanilla grant flag cannot move which slots exist under
  Custom, since that is the pond's own ladder.
- At Vanilla grants exactly the produced items leave the pool; what she takes in trade stays
  findable.
- The beatable sweep uses a wide price range so the curve has all eight throws to cut.
- A dear pond under the lowest wallet a seed can roll with has its range pulled down to what
  that wallet holds. The wallet asks for 0 and reads 599, the floor a fixed 500 rupee purchase
  in the price table sets, so a 900 to 999 range is held at 500. The wallet starts empty and
  climbs on its one upgrade, so the prizes are out of reach until it is collected. The pinned
  property is that the pond never asks for more than the wallet can ever hold.
- The shared switch makes the generator build the wish ponds' rungs from the capacity pond's
  ladder. The rows each pond holds are untouched, so the switch is reversible.
- The Brewery lock takes the pool's only Red Boomerang, so her second red displaces a filler,
  never the blue one she needs.
- Pond demands are drawn from the seed, so what the options panel previews before generation
  is byte for byte what the placement carries, retries included. The panel calls the same
  function with the same probe sets. A seed that needed a second attempt is the case the roll
  used to get wrong; pick fresh seeds if the fill ever stops retrying on these. An attempt
  seed (`#retry1`) would move every rung if it reached the roll. The mixed ask profile ticks
  every ask row and keeps both wish ponds out, so every rolled rung belongs to that ladder.

### randomizer/pond-model

The pond model: the rupee decomposition, the modes' schedules, the snapshot adapter, the
wallet reading of a prize, the pond's own receipt lines and the item demand.

- 999 is three gold, one violet, then two red, one blue and four green; the small values
  share a decoded sheet, so it flies in three volleys. A volley never holds more than the
  pond's ten slots.
- A snapshot with no pond row reads as the baseline pond, and an unknown mode
  reads as the capacity pond with a note.
- The receipt lines (the price of a toss, a prize award, an emptied pond) quote the plan's
  real amounts, because every vanilla line they replace names an amount no plan charges or
  asks a question no plan puts. Vanilla cost charges the same hundred fourteen times and never
  pays back, so it needs one price line. The composer keeps the fullest candidate that fits
  three rows and falls back down the list, so the last candidate must fit at every amount the
  ladder can reach: 63 characters, measured at 164px.
- The fixed schedule tops out at a hundred, and no reachable wallet sits below 599
  (`packages/randomizer/src/world/capacity/wallet-floor`), so it is never held to the wallet; a 299 wallet reaches it
  too, so no ceiling is written.
- The item demand names only items the player holds and the core can test, ranks the pool
  early to late, and with nothing eligible falls back to another ticked kind, then to a free
  rung. The pool the roll reads is keyed by id, so a fallback test pool is built from ids; a
  name in it would name no record.
- Each demand kind has one ramp: it reaches its own two ends at the same two rungs, is
  monotone, and always stops on a stop of that kind's own ladder.

### randomizer/potion-price-rule

Guard: no shelf is ever priced in something the file cannot buy back. The hut's three
cauldrons are the only repeatable source of potions, and a bottle price consumes its content,
so a restocked shelf asks again. A cauldron handed to the shuffle takes its potion out of the
game, and any shelf priced in that potion would be unpayable. The suite walks every reachable
pairing of the shop scope and the price rows (with every price row ticked, the choice that
exercises the mask hardest) and proves the hole is closed three times: the rule masks the
row, the frozen snapshot carries the mask, and the roll refuses the content even when a hand
edited snapshot claims otherwise. The guard asserts that something was rolled and something
was blocked, since it is worthless otherwise.

- The mask is not an overwrite: the choices never lose the tick, so dropping the cauldron
  restores the row. Price rows follow the price list's order, not the cauldron list's, so
  blocked rows are compared as sets.
- The bottle rule reads the wallet ladder off collected upgrades; a file with no upgrade
  stands on the native rung, which holds any cauldron price. The bottle count is the group
  count, as the real state answers it, so holding a bottle at all means a count of one.
- A pond rung may ask for up to four bottles at once, handed over together, so three bottles
  cannot pay a demand of four. No amount means one bottle, which is what a shelf asks and
  what every placement frozen before the count means.

### randomizer/world-from-records

What the records already answer for in the engine's world, and what they still cannot. The
region collection is the engine's region list (239 regions, the whole graph the engine
walks), a check says which region it sits in, a dungeon says which wings it spans, and the
passages between regions are one rules table. Order matters as much as the set: the prefill
and the normal placement both walk the region map and each dungeon's wings, so the
collection's id order must be the order of the reference's four taxonomies, and a dungeon's
array order must be its create order.

- Which rows a seed fills is a record question. One rule over kind and scope
  (`packages/randomizer/src/world/seed-locations.ts`) picks 261 spots out of the 594 rows. Nothing states the set
  twice, so the suite pins it by count: the whole world (255 with key drops on, which is those
  rows minus the pond pairs; 222 with key drops off, since that option invents 33 spots), 8
  story events each in its own record's region, each dungeon in create order, the shelves the
  shop scope opens and the ladders a pond sells. A number moving means a record moved.
- Three places the reference holds as regions of the world and not of the dungeon stay out
  of the dungeon lists: a secret room under the first castle and the two bomb walls in the
  last cave. A dungeon's list decides which items its prefill restricts.
- The records flag the regions impassable while transformed, by the names the reference uses.
- One thing is still stated beside the engine, because no record can answer for it yet: which
  crossing a passage is. A connection record is a physical crossing; a reference exit is a
  logical one with its own rule and name. 205 of the 392 passages join a pair of regions that
  exactly one crossing joins, so those carry its id. The rest cannot: a mirror spot, a retry
  from the menu and a wing boundary inside one room cross no tile, and a pair joined by two
  doors cannot say which door a passage is. The gap numbers (439 crossings no passage makes,
  at most 23 placeless rows, at most 16 regions no screen carries) are what the tree measured.
  Lowering a gap is progress and still passes; raising it means a record got worse.

### randomizer/progressive-tier-probe.keep.test.ts

The built wasm is loaded in node the way the capacity probe loads it, a family's mask is armed
the way a session arms it (`WasmSetProgressiveTiers`), and the virtual id (0x62 blade, 0x66
bow, families in `progressive_grants.c` order) is resolved through the grant resolver as a
seam would. A copy hands over the lowest rung still present at or above the tier held, so
unticking a middle rung shortens the ladder. Past the top rung a copy is twenty rupees. A
family with nothing ticked puts no copy in the pool, so a zero mask means never armed and
gives the whole ladder back, which keeps a silent session byte identical. The bow byte keeps
the arrow state in its low bit, so 3 is the top rung held. Skips without the wasm, the asset
blob or the vault fixture.

### randomizer/ap-online-connect.keep.test.ts and randomizer/ap-online-recovery

A server that is down at the first connect is retried on the backoff with a countdown; a
refusal is not retried. An item at a negative location is the server's own, even when this
slot asked for it. The save in play is bound to the room at Connected and after every save
swap, before any check or item crosses; a save of another room ends the session with nothing
sent. The received index moves only on a grant, every save swap asks for the list again, and a
location the save shows done is still not reported again by a reconnect's baseline.

### randomizer/ap-quiet-receipts.keep.test.ts

With a kind's option on, a delivered rupee, bomb or arrow goes in through
`WasmGrantQuietReceipt` (answering 1 granted, 2 not quiet) with no receipt line; a placed one
is armed with the silent line. Under the retro bow the single arrow is the quiver, never
quiet. When the core says a queued receipt is no longer quiet, the ordinary receipt runs.

### randomizer/ap-receipt-burst.keep.test.ts

A goal's collect sends every remaining item in one packet. Each item's line is composed when
its delivery reaches the front of the queue, so 200 items each show their own line, while the
ring of 32 never holds more than the delivery in flight. A progressive item's detail page
keeps its id and bytes through the burst.

### randomizer/ap-report-coverage.keep.test.ts

A session sends a location from one of two paths: the substitution seam (an armed override's
fire id) or the poller (a plan detection, or the tracker's sweep). A location with neither can
never be sent, so the room could never finish. The default options match the first two game
test room (341 locations). The tracker's check total must equal the room's location count;
events and status rows stay listed but are not locations. After a collect, shop restocks and
pond rungs read the taken set, since they have no record.

### randomizer/capacity-pond-rule

The pond is the only native source of the explosives and projectiles upgrades, so a family
left Vanilla while the pond hands out pool items would have no source anywhere. The suite
walks every combination the two tabs can reach, settles it, and proves the hole never
appears, settling is stable, and every control still offered leads to another sound pair.
Under the retro bow every shot is paid for, so the projectiles family reads Vanilla and needs
no source. A Custom family carries its ladder in the seed and asks the pond for nothing.

### randomizer/dialogue-charset.keep.test.ts

Every character an Archipelago name can hold encodes to a real glyph (the language's own, or
an extra glyph in a spare font slot) or to a documented fallback: an accented letter to its
base letter, a bracket to a parenthesis when no slot is left, anything else to a question
mark. European fonts have 16 spare slots for the 21 characters they lack, so five fall back.
An extra glyph packs as two 2bpp tiles, top then bottom; plane 1 is the body and plane 0 the
edge ringing it.

### randomizer/hook-save-bytes.keep.test.ts

`core/game-hooks/save_bytes.h` is the source of truth with its own `_Static_assert`s, which
only fire on a core rebuild and cannot see TS. The test parses the header's flat
`#define NAME 0xHEX` lines; generating the TS instead would only move the drift to a stale
artifact.

### packages/randomizer/tests/key-drop-size.keep.test.ts

The core matches a drop override on room and drop size, so a key drop armed at the wrong size
never fires and the vanilla key is granted. A drop whose vanilla item is its dungeon's Big
Key is armed large, every other one small.

### randomizer/location-names-closed.keep.test.ts

Every spot of the world is a check row (`packages/randomizer/src/world/seed-locations.ts`), so the world the graph
declares is the set every id keyed table must agree with. Most tables reach the rule
registry, which throws on an unknown target; the tables listed here do not, so a stale id
would sit there unnoticed. The declared set is the widest any option opens (key drops on,
every pond selling its whole ladder). The bunny list exempts two story events alongside its
locations. A rule table may hold only passages and events. A pond slot is a location only
where a pond sells it, and Normal sells none.

### randomizer/option-wiring.keep.test.ts

The creation panel and the profile writer once built their overrides separately, so a row
wired into one froze silently. Both read `randomizerChoiceOverrides` now, and the suite walks
the whole catalog by value, since a missing field still puts its key in the map with nothing
behind it. The price block's percentage is a number, every other key a tick. The base fixture
pins the shop mode to vanilla, because a fresh profile starts shuffled; the shop cases stock
one purchase per slot.

### packages/randomizer/tests/plan-covers-placement.keep.test.ts

Every location a placement names must appear in the physical plan as an entry or an explicit
error; that gap once let shuffled dungeon prizes vanish between generation and the session.
Shop slots reach the session through seams of their own (the hut and the bomb counter too),
so every mode and both depths are pinned, and a shelf slot must never be an error row.

### randomizer/pool-listing-sprites.keep.test.ts

Two hops leave the options panel drawing placeholders over sprites on disk. The panel renders
inside the profile creation form, possibly with no active profile and no ROM picked, so
`spriteRomOf` lets a ready ROM stand in. And every sprite an item record names must be one the
extraction writes, or the row asks for a URL that 404s over `app-sprite://`.

### randomizer/progressive-tick-consequences.keep.test.ts

The consequence lines are the panel's live reading of `derivedItemPower`; for any tick set,
the switches the derivation masks on must be exactly the ones the visible lines stand for.

### randomizer/receipt-highlight.keep.test.ts

Every composed line marks what was found in the primary highlight and who it came from or
went to in the secondary one. The composer turns the markup into the core's highlight bytes
(`core/game-hooks/dialog_highlight.c`), measures it as zero pixels, and reopens a span at
every row break. The two colours default to the app's gold and green, snapped to 15 bit
colour as the core's own defaults are.

### randomizer/shop-slots-panel.keep.test.ts

The count control was once fed the stored slot count, which custom mode never reads, so it
sat still while the ticks moved. In custom mode the opened set is the ticked set, so a slider
would always sit full; the modes the ticks alone decide show a read out. A new profile ticks
every shelf slot and the bomb counter; the potion seller's three cauldrons start unticked,
since a cauldron holding a shuffled item is opt in.

### randomizer/rule-parity-harness and rule-node-parity.keep.test.ts

The guard that the rules answer exactly as they did before they became node trees
(`packages/randomizer/src/world/rules/rule-node.type.ts`). The digests were captured from the closure only engine:
every location, story event and exit rule, asked over 5000 seeded random collection states
per option set (mulberry32, so the states repeat on every run). Half of the states see a
random fill seam, so rules that read placements answer both ways; `actRecord` attaches a
random record of done acts, as a world built from a save does. The generation half pins whole
placements for 20 seeds; a placement digest spells out maps and sets so every entry counts.
The export half inlines every derived helper down to the primitive list, sends the trees
through JSON and back, and asks them beside the engine's own rules.

A digest moves on purpose only when a rule is meant to change; recapture it in the same
change and say which rule moved. Recaptures so far were renames that moved no answer: event
slots keyed by item check ids becoming ledger event records, shop purchases keyed by shelf and
slot, the flute and floodgate slots becoming story events, the event pairs becoming story
events of the world (the capacity shop token went too; only the "capacity vanilla" rule digest
moved, and no placement), the Activated Flute (`item-075`) becoming an ordinary item, the Flute
becoming the Progressive Ocarina family (`item-179`), and the placement stats dropping
`capacityShuffle`.

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
dataset's own record like every other event row (`packages/navigation/src/tracker/tracker-statuses/tracker-statuses.ts`).
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

## simulation

### simulation/active-states.keep.test.ts

The widget's States row returns a list, since several states hold at once. Names come from
the decompilation routine that sets each tagalong id; an id with no confirmed source is
reported by number. Progress bits come from the live player state bytes and are tested in
`player-state-rules`. An unmapped progress tier invents no story beat. `link_num_keys` is
0xFF outside a dungeon, which once rendered as "255 small keys".

### simulation/annotation-coverage.keep.test.ts

The annotation list is generated, so a new mechanic could produce a kind nothing draws.
`EXPECTED_KINDS` mirrors the `AnnotationKind` union, because a type cannot be enumerated at
runtime. `kill-trigger` describes the whole room and has no tile, so it is panel only.

### simulation/annotation-reachability.keep.test.ts

The Secret Passage case: the uncle blocks the corridor, so the chest behind him must not read
as available. A feature's own tile is usually solid (a chest is a wall tile), so reachability
is judged from the tiles around it.

### simulation/cross-world-gating.keep.test.ts

`screen-030` is `lw-10`, `screen-260` is `west-dark-world` and `screen-463` is
`superbunny-cave-top`. The rain intro run with an empty inventory once warped from `lw-10`
into the dark world. The light world must still be broadly reachable, or a zero dark result
would mean nothing. The `screen-463` crossing carries no `ctx:cross-world` tag; only the
world aware detection catches it.

### simulation/discover

A chest is a solid 2x2 block anchored at its top left tile; the game opens it only from the
tile directly below the footprint, facing up. A reachable tile above or beside it does not
count.

A `CHECK_NPC_FLAGS` config that pins a `room` binds only there: sprite 0x73 matches in room
0x55 (the check) and not in room 0x104 (the scripted opening). Room less configs match by
type anywhere and still honour their presence condition: 0x52 is present only while the
swimming item is unowned, 0x16 is the first sage, 0xEE is no check NPC. Sprites use coarse
reachability there (`posKnown: false`) because matching is under test, not tiles.

A 2x2 overworld area returns its whole sprite table for any of its screens, each spawn
resolved to the screen it sits on; a target is judged against that screen's flood only.
Traversal is virtual, so the observed screen comes from the run's own position.

### simulation/dungeon-ledger

The sewers (room 0x11, palace 0x00) are reachable only through the castle above (palace
0x02), the one case the ledger groups. Traversal ids are the game's room numbers. Item
`item-041`, the bomb pickup, grants the `bombs` token.

### simulation/enemy-reach

Inventories are dataset ids: `item-012` bow, `item-074` tier 1 sword, `item-004` tier 4
sword, `item-013` blue boomerang, `item-008` fire rod. A tier 1 sword is damage class 1; the
blue boomerang fires ancilla 0x05, damage class 0, which is a real class and not harmless.
The fire rod is ancilla 0x02 and reaches without bound. The multi section case splits the
room west and east with the player in the west section.

### simulation/engine-loop

A synthetic three screen world with chests wired to real rooms, so the matcher names them. A
is the start; the chest in room 0x103 hands over the Hammer that unlocks the B to C door. C
holds the chest in room 0x104, the goal. A one sided point resolves its partner through the
global facade (`toScreenIdOf` calls `getConnection`), so the world's points are registered in
the real session registry. The Hammer pickup bumps the epoch; reaching C proves the re-flood.

### simulation/engine-review-fixes

Each `describe` pins one finding of an engine review: visited and failed clear on an epoch
reset; visited pass through screens are backtracked with one event and no new discovery; a
blocked next hop aborts the route instead of teleporting; an unknown position chest is still
discovered; a trigger with no flag change is recorded as failed and retried after a reset; a
generic key is credited to the matched check's dungeon. 2x2 overworld areas pack the second
screen's coordinates past the first, so a known tile can land outside the 64x64 flood grid.

### simulation/exit-distance.keep.test.ts

The ordering score packs real steps, an out of area bias (0x1000) and an unknown distance
sentinel (999) into one number; `steps` must only hold a real distance, never "4096 steps".
The walk BFS follows ledge hops. A ledge drop is one way, so its landing costs more than any
walk on the current footing; otherwise the run drops off with work pending above and, the
screen being marked visited, never comes back. A solid target tile measures from the nearest
walkable tile within four.

### simulation/flag-snapshot.keep.test.ts

The chest open bit for slot 0 is 0x10, the same native fact the matcher uses. Room 0x104 chest
0 is `check-026`; no check maps to room 0x02 chest 0. Overworld byte 0x81 bit 0x40 and
progress byte 2 bit 0x02 are real flags (a ledge item and a merchant).

### simulation/npc-check-naming.keep.test.ts

An NPC marker carries the check id it is plus the name to draw. Sprite 0x73 spawns in the
scripted opening room (no check) and in the passage where the sword is handed over (the
check). Completion is asked by id because names are not unique. Configs with no `room` mean
the sprite type is that check wherever it spawns, the same contract as the flag matcher.

### simulation/overworld-sprite-trigger.keep.test.ts

Outdoor discovery uses the same kind based dispatch as indoors: NPC sprites resolve their
flag and item from the check records' `gameId` by sprite type; anything else maps to null and
is skipped, with no invented overworld mask.

### simulation/player-state-rules.keep.test.ts

`player_sleep_in_bed_state` is a step counter inside the sleeping handler and reads 0 while
asleep, so asleep comes from the handler state; the counter is stale outside it. The bit mask
goes in the chip's hint, never its visible detail.

### simulation/recorder.keep.test.ts

The dedup key includes the location: unidentified observations carry a null `checkId`, so an
identity only key would collapse them into the first one seen.

### simulation/run-trail.keep.test.ts

A stop stores the check tally on arrival, so its haul is the next stop's arrival minus its
own; the last stop has no successor. `screenId` holds a traversal id (`ow:<n>` or
`room:<n>`), which `haulAt` never inspects.

### simulation/screen-panel.keep.test.ts

The "On this screen" list must show everything the overlay draws; an unmapped kind lands in
"Unmapped" and never vanishes.

## snapshot.spec.ts

A visual snapshot driven by environment variables. The app loads the current profile and
save state slot `SNAPSHOT_SLOT` (default 2), then its auto test hook writes
`tests/screenshots/<SNAPSHOT_NAME>.png`. `SNAPSHOT_WAIT` is the time given to the app to
finish (default 20000 ms). Run it with `npx playwright test apps/desktop/tests/snapshot.spec.ts`.

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
`git archive origin/master core | tar -x -C .user-data/baseline-core`
and then `node core/wasm-build/build.mjs` inside that folder, with the emsdk environment active.

## story-events/t6-tracker.keep.test.ts

The tracker's event records resolve from a synthetic heap: ledger bits, vanilla bits, the
derived pass and the older file fallbacks, with no game. A ledger event answers from its own
bit alone; a later story beat never stands in for it.

## widgets/live-data-inspector-records.keep.test.ts

`recordsFor` returns every record relating to the current screen. It replaced a lookup that
showed only the first connection, so the cases use real screens with several records,
including two spawns of the same sprite type.

## widgets/screen-record-draft.keep.test.ts

The screen editor sends this record to `screenEditor:writeScreen`, the one place the
dataset tooling writes a record into a source file. A dungeon room's file is its floor, so
an interior without a floor is a separate blocker (see `record-file-targets`).
