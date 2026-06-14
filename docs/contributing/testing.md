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

For example:

```bash
npx electron dist/electron/main.js --no-focus --muted --auto-state=2 --screenshot=snapshot
```

The JSON dumps are the most reliable way to check navigation and collision behavior, so read those rather than squinting at a screenshot.

Launch test runs with `--no-focus --muted` so the window doesn't grab focus while you work. For a quick dev-server boot check, use `npm run dev -- -- --no-focus --muted`.

## Playwright

The app changes quickly, so there's no standing Playwright suite — specs go stale within days. Use Playwright only for a one-off check: put the throwaway spec in `tests/scratch/` (which is gitignored), run it, and delete it when you're done. The one permanent spec is `tests/snapshot.spec.ts`.

A few files make up the test harness and shouldn't be changed casually: `apps/desktop/electron/test/ipc-handlers.ts`, `apps/web/src/App/behavior/useAutoTest.ts`, and `tests/snapshot.spec.ts`. If you think one needs to change, check with the maintainer first.
