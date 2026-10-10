/* @layer tests @kind test */
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';
import { TEST_INSTANCE, ensureTestProfile } from './ensure-test-profile';

const PROJECT_ROOT = join(__dirname, '..', '..');
const MAIN_JS = join(PROJECT_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');
const DUMP_PATH = join(PROJECT_ROOT, 'debug-output', 'dump-nav.json');

interface Expected {
  state: string;
  location: { field: 'overworldScreenIndexHex'; hex: string } | { field: 'roomIndexHex'; hex: string };
  reachable: number;
  ledges: number;
  byDir: Record<string, number>;
}

const ignoreAlreadyExited = (): void => undefined;

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
    return JSON.parse(readFileSync(DUMP_PATH, 'utf8')) as Record<string, unknown>;
  } finally {
    await app.close().catch(ignoreAlreadyExited);
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
