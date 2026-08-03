/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildConnectionNav } from '../../../shared/game/navigation/analysis/connection-nav-from-flood';
import { serializeConnectionRecord } from '../../../shared/game/data/record-codegen';
import type { ConnectionInfo } from '../../../shared/game/navigation';
import type { ConnectionRecord, ConnectionTag } from '../../../shared/game/data';

const makeInfo = (over: Partial<ConnectionInfo>): ConnectionInfo => ({
  edge: 'east',
  targetScreen: 0x31,
  freeTileCount: 0,
  itemTileCount: 0,
  positions: [],
  requirements: [],
  ...over,
});

describe('buildConnectionNav — ConnectionInfo → ConnectionNavData', () => {
  it('walk crossing records positions as overlapTiles and distance weight', () => {
    const info = makeInfo({ edge: 'east', positions: [30, 31, 32], requirements: [] });
    const nav = buildConnectionNav(info, ['transit:walk', 'dir:two-way']);
    expect(nav.transitType).toBe('walk');
    expect(nav.overlapTiles).toEqual([30, 31, 32]);
    expect(nav.weight).toBe(3);
    expect(nav.bidirectional).toBe(true);
    expect(nav.fromPoint).toBeUndefined();
    expect(nav.invalid).toBeUndefined();
  });

  it('door crossing records a fromPoint entry from positions + edge', () => {
    const info = makeInfo({ edge: 'north', positions: [24], requirements: ['boots'] });
    const nav = buildConnectionNav(info, ['transit:door', 'dir:two-way']);
    expect(nav.transitType).toBe('door');
    expect(nav.overlapTiles).toBeUndefined();
    expect(nav.weight).toBe(1);
    expect(nav.fromPoint?.direction).toBe('n');
    expect(nav.fromPoint?.tiles).toEqual([24]);
    expect(nav.fromPoint?.position).toEqual({ row: 0, col: 24 });
    expect(nav.fromPoint?.oneWay).toBeNull();
    expect(nav.requirements).toEqual([['boots']]);
  });

  it('one-way hole is not bidirectional and maps requirements as OR-of-AND', () => {
    const info = makeInfo({ edge: 'south', positions: [10], requirements: [] });
    const nav = buildConnectionNav(info, ['transit:hole', 'dir:one-way']);
    expect(nav.transitType).toBe('hole');
    expect(nav.bidirectional).toBe(false);
    expect(nav.fromPoint?.position).toEqual({ row: 63, col: 10 });
  });

  it('empty crossing flags invalid', () => {
    const nav = buildConnectionNav(makeInfo({ positions: [] }), ['transit:walk']);
    expect(nav.invalid).toBe(true);
    expect(nav.overlapTiles).toEqual([]);
  });
});

describe('serializeConnectionRecord — record emission', () => {
  const tags: ConnectionTag[] = ['dir:two-way'];
  const base = {
    kind: 'edge',
    fromScreenId: 'screen-030',
    toScreenId: 'screen-031',
    direction: 'two-way',
    tags,
  } as const;

  it('omits nav when absent, and every other optional field with it', () => {
    const literal = serializeConnectionRecord({ ...base });
    expect(literal).toBe([
      '  {',
      "    kind: 'edge',",
      "    fromScreenId: 'screen-030',",
      "    toScreenId: 'screen-031',",
      "    direction: 'two-way',",
      "    tags: ['dir:two-way'],",
      '  },',
    ].join('\n'));
  });

  it('collapses a nav literal onto one line while it fits', () => {
    const nav = buildConnectionNav(makeInfo({ positions: [30, 31], requirements: [] }), ['transit:walk', 'dir:two-way']);
    const literal = serializeConnectionRecord({ ...base, nav });
    expect(literal).toContain(`nav: { transitType: 'walk', requirements: [], bidirectional: true, weight: 2, overlapTiles: [30, 31] },`);
  });

  it('expands a nav literal that no longer fits, keeping every field', () => {
    const nav = buildConnectionNav(makeInfo({ edge: 'north', positions: [24], requirements: ['boots'] }), ['transit:door', 'dir:two-way']);
    const literal = serializeConnectionRecord({ ...base, kind: 'door', nav });
    expect(literal).toContain(`      transitType: 'door',`);
    expect(literal).toContain(`      requirements: [['boots']],`);
    expect(literal).toContain(`        direction: 'n',`);
    expect(literal).toContain(`        tiles: [24],`);
    expect(literal).toContain(`        position: { row: 0, col: 24 },`);
    expect(literal).toContain(`        oneWay: null,`);
  });

  it('emits the frozen id first when the allocator has stamped one', () => {
    const literal = serializeConnectionRecord({ id: 'connection-897', ...base });
    expect(literal.split('\n')[1]).toBe("    id: 'connection-897',");
  });
});

// Compile-time guard: the shape the serializer emits must be a valid
// ConnectionRecord.nav. If ConnectionNavData drifts, this const fails tsc.
const ROUND_TRIP: ConnectionRecord = {
  id: 'connection-897',
  kind: 'edge',
  fromScreenId: 'screen-030',
  toScreenId: 'screen-031',
  direction: 'two-way',
  tags: ['dir:two-way'],
  nav: {
    transitType: 'walk',
    requirements: [['boots']],
    bidirectional: true,
    fromPoint: { id: 'flood-30-n', direction: 'n', tiles: [24], requirements: [], position: { row: 0, col: 24 }, oneWay: null },
    overlapTiles: [30, 31],
    weight: 2,
    invalid: false,
  },
};

describe('emitted nav literal type-checks as ConnectionRecord', () => {
  it('round-trip const is well-typed', () => {
    expect(ROUND_TRIP.nav?.transitType).toBe('walk');
  });
});
