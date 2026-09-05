/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildSchema } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { compile, createClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import { getFieldTester } from '../../apps/web/src/ui/design-system/data/filter/tester-registry';
import { capture, restore } from '../../apps/web/src/ui/design-system/data/view-state/snapshot';
import {
  MATCH_CASE_KEY, operatorMenuItems, supportsCaseModifier,
} from '../../apps/web/src/ui/design-system/composites/FilterBar/behavior/operator-menu-items';
import '../../apps/web/src/ui/design-system/composites/field-kits';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { MenuItem } from '../../apps/web/src/ui/design-system/composites/DropdownMenu';
import type { FieldKind } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// The real string tester is registered by importing the field-kit barrel
// above, so these go through the same registry the app does.

const stringTest = (value: unknown, op: string, operand: unknown, caseSensitive?: boolean): boolean => {
  const tester = getFieldTester('string');
  if (!tester) throw new Error('no string tester registered');
  return tester.test(value, op, operand, { caseSensitive });
};

describe('string matching leaves the case modifier off by default', () => {
  it('folds case in every text operator when the flag is absent', () => {
    expect(stringTest('Upper Ledge', 'contains', 'ledge')).toBe(true);
    expect(stringTest('Upper Ledge', 'startsWith', 'upp')).toBe(true);
    expect(stringTest('Upper Ledge', 'endsWith', 'LEDGE')).toBe(true);
    expect(stringTest('Upper Ledge', 'eq', 'upper ledge')).toBe(true);
    expect(stringTest('Upper Ledge', 'neq', 'upper ledge')).toBe(false);
  });

  it('folds case just the same when the flag is explicitly off', () => {
    expect(stringTest('Upper Ledge', 'contains', 'LEDGE', false)).toBe(true);
    expect(stringTest('Upper Ledge', 'eq', 'upper ledge', false)).toBe(true);
  });

  it('stops folding in every text operator when the flag is on', () => {
    expect(stringTest('Upper Ledge', 'contains', 'ledge', true)).toBe(false);
    expect(stringTest('Upper Ledge', 'startsWith', 'upp', true)).toBe(false);
    expect(stringTest('Upper Ledge', 'endsWith', 'LEDGE', true)).toBe(false);
    expect(stringTest('Upper Ledge', 'eq', 'upper ledge', true)).toBe(false);
    expect(stringTest('Upper Ledge', 'neq', 'upper ledge', true)).toBe(true);
  });

  it('still matches an exactly-cased operand with the flag on', () => {
    expect(stringTest('Upper Ledge', 'contains', 'Ledge', true)).toBe(true);
    expect(stringTest('Upper Ledge', 'eq', 'Upper Ledge', true)).toBe(true);
  });

  it('leaves the emptiness operators alone, because they never looked at case', () => {
    expect(stringTest('   ', 'isEmpty', null, true)).toBe(true);
    expect(stringTest('A', 'isNotEmpty', null, true)).toBe(true);
  });
});

describe('the flag threads from the clause down to the match', () => {
  const ROWS = [
    { id: 'row-001', name: 'Upper Ledge' },
    { id: 'row-002', name: 'upper ledge' },
    { id: 'row-003', name: 'Lower Ledge' },
  ];
  // Three distinct values would otherwise infer as a closed set; the override
  // keeps this about the text kind.
  const schema = buildSchema(ROWS, { kinds: { name: 'string' } } as const);

  const matches = (clause: FilterClause): string[] =>
    ROWS.filter(compile([clause], schema)).map((row) => row.id);

  it('matches both casings with no modifier on the clause', () => {
    expect(matches(createClause('name', 'eq', 'Upper Ledge'))).toEqual(['row-001', 'row-002']);
  });

  it('matches only the exact casing once the clause carries the modifier', () => {
    const clause = { ...createClause('name', 'eq', 'Upper Ledge'), caseSensitive: true };
    expect(matches(clause)).toEqual(['row-001']);
  });

  it('narrows a contains clause the same way', () => {
    const loose = createClause('name', 'contains', 'ledge');
    expect(matches(loose)).toHaveLength(3);
    // Only the all-lowercase row still holds a lowercase "ledge".
    expect(matches({ ...loose, caseSensitive: true })).toEqual(['row-002']);
  });

  it('survives a view snapshot round-trip', () => {
    const clause = { ...createClause('name', 'contains', 'Ledge'), caseSensitive: true };
    const table = { columns: [], sort: [], groupBy: [] };
    const [restored] = restore(capture(table, [clause])).filters;
    expect(restored?.caseSensitive).toBe(true);
  });
});

describe('operatorMenuItems offers the modifier where it means something', () => {
  const noop = (): void => undefined;

  const entries = (kind: FieldKind, op: string, caseSensitive?: boolean) =>
    operatorMenuItems({ kind, op, caseSensitive, onPickOperator: noop, onToggleCaseSensitive: noop });

  const keys = (kind: FieldKind, op: string): string[] =>
    entries(kind, op).map((entry) => (entry === 'separator' ? 'separator' : entry.key));

  it('offers it for text', () => {
    expect(supportsCaseModifier('string')).toBe(true);
    expect(keys('string', 'contains')).toContain(MATCH_CASE_KEY);
  });

  it('keeps it out of the kinds that match exactly or have no case', () => {
    for (const kind of ['number', 'boolean', 'enum', 'idRef', 'array', 'object', 'union', 'unknown'] as const) {
      expect(supportsCaseModifier(kind), kind).toBe(false);
      expect(keys(kind, 'eq'), kind).not.toContain(MATCH_CASE_KEY);
    }
  });

  it('separates it from the operators, which stay exclusive above it', () => {
    const listed = keys('string', 'contains');
    expect(listed[listed.length - 2]).toBe('separator');
    expect(listed[listed.length - 1]).toBe(MATCH_CASE_KEY);
  });

  it('omits it entirely when the caller offers no handler', () => {
    const listed = operatorMenuItems({ kind: 'string', op: 'contains', onPickOperator: noop })
      .map((entry) => (entry === 'separator' ? 'separator' : entry.key));
    expect(listed).not.toContain(MATCH_CASE_KEY);
  });

  it('marks itself with the menu check only while the clause has it on', () => {
    const item = (caseSensitive?: boolean): MenuItem =>
      entries('string', 'contains', caseSensitive)
        .filter((entry): entry is MenuItem => entry !== 'separator')
        .find((entry) => entry.key === MATCH_CASE_KEY) as MenuItem;
    expect(item(undefined).checked).toBe(false);
    expect(item(false).checked).toBe(false);
    expect(item(true).checked).toBe(true);
  });

  it('toggles to the opposite of what the clause currently carries', () => {
    const seen: boolean[] = [];
    const toggled = (caseSensitive?: boolean): void => {
      const listed = operatorMenuItems({
        kind: 'string', op: 'contains', caseSensitive,
        onPickOperator: noop,
        onToggleCaseSensitive: (next) => seen.push(next),
      });
      const item = listed.find((entry) => entry !== 'separator' && entry.key === MATCH_CASE_KEY);
      if (item && item !== 'separator') item.onClick?.();
    };
    toggled(undefined);
    toggled(true);
    expect(seen).toEqual([true, false]);
  });
});
