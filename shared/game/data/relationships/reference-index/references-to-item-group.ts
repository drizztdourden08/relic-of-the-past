/* @layer shared-game @kind logic */
import { all } from '../../registry';
import type { ReferenceHit } from '../reference-index.type';
import { requirementUsesGroup } from './requirement-uses-group';

const referencesToItemGroup = (id: string): ReferenceHit[] => {
  const hits: ReferenceHit[] = [];

  for (const check of all('check')) {
    if (check.requirements && requirementUsesGroup(check.requirements, id)) {
      hits.push({ kind: 'check', id: check.id, field: 'requirements' });
    }
  }
  for (const connection of all('connection')) {
    if (connection.requirements && requirementUsesGroup(connection.requirements, id)) {
      hits.push({ kind: 'connection', id: connection.id, field: 'requirements' });
    }
  }
  for (const actor of all('actor')) {
    if (actor.clearedBy && requirementUsesGroup(actor.clearedBy, id)) {
      hits.push({ kind: 'actor', id: actor.id, field: 'clearedBy' });
    }
  }

  return hits;
};

export { referencesToItemGroup };
