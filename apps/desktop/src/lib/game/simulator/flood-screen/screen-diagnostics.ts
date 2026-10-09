/* @layer bridge-wasm @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import { wasmGetOverworldSpriteSpawns } from '../../';
import { getScreenGrids } from '../../flood';
import {
  EDGE_DIAGNOSTIC_COL_FROM, EDGE_DIAGNOSTIC_COL_TO, EDGE_DIAGNOSTIC_ROWS, SPRITE_REACH_RADIUS,
} from './flood-screen.constants';
import type { ScreenFlood } from './flood-screen.type';

const reachedNear = (result: FloodFillResult, row: number, col: number): boolean => {
  for (let dr = -SPRITE_REACH_RADIUS; dr <= SPRITE_REACH_RADIUS; dr++) {
    for (let dc = -SPRITE_REACH_RADIUS; dc <= SPRITE_REACH_RADIUS; dc++) {
      if ((result.reachable[row + dr]?.[col + dc] ?? 0) > 0) return true;
    }
  }
  return false;
};

const spriteReach = (result: FloodFillResult, screenIndex: number): NonNullable<ScreenFlood['sprites']> =>
  (wasmGetOverworldSpriteSpawns(screenIndex) ?? []).map((sp) => ({
    type: `0x${sp.spriteType.toString(16)}`,
    row: sp.row,
    col: sp.col,
    reached: reachedNear(result, sp.row, sp.col),
  }));

const edgeRows = (result: FloodFillResult, screenIndex: number): NonNullable<ScreenFlood['edgeRows']> => {
  const grid = getScreenGrids({ isIndoors: false, roomId: 0, owScreenIndex: screenIndex }).rawAttrGrid;
  return EDGE_DIAGNOSTIC_ROWS.map((row) => ({
    row,
    raw: (grid[row] ?? []).slice(EDGE_DIAGNOSTIC_COL_FROM, EDGE_DIAGNOSTIC_COL_TO).map((v) => v.toString(16).padStart(2, '0')).join(' '),
    reached: (result.reachable[row] ?? []).slice(EDGE_DIAGNOSTIC_COL_FROM, EDGE_DIAGNOSTIC_COL_TO).map((v) => (v > 0 ? '#' : '.')).join(''),
  }));
};

const screenDiagnostics = (
  result: FloodFillResult,
  screenIndex: number | undefined,
): Pick<ScreenFlood, 'sprites' | 'edgeRows'> => {
  if (screenIndex === undefined) return { edgeRows: undefined };
  return { sprites: spriteReach(result, screenIndex), edgeRows: edgeRows(result, screenIndex) };
};

export { screenDiagnostics };
