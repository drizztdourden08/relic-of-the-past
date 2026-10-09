/* @layer site-kit @kind constants */
import type { TableColumn, TableState } from '@ds/data/table/types';

const NO_COLUMNS: readonly TableColumn[] = [];
const QUERY_HALF_TABLE: TableState = { columns: [], sort: [], groupBy: [] };

export { NO_COLUMNS, QUERY_HALF_TABLE };
