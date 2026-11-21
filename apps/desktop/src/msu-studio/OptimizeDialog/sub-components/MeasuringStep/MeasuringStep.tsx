/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { MeasuringStepProps } from './MeasuringStep.type';

const MeasuringStep = (props: MeasuringStepProps) => {
  const { progress } = props;
  const t = useT();
  return (
    <Box className="msu-optimize__step">
      <Text className="msu-optimize__note">
        {progress === null
          ? t('msu-studio:optimize.measuring')
          : t('msu-studio:optimize.measuring-file', { name: progress.fileName, index: progress.index, total: progress.total })}
      </Text>
    </Box>
  );
};

export { MeasuringStep };
