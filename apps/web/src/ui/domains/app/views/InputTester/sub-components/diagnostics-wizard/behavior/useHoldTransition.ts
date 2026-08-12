/* @layer renderer-components @kind hook */
/**
 * Runs one async hold transition (release or restore, see
 * controller-hold-store.ts) whenever `active` becomes true, and tracks it as
 * an async status line: pending while the call is in flight, done once it
 * resolves truthy, error otherwise. Shared by step 1 (release) and step 3
 * (restore): same shape, different action and different trigger condition.
 */
import { useEffect, useState } from 'react';

type HoldTransitionStatus = 'pending' | 'done' | 'error';

const useHoldTransition = (run: () => Promise<boolean>, active: boolean) => {
  const [status, setStatus] = useState<HoldTransitionStatus>('pending');

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setStatus('pending');
    run()
      .then((ok) => { if (!cancelled) setStatus(ok ? 'done' : 'error'); })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
    // `run` is a module-level store function (stable identity); only `active`
    // should re-trigger this.
  }, [active, run]);

  return { status };
};

export { useHoldTransition };
export type { HoldTransitionStatus };
