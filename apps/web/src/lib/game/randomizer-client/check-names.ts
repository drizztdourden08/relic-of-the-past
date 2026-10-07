/* @layer bridge-wasm @kind logic */
/**
 * Check names, mapping a check id to its community-standard display name:
 * `<dungeon> - <check>` when the check belongs to a dungeon, else the check's
 * own name, with a small data-file override table for the sub-areas whose
 * standard prefix differs from their dungeon.
 *
 * The record form takes the CheckRecord itself, so it also answers for a
 * record the registry does not hold: a virtual row the tracker mints for a
 * location with no check of its own (virtual-locations.ts).
 */

import { all, getCheck, getDungeon } from '@shared/game/data';
import type { CheckRecord } from '@shared/game/data';
import { CHECK_NAME_OVERRIDES } from './check-name-overrides.data';

const derivedName = (check: CheckRecord): string => (check.dungeonId === undefined
  ? check.randomizerName
  : `${getDungeon(check.dungeonId).randomizerName} - ${check.randomizerName}`);

/** The standard name of one record, registered or minted. */
const standardNameOfCheck = (check: CheckRecord): string => {
  const name = derivedName(check);
  return CHECK_NAME_OVERRIDES[name] ?? name;
};

const standardCheckName = (checkId: string): string => standardNameOfCheck(getCheck(checkId));

let reverseByName: Map<string, string> | null = null;

const checkIdByStandardName = (name: string): string | undefined => {
  reverseByName ??= new Map(all('check').map((check) => [standardCheckName(check.id), check.id]));
  return reverseByName.get(name);
};

export { checkIdByStandardName, standardCheckName, standardNameOfCheck };
