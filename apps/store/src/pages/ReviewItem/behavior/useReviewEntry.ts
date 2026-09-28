/* @layer store-site @kind hook */
/**
 * The entry a review page shows, found by its row id in the lists the Reviewer Hub reads:
 * the queue (waiting versions and listing edits) and the versions not submitted yet. The
 * entry is null while they load, and stays null with a reason when neither holds it.
 */
import { useMemo } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import { listUnsubmitted } from '../../../api/review-endpoints';
import { entryId } from '../../../review/review-row';
import { useReviewQueue } from '../../../review/useReviewQueue';

type ReviewEntryState = {
  entry: ReviewEntry | null;
  loading: boolean;
  error: string | null;
};

const GONE = 'This entry is not waiting for review any more.';

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
export type { ReviewEntryState };
