/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { join } from 'path';
import { existsSync } from 'fs';
import { dumpNav } from './dump-nav';
import { REPO_ROOT } from '../repo-root';

const PROJECT_ROOT = REPO_ROOT;

interface Expected {
  state: string;
  location: { field: 'overworldScreenIndexHex'; hex: string } | { field: 'roomIndexHex'; hex: string };
  reachable: number;
  ledges: number;
  byDir: Record<string, number>;
}

const CASES: Expected[] = [
  {
    state: 'test-cliffs-uncle-west',
    location: { field: 'overworldScreenIndexHex', hex: '0x2b' },
    reachable: 1624,
    ledges: 39,
    byDir: { n: 8, s: 6, nw: 19, sw: 5, se: 1 },
  },
  {
    state: 'test-cliffs-uncle-east',
    location: { field: 'overworldScreenIndexHex', hex: '0x2c' },
    reachable: 2220,
    ledges: 77,
    byDir: { n: 20, s: 14, w: 2, e: 20, nw: 7, ne: 11, se: 3 },
  },
  {
    state: 'test-cliffs-haunted-terrace',
    location: { field: 'overworldScreenIndexHex', hex: '0x32' },
    reachable: 1753,
    ledges: 0,
    byDir: {},
  },
  {
    state: 'test-castle-bridge',
    location: { field: 'roomIndexHex', hex: '0x0062' },
    reachable: 1241,
    ledges: 10,
    byDir: { n: 10 },
  },
];

const stepLetter = (delta: number, negative: string, positive: string): string => {
  if (delta < 0) return negative;
  return delta > 0 ? positive : '';
};

const directionOf = (l: { startRow: number; startCol: number; endRow: number; endCol: number }): string => {
  const dr = Math.sign(l.endRow - l.startRow);
  const dc = Math.sign(l.endCol - l.startCol);
  return `${stepLetter(dr, 'n', 's')}${stepLetter(dc, 'w', 'e')}` || '?';
};

const dumpFor = (state: string): Promise<Record<string, unknown>> => dumpNav<Record<string, unknown>>(state);

for (const expected of CASES) {
  test(`ledge baseline: ${expected.state}`, { tag: '@e2e' }, async () => {
    const fixture = join(PROJECT_ROOT, 'tests', 'fixtures', 'save-states', `${expected.state}.sav`);
    if (!existsSync(fixture)) {
      test.skip(true, `fixture ${expected.state}.sav absent (needs the private vault)`);
      return;
    }
    const dump = await dumpFor(expected.state) as {
      overworldScreenIndexHex: string;
      roomIndexHex: string;
      floodFill: { reachableCount: number; ledges: Array<{ startRow: number; startCol: number; endRow: number; endCol: number }> };
    };

    expect(dump[expected.location.field]).toBe(expected.location.hex);
    expect(dump.floodFill.reachableCount).toBe(expected.reachable);
    expect(dump.floodFill.ledges).toHaveLength(expected.ledges);

    const byDir: Record<string, number> = {};
    for (const l of dump.floodFill.ledges) {
      const d = directionOf(l);
      byDir[d] = (byDir[d] ?? 0) + 1;
    }
    expect(byDir).toEqual(expected.byDir);

    for (const l of dump.floodFill.ledges) {
      const d = directionOf(l);
      if (d.length !== 2) continue;
      const dr = Math.abs(l.endRow - l.startRow);
      const dc = Math.abs(l.endCol - l.startCol);
      expect(dc).toBeLessThanOrEqual(3);
      expect(dr - dc).toBeGreaterThanOrEqual(0);
      expect(dr - dc).toBeLessThanOrEqual(1);
    }
  });
}
