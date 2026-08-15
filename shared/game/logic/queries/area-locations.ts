/* @layer shared-game @kind logic */
/**
 * Which locations sit inside an area, and which area holds a location.
 *
 * The relationship is stored one way only — a location record names its
 * `areaId` and an area record lists nothing — so the reverse read has to scan.
 * The collection is a few dozen records and the source array is rebuilt on
 * every dataset change, so this stays a plain filter rather than an index that
 * would need invalidating alongside it.
 */
import { find, findOne } from '../../data';
import type { AreaId, LocationRecord } from '../../data';

/** Every location filed under an area, in collection order. Empty for an area
 *  nothing has been placed in yet, which is a real answer, not a miss. */
const locationsInArea = (areaId: string): readonly LocationRecord[] =>
  find('location', location => location.areaId === areaId);

/** The area a location is filed under, or undefined when no record holds that
 *  id — a dangling reference and a placeless one are different faults. */
const areaOfLocation = (locationId: string): AreaId | undefined =>
  findOne('location', location => location.id === locationId)?.areaId;

export { areaOfLocation, locationsInArea };
