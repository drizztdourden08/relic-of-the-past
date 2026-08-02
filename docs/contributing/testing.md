<!-- @layer docs @kind doc -->
# Testing

## Unit tests

Logic is covered by Vitest. Run the file you're working on rather than the whole suite:

```bash
npx vitest run tests/<file>
```

Tests live under `tests/`, or alongside the code as `*.test.ts`.

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
| `--instance=NAME` | run as a named instance: own profile, own identity, and read-only for the two shared files below — but see the note after this section, some app-wide tool state still isn't sandboxed |

For example:

```bash
npx electron dist/electron/main.js --no-focus --muted --instance=big-key --auto-state=test-jail-cell --screenshot=snapshot
```

The JSON dumps are the most reliable way to check navigation and collision behavior, so read those rather than squinting at a screenshot.

Launch test runs with `--no-focus --muted` so the window doesn't grab focus while you work. For a quick dev-server boot check, use `npm run dev -- -- --no-focus --muted`.

### Mandatory: an automated launch always names its own profile

> **Every automated launch must pass `--instance=NAME` and use that instance's own
> profile.** Never launch automation against the profile that opens by default. That
> profile, its save states and its settings belong to the person at the keyboard and are
> relied on for their own testing — an automated run must leave them exactly as it found
> them.

An `--instance=NAME` launch gets its own profile (created by `npm run wt -- new NAME`,
pre-loaded with a copy of the named save states) and identifies itself on screen and on the
taskbar, so it is never mistaken for the real app. See
[parallel-worktrees.md](parallel-worktrees.md).

The app enforces the "changes nothing shared" half of this rather than trusting the caller.
Any launch carrying an automation flag is **read-only** for configuration every launch
shares:

| Shared file | What it controls | On an automated launch |
|---|---|---|
| `Data/app.json` → `lastProfileId` | which profile opens by default | never written |
| `Data/config/window-state.json` | window size, position, maximized/fullscreen | never written |

So forgetting `--instance` cannot repoint the default profile or move the window — but it
does mean the run shares the user's save data, which is exactly what the rule above exists
to prevent. Pass the flag.

### `--instance` sandboxes profile data, not app-wide tool state

`--instance` selects a game **profile** (`app.getPath('userData')` is one fixed directory
regardless of the flag — see `apps/desktop/electron/lib/paths.ts`), so anything that isn't
stored inside `Data/profiles/<id>/` is shared across every instance, named or not. Besides
the two enforced-read-only files above, five files sit directly under `Data/` and are
**intentionally global by design** — they're tool/UI preferences, not gameplay state, so
they don't belong per-profile any more than a window's size would:

| File | What it holds |
|---|---|
| `Data/ui-views.json` | Data Inspector view-state — per-collection columns, sort, filters |
| `Data/nav-review.json` | navigation-baseline review progress |
| `Data/connection-review.json` | connection-review progress |
| `Data/sprite-review.json` | sprite-review progress |
| `Data/stick-calibration.json` | controller stick calibration (hardware, not a save) |

Unlike the two files the app refuses to write, these are meant to be written — normal use
is expected to update them. The consequence for automation: **a `--instance` launch is not
a safe sandbox for exercising a real UI flow that saves through one of these files.**
Resizing/sorting/filtering a live Data Inspector column, for example, debounce-saves
straight to the one shared `ui-views.json` — the same file the maintainer's own hand-tuned
layouts live in. Before driving that flow with Playwright, read the file first; if it holds
real content, verify with a throwaway unit test against the pure logic instead of the live
UI, or stop short of the save-triggering interaction, exactly as you'd want a change to a
save-state format to be checked without touching a real save.

## Playwright

Playwright specs are **throwaway by default**. The app changes quickly and specs go stale within days, so a one-off check belongs in `tests/scratch/` (gitignored): write it, run it, delete it.

A spec becomes permanent only when the maintainer asks for it. Those live in `tests/e2e/` with a `.keep.spec.ts` suffix and are documented in that folder's README, which records what each one guards against. Don't add one, or move a spec there, on your own initiative — if a throwaway looks worth keeping, say so and ask.

A few files make up the test harness and shouldn't be changed casually: `apps/desktop/electron/test/ipc-handlers.ts` and `apps/web/src/App/behavior/useAutoTest.ts`. If you think one needs to change, check with the maintainer first.
