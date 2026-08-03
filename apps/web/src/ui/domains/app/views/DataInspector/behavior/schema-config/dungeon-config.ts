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
};

export { DUNGEON_CONFIG };
