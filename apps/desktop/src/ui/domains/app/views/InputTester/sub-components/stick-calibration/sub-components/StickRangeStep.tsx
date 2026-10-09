/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { CALIBRATION_STYLE } from '../../calibration-parts';
import { RANGE_GRID_PAIR, RANGE_GRID_SINGLE, STICK_WIZARD_STYLE } from '../stick-calibration.constants';
import type { StickStepProps } from '../stick-calibration.type';
import { StickCircle } from '../StickCircle';

const normalizeToRange = (raw: number, center: number, min: number, max: number) =>
  (raw - center) / Math.max(max - center, center - min, 1);

const StickRangeStep = ({ cal, target }: StickStepProps) => {
  const { rangeMinMax: mm, rangeDone, centerValues: c, setStep } = cal;
  const { calibrateLeft, calibrateRight, rawLX, rawLY, rawRX, rawRY } = cal;
  const goReview = useCallback(() => setStep('review'), [setStep]);
  const goCenter = useCallback(() => setStep('center'), [setStep]);

  return (
    <Box>
      <Text as="p" style={CALIBRATION_STYLE.para}>
        <Text as="strong">Slowly rotate {target ? `the ${target} stick` : 'both sticks'}</Text> in full circles, reaching the physical limits in all directions.
      </Text>
      <Box style={calibrateLeft && calibrateRight ? RANGE_GRID_PAIR : RANGE_GRID_SINGLE}>
        {calibrateLeft && (
          <Box>
            <Box style={STICK_WIZARD_STYLE.stickHead}>Left Stick</Box>
            <Box>X: {mm.lxMin} to {mm.lxMax} (Δ{mm.lxMax - mm.lxMin})</Box>
            <Box>Y: {mm.lyMin} to {mm.lyMax} (Δ{mm.lyMax - mm.lyMin})</Box>
          </Box>
        )}
        {calibrateRight && (
          <Box>
            <Box style={STICK_WIZARD_STYLE.stickHead}>Right Stick</Box>
            <Box>X: {mm.rxMin} to {mm.rxMax} (Δ{mm.rxMax - mm.rxMin})</Box>
            <Box>Y: {mm.ryMin} to {mm.ryMax} (Δ{mm.ryMax - mm.ryMin})</Box>
          </Box>
        )}
      </Box>
      <Box style={STICK_WIZARD_STYLE.circlesRow}>
        {calibrateLeft && <StickCircle
          x={normalizeToRange(rawLX, c.lx, mm.lxMin, mm.lxMax)}
          y={-normalizeToRange(rawLY, c.ly, mm.lyMin, mm.lyMax)}
          label="L Stick" />}
        {calibrateRight && <StickCircle
          x={normalizeToRange(rawRX, c.rx, mm.rxMin, mm.rxMax)}
          y={-normalizeToRange(rawRY, c.ry, mm.ryMin, mm.ryMax)}
          label="R Stick" />}
      </Box>
      <Box style={CALIBRATION_STYLE.actions12}>
        <Button variant="primary" size="sm" onClick={goReview} disabled={!rangeDone}>Next →</Button>
        <Button variant="tertiary" size="sm" onClick={goCenter}>← Back</Button>
        {!rangeDone && (
          <Text style={CALIBRATION_STYLE.hint}>
            Rotate {target ? `the ${target} stick` : 'both sticks'} fully to continue...
          </Text>
        )}
      </Box>
    </Box>
  );
};

export { StickRangeStep };
