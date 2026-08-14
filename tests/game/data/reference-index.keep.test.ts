/* @layer tests @kind test */
/**
 * `referencesTo` is new logic with no prior coverage — it backs a later
 * delete-guard UI ("what still points at this tag/item group before you
 * remove it"), so this pins that it actually finds a real reference and
 * actually returns empty for a group nothing points at.
 */
import { describe, it, expect } from 'vitest';
import { referencesTo } from '../../../shared/game/data/relationships/reference-index';
import { all, ITEM_GROUP_IDS } from '@shared/game/data';
import { describeDataset } from '../../dataset-guard';

describeDataset('referencesTo', () => {
  it('finds the check that uses a given item group', () => {
    // check-072 requires { count: { groupId: Pendants, n: 3 } } in its own data.
    const hits = referencesTo('item-group', ITEM_GROUP_IDS.Pendants);
    expect(hits).toContainEqual({ kind: 'check', id: 'check-072', field: 'requirements' });
  });

  it('finds a second, independent check that uses a different item group', () => {
    // check-041 requires { count: { groupId: Bottles, n: 1 } } in its own data.
    const hits = referencesTo('item-group', ITEM_GROUP_IDS.Bottles);
    expect(hits).toContainEqual({ kind: 'check', id: 'check-041', field: 'requirements' });
  });

  it('returns empty for an item group nothing currently references', () => {
    // Swords is a real, seeded group, but no CheckRecord/ConnectionRecord/ActorRecord
    // bakes a { count: { groupId: Swords } } leaf into its static requirements today.
    expect(referencesTo('item-group', ITEM_GROUP_IDS.Swords)).toEqual([]);
  });

  it('returns empty for an id that names no group at all', () => {
    expect(referencesTo('item-group', 'ig-999')).toEqual([]);
  });

  it('finds a tag reference on the real screen or connection that carries it', () => {
    // Picks a real tag off the live dataset rather than hardcoding an id, so
    // the assertion holds regardless of how the seed data is renumbered.
    const tagged = all('screen').find(screen => screen.tags.length > 0);
    expect(tagged).toBeDefined();
    const tagId = tagged!.tags[0];

    const hits = referencesTo('tag', tagId);
    expect(hits).toContainEqual({ kind: 'screen', id: tagged!.id, field: 'tags' });
  });

  it('finds a tag reference on the real check that carries it (the content family)', () => {
    const tagged = all('check').find(check => (check.tags ?? []).length > 0);
    expect(tagged).toBeDefined();
    const tagId = tagged!.tags![0];

    const hits = referencesTo('tag', tagId);
    expect(hits).toContainEqual({ kind: 'check', id: tagged!.id, field: 'tags' });
  });

  it('returns empty for a tag id nothing carries', () => {
    expect(referencesTo('tag', 'tag-999')).toEqual([]);
  });
});
