<!-- @layer docs @kind doc -->
# Building the WASM Core

> ⚠️ **You only need this when you change the C code.** `npm run dev` and `npm run build` run an
> `ensure-wasm` step that rebuilds the WASM core automatically whenever it's missing or a C source is
> newer than the last build, so normal app work needs nothing extra. The build output is gitignored,
> not committed. C changes under `core/` take effect on the next `dev`/`build` — or run
> `npm run ensure-wasm` to force a rebuild now.

## Prerequisites

- Emscripten SDK installed (the repo's setup expects it at `E:\GameProjects\emsdk`, providing `emcc`).
- `emcc` on PATH — which means sourcing the emsdk env in the **same shell** as the build.

## Build manually (`build.bat` — what `ensure-wasm` invokes)

`core/wasm-build/build.bat` is a thin wrapper around `build.mjs` (the single source of truth for the
source list and emcc flags); it writes straight to `apps/web/public/wasm/` (with debug info).
`ensure-wasm` calls it for you, but you can run it directly. Activate the Emscripten env first:

```bash
cmd /c "E:\GameProjects\emsdk\emsdk_env.bat && cd /d <repo>\core\wasm-build && build.bat"
```

On success it prints `Build successful!` and the two output files (`zelda3.js`, `zelda3.wasm`); on
failure `BUILD FAILED` with the compiler error. After building, restart `npm run dev` (or reload the
renderer) to pick up the new module.

## One build, three entry points

`build.mjs` holds the source list and emcc flags **once** — it is the single source of truth and
writes to `apps/web/public/wasm/`. Everything else just delegates to it, so the build can never drift
between platforms:

| Entry point | When | Notes |
|------|------|-------|
| `build.mjs` | direct (`node build.mjs`) | The actual build. Cross-platform; needs `emcc` on PATH. |
| `build.bat` | Windows / `ensure-wasm` | Thin wrapper → `build.mjs`. |
| `Makefile` (`make`) | CI / Unix habit | Thin wrapper → `build.mjs`. |

There is no per-function `EXPORTED_FUNCTIONS` list. Every `Wasm*` export is tagged
`EMSCRIPTEN_KEEPALIVE` in its `.c` file, which both retains *and* exports the symbol — so there is
nothing to keep in sync and no symbol to add when you write a new export (see
[Adding a WASM Function](adding-a-wasm-function.md)). Forget the `KEEPALIVE` tag and the function
compiles fine but throws at the `ccall` site at runtime.

## Notes

- `emscripten_main.c` is the entry point; the app ships through Electron, not an SDL window.
- `core/zelda3/snes/` builds three units: `ppu.c` (the renderer), `dma.c` and `dsp.c` (audio).
  Those are the chips the decompiled game still writes registers to. There is no CPU emulation —
  the game's own processor code is what was decompiled into C, which is the point of the port.
- It's a full recompile of dozens of translation units — expect it to take a while.
- The repo's `build-wasm` skill automates this exact flow.
