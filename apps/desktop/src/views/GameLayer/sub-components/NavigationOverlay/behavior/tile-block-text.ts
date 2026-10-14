/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { REACH_BLOCKED, REACH_OPEN } from '@app/navigation-overlay/pathfinding/pathfinding.constants';
import type { TileBlockTextParams } from './rect-selection.type';

const reachMark = (reach: number | undefined): string => {
  if (reach === REACH_BLOCKED) return '-';
  if (reach === REACH_OPEN) return '+';
  return '~';
};

const cellText = (result: FloodFillResult, attrGrid: number[][], r: number, c: number): string => {
  const attr = attrGrid[r]?.[c];
  if (attr === undefined) throw new Error(`attribute grid has no tile at row ${r}, column ${c}`);
  return `${attr.toString(16).padStart(2, '0')}${reachMark(result.reachable[r]?.[c])}`;
};

const tileBlockText = (params: TileBlockTextParams): string => {
  const { result, attrGrid, r0, r1, c0, c1 } = params;
  const rows: string[] = [];
  for (let r = r0; r <= r1; r++) {
    const cells: string[] = [];
    for (let c = c0; c <= c1; c++) cells.push(cellText(result, attrGrid, r, c));
    rows.push(cells.join(' '));
  }

  const header = [
    `Tile Selection [${r0},${c0}] to [${r1},${c1}] (${(r1 - r0 + 1)}×${(c1 - c0 + 1)} = ${(r1 - r0 + 1) * (c1 - c0 + 1)} tiles)`,
    `Context: ${result.indoors ? 'interior' : 'overworld'} | Screen: 0x${result.screenIndex.toString(16).padStart(2, '0')}`,
    `Format: <hex_attr><+reachable|~traversal|-blocked>`,
    ``,
  ];

  return header.join('\n') + rows.join('\n');
};

export { tileBlockText };
