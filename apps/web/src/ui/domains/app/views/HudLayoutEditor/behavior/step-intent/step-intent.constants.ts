/* @layer renderer-components @kind constants */
import type { StepDirection } from './step-intent.type';

const STEP_KEYS: Readonly<Record<string, StepDirection>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'out',
  ArrowRight: 'in',
};

const ARROW: Readonly<Record<StepDirection, string>> = {
  up: '↑', down: '↓', out: '←', in: '→',
};

export { ARROW, STEP_KEYS };
