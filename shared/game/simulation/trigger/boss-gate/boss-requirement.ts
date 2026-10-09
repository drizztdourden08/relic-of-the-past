/* @layer shared-game @kind logic */
import type { CheckId, Requirement } from '../../../data';
import { getCheck } from '../../../data';

const bossRequirement = (bossCheckId: CheckId): Requirement =>
  getCheck(bossCheckId).requirements ?? { allOf: [] };

export { bossRequirement };
