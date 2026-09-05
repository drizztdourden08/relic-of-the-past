/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`). Do not delete with the scratch specs.
 *
 * Ledges are easy to break without noticing: a wrong one still produces a
 * plausible number. Four states pin every kind:
 *
 *   test-cliffs-uncle-west       straight north and south, plus all four diagonals
 *   test-cliffs-uncle-east       the same, and the widest ledge count on one screen
 *   test-cliffs-haunted-terrace  diagonals used to read as north-to-south, which
 *                                let the run take `Cave 45` via a mirror-only ledge
 *   test-castle-bridge           the ONLY dual-layer (indoor) case: the void gap
 *                                either side of the bridge deck reads as bare 0x00
 *                                on both layers but is not a surface. Treating it
 *                                as floor drew a column of phantom jump arrows.
 *
 * Counts are asserted by DIRECTION, not total, because these bugs move a jump
 * between directions: south-west produced nothing for a long time, north-east
 * landings pointed south-west, and the bridge's phantom column was "e"/"w" hops.
 *
 * Requires the private vault; without it each case skips.
 */
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import { TEST_INSTANCE, ensureTestProfile } from './ensure-test-profile';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'dist', 'electron', 'main.js');
const DUMP_PATH = join(PROJECT_ROOT, 'debug-output', 'dump-nav.json');

interface Expected {
  state: string;
  /** Which dump field identifies the location, either overworld screen or indoor room. */
  location: { field: 'overworldScreenIndexHex'; hex: string } | { field: 'roomIndexHex'; hex: string };
  reachable: number;
  ledges: number;
  /** Ledge count per travel direction, derived from start → end. */
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

/** Travel direction of a ledge, from its start and landing tiles. */
const directionOf = (l: { startRow: number; startCol: number; endRow: number; endCol: number }): string => {
  const dr = Math.sign(l.endRow - l.startRow);
  const dc = Math.sign(l.endCol - l.startCol);
  return `${dr < 0 ? 'n' : dr > 0 ? 's' : ''}${dc < 0 ? 'w' : dc > 0 ? 'e' : ''}` || '?';
};

const dumpFor = async (state: string): Promise<Record<string, unknown>> => {
  await ensureTestProfile();
  if (existsSync(DUMP_PATH)) rmSync(DUMP_PATH);
  const app = await electron.launch({
    args: [MAIN_JS, '--muted', '--no-focus', `--instance=${TEST_INSTANCE}`, `--dump-nav=${state}`],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  try {
    for (let i = 0; i < 120 && !existsSync(DUMP_PATH); i++) await new Promise((r) => setTimeout(r, 1000));
    if (!existsSync(DUMP_PATH)) throw new Error(`--dump-nav=${state} wrote no dump`);
    return JSON.parse(readFileSync(DUMP_PATH, 'utf8'));
  } finally {
    await app.close().catch(() => { /* already exited itself */ });
  }
};

for (const expected of CASES) {
  test(`ledge baseline: ${expected.state}`, async () => {
    test.setTimeout(300_000);
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

    // A diagonal hop is NOT 45 degrees: LinkHop_FindLandingSpotDiagonallyDown
    // (player.c:1115) steps x by 8 and y by 9, so the row delta can exceed the
    // column delta by one. A hop spanning many columns means the landing came
    // from running ALONG the face.
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
