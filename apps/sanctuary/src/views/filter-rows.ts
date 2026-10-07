/* @layer sanctuary-site @kind logic */
/** The rows a page shows: the clause list compiled once, then the free-text search over what is left. */
import { compile } from '@ds/data/filter/clause';
import type { FilterClause } from '@ds/data/filter/clause';
import { compileTextSearch } from '@ds/data/filter/text-search';
import type { SchemaLike } from '@ds/data/schema/build-schema';

type FilterRowsParams<T> = {
  rows: readonly T[];
  schema: SchemaLike;
  clauses: readonly FilterClause[];
  search: string;
};

const filterRows = <T>(params: FilterRowsParams<T>): readonly T[] => {
  const { rows, schema, clauses, search } = params;
  const matched = rows.filter(compile(clauses, schema));
  const test = compileTextSearch(search);
  return test ? matched.filter(test) : matched;
};

export { filterRows };
export type { FilterRowsParams };
