/* @layer shared-game @kind logic */
import type { DungeonGameId, DungeonRecord } from '../../types';
import { dungeonIndexMaps } from './dungeon-index-maps';

const dungeonByGameId = (match: Partial<DungeonGameId>): DungeonRecord | undefined =>
  match.palaceIndex !== undefined ? dungeonIndexMaps.byPalaceIndex.get(match.palaceIndex) : undefined;

export { dungeonByGameId };
