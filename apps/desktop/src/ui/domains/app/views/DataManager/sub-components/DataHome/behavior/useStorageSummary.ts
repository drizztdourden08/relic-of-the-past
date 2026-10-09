/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { StoragePort, StorageSummary } from '@shared/platform';

const useStorageSummary = (storage: StoragePort) => {
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    storage.getSummary()
      .then((s) => setSummary(s))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [storage]);

  useEffect(() => { refresh(); }, [refresh]);

  return { summary, loading, refresh };
};

export { useStorageSummary };
