/* @layer renderer-components @kind types */
import type { ExprProblem } from './expr-errors';

interface ExprContext {
  insideRepeat: boolean;
  extraNames?: readonly string[];
}

interface ExprReading {
  problem: ExprProblem | null;
  reads: readonly string[];
}

export type { ExprContext, ExprReading };
