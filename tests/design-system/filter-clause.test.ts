/* @layer tests @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { compile, createClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import type { FilterClause } from '../../apps/web/src/ui/design-system/data/filter/clause';
import {
  clearFieldTesters, getFieldTester, registerFieldTester,
} from '../../apps/web/src/ui/design-system/data/filter/tester-registry';
import {
  defaultOperatorFor, isOperatorValid, operatorsFor,
} from '../../apps/web/src/ui/design-system/data/filter/operators';

// The testers that do the real comparing live in the field-kit package, which
// registers them into this registry. These stand-ins are the smallest thing that
// proves the wiring: resolve the field, resolve its kind's tester, AND the lot.

const ROWS = [
  { id: 'item-001', name: 'alpha', size: 1, tag: 'red' },
  { id: 'item-002', name: 'beta', size: 5, tag: 'blue' },
  { id: 'item-003', name: 'alphabet', size: 9, tag: 'red' },
];

// `name` holds only three distinct values here, so inference would read it as a
// closed set. Forcing the kind is exactly what the config override is for, and
// it keeps this test about compile() rather than about inference.
const CONFIG = { kinds: { name: 'string' } } as const;
const schema = createSchemaIndex(buildSchema(ROWS, CONFIG));

const registerStandIns = (): void => {
  registerFieldTester('string', {
    test: (value, op, operand) =>
      op === 'contains' ? String(value).includes(String(operand)) : value === operand,
  });
  registerFieldTester('number', {
    test: (value, op, operand) => (op === 'gt' ? Number(value) > Number(operand) : value === operand),
  });
  registerFieldTester('enum', {
    test: (value, op, operand) => (operand as unknown[]).includes(value) === (op === 'anyOf'),
  });
};

const clause = (path: string, op: string, value: unknown): FilterClause =>
  createClause(path, op, value);

describe('compile — clauses are data, and they AND together', () => {
  beforeEach(() => {
    clearFieldTesters();
    registerStandIns();
  });

  it('passes everything when there is nothing to filter by', () => {
    expect(ROWS.filter(compile([], schema))).toHaveLength(3);
  });

  it('applies a single clause', () => {
    const predicate = compile([clause('name', 'contains', 'alpha')], schema);
    expect(ROWS.filter(predicate).map((r) => r.id)).toEqual(['item-001', 'item-003']);
  });

  it('combines clauses with AND', () => {
    const predicate = compile(
      [clause('name', 'contains', 'alpha'), clause('size', 'gt', 5)],
      schema,
    );
    expect(ROWS.filter(predicate).map((r) => r.id)).toEqual(['item-003']);
  });

  it('ignores a disabled clause without losing it', () => {
    const disabled = { ...clause('size', 'gt', 100), enabled: false };
    expect(ROWS.filter(compile([disabled], schema))).toHaveLength(3);
  });

  it('resolves the tester by the field kind, not by the value', () => {
    const predicate = compile([clause('tag', 'anyOf', ['red'])], schema);
    expect(schema.byPath('tag')?.kind).toBe('enum');
    expect(ROWS.filter(predicate).map((r) => r.id)).toEqual(['item-001', 'item-003']);
  });

  it('accepts a raw field list as well as an index', () => {
    const predicate = compile([clause('name', 'contains', 'beta')], buildSchema(ROWS, CONFIG));
    expect(ROWS.filter(predicate)).toHaveLength(1);
  });

  it('skips a clause whose path is gone rather than emptying the table', () => {
    expect(ROWS.filter(compile([clause('vanished', 'contains', 'x')], schema))).toHaveLength(3);
  });

  it('skips a clause whose kind has no registered tester', () => {
    clearFieldTesters();
    expect(ROWS.filter(compile([clause('name', 'contains', 'zzz')], schema))).toHaveLength(3);
  });

  it('gives each clause its own id', () => {
    const ids = [clause('a', 'eq', 1).id, clause('a', 'eq', 1).id];
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe('the tester registry', () => {
  beforeEach(() => clearFieldTesters());

  it('hands back exactly what was registered, per kind', () => {
    const tester = { test: () => true };
    registerFieldTester('boolean', tester);
    expect(getFieldTester('boolean')).toBe(tester);
    expect(getFieldTester('string')).toBeUndefined();
  });

  it('lets a later registration replace an earlier one', () => {
    registerFieldTester('boolean', { test: () => true });
    const second = { test: () => false };
    registerFieldTester('boolean', second);
    expect(getFieldTester('boolean')).toBe(second);
  });
});

describe('operators per kind', () => {
  it('offers comparisons for the kinds that can be compared', () => {
    expect(operatorsFor('string').map((o) => o.id)).toContain('contains');
    expect(operatorsFor('number').map((o) => o.id)).toContain('between');
    expect(operatorsFor('enum').map((o) => o.id)).toEqual(['anyOf', 'noneOf']);
    expect(operatorsFor('boolean').map((o) => o.id)).toEqual(['isTrue', 'isFalse']);
  });

  it('offers existence only for the kinds that cannot', () => {
    for (const kind of ['object', 'union', 'unknown'] as const) {
      expect(operatorsFor(kind).map((o) => o.id)).toEqual(['isEmpty', 'isNotEmpty']);
    }
  });

  it('validates an operator against a kind', () => {
    expect(isOperatorValid('string', 'contains')).toBe(true);
    expect(isOperatorValid('string', 'anyOf')).toBe(false);
    expect(isOperatorValid('number', 'contains')).toBe(false);
  });

  it('gives every kind a usable default operator', () => {
    const kinds = ['string', 'number', 'boolean', 'enum', 'idRef', 'array', 'object', 'union', 'unknown'] as const;
    for (const kind of kinds) expect(isOperatorValid(kind, defaultOperatorFor(kind))).toBe(true);
  });

  it('gives every operator an arity that matches whether it takes an operand', () => {
    for (const spec of operatorsFor('number')) {
      expect(['none', 'one', 'many']).toContain(spec.arity);
      expect(spec.icon.length).toBeGreaterThan(0);
    }
  });
});
