/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '@rotp/game-core';

const heapOf = (mod: EmscriptenModule): Uint8Array | undefined => mod.HEAPU8;

export { heapOf };
