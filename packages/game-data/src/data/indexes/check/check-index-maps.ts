/* @layer shared-game @kind logic */
import type { CheckRecord } from '../../types';

const checkIndexMaps = {
  byChest: new Map<string, CheckRecord>(),
  byBuffer: new Map<string, CheckRecord[]>(),
  byRoomMask: new Map<string, CheckRecord[]>(),
  byOwScreen: new Map<string, CheckRecord[]>(),
  bySpriteType: new Map<number, CheckRecord[]>(),
  byEventThreshold: new Map<string, CheckRecord>(),
};

export { checkIndexMaps };
