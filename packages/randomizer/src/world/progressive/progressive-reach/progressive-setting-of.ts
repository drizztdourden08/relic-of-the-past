/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_SETTING } from '../progressive-families.data';
import type { World } from '../../world.type';
import type { ProgressiveSetting } from '../progressive.type';

const progressiveSettingOf = (world: World): ProgressiveSetting =>
  world.options.progressiveTiers ?? DEFAULT_PROGRESSIVE_SETTING;

export { progressiveSettingOf };
