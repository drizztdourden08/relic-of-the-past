/* @layer shared-game @kind logic */
import type { ProgressiveFamilyId } from '../../progressive/progressive.type';

const difficultyCopiesKeyOf = (family: ProgressiveFamilyId): string => `difficulty_copies_${family}`;

export { difficultyCopiesKeyOf };
