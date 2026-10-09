/* @layer renderer-components @kind types */
import type { Token, Variable } from '@rotp/languages';

type VariablePopoverProps = {
  label: string;
  variables: Variable[];
  onInsert: (tokens: Token[]) => void;
};

export type { VariablePopoverProps };
