/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { ProgressBar } from '@drizztdourden08/tessera/primitives';
import { resolveLiveControlState } from '@rotp/input-mapping';
import { SDL_AXIS } from '@rotp/game-data';
import type { SdlAxisName } from '@rotp/game-data';
import type { TriggerReadoutProps } from '../ControllerPage.type';
import { AxisActions } from './AxisActions';
import { AxisReadout } from './AxisReadout';

const percentOf = (value: number): string => `${Math.round(value * 100)}%`;

const TriggerReadout = ({ trigger, state, onCalibrate }: TriggerReadoutProps) => {
  const value = Math.min(Math.max(resolveLiveControlState(trigger, state.buttons, state.axes).value, 0), 1);
  const axisIndex: number = SDL_AXIS[trigger.position as SdlAxisName];
  const getValues = useCallback(() => [value], [value]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'trigger', axisIndex, label: trigger.label }),
    [onCalibrate, axisIndex, trigger.label],
  );
  const actions = <AxisActions label={trigger.label} getValues={getValues} onCalibrate={calibrate} />;

  return (
    <AxisReadout name={trigger.label} variant="trigger" actions={actions}>
      <ProgressBar value={value} max={1} showValue formatValue={percentOf} label={trigger.label} />
    </AxisReadout>
  );
};

export { TriggerReadout };
