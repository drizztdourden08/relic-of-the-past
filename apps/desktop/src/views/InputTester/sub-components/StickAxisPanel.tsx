/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { resolveLiveControlState } from '@rotp/input-mapping';
import { AxisRecordButton } from './input-cal-visuals';
import type { StickAxisPanelProps } from './ControllerCalRow.type';

const StickAxisPanel = ({ pair, pairIdx, state, onCalibrate }: StickAxisPanelProps) => {
  const x = resolveLiveControlState(pair.xControl, state.buttons, state.axes).value;
  const y = resolveLiveControlState(pair.yControl, state.buttons, state.axes).value;
  const getValues = useCallback(() => [x, y], [x, y]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'stick', side: pairIdx === 0 ? 'left' : 'right' }),
    [onCalibrate, pairIdx],
  );

  return (
    <Box className="input-cal__cal-item">
      <Text className="input-cal__cal-item-label">{pair.label}</Text>
      <AxisRecordButton getValues={getValues} label={pair.label} />
      <Button variant="tertiary" size="sm" onClick={calibrate} title={`Calibrate ${pair.label}`}>Cal</Button>
    </Box>
  );
};

export { StickAxisPanel };
