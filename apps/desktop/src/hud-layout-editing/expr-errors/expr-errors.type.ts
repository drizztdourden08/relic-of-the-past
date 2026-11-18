/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface ExprFix {
  label: Text;
  expr: string;
}

interface ExprProblem {
  message: Text;
  column?: number;
  suggestion?: Text;
  fix?: ExprFix;
}

export type { ExprProblem };
