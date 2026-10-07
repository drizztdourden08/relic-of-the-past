/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';

type ArmedAction = 'load' | 'save';

type ArmedState = { action: ArmedAction; key: string };

type UseArmedActionParams = {
  /** How long an armed button waits for its confirming click. */
  timeoutMs: number;
  /** Digest of the data the slot shows. Any change disarms without a render round-trip. */
  resetKey: string;
};

/**
 * Two-click confirmation: the first press arms one action, the second press on
 * that same action performs it. Arming another action, waiting past the
 * timeout, or showing new slot data all disarm.
 */
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

  const armed = state != null && state.key === resetKey ? state.action : null;

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
