/* @layer test @kind test */
/**
 * `validateValue` is the hook wired into `validate-layout.ts` for the phase
 * that gives a `HudBox` field an actual `Value` type. Nothing on the document
 * schema calls it yet (see the file's own header), so this tests it directly,
 * the same way `validate-box.ts`'s helpers are tested before anything calls
 * them through a full document. Every case matches the TEST HARD list: an
 * unparseable expression and an unknown variable are both refused with a
 * message naming the field and, where one exists, the column - and the whole
 * thing never half-succeeds into a value the caller should trust.
 */
import { describe, expect, it } from 'vitest';
import expressions from '../fixtures/hud-expressions.json';
import { validateValue } from '@shared/hud/layouts';
import type { Issues } from '@shared/hud/layouts/validate-box';

const check = (value: unknown, context?: { insideRepeat?: boolean }) => {
  const issues: Issues = [];
  const result = validateValue(value, 'node.size.w', issues, context);
  return { result, issues };
};

describe('validateValue - numbers', () => {
  it('a finite number passes through untouched', () => {
    const { result, issues } = check(24);
    expect(result).toBe(24);
    expect(issues).toEqual([]);
  });

  it('refuses NaN and Infinity, naming the field', () => {
    expect(check(NaN).issues[0]).toContain('node.size.w');
    expect(check(Infinity).issues).toHaveLength(1);
  });
});

describe('validateValue - a valid data expression', () => {
  it('passes an expression naming only known variables', () => {
    const { result, issues } = check({ from: 'data', expr: expressions.valid['arrow-count'] });
    expect(result).toEqual({ from: 'data', expr: 'arrow_current' });
    expect(issues).toEqual([]);
  });

  it('accepts index/count/item only when told the field is inside a repeat', () => {
    const value = { from: 'data', expr: expressions.valid['heart-fill'] };
    expect(check(value, { insideRepeat: false }).issues.length).toBeGreaterThan(0);
    expect(check(value, { insideRepeat: true }).issues).toEqual([]);
  });
});

describe('validateValue - refusal, naming the field and the column', () => {
  it('an unparseable expression is refused with the field path and a column', () => {
    const { result, issues } = check({ from: 'data', expr: expressions.invalid.assignment });
    expect(result).toBeUndefined();
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('node.size.w.expr');
  });

  it('an unknown variable is refused, naming the field, and suggests the typo\'s fix', () => {
    const { result, issues } = check({ from: 'data', expr: expressions.invalid['unknown-variable'] });
    expect(result).toBeUndefined();
    expect(issues[0]).toBe('node.size.w.expr: unknown variable "life_curent" - did you mean life_current?');
  });

  it('disabled operators are refused through the same path as any other bad expression', () => {
    expect(check({ from: 'data', expr: expressions.invalid['function-definition'] }).result).toBeUndefined();
    expect(check({ from: 'data', expr: expressions.invalid['array-literal'] }).result).toBeUndefined();
    expect(check({ from: 'data', expr: expressions.invalid['in-operator'] }).result).toBeUndefined();
  });

  it('an empty expression is refused, not silently treated as zero', () => {
    expect(check({ from: 'data', expr: expressions.invalid.empty }).result).toBeUndefined();
  });

  it('a 10 kB expression is refused, not accepted or hung on', () => {
    const huge = { from: 'data', expr: `${'a+'.repeat(5000)}1` };
    expect(() => check(huge)).not.toThrow();
    expect(check(huge).result).toBeUndefined();
  });

  it('an unexpected key is refused the same way any other field would be', () => {
    const { issues } = check({ from: 'data', expr: 'arrow_current', extra: true });
    expect(issues.some((issue) => issue.includes("unknown key 'extra'"))).toBe(true);
  });

  it('refuses a "from" this document model does not have', () => {
    expect(check({ from: 'store', expr: 'arrow_current' }).result).toBeUndefined();
  });

  it('refuses anything that is not a number or a data-value object', () => {
    expect(check('arrow_current').result).toBeUndefined();
    expect(check(null).result).toBeUndefined();
    expect(check([1, 2, 3]).result).toBeUndefined();
  });
});
