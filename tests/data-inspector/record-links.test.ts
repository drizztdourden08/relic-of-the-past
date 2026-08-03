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
import {
  defaultIdRefDisplay, entityKindFromId, resolveRecordLabel,
} from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/record-links';

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

describe('defaultIdRefDisplay — the baseline name for a column with no displayField', () => {
  it('resolves a hinted kind straight off its own getter', () => {
    const [screen] = all('screen');
    expect(defaultIdRefDisplay(screen.id, 'screen')).toBe(screen.vanillaName ?? screen.randomizerName);
  });

  it('infers the kind from the id\'s own prefix when no hint is given', () => {
    const [item] = all('item');
    expect(defaultIdRefDisplay(item.id)).toBe(item.vanillaName ?? item.randomizerName);
  });

  it('ignores a hint that names nothing and falls back to the id\'s own prefix', () => {
    const [dungeon] = all('dungeon');
    expect(defaultIdRefDisplay(dungeon.id, 'nowhere')).toBe(dungeon.randomizerName);
  });

  /**
   * The Recommendations table's `targetId` column points at a different
   * collection per row (a `screen` finding, a `connection` finding, an
   * `actor` finding, …), so it carries no single `targetKind` at all. Each
   * id still has to resolve correctly on its own — this is the exact case a
   * MIXED column's per-row fallback exists for.
   */
  it('resolves each id by its OWN kind with no hint, for a column mixing several kinds', () => {
    const [screen] = all('screen');
    const [connection] = all('connection');
    const [actor] = all('actor');
    expect(defaultIdRefDisplay(screen.id)).toBe(screen.vanillaName ?? screen.randomizerName);
    expect(defaultIdRefDisplay(connection.id)).toBe(connection.name);
    expect(defaultIdRefDisplay(actor.id)).toBe(actor.randomizerName);
  });

  it('resolves an item-group id by its own label, same as resolveRecordLabel', () => {
    const [group] = all('item-group');
    expect(defaultIdRefDisplay(group.id)).toBe(group.label);
  });

  it('answers undefined — not the id — for something that names no known kind', () => {
    expect(defaultIdRefDisplay('not-a-known-kind-42')).toBeUndefined();
  });
});
