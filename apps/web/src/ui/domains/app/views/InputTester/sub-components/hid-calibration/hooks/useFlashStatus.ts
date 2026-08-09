/* @layer renderer-components @kind hook */
/** Tracks a transient 'ok'/'error' status that auto-resets to 'idle' after a
 *  short delay — lets a button show it worked without wiring up a toast system. */
import { useCallback, useState } from 'react';

type FlashStatus = 'idle' | 'ok' | 'error';
const FLASH_DURATION_MS = 2000;

const useFlashStatus = (): [FlashStatus, (ok: boolean) => void] => {
  const [status, setStatus] = useState<FlashStatus>('idle');

  const flash = useCallback((ok: boolean) => {
    setStatus(ok ? 'ok' : 'error');
    setTimeout(() => setStatus('idle'), FLASH_DURATION_MS);
  }, []);

  return [status, flash];
};

export { useFlashStatus };
export type { FlashStatus };
