/* @layer shared-game @kind logic */
import type { CheckDefinition } from '../types';
import { OVERWORLD_CHECKS } from './overworld';
import { DUNGEON_CHECKS } from './dungeons';

export { OVERWORLD_CHECKS } from './overworld';
export { DUNGEON_CHECKS } from './dungeons';

const ALL_CHECKS: CheckDefinition[] = [...OVERWORLD_CHECKS, ...DUNGEON_CHECKS];

const CHECK_BY_ID = new Map<string, CheckDefinition>(
  ALL_CHECKS.map(c => [c.id, c])
);

export * from './tags';
export * from './grouping';
export * from './flags';
export type { PresenceCondition, BitState } from './presence-condition';

export { ALL_CHECKS, CHECK_BY_ID };
