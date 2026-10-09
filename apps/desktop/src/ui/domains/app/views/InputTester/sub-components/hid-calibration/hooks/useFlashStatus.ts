/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { FLASH_DURATION_MS } from './useFlashStatus.constants';
import type { FlashStatus } from './useFlashStatus.type';

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
