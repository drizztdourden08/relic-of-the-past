/* @layer renderer-components @kind types */
import type { Variable } from '@shared/game/language';

type VariableChoiceProps = {
  variable: Variable;
  onPick: (variable: Variable) => void;
};

export type { VariableChoiceProps };
