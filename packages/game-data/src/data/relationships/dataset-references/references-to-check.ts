/* @layer shared-game @kind logic */
import type { EntityOf } from '../../types';
import { requirementNames } from '../requirement-leaves';
import type { ReferenceHit } from '../reference-index.type';
import { scanReferences } from './scan-references';

const variantNamesCheck = (variant: EntityOf<'screen'>['variant'], id: string): boolean =>
  variant?.condition.type === 'check' && variant.condition.id === id;

const referencesToCheck = (id: string): ReferenceHit[] => [
  ...scanReferences('dungeon', 'bossCheckId', dungeon => dungeon.bossCheckId === id),
  ...scanReferences('dungeon', 'prizeCheckId', dungeon => dungeon.prizeCheckId === id),
  ...scanReferences('check', 'requirements', check => check.requirements !== undefined && requirementNames(check.requirements, 'checkId', id)),
  ...scanReferences('connection', 'requirements', c => c.requirements !== undefined && requirementNames(c.requirements, 'checkId', id)),
  ...scanReferences('actor', 'clearedBy', actor => actor.clearedBy !== undefined && requirementNames(actor.clearedBy, 'checkId', id)),
  ...scanReferences('screen', 'variant', screen => variantNamesCheck(screen.variant, id)),
];

export { referencesToCheck };
