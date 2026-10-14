/* @layer renderer-widgets @kind logic */
import type { PlayerDebugState } from './hooks.type';

const playerMapPosOf = (playerDebug: PlayerDebugState | null): { screen: number; row: number; col: number } | null =>
  (playerDebug ? { screen: playerDebug.liveScreenIndex, row: playerDebug.tileMinRow, col: playerDebug.tileMinCol } : null);

export { playerMapPosOf };
