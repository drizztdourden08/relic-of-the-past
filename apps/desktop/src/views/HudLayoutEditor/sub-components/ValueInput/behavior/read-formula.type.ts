/* @layer renderer-components @kind types */
import type { ExprReading } from '@app/hud-layout-editing/check-expr.type';
import type { ExprProblem } from '@app/hud-layout-editing/expr-errors';

interface ReadFormulaInput {
  expr: string | null;
  scope: Readonly<Record<string, number>>;
  insideRepeat: boolean;
  extraNames?: readonly string[];
}

interface FormulaReading {
  reading: ExprReading | null;
  problem: ExprProblem | null;
  result: number | null;
}

export type { FormulaReading, ReadFormulaInput };
