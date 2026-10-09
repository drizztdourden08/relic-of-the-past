/* @layer shared-game @kind logic */
import { progressiveSettingOf } from './progressive-setting-of';
import { swordReachable } from './sword-reachable';
import type { World } from '../../world.type';

const isSwordless = (world: World): boolean => !swordReachable(progressiveSettingOf(world));

export { isSwordless };
