/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';

// Derivation has to survive the real thing, not just a fixture: hundreds of rows,
// deep nesting, optional branches and arrays of objects. These pin the kinds
// inferred for load-bearing paths, so any change to inference shows up here.

const probe = (rows: readonly unknown[]) => createSchemaIndex(buildSchema(rows));

describe('buildSchema — a large, deeply nested collection', () => {
  const rows = all('connection');
  const schema = probe(rows);

  it('walks every row without throwing', () => {
    expect(rows.length).toBeGreaterThan(100);
    expect(schema.all().length).toBeGreaterThan(10);
  });

  it('reads prefixed ids as references and records what they point at', () => {
    expect(schema.byPath('id')?.kind).toBe('idRef');
    expect(schema.byPath('id')?.targetKind).toBe('connection');
    expect(schema.byPath('screenId')?.kind).toBe('idRef');
    expect(schema.byPath('screenId')?.targetKind).toBe('screen');
    expect(schema.byPath('toConnectionId')?.kind).toBe('idRef');
    expect(schema.byPath('toConnectionId')?.targetKind).toBe('connection');
  });

  it('reads a small closed set as an enum and a list as an array', () => {
    const kind = schema.byPath('kind');
    expect(kind?.kind).toBe('enum');
    expect(kind?.options?.length).toBeGreaterThan(0);
    expect(schema.byPath('tags')?.kind).toBe('array');
  });

  it('recognises genuine variant shapes as unions and uniform ones as objects', () => {
    // Branches that never co-occur: one requirement is an id, another is a list.
    expect(schema.byPath('requirements')?.kind).toBe('union');
    // Placement is one uniform shape now (form/rect/tiles, `side` an additive
    // optional field on a border point) — not a discriminated union anymore,
    // see the connection-model migration report.
    expect(schema.byPath('placement')?.kind).toBe('object');
    expect(schema.byPath('placement.form')?.kind).toBe('enum');
    // One consistent shape, so an object, and it nests three levels deep.
    expect(schema.byPath('placement.rect')?.kind).toBe('object');
    expect(schema.byPath('placement.rect.x')?.kind).toBe('number');
  });

  it('marks a field absent from some rows as optional', () => {
    expect(schema.byPath('id')?.optional).toBe(false);
    expect(schema.byPath('gatedBy')?.optional).toBe(true);
  });
});

describe('buildSchema — a second real collection', () => {
  const schema = probe(all('item'));

  it('derives the same way over a different shape', () => {
    expect(schema.byPath('id')?.kind).toBe('idRef');
    expect(schema.byPath('category')?.kind).toBe('enum');
    expect(schema.byPath('randomizerName')?.kind).toBe('string');
    // Uniform nested shape → object. weapon.range's branches only ever ADD a
    // key on top of the smaller ones (unbounded ⊂ estimated ⊂ contact), so
    // it's one shape with optional fields, not a genuine variant — object.
    expect(schema.byPath('gameId')?.kind).toBe('object');
    expect(schema.byPath('gameId.receiveItemId')?.kind).toBe('number');
    expect(schema.byPath('weapon.range')?.kind).toBe('object');
    expect(schema.byPath('weapon.range.sourced')?.kind).toBe('boolean');
  });

  it('flattens depth-first, and every flattened path resolves', () => {
    const flat = schema.all();
    for (const field of flat) expect(schema.byPath(field.path)).toBe(field);
    // A parent always precedes its own children in the flattened order.
    const parent = flat.findIndex((f) => f.path === 'weapon');
    const child = flat.findIndex((f) => f.path === 'weapon.range');
    expect(parent).toBeGreaterThanOrEqual(0);
    expect(child).toBeGreaterThan(parent);
  });
});

describe('buildSchema — a third real collection', () => {
  const schema = probe(all('screen'));

  it('keeps element descriptors out of the flattened list', () => {
    expect(schema.byPath('tags')?.kind).toBe('array');
    expect(schema.byPath('tags')?.of).toBeDefined();
    expect(schema.all().some((field) => field.path.includes('[]'))).toBe(false);
  });

  it('humanises labels from the path segment', () => {
    expect(schema.byPath('areaId')?.label).toBe('Area Id');
    expect(schema.byPath('gameId.roomIndex')?.label).toBe('Room Index');
  });
});
