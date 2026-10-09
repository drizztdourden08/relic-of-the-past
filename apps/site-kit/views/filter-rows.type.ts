/* @layer site-kit @kind types */
import type { FilterClause } from '@ds/data/filter/clause';
import type { SchemaLike } from '@ds/data/schema/build-schema';

type FilterRowsParams<T> = {
  rows: readonly T[];
  schema: SchemaLike;
  clauses: readonly FilterClause[];
  search: string;
};

export type { FilterRowsParams };
