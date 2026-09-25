/* @layer renderer-components @kind logic */
/**
 * Is this expression writable as it stands, and if not, what does the author
 * need to hear? One entry point for the field, the menu and the error line, so
 * the three can never disagree about whether a formula is broken.
 *
 * IT RE-STATES `validate-value.ts`'S NAME RULE INSTEAD OF CALLING IT, and that
 * is a deliberate trade with a guard on it. `validateValue` formats its
 * findings for a FILE REPORT as `${path}.expr: ${message} at column N - in
 * "${expr}"`, and recovering a sentence from that string means parsing English
 * back apart. What is duplicated is three predicates, so
 * `hud-inspector-value-input.keep.test.ts` asserts the two agree over a table
 * of expressions: the day the rule changes on one side, the suite says so.
 */
import { compileExpr, isHudScopeExtra, isHudVariableName, suggestVariableName } from '@shared/hud/data';
import { explainExprError, explainUnknownName } from './expr-errors';
import type { ExprProblem } from './expr-errors';

interface ExprContext {
  insideRepeat: boolean;
  /** `transition.when`'s `delta`, which is valid at this one call site only. */
  extraNames?: readonly string[];
}

interface ExprReading {
  problem: ExprProblem | null;
  /** The names it actually reads, for the "what makes this move?" line. Empty
   *  while the formula does not compile, because a half-parsed name list is a guess. */
  reads: readonly string[];
}

const knownIn = (name: string, context: ExprContext): boolean => (
  isHudVariableName(name)
  || (context.insideRepeat && isHudScopeExtra(name))
  || (context.extraNames?.includes(name) ?? false)
);

const readExpr = (source: string, context: ExprContext): ExprReading => {
  const compiled = compileExpr(source);
  if (!compiled.ok) return { problem: explainExprError(source, compiled.message), reads: [] };

  const unknown = compiled.expr.variables.find((name) => !knownIn(name, context));
  if (unknown !== undefined) {
    const suggestion = suggestVariableName(unknown, context.insideRepeat);
    return { problem: explainUnknownName(source, unknown, suggestion), reads: compiled.expr.variables };
  }
  return { problem: null, reads: compiled.expr.variables };
};

export { readExpr };
export type { ExprContext, ExprReading };
