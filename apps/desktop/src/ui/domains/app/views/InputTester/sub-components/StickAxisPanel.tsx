/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { resolveLiveControlState } from '@shared/input/family';
import { AxisRecordButton, StickCircle } from './input-cal-visuals';
import type { StickAxisPanelProps } from './ControllerAxes.type';

const StickAxisPanel = ({ pair, pairIdx, state, styles, onCalibrate }: StickAxisPanelProps) => {
  const x = resolveLiveControlState(pair.xControl, state.buttons, state.axes).value;
  const y = resolveLiveControlState(pair.yControl, state.buttons, state.axes).value;
  const getValues = useCallback(() => [x, y], [x, y]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'stick', side: pairIdx === 0 ? 'left' : 'right' }),
    [onCalibrate, pairIdx],
  );

  return (
    <Box style={styles.col}>
      <StickCircle x={x} y={y} label={pair.label} iconPrefix={pair.basePrefix || undefined} />
      <Box style={styles.row}>
        <AxisRecordButton getValues={getValues} label={pair.label} />
        <Button
          variant="tertiary"
          size="sm"
          onClick={calibrate}
          title={`Calibrate ${pair.label}`}
        >Cal</Button>
      </Box>
    </Box>
  );
};

export { StickAxisPanel };
