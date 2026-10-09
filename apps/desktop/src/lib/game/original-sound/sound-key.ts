/* @layer bridge-wasm @kind logic */
import type { PreviewTarget } from '../bridge/sound-preview';

const soundKeyOf = (target: PreviewTarget, soundId: number): string => `${target}:${soundId}`;

export { soundKeyOf };
