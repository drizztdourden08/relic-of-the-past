import type { Requirement } from '../../types';
import { LIGHT_WORLD_CHECK_RULES } from './light-world';
import { DARK_WORLD_CHECK_RULES } from './dark-world';
import { DUNGEON_CHECK_RULES } from './dungeons';

export { LIGHT_WORLD_CHECK_RULES } from './light-world';
export { DARK_WORLD_CHECK_RULES } from './dark-world';
export { DUNGEON_CHECK_RULES } from './dungeons';

/** Combined check rules (all worlds + dungeons). */
const CHECK_RULES: Record<string, Requirement> = {
  ...LIGHT_WORLD_CHECK_RULES,
  ...DARK_WORLD_CHECK_RULES,
  ...DUNGEON_CHECK_RULES,
};

export { CHECK_RULES };
