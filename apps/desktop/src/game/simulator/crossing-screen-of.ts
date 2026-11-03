/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const screenOf = (crossing: ScreenCrossing): number | null =>
  crossing.target.native?.kind === 'overworld' ? crossing.target.native.screen : null;

export { screenOf };
