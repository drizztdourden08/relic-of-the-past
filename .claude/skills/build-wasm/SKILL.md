<!-- @layer claude-config @kind doc -->
---
name: build-wasm
description: Compile the zelda3 C core to WebAssembly with Emscripten. Use when C code under core/ (game-hooks, zelda3, emscripten_main.c) changed and the running app needs the rebuilt zelda3.{js,wasm,data}, or when the user asks to "rebuild WASM", "compile the C", or reports that a C-side change isn't taking effect.
---

# Build the WASM core

The TS app loads a **prebuilt** `apps/desktop/public/wasm/zelda3.{js,wasm,data}`.
Any change to C code in `core/` has **no effect** until you run this build.

## Prerequisites

- Emscripten SDK installed at `E:\GameProjects\emsdk` (provides `emcc`).
- `emcc` must be on PATH, which requires sourcing `emsdk_env.bat` first.

## Build (canonical — use this)

`core/wasm-build/build.bat` is the build the app actually uses. It writes
straight to `apps/desktop/public/wasm/` and includes debug info (`-g2`).

Emscripten needs its env activated in the same shell. Run from the Bash tool:

```bash
cmd /c "E:\GameProjects\emsdk\emsdk_env.bat && cd /d E:\GameProjects\relic-of-the-past\core\wasm-build && build.bat"
```

On success it prints `Build successful!` and lists the three output files.
On failure it prints `BUILD FAILED` and exits non-zero — surface the compiler
error; do not claim success.

## After building

- Restart `npm run dev` (or reload the renderer) so the new module is picked up.
- If you added a new exported function, confirm its `_Wasm...` name is present in
  the `EXPORTED_FUNCTIONS` list — a missing entry compiles fine but fails at the
  `ccall` site at runtime. (See the `add-wasm-function` skill.)

## Notes & gotchas

- There is also a `Makefile` (`emmake make`) that writes to `output/` instead of
  `public/wasm/`. Its `EXPORTED_FUNCTIONS` list has drifted from `build.bat`'s —
  **prefer `build.bat`**. If you edit one export list, mirror the change in the other.
- Win32-only sources (`opengl.c`, `glsl_shader.c`, `gl_core_3_1.c`,
  `volume_control.c`) and the native `main.c` are intentionally excluded;
  `emscripten_main.c` replaces `main.c`.
- The build is a full recompile of the C core (~dozens of translation units);
  expect it to take a while. Run it with the Bash tool's longer timeout if needed.
