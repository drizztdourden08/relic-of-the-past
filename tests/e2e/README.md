<!-- @layer tests @kind doc -->
# Permanent app-driven tests (`*.keep.spec.ts`)

Playwright specs in this project are **ephemeral by default**: they are written in
`tests/scratch/`, used, and deleted in the same session. That keeps a throwaway
debugging spec from silently becoming a maintenance burden nobody remembers asking
for.

A spec is permanent **only when the user explicitly says so.** Permanent specs live
here and carry the `.keep.spec.ts` suffix, which is the marker: anything named that
way survives the scratch cleanup and is expected to keep passing.

> **Rule for AI assistants:** never create a `.keep.spec.ts` file, and never move a
> spec into this folder, unless the user has explicitly asked for that test to be
> kept. Default to `tests/scratch/` and delete it when you are done. If a
> throwaway test turns out to be worth keeping, *say so and ask*. Do not promote it
> on your own initiative.

## What lives here and why

| Spec | Guards against |
|------|----------------|
| `flood-parity.keep.spec.ts` | The navigation widget, the simulator's runner and the `--dump-nav` dumper all flood the same location. They once disagreed (Jail Cell: widget 608, dumper 590) because the dumper hand-built its flood options with an empty inventory and a hard-coded tile context. Kept at the user's request after that bug was found by eye in a screenshot instead of by a test. |
| `ledge-baseline.keep.spec.ts` | Ledge jumps changing direction, vanishing, or appearing where none exist. Four states carry every kind between them: the uncle's estate west and east have straight north/south plus all four diagonals, the haunted terrace is the screen whose diagonals once read as north-to-south (letting a run walk onto a mirror-only ledge and take `Cave 45`), and `test-castle-bridge` is the only DUAL-LAYER case, where a bridge crossing a room splits the upper floor into three `0x00` regions, and the void either side of the deck used to read as floor because it is open on both layers exactly like real floor is, which drew a column of phantom jump arrows down the middle of the room. Asserts ledge counts **per direction**, not just totals, because these bugs move a jump between directions while leaving the total alone: south-west produced nothing at all for a long time, north-east jumps were emitted with landings pointing south-west, and the castle bridge's phantom column was a run of hops that should never have existed. Also asserts every diagonal travels the same distance on both axes. |
| `state-links-house.keep.spec.ts` | The canonical run start drifting. Every full simulator route begins at `test-links-house`, so if the state advances a step, loses the follower or collects the Lamp, every route silently measures something else. Pins room 0x104, a follower in tow, 288/4096 reachable, and both checks uncollected. |
| `state-secret-passage.keep.spec.ts` | Two rules at once: (a) a blocking NPC must stop the flood, so the chest behind the uncle reads *unreachable*, and if the flood starts walking through sprites this room is the only place it shows; (b) the duplicate-item rule must substitute, so the Lamp chest reads "5 Rupees" while Link already owns a lamp. A row saying "Lamp" here is the bug. |
| `state-tag-room.keep.spec.ts` | The room-tag decode regressing. Room 0x071 carries tag `0x08` ("clear enemies → doors open"); lose the decode and a kill-gated room reads as an ordinary corridor with permanently shut doors. Pins the decoded tag, both trap shutters as `shut`, the kill trigger citing its tag, the key door + key carrier, and 329/4096. |
| `state-jail-cell.keep.spec.ts` | The indoor navigation baseline moving. The richest single room (cell lock + big-key carrier + chest + princess) is also the one whose count exposed the dumper/widget split. Pins 608/4096, the cell lock still `shut`, and BOTH checks unreachable behind it. A count that drifts up means something walked through the lock. |
| `state-throne-room.keep.spec.ts` | The follower gate stopping checking. The push wall (`nativeType 0x14`) is testable nowhere else, and it only means something while nobody is following. Both halves are asserted here: the gate reads `shut` AND there is no follower chip. Either half breaking would move the 1320/4096 baseline. |
| `state-big-screen.keep.spec.ts` | Multi-screen areas silently collapsing to the one sub-screen the player stands on. That regression still produces a plausible-looking number. The castle exterior spans four screens, so the total must be 4 × 4096 = 16384, and the exits must include ways out annotated as being on *another* sub-screen. |
| `state-sanctuary-grounds.keep.spec.ts` | The outdoor navigation baseline. Overworld floods take a different path than bounded indoor rooms (walkable screen edges, an entrance to step into), so one baseline cannot cover both. Pins a single-screen total of 4096, 1762 reachable, and three distinct ways out each carrying a walk distance. |
| `state-intro-bed.keep.spec.ts` | The live player-state chips being read from the wrong bytes. `test-intro-bed` is the only state with `link_player_handler_state == kPlayerState_AsleepInBed`, and "asleep" vs "waking up" is derived from the handler state *and* a step counter that reads zero during sleep. A static check would only prove the first chip, so this one PLAYS the opening and asserts each beat: asleep → waking (with a step) → follower + progress flag → out of bed. It is also the zero baseline for progress-flag naming: exactly one chip at the first frame, so anything else appearing is a false positive. |

The eight `state-*` specs share `state-harness.ts` (launch, settle, teardown, input)
and `state-readers.ts` (turning the rendered widget back into data). Neither is a
spec, so neither runs on its own.

Two things about them are worth knowing before editing:

- **A missing fixture skips, it never fails.** The `.sav` files are ROM-derived and
  gitignored, so a clone without the private vault has none of them. `withState`
  checks `tests/fixtures/save-states/<name>.sav` and calls `test.skip()`, so a public
  checkout stays green instead of reporting eight failures it cannot fix.
- **`state-intro-bed` binds the keyboard itself.** Input is gated on the active
  profile's device map by design (`profile-devices.ts`): on a machine whose active
  profile is a gamepad, `allowed.keyboard` is false and synthesized keystrokes reach
  the renderer and stop there. `enableKeyboard()` binds the default layout in the
  live input manager (in memory, in the page under test, never on disk), so the
  spec does not depend on which controller the user last used.

## Running them

They drive the built Electron app, so build first:

```bash
npx electron-vite build
```

```bash
npx playwright test tests/e2e
```

Each spec launches the app with `--no-focus --muted` so it never steals focus.

## Adding one

1. Confirm with the user that the test should be permanent.
2. Name it `<what-it-guards>.keep.spec.ts` and put it here.
3. Add a row to the table above naming **what it guards against**. A permanent
   test with no stated purpose is the thing this folder exists to prevent.
