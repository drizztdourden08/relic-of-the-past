/* @layer renderer-components @kind types */
import type { SchemaLike } from '../../data/schema/build-schema';
import type { FilterClause } from '../../data/filter/clause';

interface FilterBarProps {
  /** Either a raw field list or an already-built index — both are accepted. */
  schema: SchemaLike;
  clauses: readonly FilterClause[];
  /** Filters are data: this is the only way FilterBar reports a change. */
  onChange: (next: readonly FilterClause[]) => void;
}

export type { FilterBarProps };
