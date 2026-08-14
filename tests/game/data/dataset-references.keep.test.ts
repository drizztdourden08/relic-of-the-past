/* @layer tests @kind test */
/**
 * The delete-guard's reverse index for the six record-facade collections.
 *
 * Every case is picked off the LIVE dataset rather than hardcoded, so a
 * renumbering or a re-file cannot quietly turn an assertion into a tautology:
 * the test finds a record that really carries the reference, then demands the
 * index report exactly that record and that field. What is being pinned is that
 * a delete of any of these six cannot be shown as unreferenced while something
 * still points at it — which is the whole reason the guard exists.
 */
import { describe, expect, it } from 'vitest';
import { all } from '@shared/game/data';
import { REFERENCE_TARGETS, referencesTo } from '@shared/game/data/relationships/reference-index';
import { describeDataset } from '../../dataset-guard';

describeDataset('the kinds the index answers for', () => {
  it('covers every collection with a delete path', () => {
    expect([...REFERENCE_TARGETS].sort()).toEqual(
      ['actor', 'area', 'check', 'dungeon', 'item', 'item-group', 'location', 'tag'],
    );
  });
});

describeDataset('a dungeon', () => {
  it('is reported as referenced by the checks that name it', () => {
    const check = all('check').find(entry => entry.dungeonId);
    expect(check).toBeDefined();
    expect(referencesTo('dungeon', check!.dungeonId as string))
      .toContainEqual({ kind: 'check', id: check!.id, field: 'dungeonId' });
  });

  it('is reported as referenced by the items filed under it', () => {
    const item = all('item').find(entry => entry.dungeonId);
    expect(item).toBeDefined();
    expect(referencesTo('dungeon', item!.dungeonId as string))
      .toContainEqual({ kind: 'item', id: item!.id, field: 'dungeonId' });
  });

  it('comes back clean for an id no record names', () => {
    expect(referencesTo('dungeon', 'dungeon-999')).toEqual([]);
  });
});

describeDataset('an area and a location', () => {
  it('reports the screens sitting in an area', () => {
    const screen = all('screen')[0];
    expect(referencesTo('area', screen.areaId))
      .toContainEqual({ kind: 'screen', id: screen.id, field: 'areaId' });
  });

  it('reports the locations filed under an area', () => {
    const location = all('location')[0];
    expect(referencesTo('area', location.areaId))
      .toContainEqual({ kind: 'location', id: location.id, field: 'areaId' });
  });

  it('reports the screens sitting at a location', () => {
    const screen = all('screen')[0];
    expect(referencesTo('location', screen.locationId))
      .toContainEqual({ kind: 'screen', id: screen.id, field: 'locationId' });
  });
});

describeDataset('an actor', () => {
  it('is reported as referenced by the check it grants', () => {
    const check = all('check').find(entry => entry.actorId);
    expect(check).toBeDefined();
    expect(referencesTo('actor', check!.actorId as string))
      .toContainEqual({ kind: 'check', id: check!.id, field: 'actorId' });
  });

  it('is reported as referenced by the crossing it gates', () => {
    const connection = all('connection').find(entry => entry.gatedBy);
    expect(connection).toBeDefined();
    expect(referencesTo('actor', connection!.gatedBy as string))
      .toContainEqual({ kind: 'connection', id: connection!.id, field: 'gatedBy' });
  });

  it('is reported as referenced by a screen that lists it as a trigger', () => {
    const screen = all('screen').find(entry => (entry.triggerIds ?? []).length > 0);
    expect(screen).toBeDefined();
    expect(referencesTo('actor', screen!.triggerIds![0]))
      .toContainEqual({ kind: 'screen', id: screen!.id, field: 'triggerIds' });
  });
});

describeDataset('an item', () => {
  it('is reported as referenced by the check that vanilla holds it', () => {
    const check = all('check').find(entry => entry.vanillaItemIds.length > 0);
    expect(check).toBeDefined();
    expect(referencesTo('item', check!.vanillaItemIds[0]))
      .toContainEqual({ kind: 'check', id: check!.id, field: 'vanillaItemIds' });
  });

  it('is reported as referenced by the group it belongs to', () => {
    const group = all('item-group').find(entry => entry.memberIds.length > 0);
    expect(group).toBeDefined();
    expect(referencesTo('item', group!.memberIds[0]))
      .toContainEqual({ kind: 'item-group', id: group!.id, field: 'memberIds' });
  });

  it('is reported as referenced from inside a requirement tree', () => {
    const named = all('item').map(item => item.id)
      .find(id => referencesTo('item', id).some(hit => hit.field === 'requirements'));
    expect(named, 'no item is named by any requirement').toBeDefined();
  });

  it('is reported as referenced by the dungeon it unlocks', () => {
    const dungeon = all('dungeon').find(entry => entry.medallionGate);
    expect(dungeon).toBeDefined();
    expect(referencesTo('item', dungeon!.medallionGate as string))
      .toContainEqual({ kind: 'dungeon', id: dungeon!.id, field: 'medallionGate' });
  });
});

describeDataset('a check', () => {
  it('is reported as referenced by the dungeon that names it as its boss', () => {
    const dungeon = all('dungeon').find(entry => entry.bossCheckId);
    expect(dungeon).toBeDefined();
    expect(referencesTo('check', dungeon!.bossCheckId as string))
      .toContainEqual({ kind: 'dungeon', id: dungeon!.id, field: 'bossCheckId' });
  });

  it('comes back clean for an id no record names', () => {
    expect(referencesTo('check', 'check-9999')).toEqual([]);
  });
});
