import type { Requirement } from '../../types';
import { LIGHT_WORLD_REGION_RULES } from './light-world';
import { DARK_WORLD_REGION_RULES } from './dark-world';
import { DUNGEON_REGION_RULES } from './dungeons';

export { LIGHT_WORLD_REGION_RULES } from './light-world';
export { DARK_WORLD_REGION_RULES } from './dark-world';
export { DUNGEON_REGION_RULES } from './dungeons';

/** Combined region entrance rules (all worlds + dungeons). */
const REGION_RULES: Record<string, Requirement> = {
  ...LIGHT_WORLD_REGION_RULES,
  ...DARK_WORLD_REGION_RULES,
  ...DUNGEON_REGION_RULES,
};

export { REGION_RULES };
