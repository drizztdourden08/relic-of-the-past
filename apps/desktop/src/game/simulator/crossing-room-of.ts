/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const roomOf = (crossing: ScreenCrossing): number | null =>
  crossing.target.native?.kind === 'room' ? crossing.target.native.room : null;

export { roomOf };
