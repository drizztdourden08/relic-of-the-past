/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { STICK_RAW_CENTER } from '../stick-calibration.constants';
import type { StickStepProps } from '../stick-calibration.type';
import { StickCircle } from './StickCircle';

const toUnit = (raw: number): number => (raw - STICK_RAW_CENTER) / STICK_RAW_CENTER;

const StickRawPreview = ({ cal }: Pick<StickStepProps, 'cal'>) => {
  const { calibrateLeft, calibrateRight, rawLX, rawLY, rawRX, rawRY } = cal;
  return (
    <>
      <Box className="stick-cal__circles stick-cal__circles--top">
        {calibrateLeft && <StickCircle x={toUnit(rawLX)} y={-toUnit(rawLY)} label="L Stick (raw)" />}
        {calibrateRight && <StickCircle x={toUnit(rawRX)} y={-toUnit(rawRY)} label="R Stick (raw)" />}
      </Box>
      <Box className="stick-cal__raw-row">
        {calibrateLeft && <Text>raw: {rawLX}, {rawLY}</Text>}
        {calibrateRight && <Text>raw: {rawRX}, {rawRY}</Text>}
      </Box>
    </>
  );
};

export { StickRawPreview };
