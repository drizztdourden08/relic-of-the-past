/* @layer shared-game @kind logic */
import { familyOfId } from '../family-of-id';
import { progressiveFamilyName } from './progressive-family-name';
import type { ProgressiveFamilyId } from '../progressive.type';

const progressiveFamilyNameOf = (id: ProgressiveFamilyId): string =>
  progressiveFamilyName(familyOfId(id));

export { progressiveFamilyNameOf };
