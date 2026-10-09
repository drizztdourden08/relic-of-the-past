/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@ds/data';

const CONNECTION_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'kind', 'screenId', 'toConnectionId', 'canExit', 'dungeonId'],
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
