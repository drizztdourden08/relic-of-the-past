/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { MeasuringStepProps } from './MeasuringStep.type';

const MeasuringStep = (props: MeasuringStepProps) => {
  const { progress } = props;
  return (
    <Box className="msu-optimize__step">
      <Text className="msu-optimize__note">
        {progress === null
          ? 'Measuring...'
          : `Measuring ${progress.fileName} (${progress.index} of ${progress.total})`}
      </Text>
    </Box>
  );
};

export { MeasuringStep };
