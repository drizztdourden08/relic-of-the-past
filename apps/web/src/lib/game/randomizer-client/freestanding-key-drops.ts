/* @layer bridge-wasm @kind logic */
/**
 * Freestanding placed keys that physically cross the DROP absorption seam.
 * A key standing in a room is the same absorbable sprite as a released key
 * drop, and the one absorption handler every free-standing pickup crosses is
 * already intercepted by the drop-override table (keyed room + size). This
 * table certifies, per check, that its room holds exactly one such placed
 * key (decomp-audited), so a (room, small) drop entry substitutes it safely.
 */

import { getCheck } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';

interface FreestandingKeyDrop {
  roomId: number;
  big: boolean;
}

/** The certified freestanding placed keys: the mountain tower's caged key. */
const FREESTANDING_KEY_BY_CHECK: ReadonlyMap<string, FreestandingKeyDrop> = new Map([
  ['check-135', { roomId: 135, big: false }],
]);

/** The drop-table key for one freestanding placed key, or null. */
const freestandingKeyDropOf = (checkId: CheckId): FreestandingKeyDrop | null => {
  const target = FREESTANDING_KEY_BY_CHECK.get(checkId);
  if (target === undefined) return null;
  getCheck(checkId); // throws on an unknown id — the table stays honest with the dataset
  return target;
};

export { freestandingKeyDropOf };
export type { FreestandingKeyDrop };
