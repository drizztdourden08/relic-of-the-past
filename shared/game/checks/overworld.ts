import type { CheckDefinition } from '../types';
import { LIGHT_WORLD_CHECKS } from './light-world-checks';
import { DARK_WORLD_CHECKS } from './dark-world-checks';

export { LIGHT_WORLD_CHECKS } from './light-world-checks';
export { DARK_WORLD_CHECKS } from './dark-world-checks';

export const OVERWORLD_CHECKS: CheckDefinition[] = [...LIGHT_WORLD_CHECKS, ...DARK_WORLD_CHECKS];
