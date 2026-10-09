/* @layer shared-game @kind logic */
import type { ReferenceHit } from '../reference-index.type';
import { scanReferences } from './scan-references';

const referencesToLocation = (id: string): ReferenceHit[] =>
  scanReferences('screen', 'locationId', screen => screen.locationId === id);

export { referencesToLocation };
