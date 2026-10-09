/* @layer shared-game @kind logic */
import { PLACEHOLDER_AREA_ID, PLACEHOLDER_LOCATION_ID } from '../../../data';
import { areaOfLocation } from '../area-locations';
import { NEEDS_AREA, NEEDS_COHERENT_LOCATION, NEEDS_LOCATION } from './screen-validity.constants';
import type { ScreenCandidate } from './screen-validity.type';

const isPlaceholder = (id: string | undefined, placeholder: string): boolean =>
  id === undefined || id === '' || id === placeholder;

const geographyBlockers = (candidate: ScreenCandidate): readonly string[] => {
  const { areaId, locationId } = candidate;
  const blockers: string[] = [];
  if (isPlaceholder(areaId, PLACEHOLDER_AREA_ID)) blockers.push(NEEDS_AREA);
  if (isPlaceholder(locationId, PLACEHOLDER_LOCATION_ID)) blockers.push(NEEDS_LOCATION);
  if (blockers.length > 0) return blockers;

  const holder = areaOfLocation(locationId as string);
  if (holder === undefined) return [NEEDS_LOCATION];
  return holder === areaId ? [] : [NEEDS_COHERENT_LOCATION];
};

export { geographyBlockers };
