/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUNDLE_FIXES } from '../../shared/features/bundle-fixes.generated';
import { FEATURES } from '../../shared/features/feature-registry';

// The split bug-fix flags are generated into BOTH the C header and the TS registry from one catalog
// (scripts/build/gen-bundle-flags.mjs). This test fails loudly if the two ever drift, say when someone
// hand-edits one, or the generator is changed without re-running it everywhere.

// Comments in these headers name flags in prose ("every kFeatures3_Cheat* bit ALSO requires ..."), so
// they are stripped before the enum scan instead of being left to the regex to survive.
const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

// A value is written either as a plain literal or as a shift (the hand-authored bits allocated by
// position). Anything else is left out, not guessed at.
const enumValue = (expr: string): number | null => {
  const plain = /^(\d+)u?$/.exec(expr);
  if (plain) return Number(plain[1]);
  const shifted = /^(\d+)u?\s*<<\s*(\d+)u?$/.exec(expr);
  if (shifted) return Number(shifted[1]) * 2 ** Number(shifted[2]);
  return null;
};

// Every kFeatures<word>_ enum in the given headers, not only the two generated bug-fix words: the
// gate bits in features.h (word 3) are mirrored in TS the same way and drift the same way.
const parseCEnums = (...sources: string[]): Record<string, number> => {
  const out: Record<string, number> = {};
  const re = /\b(kFeatures\d+_\w+)\s*=\s*([^,\n}]+)/g;
  for (const src of sources) {
    const clean = stripComments(src);
    let m: RegExpExecArray | null;
    while ((m = re.exec(clean)) !== null) {
      const value = enumValue(m[2].trim());
      if (value !== null) out[m[1]] = value;
    }
  }
  return out;
};

const readCoreFile = (name: string): string =>
  readFileSync(resolve(__dirname, `../../core/zelda3/src/${name}`), 'utf8');

describe('split bug-fix flags: C ↔ TS parity', () => {
  const cEnums = parseCEnums(readCoreFile('features_bugfixes.h'));

  it('every registry fix has a C enum with the same bit value', () => {
    for (const fix of BUNDLE_FIXES) {
      expect(fix.flag, `${fix.id} is missing a flag`).toBeTruthy();
      expect(cEnums[fix.flag!], `${fix.flag} missing/mismatched in features_bugfixes.h`).toBe(fix.bit);
    }
  });

  it('each flag name encodes its storage word (kFeatures<word>_...)', () => {
    for (const fix of BUNDLE_FIXES) {
      expect(fix.flag!.startsWith(`kFeatures${fix.word}_`), `${fix.flag} not in word ${fix.word}`).toBe(true);
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
      const b = fix.bit!;
      expect(b > 0 && (b & (b - 1)) === 0, `${fix.flag}=${b} is not a single bit`).toBe(true);
      expect(b <= 0x80000000, `${fix.flag}=${b} overflows 32 bits`).toBe(true);
    }
  });
});

// The generated bug-fix words are not the only C↔TS mirror. The word-3 gate bits are hand-authored in
// features.h and hand-mirrored in the registry (and again in live-settings-flags.ts, which builds the
// word from those same values), so they drift exactly the way the generated words would if someone
// skipped the generator: the same failure, with no generator to blame for it. The scan above stopped
// at kFeatures[12]_, which left every word-3 bit uncovered.

const FEATURES3 = 'kFeatures3_';
const FEATURES2 = 'kFeatures2_';

describe('word-3 gate bits: C ↔ registry parity', () => {
  const cEnums = parseCEnums(readCoreFile('features.h'));
  const defs = FEATURES.filter((f) => f.flag?.startsWith(FEATURES3));

  it('every registry feature on word 3 has a C enum with the same bit value', () => {
    expect(defs.length, 'no word-3 features found, so the scan stopped matching').toBeGreaterThan(0);
    for (const def of defs) {
      expect(def.bit, `${def.id} names ${def.flag} but declares no bit`).toBeTruthy();
      expect(cEnums[def.flag!], `${def.flag} missing/mismatched in features.h`).toBe(def.bit);
    }
  });

  it('word-3 bit values are single powers of two within a 32-bit word', () => {
    for (const def of defs) {
      const b = def.bit!;
      expect(b > 0 && (b & (b - 1)) === 0, `${def.flag}=${b} is not a single bit`).toBe(true);
      expect(b <= 0x80000000, `${def.flag}=${b} overflows 32 bits`).toBe(true);
    }
  });

  it('no two word-3 features claim the same bit', () => {
    const seen = new Map<number, string>();
    for (const def of defs) {
      expect(seen.has(def.bit!), `bit ${def.bit} claimed by ${seen.get(def.bit!)} and ${def.id}`).toBe(false);
      seen.set(def.bit!, def.id);
    }
  });
});

// The host-owned pause menu and the modern control scheme gate on two hand-authored features2 bits:
// word 3 has no free bit left. They are mirrored in the registry and in live-settings-feature-words.ts
// like the word-3 bits above, so they are checked the same way, by name.
describe('host-menu gate bits: C ↔ registry parity', () => {
  const cEnums = parseCEnums(readCoreFile('features.h'));
  const defs = FEATURES.filter((f) => f.id === 'hostMenu' || f.id === 'modernControls');

  it('the host-menu and modern-control gates are registered and mirrored', () => {
    // Named, not left to a loop: removing either registry entry has to fail here instead of
    // silently shrinking a set.
    expect(cEnums[`${FEATURES2}HostMenu`]).toBe(134217728);
    expect(cEnums[`${FEATURES2}ModernControls`]).toBe(268435456);
    expect(defs.map((d) => d.id).sort()).toEqual(['hostMenu', 'modernControls']);
    for (const def of defs) {
      expect(def.word, `${def.id} is not on word 2`).toBe(2);
      expect(cEnums[def.flag!], `${def.flag} missing/mismatched in features.h`).toBe(def.bit);
    }
  });

  it('both gates sit above the generated bug-fix range of word 2', () => {
    const floor = cEnums[`${FEATURES2}HandAuthoredFloor`];
    expect(floor, 'kFeatures2_HandAuthoredFloor not found').toBeGreaterThan(0);
    for (const def of defs) expect(def.bit!).toBeGreaterThanOrEqual(floor);
  });

  it('both gates are stripped by the C-side Vanilla Safe mask', () => {
    // Asserts the two bits by name instead of sweeping word 2: both change what the game computes
    // (the menu takeover and the item register), so both are parity-affecting.
    const rtl = stripComments(readCoreFile('zelda_rtl.c'));
    const mask = /kGateWordParityMask\[kGateWordCount\]\s*=\s*\{([\s\S]*?)\n\};/.exec(rtl);
    expect(mask, 'kGateWordParityMask not found in zelda_rtl.c').toBeTruthy();
    const word2 = mask![1].split(',').filter((entry) => entry.includes(FEATURES2)).join(' ');
    expect(word2).toContain(`${FEATURES2}HostMenu`);
    expect(word2).toContain(`${FEATURES2}ModernControls`);
  });
});
