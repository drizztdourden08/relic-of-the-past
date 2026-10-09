/* @layer shared-game @kind logic */
import { labelOf } from '../../../data';
import { PROGRESS_TIER_CATEGORY } from './progress-tier.constants';

const progressTierLabel = (tier: number): string | undefined =>
  labelOf(PROGRESS_TIER_CATEGORY, String(tier));

export { progressTierLabel };
