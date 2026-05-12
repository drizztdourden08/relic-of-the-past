import type { CheckDefinition } from '../../types/tracker';
import { OVERWORLD_CHECKS } from './overworld';
import { DUNGEON_CHECKS } from './dungeons';

export { OVERWORLD_CHECKS } from './overworld';
export { DUNGEON_CHECKS } from './dungeons';

export const ALL_CHECKS: CheckDefinition[] = [...OVERWORLD_CHECKS, ...DUNGEON_CHECKS];

export const CHECK_BY_ID = new Map<string, CheckDefinition>(
  ALL_CHECKS.map(c => [c.id, c])
);
