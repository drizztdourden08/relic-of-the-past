/* @layer tests @kind test */
/*
 * Guards byte-identical placements across the Brock randomizer lift: every case in
 * golden-seeds.cases.ts is generated and its JSON text (key order included) must equal
 * fixtures/<case>.json. A missing fixture fails. GOLDEN_SEEDS_WRITE=1 writes every fixture.
 * Fixtures captured on: TBD
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { generatePlacement } from '@rotp/randomizer';
import { GOLDEN_CASES } from './golden-seeds.cases';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const WRITE = process.env.GOLDEN_SEEDS_WRITE === '1';

describe('golden seeds', { tags: ['standard'] }, () => {
  for (const { name, request } of GOLDEN_CASES) {
    it(`${name} places byte-identically`, () => {
      const text = JSON.stringify(generatePlacement(request), null, 2);
      const file = join(FIXTURES, `${name}.json`);
      if (WRITE) {
        mkdirSync(FIXTURES, { recursive: true });
        writeFileSync(file, text);
        return;
      }
      expect(existsSync(file), `missing fixture ${name}.json`).toBe(true);
      expect(text === readFileSync(file, 'utf8')).toBe(true);
    });
  }
});
