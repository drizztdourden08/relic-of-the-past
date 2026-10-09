/* @layer shared-game @kind logic */
import { ProgressiveTierError } from './progressive-tier-error';
import { unrollableTickSetReasons } from './unrollable-tick-set-reasons';
import type { ProgressiveSetting } from '../progressive.type';

const assertRollableTickSet = (setting: ProgressiveSetting): void => {
  const reasons = unrollableTickSetReasons(setting);
  if (reasons.length > 0) throw new ProgressiveTierError(reasons);
};

export { assertRollableTickSet };
