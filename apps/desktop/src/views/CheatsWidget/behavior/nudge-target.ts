/* @layer renderer-widgets @kind logic */
import { rungFrom } from '../sub-components/PlayerTab/behavior/rung-from';
import type { NudgeParams } from '../CheatsWidget.type';

const nudgeTarget = ({ ladder, steps, value, dir }: NudgeParams): number | null => {
  if (ladder) return rungFrom(ladder, value, dir);
  const [step] = steps;
  return step === undefined ? null : value + dir * step;
};

export { nudgeTarget };
