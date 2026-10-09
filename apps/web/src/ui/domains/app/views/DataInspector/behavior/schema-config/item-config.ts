/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@ds/data';

const ITEM_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'category', 'origin', 'tier'],
  formats: { 'gameId.receiveItemId': 'hex2' },
};

export { ITEM_CONFIG };
