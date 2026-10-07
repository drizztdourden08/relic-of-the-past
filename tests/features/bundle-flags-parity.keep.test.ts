/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUNDLE_FIXES } from '../../shared/features/bundle-fixes.generated';

// The split bug-fix flags are generated into BOTH the C header and the TS registry from one catalog
// (scripts/build/gen-bundle-flags.mjs). This test fails loudly if the two ever drift, say when someone
// hand-edits one, or the generator is changed without re-running it everywhere.

const parseCEnums = (src: string): Record<string, number> => {
  const out: Record<string, number> = {};
  const re = /\b(kFeatures[12]_\w+)\s*=\s*(\d+)u?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out[m[1]] = Number(m[2]);
  return out;
};

describe('split bug-fix flags: C ↔ TS parity', () => {
  const header = readFileSync(resolve(__dirname, '../../core/zelda3/src/features_bugfixes.h'), 'utf8');
  const cEnums = parseCEnums(header);

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
