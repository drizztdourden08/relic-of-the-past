/* @layer bridge-wasm @kind logic */
/**
 * Check names, mapping a check id to its community-standard display name:
 * `<dungeon> - <check>` when the check belongs to a dungeon, else the check's
 * own name, with a small data-file override table for the sub-areas whose
 * standard prefix differs from their dungeon.
 */

import { all, getCheck, getDungeon } from '@shared/game/data';
import { CHECK_NAME_OVERRIDES } from './check-name-overrides.data';

const derivedName = (checkId: string): string => {
  const check = getCheck(checkId);
  if (check.dungeonId !== undefined) {
    return `${getDungeon(check.dungeonId).randomizerName} - ${check.randomizerName}`;
  }
  return check.randomizerName;
};

const standardCheckName = (checkId: string): string => {
  const name = derivedName(checkId);
  return CHECK_NAME_OVERRIDES[name] ?? name;
};

let reverseByName: Map<string, string> | null = null;

const checkIdByStandardName = (name: string): string | undefined => {
  reverseByName ??= new Map(all('check').map((check) => [standardCheckName(check.id), check.id]));
  return reverseByName.get(name);
};

export { checkIdByStandardName, standardCheckName };
