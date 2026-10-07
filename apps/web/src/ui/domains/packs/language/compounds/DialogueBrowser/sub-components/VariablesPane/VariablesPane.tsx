/* @layer renderer-components @kind component */
/** The set's variables, read only, with the table's own filter and search. */
import { useMemo, useState } from 'react';
import { VariablesTable, filterVariables } from '../../../variables';
import { countVariableUses } from '../../../../behavior/entry-selectors';
import type { DialogueEntry } from '@shared/game/language';
import type { VariableFilter } from '../../../variables';
import type { SetVariables } from '../../../../behavior/useSetVariables';

type VariablesPaneProps = {
  dialogue: DialogueEntry[];
  vars: SetVariables;
};

const VariablesPane = (props: VariablesPaneProps) => {
  const { dialogue, vars } = props;
  const [filter, setFilter] = useState<VariableFilter>('all');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => filterVariables(vars.variables, filter, query), [vars.variables, filter, query]);
  const used = useMemo(() => countVariableUses(dialogue), [dialogue]);

  return (
    <VariablesTable
      variables={vars.variables}
      rows={rows}
      used={used}
      filter={filter}
      query={query}
      onFilterChange={setFilter}
      onQueryChange={setQuery}
    />
  );
};

export { VariablesPane };
export type { VariablesPaneProps };
