/* @layer shared-game @kind logic */
import { POND_RUNGS_BY_ID } from '../pond-rungs';
import { capacityPondSpots } from '../../capacity/capacity-spots';
import type { LocationKey } from '../../location-key';
import type { PondInstance } from '../pond-instance.type';

const locationsOfPond = (pond: PondInstance): readonly LocationKey[] =>
  (pond.id === 'capacity'
    ? [...capacityPondSpots(), ...POND_RUNGS_BY_ID.capacity]
    : POND_RUNGS_BY_ID[pond.id]);

export { locationsOfPond };
