/* @layer renderer-app @kind data */
/** Twelve derived fields, several deep unions or free prose that mean nothing
 *  at a glance. The default columns are what a reader scans by. */
import type { SchemaConfig } from '@ds/data';

const CHECK_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'kind', 'screenId', 'dungeonId', 'vanillaItemIds'],
  // Same hex convention as SCREEN_CONFIG. roomId is a room id (hex4), chestIndex isn't.
  formats: {
    'gameId.roomId': 'hex4',
    'gameId.chestIndex': 'hex2',
  },
};

export { CHECK_CONFIG };
