<!-- @layer docs @kind doc -->
# Building the WASM Core

> ⚠️ The WASM build is a **separate manual step — not part of any `npm` script.** The TS app loads a
> committed prebuilt `apps/desktop/public/wasm/zelda3.{js,wasm,data}`. **C changes under `core/` have
> no effect until you rebuild.** You only need this when editing C — normal app work doesn't.

## Prerequisites

- Emscripten SDK installed (the repo's setup expects it at `E:\GameProjects\emsdk`, providing `emcc`).
- `emcc` on PATH — which means sourcing the emsdk env in the **same shell** as the build.

## Build (canonical)

`core/wasm-build/build.bat` is the build the app actually uses; it writes straight to
`apps/desktop/public/wasm/` (with debug info). Activate the Emscripten env first:

```bash
cmd /c "E:\GameProjects\emsdk\emsdk_env.bat && cd /d <repo>\core\wasm-build && build.bat"
```

On success it prints `Build successful!` and the three output files; on failure `BUILD FAILED` with
the compiler error. After building, restart `npm run dev` (or reload the renderer) to pick up the new module.

## Two build files

| File | Output | Use |
|------|--------|-----|
| `build.bat` | `apps/desktop/public/wasm/` | **Canonical** — what the app runs. |
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
