/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { ControllerInputState } from '@rotp/input-mapping';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { IDLE_AXIS_SLOTS, IDLE_BUTTON_SLOTS } from '../ControllerPage.constants';

const idleStateOf = (deviceKey: string): ControllerInputState => ({
  deviceKey,
  buttons: new Array<boolean>(IDLE_BUTTON_SLOTS).fill(false),
  axes: new Array<number>(IDLE_AXIS_SLOTS).fill(0),
  timestamp: 0,
});

const useControllerInputState = (deviceKey: string): ControllerInputState => {
  const [state, setState] = useState<ControllerInputState>(
    () => getInputManager().getHidStates().get(deviceKey) ?? idleStateOf(deviceKey),
  );

  useEffect(() => getInputManager().onInputState((states) => {
    setState(states.get(deviceKey) ?? idleStateOf(deviceKey));
  }), [deviceKey]);

  return state;
};

export { useControllerInputState };
