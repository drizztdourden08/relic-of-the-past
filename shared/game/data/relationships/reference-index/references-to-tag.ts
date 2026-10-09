/* @layer shared-game @kind logic */
import { all } from '../../registry';
import type { ReferenceHit } from '../reference-index.type';

const carriesTag = (tags: readonly string[] | undefined, id: string): boolean => tags?.includes(id) ?? false;

const referencesToTag = (id: string): ReferenceHit[] => {
  const hits: ReferenceHit[] = [];

  for (const screen of all('screen')) {
    if (carriesTag(screen.tags, id)) hits.push({ kind: 'screen', id: screen.id, field: 'tags' });
  }
  for (const connection of all('connection')) {
    if (carriesTag(connection.tags, id)) hits.push({ kind: 'connection', id: connection.id, field: 'tags' });
  }
  for (const check of all('check')) {
    if (carriesTag(check.tags, id)) hits.push({ kind: 'check', id: check.id, field: 'tags' });
  }

  return hits;
};

export { referencesToTag };
