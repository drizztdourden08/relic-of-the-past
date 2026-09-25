/* @layer test @kind test */
/**
 * `resolveValue` is the seam a bad expression cannot get past: whatever
 * `compileExpr`/`evaluate` produce, this is where `1/0` stops being able to
 * become a repeat count of `Infinity`. Every case here either asserts the
 * documented clamp (`resolve-value.ts`'s own comment) or proves the function
 * never throws, because nothing downstream is written to catch it if it did.
 */
import { describe, expect, it } from 'vitest';
import { MAX_SAFE_RESULT, clampFinite, resolveValue } from '@shared/hud/data';
import type { Value } from '@shared/types/hud';

describe('clampFinite - the documented bound', () => {
  it('passes an ordinary number through unchanged', () => {
    expect(clampFinite(42)).toBe(42);
    expect(clampFinite(-42)).toBe(-42);
    expect(clampFinite(0)).toBe(0);
  });

  it('folds +Infinity and -Infinity to the finite bound, sign preserved', () => {
    expect(clampFinite(Infinity)).toBe(MAX_SAFE_RESULT);
    expect(clampFinite(-Infinity)).toBe(-MAX_SAFE_RESULT);
  });

  it('folds NaN to 0, not to the bound - it has no sign to preserve', () => {
    expect(clampFinite(NaN)).toBe(0);
  });

  it('clamps a merely huge finite number the same as it clamps Infinity', () => {
    expect(clampFinite(1e301)).toBe(MAX_SAFE_RESULT);
    expect(clampFinite(-1e301)).toBe(-MAX_SAFE_RESULT);
  });
});

describe('resolveValue - a bare number', () => {
  it('is clamped exactly like any other resolved number', () => {
    expect(resolveValue(5, {})).toBe(5);
    expect(resolveValue(Infinity, {})).toBe(MAX_SAFE_RESULT);
    expect(resolveValue(NaN, {})).toBe(0);
  });
});

describe('resolveValue - the nasty expressions', () => {
  const expr = (source: string): Value => ({ from: 'data', expr: source });

  it('division by zero clamps to the finite bound, not Infinity', () => {
    expect(resolveValue(expr('1 / 0'), {})).toBe(MAX_SAFE_RESULT);
    expect(resolveValue(expr('-1 / 0'), {})).toBe(-MAX_SAFE_RESULT);
  });

  it('0/0 (NaN) resolves to 0', () => {
    expect(resolveValue(expr('0 / 0'), {})).toBe(0);
  });

  it('an absurd count from a runaway exponent clamps instead of exploding', () => {
    expect(resolveValue(expr('10 ^ 400'), {})).toBe(MAX_SAFE_RESULT);
  });

  it('a negative result is returned as-is - not every Value is a count', () => {
    expect(resolveValue(expr('life_current - 1000'), { life_current: 4 })).toBe(-996);
  });

  it('an unknown variable at evaluation time resolves to 0, never throws', () => {
    expect(() => resolveValue(expr('missing_var + 1'), {})).not.toThrow();
    expect(resolveValue(expr('missing_var + 1'), {})).toBe(0);
  });

  it('an expression that fails to compile resolves to 0, never throws', () => {
    expect(() => resolveValue(expr('x = 5'), {})).not.toThrow();
    expect(resolveValue(expr('x = 5'), {})).toBe(0);
    expect(resolveValue(expr(''), {})).toBe(0);
  });

  it('a 10 kB expression resolves to 0 instead of hanging or throwing', () => {
    const huge = expr(`${'a+'.repeat(5000)}1`);
    expect(() => resolveValue(huge, {})).not.toThrow();
    expect(resolveValue(huge, {})).toBe(0);
  });

  it('the worked examples resolve to the numbers the plan claims', () => {
    const heartFill = expr('min(max(life_current - index * 8, 0), 8)');
    expect(resolveValue(heartFill, { life_current: 28, index: 0 })).toBe(8);
    expect(resolveValue(heartFill, { life_current: 28, index: 3 })).toBe(4);
    expect(resolveValue(heartFill, { life_current: 28, index: 4 })).toBe(0);
  });
});
