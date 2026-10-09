/* @layer bridge-wasm @kind logic */
import type { PreviewTarget } from '@rotp/game-core';

const soundKeyOf = (target: PreviewTarget, soundId: number): string => `${target}:${soundId}`;

export { soundKeyOf };
