# Building zelda3 as WebAssembly

## Prerequisites

1. **Emscripten SDK** — https://emscripten.org/docs/getting_started/downloads.html

   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh   # or emsdk_env.bat on Windows
   ```

2. **Assets** — You need a valid `assets.dat` in the project `assets/` directory.
   Run the zelda3 asset extractor against your legally owned ROM:

   ```bash
   cd core/zelda3
   python assets/restool.py --extract path/to/your_rom.sfc
   ```

## Building

```bash
cd core/wasm-build
make
```

Output will be in `core/wasm-build/output/`:
- `zelda3.wasm`
- `zelda3.js` (Emscripten glue)
- `zelda3.data` (preloaded assets)

## Integration

The WASM module is loaded by the React renderer via the `GameCanvas` component.
The Emscripten module is configured with `MODULARIZE=1` and `EXPORT_NAME='Zelda3'`,
so it's instantiated as:

```ts
import Zelda3Module from './zelda3.js';

const core = await Zelda3Module({
  canvas: canvasElement,
});
```

## Current Status

The build is **not yet functional** — the zelda3 source needs lifecycle refactoring
(Phase 3) before it can be compiled as a library. This scaffolding is in place for
when that work begins.
