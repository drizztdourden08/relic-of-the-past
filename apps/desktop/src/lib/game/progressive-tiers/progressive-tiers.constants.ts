/* @layer bridge-wasm @kind constants */
import type { ProgressiveFamilyId } from '@shared/randomizer/world/progressive/progressive.type';

const CORE_FAMILY_INDEX: Readonly<Record<ProgressiveFamilyId, number>> = {
  sword: 0, shield: 1, glove: 2, mail: 3, bow: 4, ocarina: 5,
};

export { CORE_FAMILY_INDEX };
