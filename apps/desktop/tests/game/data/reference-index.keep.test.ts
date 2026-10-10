/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { referencesTo, all, ITEM_GROUP_IDS } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';
import { required } from '../../required';

const CHECK_NEEDING_THREE_PENDANTS = 'check-072';
const CHECK_NEEDING_A_BOTTLE = 'check-041';

describeDataset('referencesTo', () => {
  it('finds the check that uses a given item group', () => {
    const hits = referencesTo('item-group', ITEM_GROUP_IDS.Pendants);
    expect(hits).toContainEqual({ kind: 'check', id: CHECK_NEEDING_THREE_PENDANTS, field: 'requirements' });
  });

  it('finds a second, independent check that uses a different item group', () => {
    const hits = referencesTo('item-group', ITEM_GROUP_IDS.Bottles);
    expect(hits).toContainEqual({ kind: 'check', id: CHECK_NEEDING_A_BOTTLE, field: 'requirements' });
  });

  it('returns empty for an item group nothing currently references', () => {
    expect(referencesTo('item-group', ITEM_GROUP_IDS.Swords)).toEqual([]);
  });

  it('returns empty for an id that names no group at all', () => {
    expect(referencesTo('item-group', 'ig-999')).toEqual([]);
  });

  it('finds a tag reference on the real screen or connection that carries it', () => {
    const found = all('screen').find(screen => screen.tags.length > 0);
    expect(found).toBeDefined();
    const tagged = required(found, 'a tagged screen');
    const tagId = required(tagged.tags[0], 'the first screen tag');

    const hits = referencesTo('tag', tagId);
    expect(hits).toContainEqual({ kind: 'screen', id: tagged.id, field: 'tags' });
  });

  it('finds a tag reference on the real check that carries it (the content family)', () => {
    const found = all('check').find(check => (check.tags ?? []).length > 0);
    expect(found).toBeDefined();
    const tagged = required(found, 'a tagged check');
    const tagId = required(tagged.tags?.[0], 'the first check tag');

    const hits = referencesTo('tag', tagId);
    expect(hits).toContainEqual({ kind: 'check', id: tagged.id, field: 'tags' });
  });

  it('returns empty for a tag id nothing carries', () => {
    expect(referencesTo('tag', 'tag-999')).toEqual([]);
  });
});
