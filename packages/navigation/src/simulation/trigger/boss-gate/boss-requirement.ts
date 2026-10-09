/* @layer shared-game @kind logic */
import type { CheckId, Requirement } from '@rotp/game-data';
import { getCheck } from '@rotp/game-data';

const bossRequirement = (bossCheckId: CheckId): Requirement =>
  getCheck(bossCheckId).requirements ?? { allOf: [] };

export { bossRequirement };
