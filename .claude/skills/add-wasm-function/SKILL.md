<!-- @layer claude-config @kind doc -->
---

name: add-wasm-function
description: Scaffold a new function that crosses the C↔TypeScript WASM boundary in this ALttP port — either a TS→C call (Wasm* export) or a C→TS callback (GameHook_*/window.__on*). Use when adding a new bridge call, exposing a game value/state to the UI, sending a new game event to JS, or when a newly added Wasm function "isn't found"/throws at ccall (usually a missing EMSCRIPTEN_KEEPALIVE tag or un-rebuilt WASM). Touches the C impl and the TS bridge
---

# Add a WASM bridge function

Crossing the C↔TS boundary touches **two places**. Miss one and it fails
silently (dead-code-stripped) or throws at the `ccall`. Do both, then
rebuild WASM.

Pick the direction first.

---

## Direction A — TypeScript calls into C (`Wasm*` export)

Use for: reading a game value/state, or commanding the game (pause, cheat, etc.).

### Step 1 — C implementation (`core/game-hooks/<domain>.c`)

Choose the file by domain: `state_queries.c` (reads), `cheats.c`,
`check_triggers.c`, `ui_state.c`, `haptic_events.c`, `item_overrides.c`.

```c
#include "game_hooks_internal.h"

// Scalar return:
EMSCRIPTEN_KEEPALIVE
int WasmGetMyFlag(void) { return some_game_global ? 1 : 0; }

// Bulk data: fill a static buffer, return its address as int. Pack bytes with
// the helpers in game-hooks/wasm_buf.h — never hand-roll `v & 0xFF`/`v >> 8`.
static uint8 g_my_buf[2 + N * 3];
EMSCRIPTEN_KEEPALIVE
int WasmGetMyData(void) {
  BufW b = BufW_Init(g_my_buf);   // sequential append cursor (count-prefixed lists)
  BufW_U16(&b, count);
  for (int i = 0; i < count; i++) { BufW_U16(&b, room[i]); BufW_U8(&b, kind[i]); }
  return (int)g_my_buf;
  // For a fixed-offset struct buffer, use PutU16(g_my_buf, at, v) instead.
}

// Taking args:
EMSCRIPTEN_KEEPALIVE
void WasmSetMyThing(int value) { /* clamp inputs with clampi() from num_util.h */ }
```

- `EMSCRIPTEN_KEEPALIVE` is mandatory — it both **retains and exports** the
  symbol, so there is **no** `EXPORTED_FUNCTIONS` list to edit in `build.bat` or
  `Makefile`. That attribute is the single source of truth for what's callable.
- Only add a declaration to `game_hooks.h` if other **C** code calls it.
- Shared helpers live in `game-hooks/`: `wasm_buf.h` (`PutU16`/`BufW`),
  `num_util.h` (`clampi`), `game_constants.h` (`MODULE_*`, `HAPTIC_*`, sprite ids).
  Reuse them instead of re-deriving magic numbers or byte math.

### Step 2 — TypeScript caller (`apps/web/src/lib/game/...`)

```ts
// scalar
const flag = mod.ccall('WasmGetMyFlag', 'number', [], []) as number;

// args
mod.ccall('WasmSetMyThing', null, ['number'], [value]);

// pointer + HEAPU8 read (bulk data)
const ptr = mod.ccall('WasmGetMyData', 'number', [], []) as number;
const heap = mod.HEAPU8;
const first = heap[ptr];   // read N bytes from ptr
```

Guard on module readiness like the existing helpers in `wasm-bridge.ts`
(`if (!mod || currentState.status !== 'running') return;`). Place reads in the
matching module (`wasm-bridge.ts`, `tracker/`, `navigation-data-source.ts`, …)
and follow @docs/contributing/coding-standards.md (exports at end, destructure first line).

---

## Direction B — C calls into JS (event callback)

Use for: notifying the UI of a game event (item received, sword swing, etc.).

### Step 1 — C side (`core/game-hooks/<domain>.c` + `game_hooks.h`)

```c
void GameHook_NotifyMyEvent(uint8 arg) {
  EM_ASM({
    if (typeof window !== 'undefined' && window.__onMyEvent) window.__onMyEvent($0);
  }, arg);
}
```

Declare `void GameHook_NotifyMyEvent(uint8 arg);` in `game_hooks.h`.

### Step 2 — call site in upstream `core/zelda3/`

Insert the `GameHook_NotifyMyEvent(...)` call at the game event. **This is the
only sanctioned reason to edit upstream `zelda3/` files** — keep it to a single
call line; logic stays in `game-hooks/`.

### Step 3 — JS registers the handler

In the renderer, set `window.__onMyEvent = (arg) => { ... }` (mirror how
`window.__onItemReceived` is wired). No `EXPORTED_FUNCTIONS` entry is needed for
this direction.

---

## Finally — rebuild and verify

1. Run the **build-wasm** skill (C changes don't take effect until rebuilt).
2. Restart `npm run dev`.
3. Verify: call the new function / trigger the event and confirm the value or
   callback fires. If `ccall` throws "function not found", the C function is
   missing its `EMSCRIPTEN_KEEPALIVE` tag or the WASM wasn't rebuilt.
