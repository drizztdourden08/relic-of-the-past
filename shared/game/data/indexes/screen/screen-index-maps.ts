/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../types';

const screenIndexMaps = {
  byRoom: new Map<string, ScreenRecord>(),
  byOverworld: new Map<number, ScreenRecord>(),
};

export { screenIndexMaps };
