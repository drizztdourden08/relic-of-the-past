/* @layer shared-game @kind logic */
import type { ProgressiveFamilyId } from '../progressive.type';

const progressiveModeKeyOf = (family: ProgressiveFamilyId): string => `progressive_mode_${family}`;

export { progressiveModeKeyOf };
