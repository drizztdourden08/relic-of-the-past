/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ButtonMappingInstructionProps } from './ButtonMapping.type';

const ButtonMappingInstruction = (props: ButtonMappingInstructionProps) => {
  const { items, activeIndex, captureState, axisSubStep, instruction, showAxisSubStep } = props;
  const showSubStep = showAxisSubStep && items[activeIndex]?.kind === 'axis' && captureState === 'waiting-press';

  return (
    <Box className="hid-cal__instruction">
      {instruction}
      {showSubStep && (
        <Text className="hid-cal__axis-sub">
          [{axisSubStep === 'pos' ? '1/2 positive' : '2/2 negative'}]
        </Text>
      )}
    </Box>
  );
};

export { ButtonMappingInstruction };
