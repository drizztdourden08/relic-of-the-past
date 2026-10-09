/* @layer shared-game @kind logic */
import { beamSwordReachable } from './beam-sword-reachable';
import { progressiveSettingOf } from './progressive-setting-of';
import type { World } from '../../world.type';

const isBeamless = (world: World): boolean => !beamSwordReachable(progressiveSettingOf(world));

export { isBeamless };
