/* @layer renderer-components @kind logic */
import { resolveValue } from '@rotp/hud';
import { readExpr } from '@app/hud-layout-editing/check-expr';
import type { FormulaReading, ReadFormulaInput } from './read-formula.type';

const readFormula = (input: ReadFormulaInput): FormulaReading => {
  const { expr, scope, insideRepeat, extraNames } = input;
  const reading = expr === null ? null : readExpr(expr, { insideRepeat, extraNames });
  const problem = reading?.problem ?? null;
  const result = expr === null || problem !== null ? null : resolveValue({ from: 'data', expr }, scope);
  return { reading, problem, result };
};

export { readFormula };
