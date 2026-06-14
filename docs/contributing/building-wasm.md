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

`core/wasm-build/build.bat` is the build the app actually uses; it writes straight to
`apps/web/public/wasm/` (with debug info). `ensure-wasm` calls it for you, but you can run it
directly. Activate the Emscripten env first:

```bash
cmd /c "E:\GameProjects\emsdk\emsdk_env.bat && cd /d <repo>\core\wasm-build && build.bat"
```

On success it prints `Build successful!` and the two output files (`zelda3.js`, `zelda3.wasm`); on
failure `BUILD FAILED` with the compiler error. After building, restart `npm run dev` (or reload the
renderer) to pick up the new module.

## Two build files

| File | Output | Use |
|------|--------|-----|
| `build.bat` | `apps/web/public/wasm/` | **Canonical** — what the app runs. |
| `Makefile` (`emmake make`) | `output/` | Alternate (CI). |

Neither carries a per-function `EXPORTED_FUNCTIONS` list. Every `Wasm*` export is tagged
`EMSCRIPTEN_KEEPALIVE` in its `.c` file, which both retains *and* exports the symbol — so there is
nothing to keep in sync between the two builds and no symbol to add when you write a new export (see
[Adding a WASM Function](adding-a-wasm-function.md)). Forget the `KEEPALIVE` tag and the function
compiles fine but throws at the `ccall` site at runtime.

## Notes

- Win32-only sources (`opengl.c`, `glsl_shader.c`, `gl_core_3_1.c`, `volume_control.c`) and the native
  `main.c` are intentionally excluded; `emscripten_main.c` replaces `main.c`.
- It's a full recompile of dozens of translation units — expect it to take a while.
- The repo's `build-wasm` skill automates this exact flow.
