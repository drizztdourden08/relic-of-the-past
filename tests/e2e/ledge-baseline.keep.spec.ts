/* @layer tests @kind test */
/**
 * PERMANENT (`.keep.spec.ts`) — do not delete with the scratch specs.
 *
 * Ledges are the easiest part of the flood to break without noticing, because a
 * wrong one still produces a plausible number. Every kind exists across these four
 * states, so they pin all of them at once:
 *
 *   test-cliffs-uncle-west       straight north and south, plus all four diagonals
 *   test-cliffs-uncle-east       the same, and the widest ledge count on one screen
 *   test-cliffs-haunted-terrace  the screen whose diagonals used to read as
 *                                north-to-south, which let the run walk onto a
 *                                mirror-only ledge and take `Cave 45`
 *   test-castle-bridge           the ONLY dual-layer (indoor) case: a bridge crossing
 *                                a room splits the upper floor into three regions —
 *                                the deck itself and a void gap either side that reads
 *                                identical (bare 0x00 on both layers) but is not a
 *                                surface, because nothing supports it. Treating the
 *                                gaps as floor put a column of phantom jump arrows
 *                                down the middle of the room.
 *
 * The counts below are the blessed reference. Each is asserted by DIRECTION, not
 * just as a total, because the bugs this guards against move a jump from one
 * direction to another while leaving the total alone — south-west produced nothing
 * at all for a long time, north-east jumps were being emitted with landings that
 * pointed south-west, and the castle bridge's phantom column was a run of "e"/"w"
 * hops that should never have existed at all.
 *
 * Requires the private vault for the `.sav` fixtures; without them each case skips
 * rather than fails, so a public checkout stays green.
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
  /** Which field of the dump identifies the location — overworld screen or indoor room. */
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
  test(`ledge baseline — ${expected.state}`, async () => {
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
    // (player.c:1115) steps x by 8 pixels and y by 9, so it travels slightly
    // steeper than the diagonal and the row delta can exceed the column delta by
    // one. What must hold is that it stays a diagonal and stays short — a hop
    // spanning many columns means the landing came from running ALONG the face
    // instead of across it.
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
