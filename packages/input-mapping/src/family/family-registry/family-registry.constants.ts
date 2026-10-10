/* @layer shared-input @kind constants */
import { GAMECUBE_FAMILY } from '../gamecube-family';
import { GENERIC_FAMILY } from '../generic-family';
import { NINTENDO_FAMILY } from '../nintendo-family';
import { PLAYSTATION_FAMILY } from '../playstation-family';
import { XBOX_FAMILY } from '../xbox-family';
import type { FamilyMetadata } from '../family.type';

const EMPTY_FAMILY: FamilyMetadata = { types: [] };

const BUILT_IN_FAMILIES: readonly FamilyMetadata[] = [
  NINTENDO_FAMILY,
  XBOX_FAMILY,
  PLAYSTATION_FAMILY,
  GAMECUBE_FAMILY,
  GENERIC_FAMILY,
];

export { BUILT_IN_FAMILIES, EMPTY_FAMILY };
