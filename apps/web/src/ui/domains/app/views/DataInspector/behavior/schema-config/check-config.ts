/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@ds/data';

const CHECK_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'kind', 'screenId', 'dungeonId', 'vanillaItemIds'],
  formats: {
    'gameId.roomId': 'hex4',
    'gameId.chestIndex': 'hex2',
  },
};

export { CHECK_CONFIG };
