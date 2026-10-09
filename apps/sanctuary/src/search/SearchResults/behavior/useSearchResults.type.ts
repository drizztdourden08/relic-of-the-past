/* @layer sanctuary-site @kind types */
import type { SearchCategory } from '../../search-categories';

type ResultGroup<Row> = { category: SearchCategory; rows: Row[] };

export type { ResultGroup };
