/* @layer renderer-components @kind logic */
import type { StepperStep } from '@drizztdourden08/tessera/primitives';
import { KEPT_TONE, REMOVED_TONE } from '../LadderStepper.constants';
import type { LadderStepperRung } from '../LadderStepper.type';

const stepsOf = (rungs: readonly LadderStepperRung[]): StepperStep[] =>
  rungs.map((rung) => ({
    id: rung.key,
    label: rung.label,
    tone: rung.checked ? KEPT_TONE : REMOVED_TONE,
  }));

export { stepsOf };
