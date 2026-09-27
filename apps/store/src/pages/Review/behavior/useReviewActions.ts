/* @layer store-site @kind hook */
/**
 * A reviewer's decisions on the picked entry: approve, reject with a note (store-api refuses
 * a rejection without one), and unlist the whole item. Each settles entries in the queue,
 * which then drop out of it.
 */
import { useCallback, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import type { ReviewDecision } from '@shared/store/review-types';
import { errorMessage } from '@site-kit/api/api-error';
import { decideReview, unlistItem } from '../../../api/review-endpoints';
import { entryId } from '../../../review/review-row';
import type { ReviewQueue } from '../../../review/useReviewQueue';

type UseReviewActionsParams = {
  queue: ReviewQueue;
  /** Called once the picked entry has left the queue. */
  onSettled: () => void;
};

const DONE: Record<ReviewDecision, string> = { approve: 'Approved.', reject: 'Rejected. The author sees your note.' };

const useReviewActions = (params: UseReviewActionsParams) => {
  const { queue, onSettled } = params;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const run = useCallback(async (work: () => Promise<void>) => {
    setBusy(true);
    setNotice(null);
    try {
      await work();
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const decide = useCallback((entry: ReviewEntry, decision: ReviewDecision, note: string) => run(async () => {
    await decideReview(entry.item.id, entry.target, { decision, note: note.trim() });
    queue.removeEntry(entryId(entry));
    setNotice(DONE[decision]);
    onSettled();
  }), [run, queue, onSettled]);

  const unlist = useCallback((entry: ReviewEntry) => run(async () => {
    await unlistItem(entry.item.id);
    setNotice(`${entry.item.name} is unlisted.`);
  }), [run]);

  return { busy, notice, decide, unlist };
};

type ReviewActions = ReturnType<typeof useReviewActions>;

export { useReviewActions };
export type { ReviewActions };
