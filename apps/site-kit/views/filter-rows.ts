/* @layer site-kit @kind logic */
import { compile } from '@ds/data/filter/clause';
import { compileTextSearch } from '@ds/data/filter/text-search';
import type { FilterRowsParams } from './filter-rows.type';

const filterRows = <T>(params: FilterRowsParams<T>): readonly T[] => {
  const { rows, schema, clauses, search } = params;
  const matched = rows.filter(compile(clauses, schema));
  const test = compileTextSearch(search);
  return test ? matched.filter(test) : matched;
};

export { filterRows };
export type { FilterRowsParams } from './filter-rows.type';
