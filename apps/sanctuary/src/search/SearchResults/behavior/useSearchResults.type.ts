/* @layer sanctuary-site @kind types */
import type { SearchCategory } from '../../search-categories';
import type { useSearchResults } from './useSearchResults';

type ResultGroup<Row> = { category: SearchCategory; rows: Row[] };

type SearchResultsState = ReturnType<typeof useSearchResults>;

export type { ResultGroup, SearchResultsState };
