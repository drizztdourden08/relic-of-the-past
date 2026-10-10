/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUNDLE_FIXES, FEATURES } from '@rotp/features';
import { required } from './required';

const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

const enumValue = (expr: string): number | null => {
  const plain = /^(\d+)u?$/.exec(expr);
  if (plain) return Number(plain[1]);
  const shifted = /^(\d+)u?\s*<<\s*(\d+)u?$/.exec(expr);
  if (shifted) return Number(shifted[1]) * 2 ** Number(shifted[2]);
  return null;
};

const parseCEnums = (...sources: string[]): Record<string, number> => {
  const out: Record<string, number> = {};
  const re = /\b(kFeatures\d+_\w+)\s*=\s*([^,\n}]+)/g;
  for (const src of sources) {
    const clean = stripComments(src);
    let m: RegExpExecArray | null;
    while ((m = re.exec(clean)) !== null) {
      const name = required(m[1], 'the enum name group');
      const value = enumValue(required(m[2], 'the enum value group').trim());
      if (value !== null) out[name] = value;
    }
  }
  return out;
};

const readCoreFile = (name: string): string =>
  readFileSync(resolve(__dirname, `../../../core/zelda3/src/${name}`), 'utf8');

describe('split bug-fix flags: C <-> TS parity', () => {
  const cEnums = parseCEnums(readCoreFile('features_bugfixes.h'));

  it('every registry fix has a C enum with the same bit value', () => {
    for (const fix of BUNDLE_FIXES) {
      expect(fix.flag, `${fix.id} is missing a flag`).toBeTruthy();
      const flag = required(fix.flag, `${fix.id} flag`);
      expect(cEnums[flag], `${fix.flag} missing/mismatched in features_bugfixes.h`).toBe(fix.bit);
    }
  });

  it('each flag name encodes its storage word (kFeatures<word>_...)', () => {
    for (const fix of BUNDLE_FIXES) {
      expect(required(fix.flag, `${fix.id} flag`).startsWith(`kFeatures${fix.word}_`), `${fix.flag} not in word ${fix.word}`).toBe(true);
    }
  });

  it('no two fixes collide on the same word + bit', () => {
    const seen = new Set<string>();
    for (const fix of BUNDLE_FIXES) {
      const slot = `${fix.word}:${fix.bit}`;
      expect(seen.has(slot), `duplicate slot ${slot} (${fix.id})`).toBe(false);
      seen.add(slot);
    }
  });

  it('bit values are single powers of two within a 32-bit word', () => {
    for (const fix of BUNDLE_FIXES) {
      const b = required(fix.bit, `${fix.id} bit`);
      expect(b > 0 && (b & (b - 1)) === 0, `${fix.flag}=${b} is not a single bit`).toBe(true);
      expect(b <= 0x80000000, `${fix.flag}=${b} overflows 32 bits`).toBe(true);
    }
  });
});

const FEATURES3 = 'kFeatures3_';
const FEATURES2 = 'kFeatures2_';

describe('word-3 gate bits: C <-> registry parity', () => {
  const cEnums = parseCEnums(readCoreFile('features.h'));
  const defs = FEATURES.filter((f) => f.flag?.startsWith(FEATURES3));

  it('every registry feature on word 3 has a C enum with the same bit value', () => {
    expect(defs.length, 'no word-3 features found, so the scan stopped matching').toBeGreaterThan(0);
    for (const def of defs) {
      expect(def.bit, `${def.id} names ${def.flag} but declares no bit`).toBeTruthy();
      expect(cEnums[required(def.flag, `${def.id} flag`)], `${def.flag} missing/mismatched in features.h`).toBe(def.bit);
    }
  });

  it('word-3 bit values are single powers of two within a 32-bit word', () => {
    for (const def of defs) {
      const b = required(def.bit, `${def.id} bit`);
      expect(b > 0 && (b & (b - 1)) === 0, `${def.flag}=${b} is not a single bit`).toBe(true);
      expect(b <= 0x80000000, `${def.flag}=${b} overflows 32 bits`).toBe(true);
    }
  });

  it('no two word-3 features claim the same bit', () => {
    const seen = new Map<number, string>();
    for (const def of defs) {
      const bit = required(def.bit, `${def.id} bit`);
      expect(seen.has(bit), `bit ${def.bit} claimed by ${seen.get(bit)} and ${def.id}`).toBe(false);
      seen.set(bit, def.id);
    }
  });
});

describe('host-menu gate bits: C <-> registry parity', () => {
  const cEnums = parseCEnums(readCoreFile('features.h'));
  const defs = FEATURES.filter((f) => f.id === 'hostMenu' || f.id === 'modernControls');

  it('the host-menu and modern-control gates are registered and mirrored', () => {
    expect(cEnums[`${FEATURES2}HostMenu`]).toBe(134217728);
    expect(cEnums[`${FEATURES2}ModernControls`]).toBe(268435456);
    expect(defs.map((d) => d.id).sort()).toEqual(['hostMenu', 'modernControls']);
    for (const def of defs) {
      expect(def.word, `${def.id} is not on word 2`).toBe(2);
      expect(cEnums[required(def.flag, `${def.id} flag`)], `${def.flag} missing/mismatched in features.h`).toBe(def.bit);
    }
  });

  it('both gates sit above the generated bug-fix range of word 2', () => {
    const floor = cEnums[`${FEATURES2}HandAuthoredFloor`];
    expect(floor, 'kFeatures2_HandAuthoredFloor not found').toBeGreaterThan(0);
    const floorBit = required(floor, 'kFeatures2_HandAuthoredFloor');
    for (const def of defs) expect(required(def.bit, `${def.id} bit`)).toBeGreaterThanOrEqual(floorBit);
  });

  it('both gates are stripped by the C-side Vanilla Safe mask', () => {
    const rtl = stripComments(readCoreFile('zelda_rtl.c'));
    const mask = /kGateWordParityMask\[kGateWordCount\]\s*=\s*\{([\s\S]*?)\n\};/.exec(rtl);
    expect(mask, 'kGateWordParityMask not found in zelda_rtl.c').toBeTruthy();
    const maskBody = required(required(mask,'kGateWordParityMask')[1], 'the kGateWordParityMask body');
    const word2 = maskBody.split(',').filter((entry) => entry.includes(FEATURES2)).join(' ');
    expect(word2).toContain(`${FEATURES2}HostMenu`);
    expect(word2).toContain(`${FEATURES2}ModernControls`);
  });
});
