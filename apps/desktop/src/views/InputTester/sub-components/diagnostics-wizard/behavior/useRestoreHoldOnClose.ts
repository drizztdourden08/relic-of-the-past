/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import type { HoldTransitionStatus } from '../diagnostics-wizard.type';
import { restoreHold } from './restore-hold';

const useRestoreHoldOnClose = (open: boolean, restoreStatus: HoldTransitionStatus) => {
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (wasOpenRef.current && !open && restoreStatus !== 'done') {
      restoreHold().catch(() => {});
    }
    wasOpenRef.current = open;
  }, [open, restoreStatus]);
};

export { useRestoreHoldOnClose };
