/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { controllerInputStore } from '@app/input/controller-input-store';
import type { ControllerJoystickSample } from '@drizztdourden08/brock-input';
import { processPositionalSample } from './process-positional-sample';
import type { PositionalSession } from './positional-capture.type';

const usePositionalInput = (session: PositionalSession, deviceKey: string | null, active: boolean) => {
  const { refs, setItems, answerActive } = session;

  useEffect(() => {
    if (!active || !deviceKey) return;
    const unsub = controllerInputStore.onInput((state) => {
      if (state.deviceKey !== deviceKey) return;
      const sample: ControllerJoystickSample = { id: 0, buttons: state.buttons, axes: state.axes, hats: [] };
      processPositionalSample({ refs, sample, onAnswer: answerActive, onItemsChange: setItems });
    });
    return unsub;
  }, [active, deviceKey, refs, setItems, answerActive]);
};

export { usePositionalInput };
