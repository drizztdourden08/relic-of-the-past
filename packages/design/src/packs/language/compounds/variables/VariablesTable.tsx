/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Box, Button, EmptyState, SectionHeader, SegmentedControl, TextInput } from '@drizztdourden08/tessera/primitives';
import { AddTermForm } from './AddTermForm';
import { VariableRow } from './VariableRow';
import { countByFilter } from './variable-groups/count-by-filter';
import { FILTER_ORDER, FILTER_WORDS } from './variables.constants';
import type { ChangeEvent } from 'react';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { VariableFilter, VariablesTableProps } from './variables.type';
import './VariablesTable.css';

const VariablesTable = (props: VariablesTableProps) => {
  const {
    variables, rows, used, filter, query,
    onFilterChange, onQueryChange, onChangeValue, onAddTerm, onRemoveTerm, onFindHardcoded,
  } = props;

  const counts = useMemo(() => countByFilter(variables), [variables]);
  const options = useMemo<SegmentOption<VariableFilter>[]>(
    () => FILTER_ORDER.map((id) => ({ value: id, label: `${FILTER_WORDS[id]} ${counts[id]}` })),
    [counts],
  );

  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.currentTarget.value);
  }, [onQueryChange]);

  const search = (
    <TextInput value={query} onChange={handleQuery} placeholder="Search variables..." />
  );

  return (
    <Box className="variables-table">
      <SectionHeader title={`${rows.length} of ${variables.length} variables`} action={search} />

      <Box className="variables-table__controls">
        <SegmentedControl options={options} value={filter} onChange={onFilterChange} />
        {onFindHardcoded ? (
          <Button variant="secondary" size="sm" onClick={onFindHardcoded}>
            Find hardcoded names...
          </Button>
        ) : null}
      </Box>

      <Box className="variables-table__rows">
        {rows.length === 0 ? <EmptyState message="No variable matches" /> : null}
        {rows.map((variable) => (
          <VariableRow
            key={variable.key}
            variable={variable}
            used={used[variable.key] ?? 0}
            onChangeValue={onChangeValue}
            onRemove={variable.kind === 'term' ? onRemoveTerm : undefined}
          />
        ))}
      </Box>

      {onAddTerm ? <AddTermForm onAddTerm={onAddTerm} /> : null}
    </Box>
  );
};

export { VariablesTable };
