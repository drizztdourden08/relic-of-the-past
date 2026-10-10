/* @layer shared-game @kind logic */
import { presenceNamesItem, requirementNames } from '../requirement-leaves';
import type { ReferenceHit } from '../reference-index.type';
import { scanReferences } from './scan-references';

const referencesToItem = (id: string): ReferenceHit[] => [
  ...scanReferences('check', 'vanillaItemIds', check => check.vanillaItemIds.includes(id as never)),
  ...scanReferences('check', 'requirements', check => check.requirements !== undefined && requirementNames(check.requirements, 'itemId', id)),
  ...scanReferences('check', 'presence', check => check.presence !== undefined && presenceNamesItem(check.presence, id)),
  ...scanReferences('connection', 'requirements', c => c.requirements !== undefined && requirementNames(c.requirements, 'itemId', id)),
  ...scanReferences('actor', 'clearedBy', actor => actor.clearedBy !== undefined && requirementNames(actor.clearedBy, 'itemId', id)),
  ...scanReferences('dungeon', 'medallionGate', dungeon => dungeon.medallionGate === id),
  ...scanReferences('item', 'aliasOf', item => item.aliasOf === id),
  ...scanReferences('item-group', 'memberIds', group => group.memberIds.includes(id as never)),
];

export { referencesToItem };
