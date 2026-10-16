/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { ELAPSED_TICK_MS } from './useElapsed.constants';

const useElapsed = (startedAt: number): number => {
  const [elapsedMs, setElapsedMs] = useState(() => Date.now() - startedAt);

  useEffect(() => {
    setElapsedMs(Date.now() - startedAt);
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), ELAPSED_TICK_MS);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsedMs;
};

export { useElapsed };
