/* @layer renderer-components @kind types */
import type { ExprProblem } from '@app/hud-layout-editing/expr-errors';

interface FormulaProblemProps {
  problem: ExprProblem | null;
  onFix: (expr: string) => void;
}

export type { FormulaProblemProps };
