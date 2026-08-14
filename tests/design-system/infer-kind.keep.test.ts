/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import {
  ENUM_MAX, enumOptions, idTargetKind, inferKind,
} from '../../apps/web/src/ui/design-system/data/schema/infer-kind';
import { describeDataset } from '../dataset-guard';

// Inference is the only genuinely tricky derivation in the package, and every
// downstream decision (which operators, which control, how it sorts) hangs off
// getting it right. One constructed case per kind, plus the edges that decide
// between two neighbouring kinds.

const distinct = (count: number): string[] =>
  Array.from({ length: count }, (_, i) => `value-${i}`);

describeDataset('inferKind — one case per kind', () => {
  it('reads booleans', () => {
    expect(inferKind([true, false, true])).toBe('boolean');
  });

  it('reads numbers', () => {
    expect(inferKind([0, 1, -3, 2.5])).toBe('number');
  });

  it('reads arrays before it reads objects', () => {
    expect(inferKind([[], [1, 2], ['a']])).toBe('array');
  });

  it('reads prefixed ids as references, not as an enum', () => {
    expect(inferKind(['screen-001', 'screen-002'])).toBe('idRef');
    expect(inferKind(['item-174', 'dungeon-013', 'actor-271'])).toBe('idRef');
  });

  it('does not mistake an unprefixed or unpadded lookalike for a reference', () => {
    expect(inferKind(['screen-001', 'not-an-id'])).toBe('enum');
    expect(inferKind(['screen-'])).toBe('enum');
  });

  it('reads a uniform object shape as an object', () => {
    expect(inferKind([{ a: 1, b: 'x' }, { a: 2, b: 'y' }])).toBe('object');
  });

  it('reads variant object shapes as a union', () => {
    // No shared key at all — two disjoint branches.
    expect(inferKind([{ itemId: 'item-001' }, { anyOf: [] }])).toBe('union');
    // Same key, primitive on one branch and a container on the other.
    expect(inferKind([{ at: 'edge' }, { at: { x: 1 } }])).toBe('union');
  });
});

describeDataset('inferKind — the edges', () => {
  it('calls an all-absent field unknown rather than guessing', () => {
    expect(inferKind([])).toBe('unknown');
    expect(inferKind([undefined, undefined])).toBe('unknown');
    expect(inferKind([null, null, undefined])).toBe('unknown');
  });

  it('calls a genuinely mixed field unknown', () => {
    expect(inferKind([1, 'a', true])).toBe('unknown');
    expect(inferKind([{ a: 1 }, 'a'])).toBe('unknown');
    expect(inferKind([[1], { a: 1 }])).toBe('unknown');
  });

  it('ignores null and undefined when deciding the kind of what is there', () => {
    expect(inferKind([1, null, 2, undefined])).toBe('number');
    expect(inferKind([null, true])).toBe('boolean');
  });

  it('switches from enum to string at the closed-set ceiling', () => {
    expect(inferKind(distinct(ENUM_MAX))).toBe('enum');
    expect(inferKind(distinct(ENUM_MAX + 1))).toBe('string');
  });

  it('counts distinct values, not rows, for the ceiling', () => {
    const repeated = Array.from({ length: 500 }, (_, i) => `value-${i % 3}`);
    expect(inferKind(repeated)).toBe('enum');
  });

  it('treats an empty array of values as an array, not as unknown', () => {
    expect(inferKind([[], [], []])).toBe('array');
  });
});

describeDataset('inferKind — the details a descriptor carries', () => {
  it('collects enum options in first-seen order, without duplicates', () => {
    expect(enumOptions(['b', 'a', 'b', null, 'c'])).toEqual(['b', 'a', 'c']);
  });

  it('reports the shared id prefix, and nothing when they disagree', () => {
    expect(idTargetKind(['screen-001', 'screen-486'])).toBe('screen');
    expect(idTargetKind(['screen-001', 'item-001'])).toBeUndefined();
  });
});

// Real dataset regression cases for the subset-chain fix: a field that is
// really one shape with optional keys must NOT be misread as a union just
// because some sampled objects carry fewer keys than others.
describeDataset('inferKind — subset-chain regression, real dataset shapes', () => {
  it('reads screen.position as object: dungeon screens add floor, overworld screens do not', () => {
    const positions = all('screen')
      .map((screen) => screen.position)
      .filter((position): position is NonNullable<typeof position> => position !== undefined);
    expect(positions.length).toBeGreaterThan(0);
    // Confirms the fixture actually exercises both branch sizes, not just one.
    expect(positions.some((p) => p.floor !== undefined)).toBe(true);
    expect(positions.some((p) => p.floor === undefined)).toBe(true);
    expect(inferKind(positions)).toBe('object');
  });

  it('reads connection.placement as object: a border point only ADDS `side` on top of an area one', () => {
    // The connection-model migration replaced the old discriminated
    // `{ at: 'side' | 'area', ... }` placement (a real union: the two
    // branches shared no key) with one shape (form/rect/tiles) where a
    // border point's `side` is an additive optional field — exactly the
    // subset-chain case this inference fix exists for, so this is now a
    // POSITIVE regression case for `object` rather than `union`.
    const placements = all('connection').map((connection) => connection.placement);
    expect(placements.length).toBeGreaterThan(0);
    expect(placements.some((p) => p.form === 'border')).toBe(true);
    expect(placements.some((p) => p.form === 'area')).toBe(true);
    expect(inferKind(placements)).toBe('object');
  });

  it('still reads connection.requirements as union: itemId/anyOf/allOf branches share no key', () => {
    const requirements = all('connection')
      .map((connection) => connection.requirements)
      .filter((req): req is NonNullable<typeof req> => req !== undefined);
    expect(requirements.length).toBeGreaterThan(0);
    expect(inferKind(requirements)).toBe('union');
  });

  it('reads item.weapon.range as object: unbounded/estimated/contact only ever add a key', () => {
    const ranges = all('item')
      .map((item) => item.weapon?.range)
      .filter((range): range is NonNullable<typeof range> => range !== undefined);
    expect(ranges.length).toBeGreaterThan(0);
    // The three branches observed in the real data — {kind} ⊂ {kind,tiles} ⊂
    // {kind,tiles,sourced} — form a chain rather than diverging, even though
    // the TS type itself is written as a discriminated union.
    expect(ranges.some((r) => r.kind === 'unbounded')).toBe(true);
    expect(ranges.some((r) => r.kind === 'estimated')).toBe(true);
    expect(ranges.some((r) => r.kind === 'contact')).toBe(true);
    expect(inferKind(ranges)).toBe('object');
  });
});
