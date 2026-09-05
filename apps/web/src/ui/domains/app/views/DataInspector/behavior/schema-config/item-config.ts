/* @layer renderer-app @kind data */
/**
 * The one real misinference in the dataset: only twelve of 174 rows carry a
 * `vanillaName`, so derivation reads it as a closed enum. It is free text,
 * hence `kinds`. The column set drops two nested shapes that say nothing in a cell.
 */
import type { SchemaConfig } from '@ds/data';

const ITEM_CONFIG: SchemaConfig = {
  kinds: { vanillaName: 'string' },
  defaultColumns: ['id', 'randomizerName', 'vanillaName', 'category', 'origin', 'tier'],
  // Same hex convention as SCREEN_CONFIG: a native receive-item index byte.
  formats: { 'gameId.receiveItemId': 'hex2' },
};

export { ITEM_CONFIG };
