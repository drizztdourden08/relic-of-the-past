/* @layer renderer-components @kind component */
import { Box, Text, Button } from '../../../../../../../design-system/primitives';
import { CALIBRATION_STYLE, SamplingProgress } from '../../calibration-parts';
import { CENTER_GRID_PAIR, CENTER_GRID_SINGLE, STICK_RAW_CENTER, STICK_WIZARD_STYLE } from '../stick-calibration.constants';
import type { StickStepProps } from '../stick-calibration.type';
import { StickCircle } from '../StickCircle';

const StickCenterStep = ({ cal, target }: StickStepProps) => {
  const { centerDone, centerProgress, centerValues, startCenter, goToRange } = cal;
  const { calibrateLeft, calibrateRight, rawLX, rawLY, rawRX, rawRY } = cal;

  return (
    <Box>
      <Text as="p" style={CALIBRATION_STYLE.para}>
        <Text as="strong">Leave {target ? `the ${target} stick` : 'both sticks'} at rest</Text>. Don't touch {target ? 'it' : 'them'}. The software will record the idle center position.
      </Text>
      {!centerDone ? (
        <SamplingProgress progress={centerProgress} />
      ) : (
        <Box>
          <Box style={calibrateLeft && calibrateRight ? CENTER_GRID_PAIR : CENTER_GRID_SINGLE}>
            {calibrateLeft && <Box>L Center: {centerValues.lx}, {centerValues.ly}</Box>}
            {calibrateRight && <Box>R Center: {centerValues.rx}, {centerValues.ry}</Box>}
          </Box>
          <Box style={CALIBRATION_STYLE.row8}>
            <Button variant="primary" size="sm" onClick={goToRange}>Next →</Button>
            <Button variant="tertiary" size="sm" onClick={startCenter}>Redo</Button>
          </Box>
        </Box>
      )}
      <Box style={STICK_WIZARD_STYLE.circlesRowTop}>
        {calibrateLeft && <StickCircle x={(rawLX - STICK_RAW_CENTER) / STICK_RAW_CENTER} y={-(rawLY - STICK_RAW_CENTER) / STICK_RAW_CENTER} label="L Stick (raw)" />}
        {calibrateRight && <StickCircle x={(rawRX - STICK_RAW_CENTER) / STICK_RAW_CENTER} y={-(rawRY - STICK_RAW_CENTER) / STICK_RAW_CENTER} label="R Stick (raw)" />}
      </Box>
      <Box style={STICK_WIZARD_STYLE.rawRow}>
        {calibrateLeft && <Text>raw: {rawLX}, {rawLY}</Text>}
        {calibrateRight && <Text>raw: {rawRX}, {rawRY}</Text>}
      </Box>
    </Box>
  );
};

export { StickCenterStep };
