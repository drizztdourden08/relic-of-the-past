/* @layer shared-game @kind logic */
import type { ReferenceHit } from '../reference-index.type';
import { scanReferences } from './scan-references';

const referencesToArea = (id: string): ReferenceHit[] => [
  ...scanReferences('screen', 'areaId', screen => screen.areaId === id),
  ...scanReferences('location', 'areaId', location => location.areaId === id),
];

export { referencesToArea };
