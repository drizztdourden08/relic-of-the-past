<!-- @layer docs @kind doc -->
# Testing the App — Built-in Capabilities (no Playwright needed)

The app has **CLI flags and IPC channels** that let it drive itself — load a save
state, screenshot, and dump internal state to JSON — without writing a Playwright
test. Prefer these for LLM/manual verification.

## ⚠️ Protected files — modify only with explicit permission

Files marked `THIS TEST MUST NEVER BE MODIFIED BY THE AI` are protected:

- `apps/desktop/electron/test/ipc-handlers.ts`
- `apps/desktop/src/App/behavior/useAutoTest.ts`
- `tests/snapshot.spec.ts`

Do **not** edit them on your own initiative. If a change seems necessary, **stop
and ask the user** — they can grant permission, and only then may you modify them.
Otherwise, use the capabilities; don't touch the harness that provides them.

## Prerequisites

1. **Build first** — these flags run the built app, not the dev server:
   `npm run build` (produces `dist/electron/main.js`).
2. An **active profile** must exist (the app loads the current profile).
3. Save **state slots** must exist for the slot you reference (`--auto-state=N`).

Launch form: `npx electron dist/electron/main.js <flags>`

> ⚠️ **ALWAYS launch with `--no-focus` (and `--muted`)** when starting the app for
> any test/verification, so the window opens **inactive** and does **not** steal
> focus or interrupt what the user is doing. This is mandatory, not optional.
>
> - **Built app:** `npx electron dist/electron/main.js --no-focus --muted <flags>`
> - **Dev server:** `npm run dev -- -- --no-focus --muted` — the double `--` is
>   required (first for npm → the script, second for electron-vite → Electron).
>   Verified: this forwards `--no-focus` to the Electron process.

## CLI flags

| Flag | Effect | Output |
|------|--------|--------|
| `--muted` | Mute audio (use for all automated runs) | — |
| `--no-focus` | Don't steal window focus | — |
| `--auto-state=N` | Start game with active profile, load save-state slot **N** | — |
| `--screenshot=NAME` | After state loads, capture the window | `tests/screenshots/NAME.png` |
| `--dump-layers=N` | Load slot N, dump the dual-layer collision grid (the exact data the navigation overlay uses), then **exit** | `debug-output/dump-layers.json` |
| `--hover-tile=col,row` | With `--dump-layers`: open nav overlay, hover that tile (trigger tooltip), screenshot | `debug-output/` |
| `--dump-nav=N` | Load slot N, dump nav widget state (entrances, screen detection, transitions), then **exit** | `debug-output/dump-nav.json` |
| `--auto-flood` | Run navigation flood-fill automation | — |

### Common recipes

```bash
# Screenshot of save slot 2 (then inspect tests/screenshots/snapshot.png)
npx electron dist/electron/main.js --no-focus --muted --auto-state=2 --screenshot=snapshot

# Dump the collision grid for slot 6 and read the JSON
npx electron dist/electron/main.js --no-focus --muted --dump-layers=6
# → read debug-output/dump-layers.json

# Dump grid + hover a specific tile's tooltip + screenshot
npx electron dist/electron/main.js --no-focus --muted --dump-layers=6 --hover-tile=45,31

# Dump navigation state for slot 1
npx electron dist/electron/main.js --no-focus --muted --dump-nav=1

# Quick boot check via the dev server (no focus stolen)
npm run dev -- -- --no-focus --muted
```

## IPC channels behind the flags

`test:getArgs`, `test:screenshot`, `debug:getDumpLayersSlot`, `debug:getHoverTile`,
`debug:dumpLayers`, `debug:getDumpNavSlot`, `debug:dumpNav`. These are driven by the
flags above — you normally don't call them directly.

## How to verify a change with these

1. `npm run build`.
2. Run the relevant flag (screenshot for visual checks; dump-layers/dump-nav for
   navigation/overlay logic).
3. **Read the artifact** — the PNG (use Read to view it; apply the
   `interpret-game-screenshot` skill) or the JSON in `debug-output/`.
4. Report what you observed against expected. The JSON dumps are ground truth —
   prefer them over eyeballing pixels for navigation/collision questions.

---

## Playwright policy — ephemeral, not accumulated

The software changes fast, so Playwright specs deprecate almost immediately. We use
Playwright only for one-off **LLM-driven verification**, not a maintained suite.

**Rules:**

- **Do not accumulate spec files.** The only permanent specs are the protected ones
  above (`tests/snapshot.spec.ts`).
- Write any new throwaway spec under **`tests/scratch/`** (gitignored), run it, then
  **delete it** once it has served its purpose. Never commit it.
- Before reaching for Playwright, check whether a **built-in flag** (above) already
  gets you the screenshot/JSON you need — it usually does, with less overhead.
- Never leave a scratch spec behind "in case it's useful later." It won't be; it'll
  be stale within days.
- Don't modify the protected harness files (above) without explicit user permission.
