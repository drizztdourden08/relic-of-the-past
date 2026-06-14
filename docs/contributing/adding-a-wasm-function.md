<!-- @layer docs @kind doc -->
# Adding a WASM Function

Crossing the C↔TS boundary touches two places. Miss one and it either fails silently, since the
dead code gets stripped, or throws at the `ccall`. Do both, then [rebuild WASM](building-wasm.md).
Pick the direction first. The repo's `add-wasm-function` skill scaffolds this, and the
[hooks reference](../hooks/overview.md) covers the existing surface and buffer conventions.

## Direction A — TypeScript calls into C (`Wasm*` export)

For reading a game value/state or commanding the game.

**1 · C implementation** in `core/game-hooks/<domain>.c` (`state_queries*.c` for reads, `cheats.c`,
`check_triggers.c`, `ui_state.c`, `item_overrides.c`, …):

```c
#include "game_hooks_internal.h"

EMSCRIPTEN_KEEPALIVE
int WasmGetMyFlag(void) { return some_game_global ? 1 : 0; }

// Bulk data: fill a static buffer, return its address.
static uint8 g_my_buf[N];
EMSCRIPTEN_KEEPALIVE
int WasmGetMyData(void) { g_my_buf[0] = /* … */; return (int)g_my_buf; }

EMSCRIPTEN_KEEPALIVE
void WasmSetMyThing(int value) { /* … */ }
```

`EMSCRIPTEN_KEEPALIVE` is mandatory. It both retains and exports the symbol, so there's no
`EXPORTED_FUNCTIONS` list to edit in `build.bat`/`Makefile`. Add a declaration to `game_hooks.h` only
when other C code calls it.

**2 · TypeScript caller** in `apps/web/src/lib/game/` (the right `bridge/*` facade or domain module):

```ts
const flag = mod.ccall('WasmGetMyFlag', 'number', [], []) as number;   // scalar
mod.ccall('WasmSetMyThing', null, ['number'], [value]);                // args
const ptr = mod.ccall('WasmGetMyData', 'number', [], []) as number;    // pointer
const bytes = mod.HEAPU8.subarray(ptr, ptr + N);                       // read the documented layout
```

Guard on module readiness like the existing helpers, document the buffer layout, and follow the
[coding standards](coding-standards.md) (exports at end, destructure first line).

## Direction B — C calls into JS (event callback)

For notifying the UI of a game event.

**1 · C side** (`core/game-hooks/<domain>.c` + declare in `game_hooks.h`):

```c
void GameHook_NotifyMyEvent(uint8 arg) {
  EM_ASM({ if (typeof window !== 'undefined' && window.__onMyEvent) window.__onMyEvent($0); }, arg);
}
```

**2 · Call site** in upstream `core/zelda3/` — insert the `GameHook_NotifyMyEvent(…)` call at the game
event. This is the one sanctioned reason to edit `zelda3/`: a single call line, with the logic staying in
`game-hooks/`.

**3 · JS registers the handler** in the renderer: `window.__onMyEvent = (arg) => { … }`, mirroring how
`window.__onItemReceived` is wired. This direction needs no `EXPORTED_FUNCTIONS` entry.

## Finally

1. [Rebuild WASM](building-wasm.md), since C changes only take effect after a rebuild.
2. Restart `npm run dev`.
3. Trigger the function/event and confirm. A "function not found" at `ccall` means the C function is
   missing its `EMSCRIPTEN_KEEPALIVE` tag, or the WASM wasn't rebuilt.
