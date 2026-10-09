/* @layer store-site @kind constants */
import type { TableColumn } from '@ds/data/table/types';
import { ITEM_SORTS } from '../../../catalog/item-schema';

const NO_COLUMNS: readonly TableColumn[] = [];
const DEFAULT_SORT = ITEM_SORTS[0];

export { NO_COLUMNS, DEFAULT_SORT };
