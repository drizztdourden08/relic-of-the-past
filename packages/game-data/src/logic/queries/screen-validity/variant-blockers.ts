/* @layer shared-game @kind logic */
import { MAX_PROGRESS_TIER } from '../progress-tier/progress-tier.constants';
import { NEEDS_AGREEING_TIER, NEEDS_REAL_TIER } from './screen-validity.constants';
import type { ScreenCandidate, TierRange } from './screen-validity.type';

const tierRangeOf = (tier: number | [number, number]): TierRange =>
  (typeof tier === 'number' ? [tier, tier] : [tier[0], tier[1]]);

const isRealTierRange = ([from, to]: TierRange): boolean =>
  Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to <= MAX_PROGRESS_TIER && from <= to;

const variantBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const { variant } = candidate;
  if (variant?.progressTier === undefined) return [];

  const range = tierRangeOf(variant.progressTier);
  if (!isRealTierRange(range)) return [NEEDS_REAL_TIER];
  if (variant.condition.type !== 'progress') return [];

  const [from, to] = range;
  const min = variant.condition.min ?? 0;
  const max = variant.condition.max ?? MAX_PROGRESS_TIER;
  return from === min && to === max ? [] : [NEEDS_AGREEING_TIER];
};

export { variantBlockers };
