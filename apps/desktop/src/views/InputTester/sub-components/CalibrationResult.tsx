/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import type { CalibrationResultProps } from './CalibrationResult.type';
import './CalibrationResult.css';

const CalibrationResult = (props: CalibrationResultProps) => {
  const { calibration } = props;
  const copyResult = useCallback(() => navigator.clipboard.writeText(JSON.stringify(calibration, null, 2)), [calibration]);
  const inputCount = Object.keys(calibration.buttons).length + Object.keys(calibration.axes).length;

  return (
    <Box className="calibration-result">
      <Box className="calibration-result__header">
        <Text className="calibration-result__title">{calibration.name}</Text>
        <Text className="calibration-result__meta">{inputCount} inputs mapped</Text>
        <Button variant="tertiary" size="sm" onClick={copyResult}>Copy JSON</Button>
      </Box>
      <Box as="pre" className="calibration-result__json">{JSON.stringify(calibration, null, 2)}</Box>
    </Box>
  );
};

export { CalibrationResult };
