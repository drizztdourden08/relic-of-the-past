/* @layer renderer-components @kind component */
/**
 * The set's substitution list. ONE list, in place of the glossary and the menu
 * name table that came before it.
 *
 * The two old tables looked alike, could not reach each other, and forced a
 * translator to know which of them a given piece of text lived in before they
 * could change it. Everything that varies in shown text is now one row here,
 * whether it is theirs to change or the game's, and `kind` is a filter, not
 * a second table.
 *
 * Presentational. The rows arrive already filtered and counted; every edit,
 * addition, removal and the scan are reported upward.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, EmptyState, SectionHeader, SegmentedControl, TextInput } from '@ds/primitives';
import { VariableRow } from './VariableRow';
import { countByFilter, FILTER_ORDER, FILTER_WORDS } from './variable-groups';
import type { ChangeEvent } from 'react';
import type { SegmentOption } from '@ds/primitives';
import type { GlossaryTerm, Variable } from '@shared/game/language';
import type { VariableFilter } from './variable-groups';
import './VariablesTable.css';

type VariablesTableProps = {
  /** The whole list, unfiltered, since the filter lives here. */
  variables: Variable[];
  /** Already-filtered rows to draw. */
  rows: Variable[];
  /** Entries referencing each key. */
  used: Record<string, number>;
  filter: VariableFilter;
  query: string;
  onFilterChange: (filter: VariableFilter) => void;
  onQueryChange: (query: string) => void;
  onChangeValue: (variable: Variable, value: string) => void;
  onAddTerm: (term: GlossaryTerm) => void;
  onRemoveTerm: (key: string) => void;
  onFindHardcoded: () => void;
};

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
    if (!canAdd) return;
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
        <Button variant="secondary" size="sm" onClick={onFindHardcoded}>
          Find hardcoded names...
        </Button>
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
    </Box>
  );
};

export { VariablesTable };
export type { VariablesTableProps };
