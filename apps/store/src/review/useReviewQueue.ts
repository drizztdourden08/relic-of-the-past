/* @layer store-site @kind hook */
/**
 * The review queue: every waiting version and listing edit, oldest first, loaded when the
 * page opens. A decision or an unlist takes the entries it settled out of the list; no
 * reload after a write.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { errorMessage } from '@site-kit/api/api-error';
import { listReviewQueue } from '../api/review-endpoints';
import { entryId } from './review-row';

const NO_ENTRIES: ReviewEntry[] = [];

const useReviewQueue = () => {
  const [entries, setEntries] = useState<ReviewEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setEntries((await listReviewQueue()).entries);
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const removeEntry = useCallback((id: string) => {
    setEntries((rows) => (rows ?? []).filter((entry) => entryId(entry) !== id));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setEntries((rows) => (rows ?? []).filter((entry) => entry.item.id !== itemId));
  }, []);

  return useMemo(
    () => ({ entries: entries ?? NO_ENTRIES, loading: entries === null, error, reload: load, removeEntry, removeItem }),
    [entries, error, load, removeEntry, removeItem],
  );
};

type ReviewQueue = ReturnType<typeof useReviewQueue>;

export { useReviewQueue };
export type { ReviewQueue };
