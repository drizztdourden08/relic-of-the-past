/* @layer shared-game @kind logic */
import { regionRecords } from './region-records';
import type { RegionId } from '@rotp/game-data';

const bunnyImpassableRegionIds = (): readonly RegionId[] =>
  regionRecords().filter((region) => region.bunnyImpassable === true).map((region) => region.id);

export { bunnyImpassableRegionIds };
