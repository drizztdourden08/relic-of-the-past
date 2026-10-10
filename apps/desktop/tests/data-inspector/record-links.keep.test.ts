/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { all } from '@rotp/game-data';
import {
  defaultIdRefDisplay, entityKindFromId, resolveRecordLabel,
} from '@app/views/DataInspector/behavior/record-links';
import { describeDataset } from '../dataset-guard';
import { required } from '../required';

describeDataset('entityKindFromId', () => {
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
      const first = required(all(kind)[0], `the first ${kind}`);
      expect(entityKindFromId(first.id)).toBe(kind);
    }
  });

  it('resolves nothing for an id that names no known kind', () => {
    expect(entityKindFromId('not-a-known-kind-42')).toBeUndefined();
  });
});

describeDataset('resolveRecordLabel', () => {
  it('labels an item-group id with the group\'s own label', () => {
    const group = required(all('item-group')[0], 'the first item group');
    expect(resolveRecordLabel(group.id)).toBe(group.label);
  });

  it('labels an enumeration id with the entry\'s own label', () => {
    const entry = all('enumeration').find(e => e.category === 'world' && e.value === 'light');
    expect(entry).toBeDefined();
    const light = required(entry, 'the light world entry');
    expect(resolveRecordLabel(light.id)).toBe(light.label);
  });

  it('falls back to the bare id for something that names no known kind', () => {
    expect(resolveRecordLabel('not-a-known-kind-42')).toBe('not-a-known-kind-42');
  });
});

describeDataset('defaultIdRefDisplay names a column that has no displayField', () => {
  it('resolves a hinted kind straight off its own getter', () => {
    const screen = required(all('screen')[0], 'the first screen');
    expect(defaultIdRefDisplay(screen.id, 'screen')).toBe(screen.name);
  });

  it('infers the kind from the id\'s own prefix when no hint is given', () => {
    const item = required(all('item')[0], 'the first item');
    expect(defaultIdRefDisplay(item.id)).toBe(item.name);
  });

  it('ignores a hint that names nothing and falls back to the id\'s own prefix', () => {
    const dungeon = required(all('dungeon')[0], 'the first dungeon');
    expect(defaultIdRefDisplay(dungeon.id, 'nowhere')).toBe(dungeon.name);
  });

  it('resolves each id by its OWN kind with no hint, for a column mixing several kinds', () => {
    const screen = required(all('screen')[0], 'the first screen');
    const connection = required(all('connection')[0], 'the first connection');
    const actor = required(all('actor')[0], 'the first actor');
    expect(defaultIdRefDisplay(screen.id)).toBe(screen.name);
    expect(defaultIdRefDisplay(connection.id)).toBe(connection.name);
    expect(defaultIdRefDisplay(actor.id)).toBe(actor.name);
  });

  it('resolves an item-group id by its own label, same as resolveRecordLabel', () => {
    const group = required(all('item-group')[0], 'the first item group');
    expect(defaultIdRefDisplay(group.id)).toBe(group.label);
  });

  it('answers undefined for something that names no known kind, never the id', () => {
    expect(defaultIdRefDisplay('not-a-known-kind-42')).toBeUndefined();
  });
});
