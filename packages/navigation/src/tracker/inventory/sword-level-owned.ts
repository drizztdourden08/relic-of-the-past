/* @layer bridge-wasm @kind logic */
import { SWORD_AT_THE_SMITHS, SWORD_KEPT, SWORD_KEPT_UNRECORDED } from './inventory.constants';
import type { RawInventoryState } from './inventory.type';

const swordLevelOwned = (raw: RawInventoryState): number => {
  if (raw.sword !== SWORD_AT_THE_SMITHS) return raw.sword;
  return raw.swordAtSmiths & SWORD_KEPT ? raw.swordAtSmiths & ~SWORD_KEPT : SWORD_KEPT_UNRECORDED;
};

export { swordLevelOwned };
