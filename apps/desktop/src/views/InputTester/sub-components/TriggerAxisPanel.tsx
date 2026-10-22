/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { resolveLiveControlState } from '@rotp/input-mapping';
import { SDL_AXIS } from '@rotp/game-data';
import type { SdlAxisName } from '@rotp/game-data';
import { AxisRecordButton } from './input-cal-visuals';
import type { TriggerAxisPanelProps } from './ControllerCalRow.type';

const TriggerAxisPanel = ({ trigger, state, onCalibrate }: TriggerAxisPanelProps) => {
  const liveValue = resolveLiveControlState(trigger, state.buttons, state.axes).value;
  const axisIndex: number = SDL_AXIS[trigger.position as SdlAxisName];
  const getValues = useCallback(() => [liveValue], [liveValue]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'trigger', axisIndex, label: trigger.label }),
    [onCalibrate, axisIndex, trigger.label],
  );

  return (
    <Box className="input-cal__cal-item">
      <Text className="input-cal__cal-item-label">{trigger.label}</Text>
      <AxisRecordButton getValues={getValues} label={trigger.label} />
      <Button variant="tertiary" size="sm" onClick={calibrate} title={`Calibrate ${trigger.label}`}>Cal</Button>
    </Box>
  );
};

export { TriggerAxisPanel };
