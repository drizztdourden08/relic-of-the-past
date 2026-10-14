/* @layer renderer-appshell @kind logic */
import type { FloodRun } from './dump-nav.type';
import { hex } from './hex';

const dumpFloodConnection = (c: FloodRun['connections'][number]) => ({
  edge: c.edge,
  targetScreen: c.targetScreen,
  targetScreenHex: hex(c.targetScreen, 4),
  isIntraRoom: c.isIntraRoom ?? false,
  layerToggle: c.layerToggle ?? false,
  freeTileCount: c.freeTileCount,
  itemTileCount: c.itemTileCount,
  positions: c.positions,
});

export { dumpFloodConnection };
