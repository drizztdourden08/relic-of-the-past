/* @layer shared-game @kind logic */
import type { ReferenceHit } from '../reference-index.type';
import { scanReferences } from './scan-references';

const referencesToDungeon = (id: string): ReferenceHit[] => [
  ...scanReferences('check', 'dungeonId', check => check.dungeonId === id),
  ...scanReferences('item', 'dungeonId', item => item.dungeonId === id),
  ...scanReferences('connection', 'dungeonId', connection => connection.dungeonId === id),
];

export { referencesToDungeon };
