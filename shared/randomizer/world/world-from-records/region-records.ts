/* @layer shared-game @kind logic */
import { all } from '@shared/game/data';
import type { RegionRecord } from '@shared/game/data/types';

let ordered: readonly RegionRecord[] | null = null;

const regionRecords = (): readonly RegionRecord[] => {
  ordered ??= [...all('region')].sort((left, right) => left.id.localeCompare(right.id));
  return ordered;
};

export { regionRecords };
