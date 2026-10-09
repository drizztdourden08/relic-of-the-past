/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { getComparator, getGroupKey } from '@drizztdourden08/tessera/data';
import type { FieldKind } from '@drizztdourden08/tessera/data';
import { describeDataset } from '../../dataset-guard';
import { testerFor } from './tester-for';

describeDataset('boolean kit', () => {
  const test = testerFor('boolean');

  it('matches strictly, so a row that recorded nothing is neither', () => {
    expect(test(true, 'isTrue')).toBe(true);
    expect(test(false, 'isTrue')).toBe(false);
    expect(test(false, 'isFalse')).toBe(true);
    expect(test(true, 'isFalse')).toBe(false);
    expect(test(undefined, 'isTrue')).toBe(false);
    expect(test(undefined, 'isFalse')).toBe(false);
  });

  it('orders false before true and buckets the way the cells read', () => {
    expect(getComparator('boolean')(false, true)).toBeLessThan(0);
    const groupKey = getGroupKey('boolean');
    expect(groupKey(true)).toBe('Yes');
    expect(groupKey(false)).toBe('No');
    expect(groupKey(undefined)).toBe('');
  });
});

describeDataset('enum kit', () => {
  const test = testerFor('enum');

  it('matches membership both ways round', () => {
    expect(test('north', 'anyOf', ['north', 'south'])).toBe(true);
    expect(test('east', 'anyOf', ['north', 'south'])).toBe(false);
    expect(test('east', 'noneOf', ['north', 'south'])).toBe(true);
    expect(test('north', 'noneOf', ['north', 'south'])).toBe(false);
  });

  it('accepts a bare value as a one-item selection', () => {
    expect(test('north', 'anyOf', 'north')).toBe(true);
  });

  it('hides nothing while the selection is still empty', () => {
    expect(test('north', 'anyOf', [])).toBe(true);
    expect(test('north', 'noneOf', [])).toBe(true);
    expect(test('north', 'anyOf', undefined)).toBe(true);
  });
});

describeDataset('id-ref kit', () => {
  const test = testerFor('idRef');

  it('matches exactly, because these are machine values, not prose', () => {
    expect(test('screen-183', 'eq', 'screen-183')).toBe(true);
    expect(test('screen-183', 'eq', ' screen-183 ')).toBe(true);
    expect(test('screen-183', 'eq', 'SCREEN-183')).toBe(false);
    expect(test('screen-183', 'neq', 'screen-184')).toBe(true);
  });

  it('answers existence and stays inert with no operand', () => {
    expect(test(undefined, 'isEmpty')).toBe(true);
    expect(test('screen-183', 'isEmpty')).toBe(false);
    expect(test('screen-183', 'isNotEmpty')).toBe(true);
    expect(test('screen-183', 'eq', '')).toBe(true);
  });

  it('sorts ids by their number, not by their digits as text', () => {
    const compare = getComparator('idRef');
    expect(compare('screen-9', 'screen-10')).toBeLessThan(0);
    const real = all('screen').slice(0, 40).map((row) => row.id);
    const sorted = [...real].sort(compare);
    expect(sorted).toHaveLength(real.length);
    expect(sorted[0].startsWith('screen-')).toBe(true);
  });
});

describeDataset('array kit', () => {
  const test = testerFor('array');

  it('reads a scalar element as membership and a nested one as text', () => {
    expect(test(['alpha', 'bravo'], 'containsValue', 'ALPHA')).toBe(true);
    expect(test(['alpha', 'bravo'], 'containsValue', 'alph')).toBe(false);
    expect(test([{ at: 'north' }], 'containsValue', 'north')).toBe(true);
  });

  it('counts length, and treats a non-list as empty', () => {
    expect(test([1, 2, 3], 'lengthEq', 3)).toBe(true);
    expect(test([1, 2, 3], 'lengthGt', 2)).toBe(true);
    expect(test([1, 2, 3], 'lengthLt', 4)).toBe(true);
    expect(test([], 'isEmpty')).toBe(true);
    expect(test(undefined, 'isEmpty')).toBe(true);
    expect(test([1], 'isNotEmpty')).toBe(true);
  });

  it('stays inert until an operand is entered', () => {
    expect(test([1, 2], 'lengthEq', null)).toBe(true);
    expect(test([1, 2], 'containsValue', '')).toBe(true);
  });

  it('sorts and buckets by length', () => {
    const compare = getComparator('array');
    expect(compare([1], [1, 2])).toBeLessThan(0);
    const groupKey = getGroupKey('array');
    expect(groupKey([])).toBe('none');
    expect(groupKey([1])).toBe('1 item');
    expect(groupKey([1, 2])).toBe('2 items');
  });
});

describeDataset('object, union and unknown kits', () => {
  const nested: readonly FieldKind[] = ['object', 'union', 'unknown'];

  it('answers existence, counting a keyless object as empty', () => {
    for (const kind of nested) {
      const test = testerFor(kind);
      expect(test({ a: 1 }, 'isEmpty'), kind).toBe(false);
      expect(test({ a: 1 }, 'isNotEmpty'), kind).toBe(true);
      expect(test({}, 'isEmpty'), kind).toBe(true);
      expect(test(undefined, 'isEmpty'), kind).toBe(true);
    }
  });

  it('groups identical nested values together instead of into one bucket', () => {
    for (const kind of nested) {
      const groupKey = getGroupKey(kind);
      expect(groupKey({ at: 'north' }), kind).toBe(groupKey({ at: 'north' }));
      expect(groupKey({ at: 'north' }), kind).not.toBe(groupKey({ at: 'south' }));
      expect(groupKey(undefined), kind).toBe('');
      expect(getComparator(kind)({ at: 'a' }, { at: 'b' }), kind).toBeLessThan(0);
    }
  });

  it('survives a self-referencing value instead of throwing', () => {
    const cyclic: Record<string, unknown> = { name: 'loop' };
    cyclic.self = cyclic;
    expect(() => getGroupKey('unknown')(cyclic)).not.toThrow();
  });
});
