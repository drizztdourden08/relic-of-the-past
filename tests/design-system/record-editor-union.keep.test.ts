/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import { detectUnionBranch } from '../../apps/web/src/ui/design-system/composites/RecordEditor/behavior/union-branch';
import type { FieldDescriptor } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { describeDataset } from '../dataset-guard';

// Branch detection is only worth anything against the real variants, so these
// pull the shapes out of the live dataset instead of fixing them in a fixture.
// If a variant is added or dropped upstream, these tests see it.

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

describeDataset('union branch detection on a requirement expression', () => {
  const field = fieldAt('requirements');
  const variants = variantsOf('requirements');

  it('is a union with more than one real branch in the data', () => {
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

describeDataset('union branch detection now that placement is no longer a union', () => {
  // Placement is one plain shape now (`side` only on a border point): an object
  // with an optional field, not a union, so `buildSchema` infers `object` (see
  // infer-kind.ts's isKeySubsetChain). Pinned so a future real disjunction
  // shows up as a diff.
  it('infers as an object, not a union', () => {
    expect(fieldAt('placement').kind).toBe('object');
  });
});

describeDataset('union branch detection on the same union shape in another collection', () => {
  // `check.requirements` is the same Requirement DSL as `connection.requirements`,
  // so branch detection is not keyed to one collection's schema.
  // (item.weapon.range was the nested case before the object-vs-union inference
  // was tightened; it is a subset chain, so it now infers as `object`.)
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

describeDataset('union branch detection where it refuses to guess', () => {
  const field = fieldAt('requirements');

  it('resolves nothing for an absent value', () => {
    expect(detectUnionBranch(field, undefined).status).toBe('absent');
    expect(detectUnionBranch(field, null).status).toBe('absent');
  });

  it('resolves nothing for a value that is not a branch shape', () => {
    expect(detectUnionBranch(field, 'itemId').status).toBe('not-object');
    expect(detectUnionBranch(field, [{ itemId: 'item-001' }]).status).toBe('not-object');
  });

  it('resolves nothing for a shape it shares no key with', () => {
    expect(detectUnionBranch(field, {}).status).toBe('unmatched');
    expect(detectUnionBranch(field, { somethingElse: 1 }).status).toBe('unmatched');
  });

  it('reports keys it does not describe instead of dropping them silently', () => {
    const branch = detectUnionBranch(field, { itemId: 'item-001', future: 7 });
    expect(branch.status).toBe('resolved');
    expect(branch.extraKeys).toEqual(['future']);
  });
});
