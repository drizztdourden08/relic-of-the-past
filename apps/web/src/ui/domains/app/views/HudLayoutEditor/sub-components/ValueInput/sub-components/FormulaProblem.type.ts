/* @layer renderer-components @kind types */
import type { ExprProblem } from '../../../behavior/expr-errors';

interface FormulaProblemProps {
  problem: ExprProblem | null;
  onFix: (expr: string) => void;
}

export type { FormulaProblemProps };
