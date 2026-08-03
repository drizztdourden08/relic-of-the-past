/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { getPath, setPath } from '../../apps/web/src/ui/design-system/data/schema/path';

// Every consumer reads a value by dot path, so getPath is on the hot path of
// filtering, sorting and rendering. Its one hard requirement is that it never
// throws, whatever shape the row turns out to be.

const ROW = {
  id: 'a',
  nested: { deep: { value: 7 } },
  items: [{ name: 'first' }, { name: 'second' }],
  zero: 0,
  nulled: null,
};

describe('getPath', () => {
  it('reads a top-level and a deeply nested value', () => {
    expect(getPath(ROW, 'id')).toBe('a');
    expect(getPath(ROW, 'nested.deep.value')).toBe(7);
  });

  it('indexes into an array with a numeric segment', () => {
    expect(getPath(ROW, 'items.0.name')).toBe('first');
    expect(getPath(ROW, 'items.1.name')).toBe('second');
    expect(getPath(ROW, 'items.length')).toBe(2);
  });

  it('returns undefined rather than throwing on a missing intermediate', () => {
    expect(getPath(ROW, 'nope.deeper.still')).toBeUndefined();
    expect(getPath(ROW, 'nested.missing.value')).toBeUndefined();
    expect(getPath(ROW, 'items.9.name')).toBeUndefined();
    expect(getPath(ROW, 'nulled.anything')).toBeUndefined();
    expect(getPath(ROW, 'id.length.nope')).toBeUndefined();
  });

  it('survives a nullish or primitive root', () => {
    expect(getPath(undefined, 'a.b')).toBeUndefined();
    expect(getPath(null, 'a')).toBeUndefined();
    expect(getPath(5, 'a')).toBeUndefined();
  });

  it('keeps falsy values distinct from absent ones', () => {
    expect(getPath(ROW, 'zero')).toBe(0);
    expect(getPath(ROW, 'nulled')).toBeNull();
    expect(getPath(ROW, 'absent')).toBeUndefined();
  });

  it('reads the whole object for an empty path', () => {
    expect(getPath(ROW, '')).toBe(ROW);
  });
});

describe('setPath', () => {
  it('round-trips a value at every depth', () => {
    for (const path of ['id', 'nested.deep.value', 'items.1.name']) {
      expect(getPath(setPath(ROW, path, 'x'), path)).toBe('x');
    }
  });

  it('leaves the input untouched', () => {
    const next = setPath(ROW, 'nested.deep.value', 99);
    expect(getPath(ROW, 'nested.deep.value')).toBe(7);
    expect(next).not.toBe(ROW);
    expect(next.nested).not.toBe(ROW.nested);
  });

  it('shares the branches it did not touch', () => {
    const next = setPath(ROW, 'id', 'b');
    expect(next.nested).toBe(ROW.nested);
    expect(next.items).toBe(ROW.items);
  });

  it('creates a missing intermediate rather than throwing', () => {
    const next = setPath(ROW, 'fresh.branch.leaf', 1);
    expect(getPath(next, 'fresh.branch.leaf')).toBe(1);
    expect(getPath(next, 'id')).toBe('a');
  });

  it('creates an array when the next segment is numeric, and an object otherwise', () => {
    const withArray = setPath({}, 'list.0.name', 'x');
    expect(Array.isArray(getPath(withArray, 'list'))).toBe(true);
    const withObject = setPath({}, 'map.key', 'x');
    expect(Array.isArray(getPath(withObject, 'map'))).toBe(false);
  });

  it('keeps an array an array when writing through it', () => {
    const next = setPath(ROW, 'items.0.name', 'changed');
    expect(Array.isArray(next.items)).toBe(true);
    expect(next.items).toHaveLength(2);
    expect(next.items[1].name).toBe('second');
  });

  it('replaces the root for an empty path', () => {
    expect(setPath(ROW, '', 'whole')).toBe('whole');
  });
});
