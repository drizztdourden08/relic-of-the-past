/* @layer renderer-components @kind component */
import { Box, Image, Text } from '@drizztdourden08/tessera/primitives';
import type { LadderStepMediaProps } from '../LadderStepper.type';

const LadderStepMedia = (props: LadderStepMediaProps) => {
  const { step } = props;

  return (
    <Box className="ladder-stepper__media">
      {step.sprite !== undefined && (
        <Image className="ladder-stepper__sprite" src={step.sprite} alt="" fit="contain" pixelated aspectRatio={1} draggable={false} />
      )}
      {step.value !== undefined && <Text className="ladder-stepper__value">{step.value}</Text>}
    </Box>
  );
};

export { LadderStepMedia };
