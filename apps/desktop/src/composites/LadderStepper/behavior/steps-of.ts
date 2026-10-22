/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { StepperStep } from '@drizztdourden08/tessera/primitives';
import { LadderStepMedia } from '../sub-components/LadderStepMedia';
import type { LadderStep } from '../LadderStepper.type';
import type { StepsOfOptions } from './steps-of.type';

const mediaOf = (step: LadderStep) => {
  if (step.sprite === undefined && step.value === undefined) return undefined;
  return createElement(LadderStepMedia, { step });
};

const stepsOf = (steps: readonly LadderStep[], options: StepsOfOptions): StepperStep[] =>
  steps.map((step) => ({
    id: step.key,
    label: options.withLabels ? step.label : '',
    state: step.active ? 'done' : 'upcoming',
    struck: step.struck ?? false,
    media: options.withMedia ? mediaOf(step) : undefined,
  }));

export { stepsOf };
