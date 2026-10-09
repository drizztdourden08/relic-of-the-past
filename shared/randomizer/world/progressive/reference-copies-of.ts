/* @layer shared-game @kind logic */
import type { ProgressiveFamilyDef } from './progressive.type';

const referenceCopiesOf = (family: ProgressiveFamilyDef): number => family.referenceCopies ?? family.tiers.length;

export { referenceCopiesOf };
