/* @layer store-site @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { errorMessage } from '@site-kit/api/api-error';
import { listReviewQueue } from '../api/review-endpoints/list-review-queue';
import type { EntriesLoader } from './useReviewQueue.type';
import { NO_ENTRIES } from './useReviewQueue.constants';

const useReviewQueue = (load: EntriesLoader = listReviewQueue) => {
  const [entries, setEntries] = useState<ReviewEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setEntries((await load()).entries);
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setEntries([]);
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return useMemo(
    () => ({ entries: entries ?? NO_ENTRIES, loading: entries === null, error, reload }),
    [entries, error, reload],
  );
};

export { useReviewQueue };
export type { ReviewQueue, EntriesLoader } from './useReviewQueue.type';
