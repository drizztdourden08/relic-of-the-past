/* @layer shared-game @kind logic */
import { familyOfId } from '../family-of-id';
import { progressiveTierName } from './progressive-tier-name';
import type { ProgressiveFamilyId } from '../progressive.type';

const progressiveTierNameOf = (id: ProgressiveFamilyId, index: number): string =>
  progressiveTierName(familyOfId(id), index);

export { progressiveTierNameOf };
