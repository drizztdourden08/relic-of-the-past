/* @layer renderer-lib @kind logic */
import { locationKeyOfCheck } from '@shared/randomizer/world/location-record';
import type { CheckRecord } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { VIRTUAL_PREFIX } from './tracker-statuses.constants';

const rowsWithoutALocation = (
  checks: readonly CheckRecord[], placement: Placement,
): CheckRecord[] => checks.filter((check) => !check.id.startsWith(VIRTUAL_PREFIX)
  && placement.locations[locationKeyOfCheck(check.id)] === undefined);

export { rowsWithoutALocation };
