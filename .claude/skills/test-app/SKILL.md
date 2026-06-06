---
name: test-app
description: Drive and verify the running game using the project's BUILT-IN automation (CLI flags + IPC) instead of writing Playwright tests — load a save state, screenshot the window, or dump the collision/navigation state to JSON. Use when asked to test, verify, screenshot, or reproduce app behavior, to check a navigation/overlay change, or whenever you'd otherwise write a Playwright spec. Prefer these built-ins; keep any Playwright use ephemeral.
---

# Test the app with built-ins (not Playwright)

Full reference: @docs/testing-capabilities.md. The app drives itself via CLI flags
and writes artifacts you can read.

## ⚠️ Protected harness files — modify only with permission

`apps/desktop/electron/test/ipc-handlers.ts`, `App/behavior/useAutoTest.ts`,
`tests/snapshot.spec.ts` — marked "NEVER MODIFIED BY THE AI." Don't edit them on
your own; if a change seems needed, **stop and ask the user** for permission first.

## ALWAYS launch with --no-focus (and --muted)

Any time you start the app for testing, the window must open **inactive** so it
never steals focus or interrupts the user. This is mandatory.
- **Built app:** `npx electron dist/electron/main.js --no-focus --muted <flags>`
- **Dev server (quick boot check):** `npm run dev -- -- --no-focus --muted`
  (double `--` required: npm → script, electron-vite → Electron — verified to forward).

## Workflow

1. **Build** (these flags run the built app, not dev): `npm run build`.
   Requires an active profile and existing save-state slots.
2. **Run the right flag** (`npx electron dist/electron/main.js <flags>`, always `--no-focus --muted`):
   - Visual check → `--auto-state=N --screenshot=NAME` → `tests/screenshots/NAME.png`
   - Collision/overlay logic → `--dump-layers=N` → `debug-output/dump-layers.json`
     (add `--hover-tile=col,row` for the tooltip + screenshot)
   - Navigation state → `--dump-nav=N` → `debug-output/dump-nav.json`
3. **Read the artifact.** For PNGs, view with Read + the `interpret-game-screenshot`
   skill. For JSON, prefer it as ground truth over eyeballing pixels.
4. **Report** what you observed vs. expected.

## If you must use Playwright (ephemeral only)

- First confirm a built-in flag can't already do it (it usually can).
- Put the throwaway spec in **`tests/scratch/`** (gitignored), run it, then **delete
  it**. Never commit it; never grow a suite. Only `tests/snapshot.spec.ts` is permanent.
