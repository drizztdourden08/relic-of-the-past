/* @layer renderer-app @kind data */
/**
 * The largest shape in the dataset (14 derived fields, four nested).
 * `defaultColumns` picks the identity-and-placement subset; the groups give
 * the editor a running order instead of key-insertion order.
 */
import { progressTierOptions } from '@shared/game/logic/queries/progress-tier';
import type { SchemaConfig } from '@ds/data';

const SCREEN_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'name', 'kind', 'world', 'areaId', 'locationId'],
  // A variant's tier is one of four values of a game byte, and derivation can
  // only see the one the dataset happens to use today, so the set is declared
  // from the enumeration that already names them and the picker offers those
  // four and nothing else. The RANGE form of the field (`[from, to]`) has no
  // control here: an array is not one of a closed set, so a variant that spans
  // tiers is still edited through the source tab.
  options: {
    'variant.progressTier': progressTierOptions(),
  },
  // Matches the Game State panel's hex rendering (GameStatePanel.tsx).
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
