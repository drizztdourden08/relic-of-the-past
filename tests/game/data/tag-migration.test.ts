/* @layer tests @kind test */
/**
 * What the migration from string tags to tag references has to keep true.
 *
 * Nothing here reads the old data — it is gone. What it checks instead is the
 * property the migration was FOR: every tag a record holds is a reference that
 * resolves, to a term the collection is allowed to carry, with no raw term left
 * behind and no id pointing at nothing. A value silently dropped or a key that
 * failed to map would land here as a dangling or malformed reference.
 */
import { describe, it, expect } from 'vitest';
import { all, CONNECTION_TAG_METADATA, tagById, tagKeysOf, TAG_METADATA } from '@shared/game/data';
import type { EntityKind } from '@shared/game/data';

const TAGGED: readonly EntityKind[] = ['screen', 'connection'];

const storedTags = (kind: EntityKind): readonly string[] =>
  (all(kind) as readonly { tags: readonly string[] }[]).flatMap(row => [...row.tags]);

describe('every migrated tag is a real reference', () => {
  for (const kind of TAGGED) {
    it(`${kind}: holds ids, never terms`, () => {
      const stored = storedTags(kind);
      expect(stored.length).toBeGreaterThan(0);
      for (const value of stored) expect(value, value).toMatch(/^tag-\d+$/);
    });

    it(`${kind}: every reference resolves to a record`, () => {
      const dangling = [...new Set(storedTags(kind))].filter(id => tagById(id) === undefined);
      expect(dangling).toEqual([]);
    });

    it(`${kind}: every term it uses is one this collection may carry`, () => {
      const wrongScope = [...new Set(storedTags(kind))]
        .map(id => tagById(id))
        .filter(tag => tag && !tag.appliesTo.includes(kind))
        .map(tag => tag?.name);
      expect(wrongScope).toEqual([]);
    });
  }
});

describe('nothing was lost on the way', () => {
  it('still uses the same set of terms the taxonomy defines', () => {
    const used = new Set<string>();
    for (const kind of TAGGED) for (const key of tagKeysOf(storedTags(kind))) used.add(key);
    const defined = new Set([
      ...TAG_METADATA.map(entry => entry.id),
      ...CONNECTION_TAG_METADATA.map(entry => entry.id),
    ]);
    const strays = [...used].filter(key => !defined.has(key));
    expect(strays).toEqual([]);
  });

  it('resolves as many terms as there are stored references', () => {
    for (const kind of TAGGED) {
      const stored = storedTags(kind);
      expect(tagKeysOf(stored), kind).toHaveLength(stored.length);
    }
  });

  it('leaves no record with a duplicated reference', () => {
    for (const kind of TAGGED) {
      for (const row of all(kind) as readonly { id: string; tags: readonly string[] }[]) {
        expect(new Set(row.tags).size, row.id).toBe(row.tags.length);
      }
    }
  });
});
