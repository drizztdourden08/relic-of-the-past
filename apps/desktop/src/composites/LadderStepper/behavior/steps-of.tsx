/* @layer renderer-components @kind logic */
import { Box, Image, Text } from '@drizztdourden08/tessera/primitives';
import type { StepperStep } from '@drizztdourden08/tessera/primitives';
import type { LadderStep } from '../LadderStepper.type';

const mediaOf = (step: LadderStep) => {
  if (step.sprite === undefined && step.value === undefined) return undefined;
  return (
    <Box className="ladder-stepper__media">
      {step.sprite !== undefined && (
        <Image className="ladder-stepper__sprite" src={step.sprite} alt="" fit="contain" pixelated aspectRatio={1} draggable={false} />
      )}
      {step.value !== undefined && <Text className="ladder-stepper__value">{step.value}</Text>}
    </Box>
  );
};

const stepsOf = (steps: readonly LadderStep[]): StepperStep[] =>
  steps.map((step) => ({
    id: step.key,
    label: step.label,
    state: step.active ? 'done' : 'upcoming',
    struck: step.struck ?? false,
    media: mediaOf(step),
  }));

export { stepsOf };
