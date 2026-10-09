/* @layer shared-game @kind logic */
import { find } from '../../../data';
import type { LocationRecord } from '../../../data';

const locationsInArea = (areaId: string): readonly LocationRecord[] =>
  find('location', location => location.areaId === areaId);

export { locationsInArea };
