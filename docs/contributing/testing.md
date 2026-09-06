<!-- @layer docs @kind doc -->
# Testing

## Unit tests

Logic is covered by Vitest. Run the file you're working on, not the whole suite:

```bash
npx vitest run tests/<file>
```

Tests live under `tests/`.

Vitest tests are **throwaway by default**, the same rule as Playwright specs below: write it, run it, delete it once it's done its job. A test becomes permanent only when the maintainer asks for it, and a permanent one carries a `.keep.test.ts` suffix instead of `.test.ts`, no matter where it lives under `tests/` (Vitest tests aren't segregated into a scratch vs. permanent folder the way Playwright specs are, since they're organized by subject, not by lifespan). `.gitignore` enforces the default: `tests/**/*.test.ts` is ignored, `tests/**/*.keep.test.ts` is excepted, so an un-kept test naturally never reaches a commit.

Don't add the `.keep` suffix, or rename an existing test to add it, on your own initiative. If a throwaway looks worth keeping, say so and ask.

### Test-coverage registry

`tests/COVERAGE.md` is a living matrix of app features/areas against their test coverage (covered / partial / none), kept at the root of `tests/` on purpose so a gap is visible at a glance. **It must be kept up to date**: when a `.keep.test.ts` file is added, removed, or its target area changes, update the matching row in the same change. Don't let it drift into a stale snapshot.

## Checking the running app

The app can drive itself from the command line, which is usually quicker than a browser test for confirming a change. Build first with `npm run build`, make sure a profile and the save slots you reference exist, then run the built app with a flag:

| Flag | What it does |
|------|--------------|
| `--auto-state=N` | start with the active profile and load save-state slot N |
| `--screenshot=NAME` | capture the window to `tests/screenshots/NAME.png` |
| `--dump-layers=N` | write the collision grid for slot N to `debug-output/dump-layers.json` |
| `--dump-nav=N` | write the navigation state for slot N to `debug-output/dump-nav.json` |
| `--muted` | mute audio |
| `--no-focus` | open the window without taking focus |
| `--instance=NAME` | run as a named instance: own profile, own identity, and read-only for the two shared files below. See the note after this section: some app-wide tool state still isn't sandboxed |

For example:

```bash
npx electron dist/electron/main.js --no-focus --muted --instance=big-key --auto-state=test-jail-cell --screenshot=snapshot
```

The JSON dumps are the most reliable way to check navigation and collision behavior, so read those instead of squinting at a screenshot.

Launch test runs with `--no-focus --muted` so the window doesn't grab focus while you work. For a quick dev-server boot check, use `npm run dev -- -- --no-focus --muted`.

### Mandatory: an automated launch always names its own profile

> **Every automated launch must pass `--instance=NAME` and use that instance's own
> profile.** Never launch automation against the profile that opens by default. That
> profile, its save states and its settings belong to the person at the keyboard and are
> relied on for their own testing, so an automated run must leave them exactly as it found
> them.

An `--instance=NAME` launch gets its own profile (created by `npm run wt -- new NAME`,
pre-loaded with a copy of the named save states) and identifies itself on screen and on the
taskbar, so it is never mistaken for the real app. See
[parallel-worktrees.md](parallel-worktrees.md).

The app enforces the "changes nothing shared" half of this instead of trusting the caller.
Any launch carrying an automation flag is **read-only** for configuration every launch
shares:

| Shared file | What it controls | On an automated launch |
|---|---|---|
| `Data/app.json` → `lastProfileId` | which profile opens by default | never written |
| `Data/config/window-state.json` | window size, position, maximized/fullscreen | never written |

So forgetting `--instance` cannot repoint the default profile or move the window. It
does mean the run shares the user's save data, which is exactly what the rule above exists
to prevent. Pass the flag.

### `--instance` sandboxes profile data, not app-wide tool state

`--instance` selects a game **profile** (`app.getPath('userData')` is one fixed directory
regardless of the flag, as `apps/desktop/electron/lib/paths.ts` shows), so anything that isn't
stored inside `Data/profiles/<id>/` is shared across every instance, named or not. Besides
the two enforced-read-only files above, five files sit directly under `Data/` and are
**global by design:** they're tool/UI preferences, not gameplay state, so
they don't belong per-profile any more than a window's size would:

| File | What it holds |
|---|---|
| `Data/ui-views.json` | Data Inspector view-state: per-collection columns, sort, filters |
| `Data/nav-review.json` | navigation-baseline review progress |
| `Data/connection-review.json` | connection-review progress |
| `Data/sprite-review.json` | sprite-review progress (superseded by `Data/review/<kind>.json` below) |
| `Data/review/<kind>.json` | Data Inspector review layer: status/note/timestamps per collection (screen, connection, check, ...) |
| `Data/stick-calibration.json` | controller stick calibration (hardware, not a save) |

Unlike the two files the app refuses to write, these are meant to be written, and normal use
updates them. The consequence for automation: **a `--instance` launch is not
a safe sandbox for exercising a real UI flow that saves through one of these files.**
Resizing/sorting/filtering a live Data Inspector column, for example, debounce-saves
straight to the one shared `ui-views.json`, which is where the maintainer's own hand-tuned
layouts live. Before driving that flow with Playwright, read the file first; if it holds
real content, verify with a throwaway unit test against the pure logic instead of the live
UI, or stop short of the save-triggering interaction.

## Playwright

Playwright specs are **throwaway by default**. The app changes quickly and specs go stale within days, so a one-off check belongs in `tests/scratch/` (gitignored): write it, run it, delete it.

A spec becomes permanent only when the maintainer asks for it. Those live in `tests/e2e/` with a `.keep.spec.ts` suffix and are documented in that folder's README, which records what each one guards against. Don't add one, or move a spec there, on your own initiative. If a throwaway looks worth keeping, say so and ask.

A few files make up the test harness and shouldn't be changed casually: `apps/desktop/electron/test/ipc-handlers.ts` and `apps/web/src/App/behavior/useAutoTest.ts`. If you think one needs to change, check with the maintainer first.
