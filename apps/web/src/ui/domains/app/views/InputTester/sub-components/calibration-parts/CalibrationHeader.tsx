/* @layer renderer-components @kind component */
import { Box, Text, Button } from '../../../../../../design-system/primitives';
import { CALIBRATION_STYLE } from './calibration-parts.constants';
import type { CalibrationHeaderProps } from './calibration-parts.type';

const CalibrationHeader = ({ title, onCancel }: CalibrationHeaderProps) => (
  <Box className="input-cal__header">
    <Text className="input-cal__title">{title}</Text>
    <Box style={CALIBRATION_STYLE.row8}>
      <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>
    </Box>
  </Box>
);

export { CalibrationHeader };
