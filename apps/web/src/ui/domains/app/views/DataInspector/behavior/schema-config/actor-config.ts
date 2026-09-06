/* @layer renderer-app @kind data */
/** `gameId` and `clearedBy` are nested shapes that say nothing in a cell;
 *  `effect` is what distinguishes two rows. Column choice only. */
import type { SchemaConfig } from '@ds/data';

const ACTOR_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'kind', 'effect'],
  // Same hex convention as SCREEN_CONFIG. A native sprite type byte, not a room id.
  formats: { 'gameId.spriteType': 'hex2' },
};

export { ACTOR_CONFIG };
