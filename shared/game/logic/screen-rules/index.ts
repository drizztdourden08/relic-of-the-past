import type { Requirement } from '../../types';
import { LIGHT_WORLD_SCREEN_RULES } from './light-world';
import { DARK_WORLD_SCREEN_RULES } from './dark-world';
import { DUNGEON_SCREEN_RULES } from './dungeons';

export { LIGHT_WORLD_SCREEN_RULES } from './light-world';
export { DARK_WORLD_SCREEN_RULES } from './dark-world';
export { DUNGEON_SCREEN_RULES } from './dungeons';

/** Combined screen entrance rules (all worlds + dungeons). */
const SCREEN_RULES: Record<string, Requirement> = {
  ...LIGHT_WORLD_SCREEN_RULES,
  ...DARK_WORLD_SCREEN_RULES,
  ...DUNGEON_SCREEN_RULES,
};

export { SCREEN_RULES };
