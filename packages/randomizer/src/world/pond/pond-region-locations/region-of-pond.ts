/* @layer shared-game @kind logic */
import { getCheck } from '@rotp/game-data';
import type { CheckId, RegionId } from '@rotp/game-data';
import type { PondInstance } from '../pond-instance.type';

const regionOfPond = (pond: PondInstance): RegionId => {
  const region = getCheck(pond.slots[0].key).regionId;
  if (region === undefined) throw new Error(`pond slot with no region: ${pond.slots[0].key}`);
  return region;
};

export { regionOfPond };
