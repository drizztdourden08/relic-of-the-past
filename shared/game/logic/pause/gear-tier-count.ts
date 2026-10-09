/* @layer shared-game @kind logic */
import type { GearLadderKind } from './pause.type';
import { TIER_RECORDS } from './gear-tiers.constants';

const gearTierCount = (kind: GearLadderKind): number => TIER_RECORDS[kind].length;

export { gearTierCount };
