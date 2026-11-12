/* @layer renderer-app @kind hook */
import { useCallback } from 'react';
import type { ListenerExtraContext } from '@drizztdourden08/brock-input/renderer';
import type { InputBinding } from '@rotp/game-data';
import { setTouchBinding } from '@rotp/input-mapping';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { toBindTarget } from './to-bind-target';

const useCommitTouchBinding = (ctx: ListenerExtraContext) => {
  const { touch, updateTouch } = useTouchControlsSettings();
  const { target, close } = ctx;

  return useCallback((binding: InputBinding | null): void => {
    updateTouch({ bindings: setTouchBinding(touch.bindings, toBindTarget(target), binding) });
    close();
  }, [touch.bindings, updateTouch, target, close]);
};

export { useCommitTouchBinding };
