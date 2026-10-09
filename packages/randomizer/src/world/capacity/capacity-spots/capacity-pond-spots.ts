/* @layer shared-game @kind logic */
import { getCheck } from '@rotp/game-data';
import { capacitySpots } from './capacity-spots';
import type { LocationKey } from '../../location-key';

const capacityPondSpots = (): readonly LocationKey[] =>
  [...capacitySpots().values()]
    .filter((id) => getCheck(id).pond !== undefined)
    .sort((a, b) => a.localeCompare(b));

export { capacityPondSpots };
