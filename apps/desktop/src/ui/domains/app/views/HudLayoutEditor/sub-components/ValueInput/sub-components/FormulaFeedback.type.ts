/* @layer renderer-components @kind types */
import type { Scope } from '../../../behavior/formula-scope';

interface FormulaFeedbackProps {
  expr: string;
  reads: readonly string[];
  scope: Scope;
  instances: readonly Scope[];
  result: number | null;
  outOfRange?: string;
}

export type { FormulaFeedbackProps };
