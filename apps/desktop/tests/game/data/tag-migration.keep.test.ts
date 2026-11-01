/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { all, tagById } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';

const TAGGED: readonly EntityKind[] = ['screen', 'connection'];

const storedTags = (kind: EntityKind): readonly string[] =>
  (all(kind) as readonly { tags: readonly string[] }[]).flatMap(row => [...row.tags]);

describeDataset('every tag is a real reference', () => {
  for (const kind of TAGGED) {
    it(`${kind}: every term it uses is one this collection may carry`, { tags: ['standard'] }, () => {
      const wrongScope = [...new Set(storedTags(kind))]
        .map(id => tagById(id))
        .filter(tag => tag && !tag.appliesTo.includes(kind))
        .map(tag => tag?.name);
      expect(wrongScope).toEqual([]);
    });
  }

  it('leaves no record with a duplicated reference', { tags: ['standard'] }, () => {
    for (const kind of TAGGED) {
      for (const row of all(kind) as readonly { id: string; tags: readonly string[] }[]) {
        expect(new Set(row.tags).size, row.id).toBe(row.tags.length);
      }
    }
  });
});
