/**
 * @deprecated - Use `shared/game/navigation` instead. This file is a re-export shim.
 */
import type { RomData } from '../asset-extraction/rom/rom-types';
import {
  floodFillScreen, initEngine, getConnections, getAdjacentScreen,
  SCREEN_NAMES as _SCREEN_NAMES,
} from './navigation/index';
import type {
  FloodFillResult, ConnectionInfo, TilePassability,
  TransitionPoint, OverworldEntrance, LedgeTraversal, BorderSummary,
} from './navigation/index';

export type { FloodFillResult, ConnectionInfo, TilePassability, TransitionPoint, OverworldEntrance, LedgeTraversal, BorderSummary };
export { getConnections, getAdjacentScreen };
export const SCREEN_NAMES = _SCREEN_NAMES;

/** @deprecated Use `initEngine` from `shared/game/navigation` */
export function initFloodFillEngine(rom: RomData): void {
  initEngine(rom);
}

/** @deprecated Use `floodFillScreen` from `shared/game/navigation` */
export function runFloodFill(rom: RomData, screenIndex: number, inventory?: Set<string>, startPos?: { row: number; col: number }): FloodFillResult {
  return floodFillScreen(rom, screenIndex, inventory, startPos);
}
