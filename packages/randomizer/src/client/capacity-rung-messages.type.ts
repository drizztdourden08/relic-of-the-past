/* @layer bridge-wasm @kind types */
import type { CapacityFamilyId } from '../world/capacity';
import type { CapacityFixedLineArm } from '../capacity-fixed-lines/capacity-fixed-lines.type';

type RungMessageIdOf = (family: CapacityFamilyId) => readonly number[] | undefined;

interface CapacityLineMessages {
  rungMessageIdOf: RungMessageIdOf;
  fixedLineMessages: readonly CapacityFixedLineArm[];
}

export type { CapacityLineMessages, RungMessageIdOf };
