/* @layer tests @kind test */
/**
 * `entityKindFromId` resolves an id's own kind from its prefix. `item-group`
 * and `enumeration` mint under a prefix that is NOT their own kind name
 * (`ig-NNN` and `enum-NNN` — see `KIND_ID_PREFIXES`), so this pins the
 * explicit prefix→kind lookup those two need, alongside a sanity check that
 * every kind whose prefix already equals its name keeps resolving correctly.
 */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { entityKindFromId, resolveRecordLabel } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';

describe('entityKindFromId', () => {
  it('resolves an item-group id (ig-NNN) to item-group', () => {
    expect(entityKindFromId('ig-000')).toBe('item-group');
  });

  it('resolves an enumeration id (enum-NNN) to enumeration', () => {
    expect(entityKindFromId('enum-000')).toBe('enumeration');
  });

  it('still resolves a plain item id to item, unambiguously', () => {
    expect(entityKindFromId('item-042')).toBe('item');
  });

  it('resolves every other real collection id to its own kind', () => {
    for (const kind of ['screen', 'connection', 'check', 'dungeon', 'area', 'location', 'actor', 'tag'] as const) {
      const [first] = all(kind);
      expect(entityKindFromId(first.id)).toBe(kind);
    }
  });

  it('resolves nothing for an id that names no known kind', () => {
    expect(entityKindFromId('not-a-known-kind-42')).toBeUndefined();
  });
});

describe('resolveRecordLabel', () => {
  it('labels an item-group id with the group\'s own label', () => {
    const [group] = all('item-group');
    expect(resolveRecordLabel(group.id)).toBe(group.label);
  });

  it('labels an enumeration id with the entry\'s own label', () => {
    const entry = all('enumeration').find(e => e.category === 'world' && e.value === 'light');
    expect(entry).toBeDefined();
    expect(resolveRecordLabel(entry!.id)).toBe(entry!.label);
  });

  it('falls back to the bare id for something that names no known kind', () => {
    expect(resolveRecordLabel('not-a-known-kind-42')).toBe('not-a-known-kind-42');
  });
});
