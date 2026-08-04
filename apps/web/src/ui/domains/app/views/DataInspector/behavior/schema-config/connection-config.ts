/* @layer renderer-app @kind data */
/**
 * Why this override exists: the largest collection (~1600 one-sided points)
 * and the one whose derived order reads worst — `placement` / `requirements`
 * are deep unions that swamp a row. `defaultColumns` leads with the point's
 * own screen and its partner; the groups keep the deep unions below the
 * fields that identify the record.
 */
import type { SchemaConfig } from '@ds/data';

const CONNECTION_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'kind', 'screenId', 'toConnectionId', 'canExit', 'dungeonId'],
  // Same hex convention as SCREEN_CONFIG — none of these is a room id, so hex2.
  formats: {
    'gameId.entranceId': 'hex2',
    'gameId.stairIndex': 'hex2',
    'gameId.exitId': 'hex2',
  },
  groups: [
    { id: 'identity', label: 'Identity', paths: ['id', 'kind', 'tags'] },
    { id: 'endpoints', label: 'Endpoints', paths: ['screenId', 'toConnectionId', 'canExit'] },
    { id: 'context', label: 'Context', paths: ['dungeonId', 'gatedBy', 'placement'] },
    { id: 'access', label: 'Access', paths: ['requirements'] },
    { id: 'navigation', label: 'Navigation', paths: ['nav'] },
  ],
};

export { CONNECTION_CONFIG };
