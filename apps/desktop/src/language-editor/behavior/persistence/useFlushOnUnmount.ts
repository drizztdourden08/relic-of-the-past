/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import type { PersistenceRefs } from './persistence.type';

const useFlushOnUnmount = (refs: PersistenceRefs, cancelTimer: () => void): void => {
  useEffect(() => {
    refs.live.current = true;
    return () => {
      refs.live.current = false;
      cancelTimer();
      void refs.runRef.current();
    };
  }, [refs, cancelTimer]);
};

export { useFlushOnUnmount };
