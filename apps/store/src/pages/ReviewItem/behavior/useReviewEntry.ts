/* @layer store-site @kind hook */
import { useMemo } from 'react';
import { listUnsubmitted } from '../../../endpoints/review-endpoints';
import { entryId } from '../../../review/review-row';
import { useReviewQueue } from '../../../review/useReviewQueue';
import { GONE } from './useReviewEntry.constants';
import type { ReviewEntryState } from './useReviewEntry.type';

const useReviewEntry = (rowId: string): ReviewEntryState => {
  const queue = useReviewQueue();
  const unsubmitted = useReviewQueue(listUnsubmitted);
  const entry = useMemo(
    () => [...queue.entries, ...unsubmitted.entries].find((candidate) => entryId(candidate) === rowId) ?? null,
    [queue.entries, unsubmitted.entries, rowId],
  );
  const loading = queue.loading || unsubmitted.loading;
  const error = queue.error ?? unsubmitted.error ?? (!loading && !entry ? GONE : null);
  return { entry, loading, error };
};

export { useReviewEntry };
