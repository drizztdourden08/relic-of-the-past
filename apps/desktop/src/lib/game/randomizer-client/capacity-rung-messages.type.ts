/* @layer bridge-wasm @kind types */
import type { CapacityFamilyId } from '@shared/randomizer/world/capacity';
import type { CapacityFixedLineArm } from '../capacity-fixed-lines';

type RungMessageIdOf = (family: CapacityFamilyId) => readonly number[] | undefined;

interface CapacityLineMessages {
  rungMessageIdOf: RungMessageIdOf;
  fixedLineMessages: readonly CapacityFixedLineArm[];
}

export type { CapacityLineMessages, RungMessageIdOf };
