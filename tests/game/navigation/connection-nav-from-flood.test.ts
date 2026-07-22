/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildConnectionNav } from '../../../shared/game/navigation/analysis/connection-nav-from-flood';
import { serializeConnection } from '../../../shared/game/data/screen-codegen';
import type { ConnectionInfo } from '../../../shared/game/navigation';
import type { ScreenConnection } from '../../../shared/game/types';
import type { ConnectionTag } from '../../../shared/game/data/connections/tags';

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

describe('serializeConnection — nav emission', () => {
  const tags: ConnectionTag[] = ['transit:walk', 'dir:two-way'];

  it('omits nav when absent (no regression)', () => {
    const line = serializeConnection({ from: 'lw-30', to: 'lw-31', tags });
    expect(line).toBe(`  { from: 'lw-30', to: 'lw-31', tags: ['transit:walk', 'dir:two-way'] },`);
  });

  it('emits a compact nav literal for a walk crossing', () => {
    const nav = buildConnectionNav(makeInfo({ positions: [30, 31], requirements: [] }), tags);
    const line = serializeConnection({ from: 'lw-30', to: 'lw-31', tags, nav });
    expect(line).toContain(`nav: { transitType: 'walk', requirements: [], bidirectional: true, overlapTiles: [30, 31], weight: 2 }`);
  });

  it('emits fromPoint for a door crossing', () => {
    const nav = buildConnectionNav(makeInfo({ edge: 'north', positions: [24], requirements: ['boots'] }), ['transit:door', 'dir:two-way']);
    const line = serializeConnection({ from: 'lw-30', to: 'int-24', tags: ['transit:door', 'dir:two-way'], nav });
    expect(line).toContain(`fromPoint: { id:`);
    expect(line).toContain(`direction: 'n', tiles: [24], requirements: [['boots']], position: { row: 0, col: 24 }, oneWay: null }`);
  });
});

// Compile-time guard: the shape the serializer emits must be a valid
// ScreenConnection.nav. If ConnectionNavData drifts, this const fails tsc.
const ROUND_TRIP: ScreenConnection = {
  from: 'lw-30',
  to: 'lw-31',
  tags: ['transit:walk', 'dir:two-way'],
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

describe('emitted nav literal type-checks as ScreenConnection', () => {
  it('round-trip const is well-typed', () => {
    expect(ROUND_TRIP.nav?.transitType).toBe('walk');
  });
});
