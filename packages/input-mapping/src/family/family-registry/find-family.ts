/* @layer shared-input @kind logic */
import { familyMap } from './family-map';
import { EMPTY_FAMILY } from './family-registry.constants';
import type { FamilyMetadata, SdlGamepadType } from '../family.type';

const findFamily = (sdlType: SdlGamepadType): FamilyMetadata => {
  return familyMap.get(sdlType) ?? familyMap.get('unknown') ?? EMPTY_FAMILY;
};

export { findFamily };
