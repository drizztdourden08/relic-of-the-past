/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';

const tileText = (tile: GridPos): string => `${tile.col},${tile.row}`;

const arrivalLabel = (sig?: string, tile?: GridPos): string => {
  if (!sig) return tile ? `at ${tileText(tile)}` : 'start';
  const border = /^(north|south|west|east):(\d+)-(\d+)$/.exec(sig);
  if (border) return `via ${border[1]} edge, tiles ${border[2]}-${border[3]}`;
  const entrance = /^e(\d+)$/.exec(sig);
  if (entrance) return `via entrance #${entrance[1]}${tile ? ` at ${tileText(tile)}` : ''}`;
  const stair = /^s(\d+)$/.exec(sig);
  if (stair) return `via stair #${stair[1]}`;
  const doorway = /^d(north|south|west|east):(\d+)$/.exec(sig);
  if (doorway) return `via ${doorway[1]} doorway at ${doorway[2]}`;
  if (sig.startsWith('w')) return `via warp door ${sig.slice(1)}`;
  if (sig.startsWith('x')) return 'via its exit door';
  return `via ${sig}`;
};

export { arrivalLabel };
