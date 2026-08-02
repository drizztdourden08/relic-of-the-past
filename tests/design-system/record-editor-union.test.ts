/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { detectUnionBranch } from '../../apps/web/src/ui/design-system/composites/RecordEditor/behavior/union-branch';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';

// Branch detection is only worth anything against the real variants, so these
// pull the shapes out of the live dataset instead of fixing them in a fixture —
// if a variant is added or dropped upstream, these tests see it.

const connections = all('connection');
const schema = createSchemaIndex(buildSchema(connections));

const fieldAt = (path: string): FieldDescriptor => {
  const field = schema.byPath(path);
  if (!field) throw new Error(`the dataset no longer derives a field at ${path}`);
  return field;
};

/** Every distinct key-set observed at `key`, mapped to one real value that has it. */
const variantsOf = (key: string): Map<string, Record<string, unknown>> => {
  const seen = new Map<string, Record<string, unknown>>();
  for (const row of connections) {
    const value = (row as unknown as Record<string, unknown>)[key];
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue;
    const shape = Object.keys(value as Record<string, unknown>).sort().join('+');
    if (!seen.has(shape)) seen.set(shape, value as Record<string, unknown>);
  }
  return seen;
};

const keysShown = (field: FieldDescriptor, value: unknown): string[] =>
  [...detectUnionBranch(field, value).fields]
    .map((child) => child.path.slice(child.path.lastIndexOf('.') + 1))
    .sort();

describe('union branch detection — a requirement expression', () => {
  const field = fieldAt('requirements');
  const variants = variantsOf('requirements');

  it('is genuinely a union with more than one real branch in the data', () => {
    expect(field.kind).toBe('union');
    expect(variants.size).toBeGreaterThanOrEqual(2);
    expect([...variants.keys()]).toContain('itemId');
  });

  it('picks exactly the branch each real value is in', () => {
    for (const [shape, value] of variants) {
      const branch = detectUnionBranch(field, value);
      expect(branch.status, shape).toBe('resolved');
      // Nothing from a sibling branch leaks in: an item requirement offers the
      // item and not the list operators, and vice versa.
      expect(keysShown(field, value), shape).toEqual(shape.split('+'));
      expect(branch.extraKeys, shape).toEqual([]);
    }
  });

  it('never offers every branch at once, though the schema lists them together', () => {
    const merged = (field.children ?? []).length;
    expect(merged).toBeGreaterThan(1);
    for (const value of variants.values()) {
      expect(detectUnionBranch(field, value).fields.length).toBeLessThan(merged);
    }
  });
});

describe('union branch detection — a discriminated placement', () => {
  const field = fieldAt('placement');
  const variants = variantsOf('placement');

  it('carries the discriminator into every branch', () => {
    expect(variants.size).toBeGreaterThanOrEqual(2);
    for (const [shape, value] of variants) {
      expect(keysShown(field, value), shape).toContain('at');
    }
  });

  it('shows the side fields for a side crossing and the rect for an area one', () => {
    const side = [...variants.entries()].find(([shape]) => shape === 'at+side');
    const area = [...variants.entries()].find(([shape]) => shape === 'at+rect');
    expect(side).toBeDefined();
    expect(area).toBeDefined();
    expect(keysShown(field, side?.[1])).toEqual(['at', 'side']);
    expect(keysShown(field, area?.[1])).toEqual(['at', 'rect']);
  });

  it('adds an optional field only when the value actually has it', () => {
    const withRange = variantsOf('placement').get('at+side+tileRange');
    expect(withRange).toBeDefined();
    expect(keysShown(field, withRange)).toEqual(['at', 'side', 'tileRange']);
  });
});

describe('union branch detection — the same union shape in another collection', () => {
  // `check.requirements` is the identical Requirement DSL as `connection.requirements`
  // (shared/game/data/types/check.ts, types/connection.ts) — a real test that branch
  // detection isn't accidentally keyed to one collection's derived schema.
  //
  // (item.weapon.range was the nested case here before the object-vs-union inference
  // was tightened — it turned out to be one shape with additive optional fields, a
  // strict subset chain, not a real union, so it now correctly infers as `object` and
  // stopped being a union test case. See infer-kind.ts's isKeySubsetChain.)
  const nested = createSchemaIndex(buildSchema(all('check')));
  const field = nested.byPath('requirements');

  it('resolves a branch for every real value at a nested path', () => {
    expect(field?.kind).toBe('union');
    const values = all('check')
      .map((row) => row.requirements)
      .filter((value): value is Record<string, unknown> => value !== undefined && value !== null);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(detectUnionBranch(field as FieldDescriptor, value).status).toBe('resolved');
    }
  });
});

describe('union branch detection — where it refuses to guess', () => {
  const field = fieldAt('placement');

  it('resolves nothing for an absent value', () => {
    expect(detectUnionBranch(field, undefined).status).toBe('absent');
    expect(detectUnionBranch(field, null).status).toBe('absent');
  });

  it('resolves nothing for a value that is not a branch shape', () => {
    expect(detectUnionBranch(field, 'side').status).toBe('not-object');
    expect(detectUnionBranch(field, [{ at: 'side' }]).status).toBe('not-object');
  });

  it('resolves nothing for a shape it shares no key with', () => {
    expect(detectUnionBranch(field, {}).status).toBe('unmatched');
    expect(detectUnionBranch(field, { somethingElse: 1 }).status).toBe('unmatched');
  });

  it('reports keys it does not describe rather than dropping them silently', () => {
    const branch = detectUnionBranch(field, { at: 'side', side: 'north', future: 7 });
    expect(branch.status).toBe('resolved');
    expect(branch.extraKeys).toEqual(['future']);
  });
});
