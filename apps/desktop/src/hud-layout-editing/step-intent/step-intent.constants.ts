/* @layer renderer-components @kind constants */
import type { IconName, ShortcutKey } from '@drizztdourden08/tessera/primitives';
import type { StepDirection } from './step-intent.type';

const STEP_KEYS: Readonly<Record<string, StepDirection>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'out',
  ArrowRight: 'in',
};

const STEP_ICON: Readonly<Record<StepDirection, IconName>> = {
  up: 'arrow-up', down: 'arrow-down', out: 'arrow-left', in: 'arrow-right',
};

const STEP_KEY: Readonly<Record<StepDirection, ShortcutKey>> = {
  up: 'up', down: 'down', out: 'left', in: 'right',
};

export { STEP_ICON, STEP_KEY, STEP_KEYS };
