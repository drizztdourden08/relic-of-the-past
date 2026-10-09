/* @layer renderer-app @kind constants */
import { progressTierOptions } from '@shared/game/logic/queries/progress-tier';
import type { SchemaConfig } from '@drizztdourden08/tessera/data';

const SCREEN_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'kind', 'world', 'areaId', 'locationId'],
  options: {
    'variant.progressTier': progressTierOptions(),
  },
  formats: {
    'gameId.roomIndex': 'hex4',
    'gameId.overworldIndex': 'hex2',
    'gameId.palaceIndex': 'hex2',
    'gameId.entranceId': 'hex2',
  },
  groups: [
    { id: 'identity', label: 'Identity', paths: ['id', 'name', 'gameId'] },
    { id: 'placement', label: 'Placement', paths: ['world', 'areaId', 'locationId', 'position'] },
    { id: 'classification', label: 'Classification', paths: ['kind', 'interiorKind', 'tags'] },
    { id: 'contents', label: 'Contents', paths: ['spawns', 'triggerIds', 'variant'] },
    { id: 'navigation', label: 'Navigation', paths: ['nav'] },
  ],
};

export { SCREEN_CONFIG };
