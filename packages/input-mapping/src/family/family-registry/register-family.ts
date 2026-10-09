/* @layer shared-input @kind logic */
import { familyMap } from './family-map';
import type { FamilyMetadata } from '../family.type';

const registerFamily = (metadata: FamilyMetadata): void => {
  for (const type of metadata.types) {
    familyMap.set(type, metadata);
  }
};

export { registerFamily };
