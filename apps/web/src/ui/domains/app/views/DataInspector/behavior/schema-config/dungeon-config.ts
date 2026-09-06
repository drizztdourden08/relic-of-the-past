/* @layer renderer-app @kind data */
/** `roomScreenIds` runs to dozens of entries per row, so it is left out of the
 *  default columns (still available from the column picker). */
import type { SchemaConfig } from '@ds/data';

const DUNGEON_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'fileStem', 'bossCheckId', 'prizeCheckId', 'medallionGate'],
  // Same hex convention as SCREEN_CONFIG. bossRoomId is a room id (hex4), palaceIndex isn't.
  formats: {
    'gameId.palaceIndex': 'hex2',
    'gameId.bossRoomId': 'hex4',
  },
};

export { DUNGEON_CONFIG };
