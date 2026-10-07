/* @layer renderer-app @kind data */
/**
 * The column set drops two nested shapes that say nothing in a cell.
 */
import type { SchemaConfig } from '@ds/data';

const ITEM_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'category', 'origin', 'tier'],
  // Same hex convention as SCREEN_CONFIG: a native receive-item index byte.
  formats: { 'gameId.receiveItemId': 'hex2' },
};

export { ITEM_CONFIG };
