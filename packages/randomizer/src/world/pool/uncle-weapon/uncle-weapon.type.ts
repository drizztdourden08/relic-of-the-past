/* @layer shared-game @kind types */
import type { ItemKey } from '../../item-ids';

interface CandidateScan {
  candidates: ItemKey[];
  foundSword: boolean;
  foundBow: boolean;
}

export type { CandidateScan };
