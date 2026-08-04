/* @layer renderer-app @kind data */
/**
 * Why this override exists: `roomScreenIds` runs to dozens of entries per row,
 * so leaving it in the default column set makes every row the width of its
 * longest list. It stays available from the column picker; it just does not
 * open the table.
 */
import type { SchemaConfig } from '@ds/data';

const DUNGEON_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'fileStem', 'bossCheckId', 'prizeCheckId', 'medallionGate'],
  // Same hex convention as SCREEN_CONFIG — bossRoomId is a room id (hex4), palaceIndex isn't.
  formats: {
    'gameId.palaceIndex': 'hex2',
    'gameId.bossRoomId': 'hex4',
  },
};

export { DUNGEON_CONFIG };
