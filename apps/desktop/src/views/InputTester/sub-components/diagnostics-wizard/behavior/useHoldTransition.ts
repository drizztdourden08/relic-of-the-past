/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { HoldTransitionStatus } from '../diagnostics-wizard.type';

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
  }, [active, run]);

  return { status };
};

export { useHoldTransition };
