/* @layer tests @kind helper */
import type { RegionRecord } from '@rotp/game-data';
import type { Sink } from './record-references.type';

const regionReferences = (region: RegionRecord, take: Sink): void => {
  take('screen', 'headScreenId', region.headScreenId);
  take('dungeon', 'dungeonId', region.dungeonId);
  take('screen', 'bounds.screenId', region.bounds?.screenId);
};

export { regionReferences };
