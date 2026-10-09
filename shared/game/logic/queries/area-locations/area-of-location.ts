/* @layer shared-game @kind logic */
import { findOne } from '../../../data';
import type { AreaId } from '../../../data';

const areaOfLocation = (locationId: string): AreaId | undefined =>
  findOne('location', location => location.id === locationId)?.areaId;

export { areaOfLocation };
