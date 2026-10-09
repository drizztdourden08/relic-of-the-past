/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { RegionRecord } from '@rotp/game-data';

let ordered: readonly RegionRecord[] | null = null;

const regionRecords = (): readonly RegionRecord[] => {
  ordered ??= [...all('region')].sort((left, right) => left.id.localeCompare(right.id));
  return ordered;
};

export { regionRecords };
