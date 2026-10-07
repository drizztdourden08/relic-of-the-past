/* @layer shared-game @kind logic */
/**
 * The catalog keys the tier ticks occupy, derived from the family table so a
 * tier added to the data brings its row with it. One key per tier, numbered
 * from one in climb order: a key names a POSITION on the ladder, never the
 * item it hands over, so renaming a tier can never orphan a stored snapshot.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import type { ProgressiveFamilyId } from './progressive.type';

const progressiveTierKeyOf = (family: ProgressiveFamilyId, index: number): string =>
  `progressive_tier_${family}_${index + 1}`;

/** Every tier key of one family, in climb order. */
const progressiveTierKeysOf = (family: ProgressiveFamilyId): readonly string[] => {
  const found = PROGRESSIVE_FAMILIES.find((entry) => entry.id === family);
  return (found?.tiers ?? []).map((_tier, index) => progressiveTierKeyOf(family, index));
};

const PROGRESSIVE_TIER_KEYS: readonly string[] =
  PROGRESSIVE_FAMILIES.flatMap((family) => progressiveTierKeysOf(family.id));

const PROGRESSIVE_TIER_KEY_SET: ReadonlySet<string> = new Set(PROGRESSIVE_TIER_KEYS);

const isProgressiveTierKey = (key: string): boolean => PROGRESSIVE_TIER_KEY_SET.has(key);

export {
  PROGRESSIVE_TIER_KEYS,
  PROGRESSIVE_TIER_KEY_SET,
  isProgressiveTierKey,
  progressiveTierKeyOf,
  progressiveTierKeysOf,
};
