/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_MODES } from '../progressive-modes';
import type { World } from '../../world.type';
import type { ProgressiveModeSetting } from '../progressive.type';

const progressiveModesOf = (world: World): ProgressiveModeSetting =>
  world.options.progressiveModes ?? DEFAULT_PROGRESSIVE_MODES;

export { progressiveModesOf };
