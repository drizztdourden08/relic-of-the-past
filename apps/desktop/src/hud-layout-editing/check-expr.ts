/* @layer renderer-components @kind logic */
import { compileExpr, isHudScopeExtra, isHudVariableName, suggestVariableName } from '@rotp/hud';
import { explainExprError, explainUnknownName } from './expr-errors';
import type { ExprContext, ExprReading } from './check-expr.type';

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
export type { ExprContext, ExprReading } from './check-expr.type';
