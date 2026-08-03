/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { defaultOperatorFor, findOperator, operatorsFor } from '../../apps/web/src/ui/design-system/data/filter/operators';
import {
  createClauseForField, defaultValueForArity, valueForOperatorChange,
} from '../../apps/web/src/ui/design-system/composites/FilterBar/behavior/filter-clause-defaults';
import type { FieldDescriptor, FieldKind } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const field = (kind: FieldKind, extra: Partial<FieldDescriptor> = {}): FieldDescriptor => ({
  path: 'sample.path', label: 'Sample', kind, optional: false, ...extra,
});

describe('defaultValueForArity', () => {
  it('starts a many-arity operand as an empty list', () => {
    expect(defaultValueForArity('many')).toEqual([]);
  });

  it('starts a none- or one-arity operand as null', () => {
    expect(defaultValueForArity('none')).toBeNull();
    expect(defaultValueForArity('one')).toBeNull();
  });
});

describe('createClauseForField — the "+ Add filter" outcome', () => {
  it('picks the field kind\'s default operator, with a value shaped for its arity', () => {
    const clause = createClauseForField(field('number'));
    expect(clause.op).toBe(defaultOperatorFor('number'));
    expect(clause.value).toBeNull();
  });

  it('gives a many-arity default operator an empty list, not null', () => {
    const clause = createClauseForField(field('enum', { options: ['a', 'b'] }));
    expect(defaultOperatorFor('enum')).toBe('anyOf');
    expect(clause.op).toBe('anyOf');
    expect(clause.value).toEqual([]);
  });

  it('carries the field\'s own path, not a synthesized one', () => {
    const clause = createClauseForField(field('string', { path: 'gameId.roomIndex' }));
    expect(clause.path).toBe('gameId.roomIndex');
  });

  it('starts enabled', () => {
    expect(createClauseForField(field('boolean')).enabled).toBe(true);
  });

  it('picks a valid operator for every registered kind', () => {
    const kinds: readonly FieldKind[] = [
      'string', 'number', 'boolean', 'enum', 'idRef', 'array', 'object', 'union', 'unknown',
    ];
    for (const kind of kinds) {
      const clause = createClauseForField(field(kind));
      expect(operatorsFor(kind).some((spec) => spec.id === clause.op)).toBe(true);
    }
  });
});

describe('valueForOperatorChange — reset only when the shape actually changes', () => {
  it('keeps the value when both operators take a single operand', () => {
    const next = valueForOperatorChange({
      kind: 'number', previousOp: 'gt', nextOp: 'lt', currentValue: 5,
    });
    expect(next).toBe(5);
  });

  it('resets to an empty list when moving from a one-arity op to a many-arity op', () => {
    expect(findOperator('number', 'gt')?.arity).toBe('one');
    expect(findOperator('number', 'between')?.arity).toBe('many');
    const next = valueForOperatorChange({
      kind: 'number', previousOp: 'gt', nextOp: 'between', currentValue: 5,
    });
    expect(next).toEqual([]);
  });

  it('resets a stale pair when moving from a many-arity op to a one-arity op', () => {
    const next = valueForOperatorChange({
      kind: 'number', previousOp: 'between', nextOp: 'eq', currentValue: [1, 10],
    });
    expect(next).toBeNull();
  });

  it('drops a stale operand when moving to a none-arity op', () => {
    const next = valueForOperatorChange({
      kind: 'array', previousOp: 'containsValue', nextOp: 'isEmpty', currentValue: 'needle',
    });
    expect(next).toBeNull();
  });

  it('leaves the value alone switching between two none-arity operators', () => {
    const next = valueForOperatorChange({
      kind: 'boolean', previousOp: 'isTrue', nextOp: 'isFalse', currentValue: null,
    });
    expect(next).toBeNull();
  });
});
