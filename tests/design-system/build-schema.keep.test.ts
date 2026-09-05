/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { SchemaConfig } from '../../apps/web/src/ui/design-system/data/schema/field-descriptor';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';

// The config is a DIFF over the derived base, never a replacement. Everything
// below is really one assertion said several ways: whatever the config does not
// mention keeps exactly what the data said.

const ROWS = [
  { id: 'screen-001', name: 'first', size: 3, nested: { deep: { flag: true } }, only: 'here' },
  { id: 'screen-002', name: 'second', size: 5, nested: { deep: { flag: false } } },
];

const paths = (fields: readonly { path: string }[]): string[] => fields.map((f) => f.path);

describe('buildSchema derives a nested fixture', () => {
  const schema = createSchemaIndex(buildSchema(ROWS));

  it('walks objects recursively to full depth', () => {
    expect(schema.byPath('nested')?.kind).toBe('object');
    expect(schema.byPath('nested.deep')?.kind).toBe('object');
    expect(schema.byPath('nested.deep.flag')?.kind).toBe('boolean');
  });

  it('marks a field missing from one row as optional', () => {
    expect(schema.byPath('only')?.optional).toBe(true);
    expect(schema.byPath('name')?.optional).toBe(false);
  });

  it('flattens depth-first', () => {
    expect(paths(schema.all())).toEqual([
      'id', 'name', 'size', 'nested', 'nested.deep', 'nested.deep.flag', 'only',
    ]);
  });

  it('returns undefined for a path that is not there', () => {
    expect(schema.byPath('nope')).toBeUndefined();
    expect(schema.byPath('nested.nope')).toBeUndefined();
  });
});

describe('buildSchema layers the config on without removing derivation', () => {
  it('reorders listed paths first and appends the rest in derived order', () => {
    const config: SchemaConfig = { order: ['size', 'id'] };
    expect(paths(buildSchema(ROWS, config))).toEqual(['size', 'id', 'name', 'nested', 'only']);
  });

  it('leaves the derived order alone when no order is given', () => {
    expect(paths(buildSchema(ROWS))).toEqual(['id', 'name', 'size', 'nested', 'only']);
  });

  it('overrides a label without touching the rest', () => {
    const schema = createSchemaIndex(buildSchema(ROWS, { labels: { size: 'How big' } }));
    expect(schema.byPath('size')?.label).toBe('How big');
    expect(schema.byPath('name')?.label).toBe('Name');
  });

  it('marks a hidden path instead of dropping it, so the path still resolves', () => {
    const schema = createSchemaIndex(buildSchema(ROWS, { hidden: ['name'] }));
    expect(schema.byPath('name')?.hidden).toBe(true);
    expect(schema.byPath('size')?.hidden).toBeUndefined();
  });

  it('forces a kind, and stops deriving children under a field forced flat', () => {
    const schema = createSchemaIndex(buildSchema(ROWS, { kinds: { nested: 'unknown', size: 'string' } }));
    expect(schema.byPath('nested')?.kind).toBe('unknown');
    expect(schema.byPath('nested')?.children).toBeUndefined();
    expect(schema.byPath('nested.deep')).toBeUndefined();
    expect(schema.byPath('size')?.kind).toBe('string');
  });

  it('attaches a group id to every path the group lists', () => {
    const config: SchemaConfig = {
      groups: [{ id: 'identity', label: 'Identity', paths: ['id', 'nested.deep.flag'] }],
    };
    const schema = createSchemaIndex(buildSchema(ROWS, config));
    expect(schema.byPath('id')?.group).toBe('identity');
    expect(schema.byPath('nested.deep.flag')?.group).toBe('identity');
    expect(schema.byPath('name')?.group).toBeUndefined();
  });

  it('reorders nested levels by their full path', () => {
    const rows = [{ outer: { b: 1, a: 2 } }];
    const schema = buildSchema(rows, { order: ['outer.a'] });
    expect(paths(schema[0].children ?? [])).toEqual(['outer.a', 'outer.b']);
  });
});

describe('buildSchema on degenerate input', () => {
  it('returns nothing for no rows at all', () => {
    expect(buildSchema([])).toEqual([]);
  });

  it('survives rows that are not objects', () => {
    expect(buildSchema([1, 'a', null])).toEqual([]);
  });
});
