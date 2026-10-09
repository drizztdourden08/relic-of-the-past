/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.data';
import { progressiveTierKeyOf } from './progressive-tier-key-of';
import type { ProgressiveFamilyId } from '../progressive.type';

const progressiveTierKeysOf = (family: ProgressiveFamilyId): readonly string[] => {
  const found = PROGRESSIVE_FAMILIES.find((entry) => entry.id === family);
  return (found?.tiers ?? []).map((_tier, index) => progressiveTierKeyOf(family, index));
};

export { progressiveTierKeysOf };
