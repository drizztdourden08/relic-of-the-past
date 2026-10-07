/* @layer shared-hud @kind logic */
/**
 * `Value` + a data scope -> a number the engine can act on without checking it
 * for sanity itself. This is the one seam between "whatever an expression
 * produced" and every downstream consumer (a size, a repeat count, an
 * opacity), so it is the only place that seam needs guarding.
 *
 * THE CLAMP, decided and documented here because nowhere else needs to repeat
 * the reasoning: a result outside ±1,000,000 is folded to that bound, and a
 * result with no numeric meaning (`NaN`, or a compile/evaluate failure) folds
 * to 0.
 *
 *  - 1,000,000 is comfortably above every legitimate `Value` this document
 *    model has - SNES-pixel sizes and offsets, heart/arrow/rupee counts, a
 *    slot number - so no honest expression is ever clipped by it. It exists
 *    to stop `1/0` becoming a repeat count of `Infinity`, i.e. a document
 *    that tries to draw an unbounded number of nodes, while staying a real,
 *    finite, arithmetically ordinary number instead of a sentinel a caller
 *    has to special-case.
 *  - 0 for `NaN` (from `0/0`, or from a failed parse or evaluation) instead
 *    of the same 1,000,000 bound: a `NaN` carries no sign to preserve, and 0
 *    is the same safe-empty answer a zero-width box or a zero-count repeat
 *    already gives. It draws nothing instead of drawing something built
 *    from a number nobody chose.
 *  - Negative results are NOT clamped to zero here. Plenty of legitimate
 *    values are negative on purpose (an `Edges` entry hangs art outside its
 *    box; an animation's `x`/`y` moves a node left or up) - resolving to a
 *    negative number is correct, ordinary behaviour for this function. A
 *    caller that means "this is a COUNT, and a count is never negative" (a
 *    `repeat`, once phase 3 adds it) applies that rule itself, at the one
 *    place it is true, instead of this function guessing every caller wants
 *    the same floor.
 */

import { compileExpr } from './compile-expr';
import type { Value } from '../../types/hud/hud-value';

const MAX_SAFE_RESULT = 1_000_000;

const clampFinite = (n: number): number => {
  if (Number.isNaN(n)) return 0;
  if (n === Infinity) return MAX_SAFE_RESULT;
  if (n === -Infinity) return -MAX_SAFE_RESULT;
  if (n > MAX_SAFE_RESULT) return MAX_SAFE_RESULT;
  if (n < -MAX_SAFE_RESULT) return -MAX_SAFE_RESULT;
  return n;
};

/**
 * Resolves one `Value` against `scope`. Never throws: a literal number is
 * clamped and returned; an expression that fails to compile, fails to
 * evaluate, or evaluates to something with no numeric reading all fold to the
 * documented default (0) instead of reaching the caller as an exception.
 */
const resolveValue = (value: Value, scope: Readonly<Record<string, number>>): number => {
  if (typeof value === 'number') return clampFinite(value);

  // A value that is neither a number nor `{ from: 'data', expr: string }` is a
  // malformed document, and this function's contract is that NOTHING throws
  // into the layout pass. It used to: a grid's `gap: { x, y }` left on a flex
  // container reached `compileExpr(undefined)` and took the whole editor down
  // (`convert-engine.ts`). The validator is where a bad shape is reported; here
  // it folds to the documented default like every other unanswerable value.
  if (typeof value !== 'object' || value === null || typeof value.expr !== 'string') return 0;

  const compiled = compileExpr(value.expr);
  if (!compiled.ok) return 0;

  const result = compiled.expr.evaluate(scope);
  if (!result.ok) return 0;

  return clampFinite(result.value);
};

export { clampFinite, MAX_SAFE_RESULT, resolveValue };
