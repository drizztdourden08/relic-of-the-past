/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArmedAction, ArmedState, UseArmedActionParams } from './useArmedAction.type';

const useArmedAction = ({ timeoutMs, resetKey }: UseArmedActionParams) => {
  const [state, setState] = useState<ArmedState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current == null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const disarm = useCallback(() => {
    clearTimer();
    setState(null);
  }, [clearTimer]);

  const arm = useCallback((action: ArmedAction) => {
    clearTimer();
    setState({ action, key: resetKey });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setState(null);
    }, timeoutMs);
  }, [clearTimer, resetKey, timeoutMs]);

  const armed = state?.key === resetKey ? state.action : null;

  const press = useCallback((action: ArmedAction, perform: () => void) => {
    if (armed === action) {
      disarm();
      perform();
      return;
    }
    arm(action);
  }, [armed, arm, disarm]);

  useEffect(() => clearTimer, [clearTimer]);

  return { armed, press, disarm };
};

export { useArmedAction };
export type { ArmedAction };
