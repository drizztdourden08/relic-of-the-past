/* @layer renderer-components @kind types */
import type { GlossaryTerm, Variable, VariableKind } from '@shared/game/language';

type VariableFilter = 'all' | VariableKind;

type VariableRowProps = {
  variable: Variable;
  used: number;
  onChangeValue?: (variable: Variable, value: string) => void;
  onRemove?: (key: string) => void;
};

type VariablesTableProps = {
  variables: Variable[];
  rows: Variable[];
  used: Record<string, number>;
  filter: VariableFilter;
  query: string;
  onFilterChange: (filter: VariableFilter) => void;
  onQueryChange: (query: string) => void;
  onChangeValue?: (variable: Variable, value: string) => void;
  onAddTerm?: (term: GlossaryTerm) => void;
  onRemoveTerm?: (key: string) => void;
  onFindHardcoded?: () => void;
};

export type { VariableFilter, VariableRowProps, VariablesTableProps };
