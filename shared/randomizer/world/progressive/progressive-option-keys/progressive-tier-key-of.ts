/* @layer shared-game @kind logic */
import type { ProgressiveFamilyId } from '../progressive.type';

const progressiveTierKeyOf = (family: ProgressiveFamilyId, index: number): string =>
  `progressive_tier_${family}_${index + 1}`;

export { progressiveTierKeyOf };
