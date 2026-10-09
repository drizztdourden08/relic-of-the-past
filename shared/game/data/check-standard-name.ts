/* @layer shared-game @kind logic */
import { getDungeon } from './facade';
import type { CheckRecord } from './types';

const standardNameOfCheck = (check: CheckRecord): string => {
  if (check.dungeonId === undefined || check.subArea === '') return check.name;
  const prefix = check.subArea ?? getDungeon(check.dungeonId).name;
  return `${prefix} - ${check.name}`;
};

export { standardNameOfCheck };
