/* @layer store-site @kind hook */
/**
 * A reviewer's list of entries, loaded when the page opens: by default the queue (every
 * waiting version and listing edit, oldest first), or whatever `load` answers, such as the
 * versions not submitted yet.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { errorMessage } from '@site-kit/api/api-error';
import { listReviewQueue } from '../api/review-endpoints';

type EntriesLoader = () => Promise<{ entries: ReviewEntry[] }>;

const NO_ENTRIES: ReviewEntry[] = [];

/** `load` must be stable, e.g. a module-level endpoint. */
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

type ReviewQueue = ReturnType<typeof useReviewQueue>;

export { useReviewQueue };
export type { ReviewQueue, EntriesLoader };
