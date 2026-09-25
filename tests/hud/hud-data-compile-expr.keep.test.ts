/* @layer test @kind test */
/**
 * `compileExpr` is the piece everything above it assumes cannot fail: it must
 * never throw, never hang, and never let a document smuggle real JavaScript
 * past the arithmetic the plan promised. Every nasty input the phase-1 plan
 * calls out by name gets its own case here.
 *
 * ONE CORRECTION TO THE PLAN, proved by `disabled operators` below: expr-eval
 * does not use `&&`/`||` for logical AND/OR - it uses the words `and`/`or`
 * (`||` is string concatenation instead). The plan's own worked examples
 * ("index == count - 1 && item < 8") are written in the wrong dialect; the
 * fixture's `last-heart-gate` entry is the corrected form, and
 * `javascript-and` proves the original spelling fails.
 */
import { describe, expect, it } from 'vitest';
import expressions from '../fixtures/hud-expressions.json';
import { MAX_EXPR_LENGTH, compileExpr, compileExprCacheSize } from '@shared/hud/data';

describe('compileExpr - the worked examples, corrected dialect and all', () => {
  it('compiles every valid fixture and names its free variables', () => {
    expect(compileExpr(expressions.valid['arrow-count']).ok).toBe(true);
    const heartCount = compileExpr(expressions.valid['heart-count']);
    expect(heartCount.ok && heartCount.expr.variables).toEqual(['life_max']);
    const heartFill = compileExpr(expressions.valid['heart-fill']);
    expect(heartFill.ok && [...heartFill.expr.variables].sort()).toEqual(['index', 'life_current']);
  });

  it('accepts and/or/not; the plan\'s literal && does not parse', () => {
    expect(compileExpr(expressions.valid['last-heart-gate']).ok).toBe(true);
    expect(compileExpr(expressions.invalid['javascript-and']).ok).toBe(false);
  });
});

describe('compileExpr - disabled operators really are rejected', () => {
  it('refuses assignment', () => {
    expect(compileExpr(expressions.invalid.assignment).ok).toBe(false);
  });

  it('refuses a function definition', () => {
    expect(compileExpr(expressions.invalid['function-definition']).ok).toBe(false);
  });

  it('refuses an array literal', () => {
    expect(compileExpr(expressions.invalid['array-literal']).ok).toBe(false);
  });

  it('refuses the "in" operator', () => {
    expect(compileExpr(expressions.invalid['in-operator']).ok).toBe(false);
  });

  /**
   * THE DANGEROUS HALF OF A PAIR. In expr-eval `||` concatenates strings - it is
   * not the logical or, which is `or`. Left enabled, `life_current || 0` parsed
   * clean and, with life at 11, produced the string "110" that `compile-expr`'s
   * own numeric coercion turned into 110: a wrong number with no error anywhere,
   * because the parse was valid and the variable was known. Its twin `&&` was
   * never a risk - it has no meaning in this grammar at all and says so.
   */
  it('refuses `||`, which concatenates instead of or-ing, and used to answer 110 for 11', () => {
    expect(compileExpr('life_current || 0').ok).toBe(false);
  });

  it('still refuses `&&` loudly, and still spells the real operators as words', () => {
    expect(compileExpr('life_current && 1').ok).toBe(false);
    expect(compileExpr('index == count - 1 and item < 1').ok).toBe(true);
    expect(compileExpr('armor > 1 or half_magic').ok).toBe(true);
    expect(compileExpr('not half_magic').ok).toBe(true);
  });

  /**
   * THE OTHER HALF OF `||`'s LESSON, and the second of the two `shared/`
   * one-liners the UX review asks for. `random()` parses and evaluates without
   * complaint, and produces a DIFFERENT number on every call - so a layout using
   * it cannot be previewed (the live result under the field disagrees with
   * itself between renders), cannot be diffed, and draws differently on two
   * loads of the same document. Nothing in the chain would ever have said so.
   *
   * Refused AFTER the parse, not by dropping it from `parser.functions`:
   * expr-eval has no per-function switch, and deleting the entry would only
   * demote `random` to an unknown name that fails at EVALUATE time, which is a
   * runtime surprise instead of an authoring error.
   */
  it('refuses random(), which would make a HUD non-deterministic frame to frame', () => {
    const refused = compileExpr('random()');
    expect(refused.ok).toBe(false);
    expect(refused.ok === false && refused.message).toContain('re-rolls on every frame');
    // Nested just as dead: `symbols()` names it wherever it is called from.
    expect(compileExpr('ceil(random() * life_max)').ok).toBe(false);
    // And as a bare name, which is how it would be smuggled past a check that
    // only looked for the call parens.
    expect(compileExpr('random').ok).toBe(false);
  });

  it('still allows the arithmetic and functions every worked example needs', () => {
    expect(compileExpr('1 + 2 - 3 * 4 / 5 % 6 ^ 2').ok).toBe(true);
    expect(compileExpr('ceil(1.2) + floor(1.8) + round(1.5) + abs(-1) + min(1, 2) + max(1, 2)').ok).toBe(true);
    expect(compileExpr('1 ? 2 : 3').ok).toBe(true);
  });
});

describe('compileExpr - malformed and pathological input', () => {
  it('refuses an empty or whitespace-only expression, without throwing', () => {
    expect(() => compileExpr(expressions.invalid.empty)).not.toThrow();
    expect(compileExpr(expressions.invalid.empty).ok).toBe(false);
    expect(compileExpr(expressions.invalid.whitespace).ok).toBe(false);
  });

  it('refuses an unknown-variable expression at compile time not at all - it is a syntax question', () => {
    // An unknown NAME is syntactically fine; "which names are known" is
    // validate-value.ts's job, layered on top. compile-expr only parses.
    expect(compileExpr(expressions.invalid['unknown-variable']).ok).toBe(true);
  });

  it('caps source length BEFORE parsing, so a 10 kB expression is refused, not hung on', () => {
    const huge = `${'a+'.repeat(5000)}1`;
    expect(huge.length).toBeGreaterThan(10_000);
    expect(() => compileExpr(huge)).not.toThrow();
    const result = compileExpr(huge);
    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.message).toMatch(new RegExp(`over the ${MAX_EXPR_LENGTH}-character cap`));
  });

  it('deep nesting well inside the cap compiles fine - the cap is what removes the risk', () => {
    const nested = `${'('.repeat(200)}1${')'.repeat(200)}`;
    expect(nested.length).toBeLessThan(MAX_EXPR_LENGTH);
    expect(() => compileExpr(nested)).not.toThrow();
    expect(compileExpr(nested).ok).toBe(true);
  });

  it('a parse error reports a character column expr-eval names', () => {
    const result = compileExpr(expressions.invalid['javascript-and']);
    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.column).toBeTypeOf('number');
  });
});

describe('compileExpr - the parse-once cache', () => {
  it('parses the same source once: identical results, not merely equal ones', () => {
    const source = 'life_current / 8 + arrow_current';
    const before = compileExprCacheSize();
    const first = compileExpr(source);
    const grew = compileExprCacheSize();
    const second = compileExpr(source);
    expect(grew).toBe(before + 1);
    expect(compileExprCacheSize()).toBe(grew); // second call added nothing
    expect(second).toBe(first); // same object, not a re-parse that happens to agree
  });

  it('a different source gets its own cache entry', () => {
    const before = compileExprCacheSize();
    compileExpr('slot_count + 1');
    compileExpr('slot_count + 2');
    expect(compileExprCacheSize()).toBe(before + 2);
  });
});
