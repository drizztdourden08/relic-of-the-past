/* @layer renderer-hooks @kind logic */
import { useState, useCallback } from 'react';

const useStudioTask = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (task: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try { await task(); } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }, []);

  return { busy, error, run };
};

export { useStudioTask };
