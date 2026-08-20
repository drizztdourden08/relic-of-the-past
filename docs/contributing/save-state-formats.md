<!-- @layer docs @kind doc -->
# Save State Formats

Save states are raw snapshots of emulated machine memory. When the core's memory layout
changes, snapshots written by an older build stop lining up with what a newer build expects
to read back, and those saves can no longer be loaded.

This is about making that visible: to the build, to the release, and to the person about to
update.

## What identifies a format

The snapshot is written as an ordered walk of fixed-size regions. The **sequence** of those
region lengths is the format's identity, hashed down to a short id like `6895039d1993`.

A sequence rather than a total, because two different layouts can add up to the same number
of bytes; reordering two regions of equal size has to change the answer, and with a sum it
would not.

## Nobody types the id

`core/wasm-build/layout-probe.mjs` computes it. It compiles `state-layout-probe.c` with the
same compiler and headers the real build uses, runs it, and writes
`shared/game/save-state/current-format.generated.ts`.

The probe records region lengths through a callback that never reads the data pointer, so it
works against zeroed structs — no ROM, no assets, no booted game. That is what lets it run on
a release runner.

It runs automatically at the end of every WASM build, so any path that rebuilds the core
refreshes the id.

The generated file is **committed**. `npm run ci` does not build wasm, so a gitignored module
would break typecheck on a fresh clone — and committing it means a layout change shows up as a
one-line diff in review instead of a surprise during a release.

## What you do when the layout changes

You will find out on your own: the next build regenerates the id, and the diff appears.

1. **Add a row** to `KNOWN_FORMATS` in `shared/game/save-state/formats.ts` with the new id,
   the version about to ship, and one sentence saying what moved.
2. That is all. The release publishes the id as an asset, and every older build in the field
   picks it up on its next update check.

If you skip step 1, `npm run state-format` fails and so does the release. The gate is not
asking you to predict the id — it already has it. It is refusing to publish a change nobody
described.

## How an older build finds out

The release publishes `state-format-<id>.json`. The id is in the **filename**, so the release
listing the updater already fetches answers the question for every version in the picker at
once, with no extra request. (Same trick the SDL3 addon asset uses for its build key.)

The update dialog then shows one of three things:

| Situation | Shown |
|---|---|
| Ids match | nothing |
| Ids differ | red: the save states will not load |
| No id published, or unreadable | amber: could not be checked |

Both warnings say that reinstalling the current version gets the saves back, which is true:
an update replaces the installed application, while save states live in the user data
directory and are never touched by one.

Releases up to and including the `BASELINE` version in `formats.ts` predate the published
asset. Their format is not a guess — no build that could have produced them wrote anything
else — so they are treated as known rather than unverifiable.

## What each save records

Every save state written by the app carries a small trailer:

```
[ core bytes ][ stamp json ][ uint32 json length ][ 8-byte magic ]
```

holding the app version, the format id, and a timestamp. The core reads header-driven lengths
and never reads to EOF, so the trailer is invisible to it; loading strips it anyway rather
than relying on that.

The stamp is applied at the storage boundary in `saves-store.ts`, so quick slots, manual saves
and auto-saves are all covered by one write path. Saves written before this existed have no
trailer and are treated as the baseline format.

## The one gap

`InternalSaveLoad()` is `static` in the vendored core, so the probe calls the three public
region walks for real but mirrors that function's eight plain literals. A change to one of
those constants alone would not move the id.

That is covered from the other side: the renderer compares the snapshot length the core
actually wrote against the length this build declares, and logs loudly on a mismatch the first
time anything is saved.
