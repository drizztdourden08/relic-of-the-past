/* @layer renderer-hud @kind logic */
import { INK } from '../HudPixelPie.constants';
import type { SliceMap } from '../HudPixelPie.type';
import { itemAt } from '@app/checked-access';
import { inkOf } from './ink-of';

const fillGrid = (grid: Uint8Array, map: SliceMap, gone: number, nextBody: number): void => {
  for (let cell = 0; cell < grid.length; cell += 1) {
    const index = itemAt(map.owner, cell);
    if (map.outline[cell] === 1) grid[cell] = INK.outline;
    else if (map.backing[cell] === 1 || (index >= 0 && index < gone)) grid[cell] = INK.backing;
    else if (index >= 0) grid[cell] = inkOf(index === gone ? nextBody : INK.lit, map, cell);
  }
};

export { fillGrid };
