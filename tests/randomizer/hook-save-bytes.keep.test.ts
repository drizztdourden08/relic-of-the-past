/* @layer tests @kind test */
/**
 * The hook-owned save-byte registry is internally consistent, and the TS mirror
 * says exactly what the C header says.
 *
 * The C header (core/game-hooks/save_bytes.h) is the source of truth and carries
 * its own _Static_asserts, but those only fire when the core is rebuilt, and they
 * cannot see the TS side at all. This test PARSES the header instead of generating
 * the TS from it: the header is a flat list of `#define NAME 0xHEX` lines, so the
 * parse is unambiguous, and nothing has to stay regenerated. A generated file would
 * only move the drift one step, from "two hand-written tables" to "a table and a
 * stale artifact nobody re-ran the generator for".
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as mirror from '@app/lib/game/save-file/hook-save-bytes';

const HEADER = resolve(__dirname, '../../core/game-hooks/save_bytes.h');

/** Every `#define NAME <integer>` in the header, as a name → value map. */
const parseHeader = (): Record<string, number> => {
  const source = readFileSync(HEADER, 'utf8');
  const defines: Record<string, number> = {};
  for (const line of source.split('\n')) {
    const match = /^#define\s+([A-Z0-9_]+)\s+(0[xX][0-9a-fA-F]+|\d+)\s*$/.exec(line.trim());
    if (match !== null) defines[match[1]] = Number(match[2]);
  }
  return defines;
};

/** Every claim in the registry, in the ascending order the header lists them. */
const CLAIMS: ReadonlyArray<readonly [string, string]> = [
  ['SRM_SUBSTITUTION_TAKEN', 'SRM_SUBSTITUTION_TAKEN_COUNT'],
  ['SRM_WALLET_LADDER_INDEX', ''],
  ['SRM_EMPTY_RUNG', 'SRM_EMPTY_RUNG_COUNT'],
  ['SRM_PRIZE_TAKEN', 'SRM_PRIZE_TAKEN_COUNT'],
  ['SRM_PENDING_CRYSTAL', ''],
  ['SRM_POND_THROWS', ''],
  ['SRM_SHOP_SOLD', 'SRM_SHOP_SOLD_COUNT'],
];

const SPAN_NAMES = ['SAVE_BLOCK_BASE', 'HOOK_SAVE_FIRST', 'HOOK_SAVE_LAST'] as const;

describe('the hook-owned save-byte registry', () => {
  const defines = parseHeader();
  const spanOf = (base: string, count: string): [number, number] => {
    const start = defines[base];
    return [start, start + (count === '' ? 1 : defines[count])];
  };

  it('parses every name the mirror restates', () => {
    for (const name of [...SPAN_NAMES, ...CLAIMS.flat().filter((n) => n !== '')]) {
      expect(defines[name], `${name} missing from save_bytes.h`).toBeTypeOf('number');
    }
  });

  it('allocates no address twice and stays inside the span', () => {
    let cursor = defines.HOOK_SAVE_FIRST;
    for (const [base, count] of CLAIMS) {
      const [start, end] = spanOf(base, count);
      expect(start, `${base} overlaps the claim before it`).toBeGreaterThanOrEqual(cursor);
      cursor = end;
    }
    expect(cursor - 1, 'the last claim runs past the span').toBeLessThanOrEqual(defines.HOOK_SAVE_LAST);
  });

  it('matches the TS mirror byte for byte', () => {
    for (const name of [...SPAN_NAMES, ...CLAIMS.flat().filter((n) => n !== '')]) {
      expect(mirror[name as keyof typeof mirror], `${name} drifted from save_bytes.h`).toBe(defines[name]);
    }
  });
});
