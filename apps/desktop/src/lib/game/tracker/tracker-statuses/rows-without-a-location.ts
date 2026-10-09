/* @layer renderer-lib @kind logic */
import { locationKeyOfCheck } from '@rotp/randomizer';
import type { CheckRecord } from '@rotp/game-data';
import type { Placement } from '@rotp/randomizer';
import { VIRTUAL_PREFIX } from './tracker-statuses.constants';

const rowsWithoutALocation = (
  checks: readonly CheckRecord[], placement: Placement,
): CheckRecord[] => checks.filter((check) => !check.id.startsWith(VIRTUAL_PREFIX)
  && placement.locations[locationKeyOfCheck(check.id)] === undefined);

export { rowsWithoutALocation };
