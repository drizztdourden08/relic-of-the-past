/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, EmptyState, SectionHeader, SegmentedControl, TextInput } from '@ds/primitives';
import { VariableRow } from './VariableRow';
import { countByFilter } from './variable-groups/count-by-filter';
import { FILTER_ORDER, FILTER_WORDS } from './variables.constants';
import type { ChangeEvent } from 'react';
import type { SegmentOption } from '@ds/primitives';
import type { VariableFilter, VariablesTableProps } from './variables.type';
import './VariablesTable.css';

const VariablesTable = (props: VariablesTableProps) => {
  const {
    variables, rows, used, filter, query,
    onFilterChange, onQueryChange, onChangeValue, onAddTerm, onRemoveTerm, onFindHardcoded,
  } = props;

  const [draftKey, setDraftKey] = useState('');
  const [draftValue, setDraftValue] = useState('');

  const counts = useMemo(() => countByFilter(variables), [variables]);
  const options = useMemo<SegmentOption<VariableFilter>[]>(
    () => FILTER_ORDER.map((id) => ({ value: id, label: `${FILTER_WORDS[id]} ${counts[id]}` })),
    [counts],
  );

  const canAdd = draftKey.trim().length > 0 && draftValue.trim().length > 0;

  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.currentTarget.value);
  }, [onQueryChange]);

  const handleKey = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraftKey(event.currentTarget.value);
  }, []);

  const handleValue = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraftValue(event.currentTarget.value);
  }, []);

  const handleAdd = useCallback(() => {
    if (!canAdd || !onAddTerm) return;
    onAddTerm({ key: draftKey.trim(), value: draftValue.trim() });
    setDraftKey('');
    setDraftValue('');
  }, [canAdd, draftKey, draftValue, onAddTerm]);

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

      {onAddTerm ? (
        <Box className="variables-table__add">
          <TextInput
            className="variables-table__add-key"
            placeholder="new term key"
            value={draftKey}
            onChange={handleKey}
          />
          <TextInput
            className="variables-table__add-value"
            placeholder="its text"
            value={draftValue}
            onChange={handleValue}
          />
          <Button variant="secondary" size="sm" disabled={!canAdd} onClick={handleAdd}>Add term</Button>
        </Box>
      ) : null}
    </Box>
  );
};

export { VariablesTable };
