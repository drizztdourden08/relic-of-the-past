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

## platform/primary-modifier.keep.test.ts

On macOS and iOS the primary modifier is Cmd alone; a bare Ctrl means something else there.
An unknown OS accepts either key, because the web host reports `os: 'unknown'` and guessing
Ctrl would break Safari on a Mac.

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
