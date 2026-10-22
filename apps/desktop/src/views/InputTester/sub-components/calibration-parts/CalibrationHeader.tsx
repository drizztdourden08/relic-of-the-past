/* @layer renderer-components @kind component */
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import type { CalibrationHeaderProps } from './calibration-parts.type';
import './CalibrationHeader.css';

const CalibrationHeader = ({ title, onCancel }: CalibrationHeaderProps) => (
  <Box className="input-cal__header">
    <Text className="input-cal__title">{title}</Text>
    <Box className="cal-wizard__row">
      <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>
    </Box>
  </Box>
);

export { CalibrationHeader };
