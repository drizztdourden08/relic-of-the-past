/* @layer tests @kind test */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mirror } from '@rotp/game-core';
import { REPO_ROOT } from '../repo-root';

const HEADER = resolve(REPO_ROOT, 'core/game-hooks/save_bytes.h');

const parseHeader = (): Record<string, number> => {
  const source = readFileSync(HEADER, 'utf8');
  const defines: Record<string, number> = {};
  for (const line of source.split('\n')) {
    const match = /^#define\s+([A-Z0-9_]+)\s+(0[xX][0-9a-fA-F]+|\d+)\s*$/.exec(line.trim());
    if (match !== null) defines[match[1]] = Number(match[2]);
  }
  return defines;
};

const CLAIMS: ReadonlyArray<readonly [string, string]> = [
  ['SRM_SUBSTITUTION_TAKEN', 'SRM_SUBSTITUTION_TAKEN_COUNT'],
  ['SRM_WALLET_LADDER_INDEX', ''],
  ['SRM_EMPTY_RUNG', 'SRM_EMPTY_RUNG_COUNT'],
  ['SRM_PRIZE_TAKEN', 'SRM_PRIZE_TAKEN_COUNT'],
  ['SRM_PENDING_CRYSTAL', ''],
  ['SRM_POND_THROWS', ''],
  ['SRM_WISH_POND_THROWS', 'SRM_WISH_POND_THROWS_COUNT'],
  ['SRM_SWORD_AT_SMITHS', ''],
  ['SRM_SHOP_SOLD', 'SRM_SHOP_SOLD_COUNT'],
  ['SRM_EVENT_LEDGER', 'SRM_EVENT_LEDGER_COUNT'],
  ['SRM_AP_RECEIVED_INDEX', 'SRM_AP_RECEIVED_INDEX_COUNT'],
  ['SRM_AP_ROOM_HASH', 'SRM_AP_ROOM_HASH_COUNT'],
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
