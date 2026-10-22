/* @layer renderer-components @kind component */
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { SamplingProgress } from '../../calibration-parts';
import type { StickStepProps } from '../stick-calibration.type';
import { StickRawPreview } from './StickRawPreview';

const StickCenterStep = ({ cal, target }: StickStepProps) => {
  const { centerDone, centerProgress, centerValues, startCenter, goToRange, calibrateLeft, calibrateRight } = cal;
  const valuesClass = calibrateLeft && calibrateRight ? 'stick-cal__values stick-cal__values--pair' : 'stick-cal__values';

  return (
    <Box>
      <Text as="p" className="cal-wizard__para">
        <Text as="strong">Leave {target ? `the ${target} stick` : 'both sticks'} at rest</Text>. Don't touch {target ? 'it' : 'them'}. The software will record the idle center position.
      </Text>
      {!centerDone ? (
        <SamplingProgress progress={centerProgress} />
      ) : (
        <Box>
          <Box className={valuesClass}>
            {calibrateLeft && <Box>L Center: {centerValues.lx}, {centerValues.ly}</Box>}
            {calibrateRight && <Box>R Center: {centerValues.rx}, {centerValues.ry}</Box>}
          </Box>
          <Box className="cal-wizard__row">
            <Button variant="primary" size="sm" onClick={goToRange}>Next</Button>
            <Button variant="tertiary" size="sm" onClick={startCenter}>Redo</Button>
          </Box>
        </Box>
      )}
      <StickRawPreview cal={cal} />
    </Box>
  );
};

export { StickCenterStep };
