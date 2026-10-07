/* @layer renderer-app @kind data */
/**
 * The largest shape in the dataset (14 derived fields, four nested).
 * `defaultColumns` picks the identity-and-placement subset; the groups give
 * the editor a running order instead of key-insertion order.
 */
import type { SchemaConfig } from '@ds/data';

const SCREEN_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'randomizerName', 'kind', 'world', 'areaId', 'locationId'],
  // Matches the Game State panel's hex rendering (GameStatePanel.tsx).
  formats: {
    'gameId.roomIndex': 'hex4',
    'gameId.overworldIndex': 'hex2',
    'gameId.palaceIndex': 'hex2',
    'gameId.entranceId': 'hex2',
  },
  groups: [
    { id: 'identity', label: 'Identity', paths: ['id', 'randomizerName', 'gameId'] },
    { id: 'placement', label: 'Placement', paths: ['world', 'areaId', 'locationId', 'position'] },
    { id: 'classification', label: 'Classification', paths: ['kind', 'interiorKind', 'tags'] },
    { id: 'contents', label: 'Contents', paths: ['spawns', 'triggerIds', 'variant'] },
    { id: 'navigation', label: 'Navigation', paths: ['nav'] },
  ],
};

export { SCREEN_CONFIG };
