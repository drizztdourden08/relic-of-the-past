/* @layer tests @kind test */
/**
 * The widget's "On this screen" list must show everything the overlay draws —
 * these tests pin the two places that could silently swallow an item: the
 * grouping (an unmapped kind must land in "Unmapped", not vanish) and the
 * exit/edge parity (which is diagnostics, so it must not invent mismatches).
 */
import { describe, it, expect } from 'vitest';
import type { ScreenAnnotation } from '../../shared/game/simulation';
import { roomTagName } from '../../shared/game/simulation';
import { groupAnnotations, stepsOf } from '../../apps/web/src/ui/domains/widgets/navigation/sub-components/ScreenPanel/annotation-rows';
import { compareExitsToEdges } from '../../apps/web/src/ui/domains/widgets/navigation/sub-components/ScreenPanel/exit-parity';

const at = (kind: ScreenAnnotation['kind'], label: string, extra: Partial<ScreenAnnotation> = {}): ScreenAnnotation =>
  ({ kind, label, tile: { row: 0, col: 0 }, ...extra });

describe('annotation grouping', () => {
  it('keeps every item, including unmapped kinds', () => {
    const items = [
      at('chest', 'Map Chest'),
      at('cell-lock', 'cell lock #0'),
      at('big-key-carrier', 'big key guard'),
      at('exit', 'Sanctuary'),
      at('unknown', 'something new'),
    ];
    const groups = groupAnnotations(items);
    expect(groups.map((g) => g.id)).toEqual(['checks', 'locks', 'triggers', 'ways-out', 'other']);
    expect(groups.flatMap((g) => g.items)).toHaveLength(items.length);
    expect(groups.find((g) => g.id === 'other')?.items[0].label).toBe('something new');
  });

  it('drops empty groups rather than rendering headers with nothing under them', () => {
    expect(groupAnnotations([at('chest', 'Map Chest')]).map((g) => g.id)).toEqual(['checks']);
    expect(groupAnnotations([])).toEqual([]);
  });

  it('reads walk distance off the detail line, and sorts unknowns last', () => {
    expect(stepsOf(at('exit', 'a', { detail: '42 steps' }))).toBe(42);
    expect(stepsOf(at('exit', 'b'))).toBe(Number.MAX_SAFE_INTEGER);
    expect(stepsOf(at('exit', 'c', { detail: 'nonsense' }))).toBe(Number.MAX_SAFE_INTEGER);
  });
});

// REAL screen ids — an indoor screen's gameId is keyed by palace+room, so a
// made-up id resolves to nothing. Using fake ids here is what let the widget
// ship with every indoor exit missing. 'screen-133' is the real dataset id
// for the Jail Cell (room 0x80, palace 0x02) — looked up via
// scripts/generate-ids/output/id-manifest.json.
describe('exit / edge parity', () => {
  it('reports nothing when the two lists agree', () => {
    const exits = [at('exit', 'Jail Cell', { target: 'screen-133' })];
    const parity = compareExitsToEdges(exits, [{ targetScreen: 0x80, edge: 'north' }], true, 1);
    expect(parity).toEqual({ edgesWithoutExit: [], exitsWithoutEdge: [] });
  });

  it('names an edge the flood reached but derived no exit for', () => {
    const parity = compareExitsToEdges([], [{ targetScreen: 0x71, edge: 'east' }], true, 1);
    expect(parity.edgesWithoutExit).toEqual(['Boomerang Chest Room']);
  });

  it('names a door/stair exit that is not a border edge', () => {
    const exits = [at('exit', 'Jail Cell', { target: 'screen-133' })];
    expect(compareExitsToEdges(exits, [], true, 1).exitsWithoutEdge).toEqual(['Jail Cell']);

    // Without the palace, room 0x80 resolves to a CAVE that shares the number —
    // this is why the palace index is threaded through.
    expect(compareExitsToEdges(exits, [], true).exitsWithoutEdge).not.toEqual(['Jail Cell']);
  });

  it('ignores an exit whose target id is not a known screen', () => {
    const exits = [at('exit', 'nowhere', { target: 'not-a-screen' })];
    expect(compareExitsToEdges(exits, [], true, 1).exitsWithoutEdge).toEqual([]);
  });

  it('labels a screen by its real name when the data knows it', () => {
    expect(compareExitsToEdges([], [{ targetScreen: 0x2c, edge: 'south' }], false).edgesWithoutExit).toEqual(["Uncle's Estate East"]);

  });
});

describe('room tag names', () => {
  it('labels the whole clear-the-room family, not just one value', () => {
    for (const tag of [0x01, 0x0a, 0x13]) expect(roomTagName(tag)).toBe('clear enemies → doors open');
  });

  it('labels the known door/water/hole mechanics', () => {
    expect(roomTagName(0x14)).toBe('trigger → block door');
    expect(roomTagName(0x26)).toBe('kill room → block');
  });

  it('falls back to hex rather than claiming to know an unmapped tag', () => {
    expect(roomTagName(0x35)).toBe('tag 0x35');
  });
});
