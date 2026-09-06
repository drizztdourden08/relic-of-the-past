/* @layer renderer-components @kind component */
/**
 * A FilterClauseCard per clause plus "+ Add filter". Filters are data: the
 * compiled predicate belongs to whoever renders the rows (see `compile` in
 * data/filter/clause.ts). A clause whose path the schema no longer has is
 * skipped; pruning it from persisted state is a view-state concern.
 */
import { useCallback, useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { toSchemaIndex } from '../../data/schema/build-schema';
import { addClause, removeClause, updateClauseById } from './behavior/clause-list';
import { valueForOperatorChange } from './behavior/filter-clause-defaults';
import { AddFilterButton } from './sub-components/AddFilterButton';
import { FilterClauseCard } from './sub-components/FilterClauseCard';
import type { FilterBarProps } from './FilterBar.type';
import type { FilterClause } from '../../data/filter/clause';
import './FilterBar.css';

const FilterBar = (props: FilterBarProps) => {
  const { schema, clauses, onChange } = props;
  const index = useMemo(() => toSchemaIndex(schema), [schema]);
  const filteredPaths = useMemo(() => clauses.map((clause) => clause.path), [clauses]);

  const updateClause = useCallback((id: string, patch: Partial<FilterClause>) => {
    onChange(updateClauseById(clauses, id, patch));
  }, [clauses, onChange]);

  const handleOperatorChange = useCallback((clause: FilterClause, nextOp: string) => {
    const field = index.byPath(clause.path);
    const nextValue = field
      ? valueForOperatorChange({ kind: field.kind, previousOp: clause.op, nextOp, currentValue: clause.value })
      : clause.value;
    updateClause(clause.id, { op: nextOp, value: nextValue });
  }, [index, updateClause]);

  const handleRemove = useCallback((id: string) => {
    onChange(removeClause(clauses, id));
  }, [clauses, onChange]);

  const handleAdd = useCallback((clause: FilterClause) => {
    onChange(addClause(clauses, clause));
  }, [clauses, onChange]);

  return (
    <Box className="filter-bar">
      {clauses.map((clause) => {
        const field = index.byPath(clause.path);
        if (!field) return null;
        return (
          <FilterClauseCard
            key={clause.id}
            field={field}
            clause={clause}
            onChangeOperator={(nextOp) => handleOperatorChange(clause, nextOp)}
            onChangeValue={(value) => updateClause(clause.id, { value })}
            onChangeCaseSensitive={(caseSensitive) => updateClause(clause.id, { caseSensitive })}
            onToggleEnabled={(enabled) => updateClause(clause.id, { enabled })}
            onRemove={() => handleRemove(clause.id)}
          />
        );
      })}
      <AddFilterButton schema={index} excludePaths={filteredPaths} onAdd={handleAdd} />
    </Box>
  );
};

export { FilterBar };
