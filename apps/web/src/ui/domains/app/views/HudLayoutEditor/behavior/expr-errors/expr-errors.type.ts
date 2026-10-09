/* @layer renderer-components @kind types */
interface ExprFix {
  label: string;
  expr: string;
}

interface ExprProblem {
  message: string;
  column?: number;
  suggestion?: string;
  fix?: ExprFix;
}

export type { ExprFix, ExprProblem };
