/* @layer renderer-components @kind types */
import type { Variable } from '@rotp/languages';

type VariableChoiceProps = {
  variable: Variable;
  onPick: (variable: Variable) => void;
};

export type { VariableChoiceProps };
