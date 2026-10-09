/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from './progressive-families.constants';
import type { ProgressiveFamilyDef, ProgressiveFamilyId } from './progressive.type';

const familyOfId = (id: ProgressiveFamilyId): ProgressiveFamilyDef => {
  const found = PROGRESSIVE_FAMILIES.find((family) => family.id === id);
  if (found === undefined) throw new Error(`no progressive family: ${id}`);
  return found;
};

export { familyOfId };
