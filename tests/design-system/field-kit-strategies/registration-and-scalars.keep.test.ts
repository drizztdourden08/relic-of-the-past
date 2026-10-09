/* @layer tests @kind test */
import { it, expect } from 'vitest';
import { getFieldTester } from '../../../apps/web/src/ui/design-system/data/filter/tester-registry';
import { operatorsFor } from '../../../apps/web/src/ui/design-system/data/filter/operators';
import { getComparator } from '../../../apps/web/src/ui/design-system/data/table/strategy-registry';
import { registeredKitKinds, resolveFieldKit } from '../../../apps/web/src/ui/design-system/composites/field-kits';
import type { FieldKind } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../../dataset-guard';
import { testerFor } from './tester-for';

const KINDS: readonly FieldKind[] = [
  'string', 'number', 'boolean', 'enum', 'idRef', 'array', 'object', 'union', 'unknown',
];

describeDataset('field kit registration', () => {
  it('registers a tester AND a kit for every kind, with no orphans either way', () => {
    for (const kind of KINDS) {
      expect(getFieldTester(kind), `tester for ${kind}`).toBeDefined();
      expect(resolveFieldKit(kind), `kit for ${kind}`).toBeDefined();
    }
    expect([...registeredKitKinds()].sort()).toEqual([...KINDS].sort());
  });

  it('answers every operator its kind offers', () => {
    for (const kind of KINDS) {
      const test = testerFor(kind);
      for (const spec of operatorsFor(kind)) {
        expect(typeof test('x', spec.id, 1), `${kind}.${spec.id}`).toBe('boolean');
      }
    }
  });
});

describeDataset('string kit', () => {
  const test = testerFor('string');

  it('matches text case-insensitively, in every text operator', () => {
    expect(test('Upper Ledge', 'contains', 'ledge')).toBe(true);
    expect(test('Upper Ledge', 'startsWith', 'UPP')).toBe(true);
    expect(test('Upper Ledge', 'endsWith', 'Ledge')).toBe(true);
    expect(test('Upper Ledge', 'eq', 'upper ledge')).toBe(true);
    expect(test('Upper Ledge', 'neq', 'upper ledge')).toBe(false);
    expect(test('Upper Ledge', 'contains', 'bridge')).toBe(false);
  });

  it('reads absent, blank and whitespace-only as empty', () => {
    expect(test(undefined, 'isEmpty')).toBe(true);
    expect(test('', 'isEmpty')).toBe(true);
    expect(test('   ', 'isEmpty')).toBe(true);
    expect(test('a', 'isEmpty')).toBe(false);
    expect(test('a', 'isNotEmpty')).toBe(true);
  });

  it('sorts naturally: case-insensitive, digit runs as numbers, absent last', () => {
    const compare = getComparator('string');
    expect(compare('apple', 'Banana')).toBeLessThan(0);
    expect(compare('room 9', 'room 10')).toBeLessThan(0);
    expect(compare(undefined, 'a')).toBeGreaterThan(0);
    expect(compare('a', null)).toBeLessThan(0);
  });
});

describeDataset('number kit', () => {
  const test = testerFor('number');

  it('compares numerically, including numeric strings', () => {
    expect(test(5, 'eq', 5)).toBe(true);
    expect(test(5, 'neq', 4)).toBe(true);
    expect(test(5, 'gt', 4)).toBe(true);
    expect(test(5, 'gte', 5)).toBe(true);
    expect(test(5, 'lt', 6)).toBe(true);
    expect(test(5, 'lte', 5)).toBe(true);
    expect(test('5', 'gt', '4')).toBe(true);
  });

  it('treats between as inclusive, tolerates swapped ends and an open end', () => {
    expect(test(5, 'between', [1, 10])).toBe(true);
    expect(test(1, 'between', [1, 10])).toBe(true);
    expect(test(10, 'between', [1, 10])).toBe(true);
    expect(test(11, 'between', [1, 10])).toBe(false);
    expect(test(5, 'between', [10, 1])).toBe(true);
    expect(test(500, 'between', [null, null])).toBe(true);
    expect(test(500, 'between', [100, null])).toBe(true);
    expect(test(50, 'between', [100, null])).toBe(false);
  });

  it('stays inert until an operand is entered', () => {
    expect(test(5, 'gt', null)).toBe(true);
    expect(test(5, 'eq', '')).toBe(true);
  });

  it('lets only "is not" match a row that holds no number', () => {
    expect(test(undefined, 'neq', 5)).toBe(true);
    expect(test(undefined, 'eq', 5)).toBe(false);
    expect(test(undefined, 'gt', 5)).toBe(false);
    expect(test('n/a', 'lt', 5)).toBe(false);
  });

  it('sorts numerically, not as text, which is why the kit registers one', () => {
    const compare = getComparator('number');
    expect(compare(9, 10)).toBeLessThan(0);
    expect(compare(10, 9)).toBeGreaterThan(0);
    expect([10, 9, 100, 1].sort(compare)).toEqual([1, 9, 10, 100]);
    expect(compare(null, 1)).toBeGreaterThan(0);
  });
});
