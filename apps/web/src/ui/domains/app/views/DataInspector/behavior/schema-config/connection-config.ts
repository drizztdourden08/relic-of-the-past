/* @layer renderer-app @kind data */
/**
 * Why this override exists: the largest collection (896 rows) and the one whose
 * derived order reads worst — the two endpoints that define a crossing sit
 * between its classification fields, and `placement` / `requirements` are deep
 * unions that swamp a row. `defaultColumns` leads with the endpoints; the
 * groups put the endpoint pair together in the editor and keep the deep unions
 * below the fields that identify the record.
 */
import type { SchemaConfig } from '@ds/data';

const CONNECTION_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'kind', 'fromScreenId', 'toScreenId', 'direction', 'dungeonId'],
  groups: [
    { id: 'identity', label: 'Identity', paths: ['id', 'kind', 'tags'] },
    { id: 'endpoints', label: 'Endpoints', paths: ['fromScreenId', 'toScreenId', 'direction', 'counterpartId'] },
    { id: 'context', label: 'Context', paths: ['dungeonId', 'gatedBy', 'placement'] },
    { id: 'access', label: 'Access', paths: ['requirements'] },
    { id: 'navigation', label: 'Navigation', paths: ['nav'] },
  ],
};

export { CONNECTION_CONFIG };
