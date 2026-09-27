/* @layer bridge-wasm @kind logic */
/**
 * Check names, mapping a check id to its community-standard display name:
 * `<dungeon> - <check>` when the check belongs to a dungeon, else the check's
 * own name, with a small data-file override table for the sub-areas whose
 * standard prefix differs from their dungeon (the shared check-standard-name).
 *
 * The record form takes the CheckRecord itself, so it also answers for a
 * record the registry does not hold: a virtual row the tracker mints for a
 * location with no check of its own (virtual-locations.ts).
 */

import { all, getCheck } from '@shared/game/data';
import { standardNameOfCheck } from '@shared/game/data/check-standard-name';
import type { CheckId } from '@shared/game/data';
import type { LocationKey } from '@shared/randomizer/world/location-key';

const standardCheckName = (checkId: string): string => standardNameOfCheck(getCheck(checkId));

/**
 * The locations a run counts as taken: the completed checks, plus the locations the
 * substitution seam reported, which are the only word on a row no check record covers (a
 * shelf, a pond prize past the reference's two). Two callers need exactly this set, the rules
 * engine's collected state and the receipt lines' found/total.
 */
const completedLocationKeys = (
  completedChecks: Iterable<CheckId>, firedLocationKeys: Iterable<LocationKey> = [],
): Set<LocationKey> => {
  const keys = new Set<LocationKey>();
  for (const checkId of completedChecks) keys.add(checkId);
  for (const key of firedLocationKeys) keys.add(key);
  return keys;
};

let reverseByName: Map<string, string> | null = null;

const checkIdByStandardName = (name: string): string | undefined => {
  reverseByName ??= new Map(all('check').map((check) => [standardCheckName(check.id), check.id]));
  return reverseByName.get(name);
};

export { checkIdByStandardName, completedLocationKeys, standardCheckName, standardNameOfCheck };
