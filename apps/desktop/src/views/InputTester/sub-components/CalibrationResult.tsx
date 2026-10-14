/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import type { CalibrationResultProps } from './CalibrationResult.type';

const CalibrationResult = (props: CalibrationResultProps) => {
  const { calibration } = props;
  const copyResult = useCallback(() => navigator.clipboard.writeText(JSON.stringify(calibration, null, 2)), [calibration]);

  return (
    <Box className="input-cal__section">
      <Box className="input-cal__result">
        <Box className="input-cal__result-header">
          <Text className="input-cal__result-title">Diagnostics Report</Text>
          <Text className="input-cal__meta">
            {calibration.name}: {Object.keys(calibration.buttons).length + Object.keys(calibration.axes).length} inputs mapped
          </Text>
        </Box>
        <Box as="pre">{JSON.stringify(calibration, null, 2)}</Box>
        <Button variant="tertiary" size="sm" onClick={copyResult} className="input-cal__copy-btn">
          Copy JSON
        </Button>
      </Box>
    </Box>
  );
};

export { CalibrationResult };
