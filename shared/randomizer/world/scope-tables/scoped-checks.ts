/* @layer shared-game @kind logic */
import { all } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import type { CheckScope } from './scope-tables.type';

const scopedChecks = (scope: CheckScope): readonly CheckRecord[] =>
  all('check').filter((check) => check.scope === scope);

export { scopedChecks };
