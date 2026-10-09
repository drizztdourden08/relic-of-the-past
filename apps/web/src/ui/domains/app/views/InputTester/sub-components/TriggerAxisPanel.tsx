/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import { resolveLiveControlState } from '@shared/input/family';
import type { SdlAxisName } from '@shared/input/family';
import { SDL_AXIS } from '@shared/input/sdl-buttons';
import { AxisRecordButton, TriggerBar } from './input-cal-visuals';
import type { TriggerAxisPanelProps } from './ControllerAxes.type';

const TriggerAxisPanel = ({ trigger, state, styles, onCalibrate }: TriggerAxisPanelProps) => {
  const live = resolveLiveControlState(trigger, state.buttons, state.axes);
  const axisIndex = SDL_AXIS[trigger.position as SdlAxisName];
  const liveValue = live.value;
  const getValues = useCallback(() => [liveValue], [liveValue]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'trigger', axisIndex, label: trigger.label }),
    [onCalibrate, axisIndex, trigger.label],
  );

  return (
    <Box style={styles.col}>
      <TriggerBar value={live.value} label={trigger.label} pressed={live.pressed} />
      <Box style={styles.row}>
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
