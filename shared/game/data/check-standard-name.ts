/* @layer shared-game @kind logic */
/**
 * The standard name of a check: `<dungeon> - <check>` when it belongs to a dungeon, the
 * sub-area in place of the dungeon where the row carries one, else its own name. This is the
 * one place a location's name is derived, so the generator's location rules, the tracker's own
 * rule table and a stored seed all key by the same string.
 */
import { getDungeon } from './facade';
import type { CheckRecord } from './types';

/**
 * The prefix a dungeon row carries: the sub-area when it names one, the dungeon otherwise.
 * An empty sub-area drops the prefix, so the row stands under its own name alone.
 */
const standardNameOfCheck = (check: CheckRecord): string => {
  if (check.dungeonId === undefined || check.subArea === '') return check.name;
  const prefix = check.subArea ?? getDungeon(check.dungeonId).name;
  return `${prefix} - ${check.name}`;
};

export { standardNameOfCheck };
