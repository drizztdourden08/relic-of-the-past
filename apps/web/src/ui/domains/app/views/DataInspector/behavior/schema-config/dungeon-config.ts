/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@drizztdourden08/tessera/data';

const DUNGEON_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'fileStem', 'bossCheckId', 'prizeCheckId', 'medallionGate'],
  formats: {
    'gameId.palaceIndex': 'hex2',
    'gameId.bossRoomId': 'hex4',
  },
};

export { DUNGEON_CONFIG };
