/* @layer renderer-components @kind logic */
import type { PositionalTarget } from '../positional-capture.type';
import { isTriggerTarget } from './is-trigger-target';

const instructionFor = (target: PositionalTarget): string => {
  if (target.kind === 'button') return `Press "${target.label}", then let go.`;
  if (isTriggerTarget(target)) return `Press "${target.label}" all the way down, then release it.`;
  return `Rotate "${target.label}" once all the way around, then let it centre.`;
};

export { instructionFor };
