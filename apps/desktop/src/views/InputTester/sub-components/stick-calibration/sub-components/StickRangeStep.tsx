/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import type { StickStepProps } from '../stick-calibration.type';
import { StickCircle } from './StickCircle';

const normalizeToRange = (raw: number, center: number, min: number, max: number) =>
  (raw - center) / Math.max(max - center, center - min, 1);

const StickRangeStep = ({ cal, target }: StickStepProps) => {
  const { rangeMinMax: mm, rangeDone, centerValues: c, setStep } = cal;
  const { calibrateLeft, calibrateRight, rawLX, rawLY, rawRX, rawRY } = cal;
  const goReview = useCallback(() => setStep('review'), [setStep]);
  const goCenter = useCallback(() => setStep('center'), [setStep]);
  const valuesClass = calibrateLeft && calibrateRight ? 'stick-cal__values stick-cal__values--pair' : 'stick-cal__values';

  return (
    <Box>
      <Text as="p" className="cal-wizard__para">
        <Text as="strong">Slowly rotate {target ? `the ${target} stick` : 'both sticks'}</Text> in full circles to the edge.
      </Text>
      <Box className={`${valuesClass} stick-cal__values--range`}>
        {calibrateLeft && (
          <Box>
            <Box className="stick-cal__stick-head">Left Stick</Box>
            <Box>X: {mm.lxMin} to {mm.lxMax} (Δ{mm.lxMax - mm.lxMin})</Box>
            <Box>Y: {mm.lyMin} to {mm.lyMax} (Δ{mm.lyMax - mm.lyMin})</Box>
          </Box>
        )}
        {calibrateRight && (
          <Box>
            <Box className="stick-cal__stick-head">Right Stick</Box>
            <Box>X: {mm.rxMin} to {mm.rxMax} (Δ{mm.rxMax - mm.rxMin})</Box>
            <Box>Y: {mm.ryMin} to {mm.ryMax} (Δ{mm.ryMax - mm.ryMin})</Box>
          </Box>
        )}
      </Box>
      <Box className="stick-cal__circles">
        {calibrateLeft && <StickCircle
          x={normalizeToRange(rawLX, c.lx, mm.lxMin, mm.lxMax)}
          y={-normalizeToRange(rawLY, c.ly, mm.lyMin, mm.lyMax)}
          label="L Stick" />}
        {calibrateRight && <StickCircle
          x={normalizeToRange(rawRX, c.rx, mm.rxMin, mm.rxMax)}
          y={-normalizeToRange(rawRY, c.ry, mm.ryMin, mm.ryMax)}
          label="R Stick" />}
      </Box>
      <Box className="cal-wizard__actions">
        <Button variant="primary" size="sm" onClick={goReview} disabled={!rangeDone}>Next</Button>
        <Button variant="tertiary" size="sm" onClick={goCenter}>Back</Button>
        {!rangeDone && (
          <Text className="cal-wizard__hint">
            Rotate {target ? `the ${target} stick` : 'both sticks'} fully to continue...
          </Text>
        )}
      </Box>
    </Box>
  );
};

export { StickRangeStep };
