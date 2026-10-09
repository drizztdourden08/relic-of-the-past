/* @layer shared-input @kind logic */
import { BUILT_IN_FAMILIES } from './family-registry.constants';
import type { FamilyMetadata, SdlGamepadType } from '../family.type';

const familyMap = new Map<SdlGamepadType, FamilyMetadata>(
  BUILT_IN_FAMILIES.flatMap(family => family.types.map(type => [type, family] as const)),
);

export { familyMap };
