/* @layer renderer-components @kind types */
import type { Scope } from '@app/hud-layout-editing/formula-scope';

interface FormulaFeedbackProps {
  expr: string;
  reads: readonly string[];
  scope: Scope;
  instances: readonly Scope[];
  result: number | null;
  outOfRange?: string;
}

export type { FormulaFeedbackProps };
