/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { resolveLiveControlState } from '@rotp/input-mapping';
import { SDL_AXIS } from '@rotp/game-data';
import type { SdlAxisName } from '@rotp/game-data';
import { AxisRecordButton, TriggerBar } from './input-cal-visuals';
import type { TriggerAxisPanelProps } from './ControllerAxes.type';

const TriggerAxisPanel = ({ trigger, state, onCalibrate }: TriggerAxisPanelProps) => {
  const live = resolveLiveControlState(trigger, state.buttons, state.axes);
  const axisIndex: number = SDL_AXIS[trigger.position as SdlAxisName];
  const liveValue = live.value;
  const getValues = useCallback(() => [liveValue], [liveValue]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'trigger', axisIndex, label: trigger.label }),
    [onCalibrate, axisIndex, trigger.label],
  );

  return (
    <Box className="input-cal__axis-col">
      <TriggerBar value={live.value} label={trigger.label} pressed={live.pressed} />
      <Box className="input-cal__axis-row">
        <AxisRecordButton getValues={getValues} label={trigger.label} />
        <Button
          variant="tertiary"
          size="sm"
          onClick={calibrate}
          title={`Calibrate ${trigger.label}`}
        >Cal</Button>
      </Box>
    </Box>
  );
};

export { TriggerAxisPanel };
