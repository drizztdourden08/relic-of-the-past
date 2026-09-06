/* @layer renderer-components @kind component */
/**
 * The clause list for one schema: a FilterClauseCard per clause plus a
 * trailing "+ Add filter" button, laid out as a wrapping row of small cards
 * instead of one full-width line each, since a filter is a small thing, and half a
 * dozen of them should read as half a dozen small things.
 *
 * This list only ever produces and consumes plain FilterClause values through
 * onChange. Filters are data, and the compiled predicate belongs to whoever
 * renders the filtered rows, one layer up (see data/filter/clause.ts's
 * `compile`).
 *
 * A clause whose path the current schema no longer has (dropped by a schema
 * change) is skipped instead of rendered broken; pruning that clause out of
 * persisted state is a view-state concern, not this component's.
 */
import { useCallback, useMemo } from 'react';
import { toSchemaIndex } from '../../../data/schema/build-schema';
import { addClause, removeClause, updateClauseById } from '../behavior/clause-list';
import { valueForOperatorChange } from '../behavior/filter-clause-defaults';
import { AddFilterButton } from './AddFilterButton';
import { FilterClauseCard } from './FilterClauseCard';
import type { SchemaLike } from '../../../data/schema/build-schema';
import type { FilterClause } from '../../../data/filter/clause';

interface FilterClauseListProps {
  schema: SchemaLike;
  clauses: readonly FilterClause[];
  onChange: (next: readonly FilterClause[]) => void;
}

const FilterClauseList = (props: FilterClauseListProps) => {
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
    <>
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
    </>
  );
};

export { FilterClauseList };
export type { FilterClauseListProps };
