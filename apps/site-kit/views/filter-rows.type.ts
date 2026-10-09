/* @layer site-kit @kind types */
import type { FilterClause, SchemaLike } from '@drizztdourden08/tessera/data';

type FilterRowsParams<T> = {
  rows: readonly T[];
  schema: SchemaLike;
  clauses: readonly FilterClause[];
  search: string;
};

export type { FilterRowsParams };
