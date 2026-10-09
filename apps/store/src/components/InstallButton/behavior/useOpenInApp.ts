/* @layer store-site @kind hook */
import { useCallback, useEffect, useRef } from 'react';
import { formatInstallLink } from '@rotp/hub-contracts';
import { toast } from '@drizztdourden08/tessera/composites';
import { ANSWER_MS, NOT_ANSWERED, NOT_ANSWERED_MS } from './useOpenInApp.constants';

const useOpenInApp = (itemId: string) => {
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  return useCallback(() => {
    let answered = false;
    const onLeave = () => { answered = true; };
    window.addEventListener('blur', onLeave, { once: true });
    document.addEventListener('visibilitychange', onLeave, { once: true });
    window.location.href = formatInstallLink({ itemId, version: null });
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onLeave);
      if (!answered && document.hasFocus()) toast({ message: NOT_ANSWERED, variant: 'warning', duration: NOT_ANSWERED_MS });
    }, ANSWER_MS);
  }, [itemId]);
};

export { useOpenInApp };
