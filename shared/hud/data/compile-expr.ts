/* @layer shared-hud @kind logic */
/**
 * expr-eval, hardened down to arithmetic over a fixed scope, and parsed once.
 *
 * HARDENING, why each piece is here:
 *  - `assignment`, `fndef` and `in` are disabled in the constructor. `array` is
 *    disabled too, even though the shipped `.d.ts` does not list it as a valid
 *    operator key - the compiled parser reads it at runtime regardless (see
 *    the cast below), and leaving it on would let a document build an array
 *    literal with nothing in the scope for it to hold anything useful. What
 *    remains is arithmetic, comparison, `? :` and the maths functions - the
 *    whole of what every worked example in the plan needs.
 *  - `concatenate` is disabled, and this one is a CORRECTNESS fix, not a
 *    hardening one. In expr-eval `||` joins strings; it is not the logical or,
 *    which is spelled `or`. So `life_current || 0` parsed clean, produced the
 *    STRING "110" out of 11 and 0, and this file's own `Number(value)` coercion
 *    turned it into the number 110 - a wrong value with no error anywhere in
 *    the chain, because the parse was valid and the variable was known. `&&` at
 *    least fails loudly (`Unknown character "&"`), which is what made `||` the
 *    dangerous half of the pair. Nothing a HUD formula does needs string
 *    concatenation, so the operator that only ever misleads is now refused.
 *  - `random()` is REFUSED after the parse, not before it. expr-eval has no
 *    option to drop a single function, and deleting it from `parser.functions`
 *    would only demote it to an unknown name that fails at evaluate time - a
 *    runtime surprise instead of an authoring error. A layout that re-rolls a
 *    number every frame cannot be previewed, diffed or reproduced: the stage
 *    flickers, the live result under the field disagrees with itself between
 *    renders, and two loads of the same document draw differently. So the
 *    parse succeeds, `symbols()` is asked whether `random` was named, and the
 *    refusal comes back as a sentence instead of as a lexer message.
 *  - The scope an expression evaluates against is a plain object of numbers
 *    (`resolve-value.ts` builds it). There is no object in it to reach
 *    through, so member access has nothing to find even with
 *    `allowMemberAccess` left at its default.
 *  - The source is length-capped BEFORE it reaches the parser. A
 *    recursive-descent parser given deeply nested parentheses can exhaust the
 *    call stack; every level of nesting costs at least two characters, so
 *    capping the string is what keeps that pathological input from ever
 *    reaching the recursive part of the parser at all, instead of hoping the
 *    parser survives it.
 *  - A source is parsed once and cached by its exact text. The engine calls
 *    `evaluate`, never `parse`, once a document has loaded - the cache is what
 *    makes that true; it is not an optimisation to reach for later.
 *  - Nothing here throws into the caller. A parse failure and a runtime
 *    evaluation failure both come back as values, not exceptions.
 */

import { Parser } from 'expr-eval';
import type { ParserOptions } from 'expr-eval';

/** `array` is a real operator the compiled parser checks
 * (`this.tokens.isOperatorEnabled('[')` in `dist/bundle.js`), but the shipped
 * `parser.d.ts` never grew the property for it. This is the one place that
 * gap is worked around, with the reason written down instead of a bare `any`. */
type HardenedOperators = NonNullable<ParserOptions['operators']> & { array: boolean };

/** A HUD expression is a short arithmetic formula, never a document. Every
 *  worked example in the plan is well under 100 characters; this leaves
 *  generous headroom while definitively refusing anything shaped like an
 *  attack on the parser instead of an attempt to bind a variable. */
const MAX_EXPR_LENGTH = 500;

/** Named, not inlined, so the editor's error table can pin the same list. */
const REFUSED_FUNCTIONS: readonly string[] = ['random'];

const REFUSED_MESSAGE: Readonly<Record<string, string>> = {
  random: 'random() re-rolls on every frame, so a layout using it can never be previewed, diffed or reproduced',
};

const parser = new Parser({
  operators: {
    assignment: false,
    fndef: false,
    in: false,
    array: false,
    concatenate: false,
  } as HardenedOperators,
});

interface CompiledExpr {
  /** Every free identifier the expression names - what `validate-value.ts`
   *  checks against the variable table, and what a "what makes this move?"
   *  panel lists. */
  variables: readonly string[];
  /** Never throws. A runtime failure (a name absent from `scope`, most often)
   *  is reported as `{ ok: false }` instead of propagated. */
  evaluate: (scope: Readonly<Record<string, number>>) => { ok: true; value: number } | { ok: false; message: string };
}

interface CompileError {
  ok: false;
  message: string;
  /** The character column expr-eval's own parse error reports, when it has
   *  one - the same position a hand-edited document's author would need to
   *  find the mistake. */
  column?: number;
}

interface CompileOk {
  ok: true;
  expr: CompiledExpr;
}

type CompileResult = CompileOk | CompileError;

const cache = new Map<string, CompileResult>();

/** expr-eval's own parse errors read `parse error [1:20]: ...` - `1` is
 *  always the line (an expression is one line), `20` is the column. */
const parseErrorColumn = (message: string): number | undefined => {
  const match = /\[\d+:(\d+)]/.exec(message);
  return match ? Number(match[1]) : undefined;
};

const messageOf = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const compileFresh = (source: string): CompileResult => {
  if (source.length > MAX_EXPR_LENGTH) {
    return { ok: false, message: `expression is ${source.length} characters, over the ${MAX_EXPR_LENGTH}-character cap` };
  }
  if (!source.trim()) {
    return { ok: false, message: 'expression is empty' };
  }
  let parsed;
  try {
    parsed = parser.parse(source);
  } catch (err) {
    const message = messageOf(err);
    return { ok: false, message, column: parseErrorColumn(message) };
  }
  const named = new Set(parsed.symbols());
  const refused = REFUSED_FUNCTIONS.find((fn) => named.has(fn));
  if (refused) return { ok: false, message: REFUSED_MESSAGE[refused] };

  const variables = parsed.variables();
  return {
    ok: true,
    expr: {
      variables,
      evaluate: (scope) => {
        try {
          const value = parsed.evaluate(scope as Record<string, number>);
          return { ok: true, value: typeof value === 'number' ? value : Number(value) };
        } catch (err) {
          return { ok: false, message: messageOf(err) };
        }
      },
    },
  };
};

/** Parses `source` once and remembers the result by its exact text - a
 *  document holding the same expression twice, or a value re-read on the next
 *  frame, never pays for a second parse. */
const compileExpr = (source: string): CompileResult => {
  const cached = cache.get(source);
  if (cached) return cached;
  const result = compileFresh(source);
  cache.set(source, result);
  return result;
};

/** Test-only: proves the cache is doing its job, not merely existing. */
const compileExprCacheSize = (): number => cache.size;

export { compileExpr, compileExprCacheSize, MAX_EXPR_LENGTH, REFUSED_FUNCTIONS };
export type { CompiledExpr, CompileError, CompileOk, CompileResult };
