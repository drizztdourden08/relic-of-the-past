/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { VariablesTable, filterVariables } from '../../variables/index';
import { countVariableUses } from '../../../behavior/entry-selectors/index';
import type { VariableFilter } from '../../variables/index';
import type { VariablesPaneProps } from '../DialogueBrowser.type';

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
