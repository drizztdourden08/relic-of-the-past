/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { CALIBRATION_STYLE, PERCENT, PROGRESS_FILL } from './calibration-parts.constants';
import type { SamplingProgressProps } from './calibration-parts.type';

const SamplingProgress = ({ progress }: SamplingProgressProps) => {
  const fillStyle = useMemo(() => ({ ...PROGRESS_FILL, width: `${progress * PERCENT}%` }), [progress]);
  return (
    <Box>
      <Box style={CALIBRATION_STYLE.progressTrack}>
        <Box style={fillStyle} />
      </Box>
      <Text style={CALIBRATION_STYLE.sampling}>Sampling... {Math.round(progress * PERCENT)}%</Text>
    </Box>
  );
};

export { SamplingProgress };
