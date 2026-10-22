/* @layer renderer-components @kind logic */
import { Image } from '@drizztdourden08/tessera/primitives';
import type { StepperStep } from '@drizztdourden08/tessera/primitives';
import type { LadderStepperRung } from '../LadderStepper.type';

const stepsOf = (rungs: readonly LadderStepperRung[]): StepperStep[] =>
  rungs.map((rung) => ({
    id: rung.key,
    label: rung.label,
    state: rung.checked ? 'done' : 'upcoming',
    struck: !rung.checked,
    media: rung.sprite === undefined
      ? undefined
      : <Image className="ladder-stepper__sprite" src={rung.sprite} alt="" fit="contain" pixelated aspectRatio={1} draggable={false} />,
  }));

export { stepsOf };
