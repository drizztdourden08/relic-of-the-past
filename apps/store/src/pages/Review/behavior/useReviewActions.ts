/* @layer store-site @kind hook */
/**
 * A reviewer's decisions on an entry: approve, reject with a note (store-api refuses a
 * rejection without one), delete a version, and unlist the whole item. A decision or a
 * delete settles the entry and calls `onSettled`; an unlist leaves it open.
 */
import { useCallback, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import type { ReviewDecision } from '@shared/store/review-types';
import { errorMessage } from '@site-kit/api/api-error';
import { deleteVersion } from '../../../api/publish-endpoints';
import { decideReview, unlistItem } from '../../../api/review-endpoints';

type UseReviewActionsParams = {
  /** Called once the entry is settled. */
  onSettled: () => void;
};

const DONE: Record<ReviewDecision, string> = { approve: 'Approved.', reject: 'Rejected. The author sees your note.' };

const useReviewActions = (params: UseReviewActionsParams) => {
  const { onSettled } = params;
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

  const settle = useCallback((done: string) => {
    setNotice(done);
    onSettled();
  }, [onSettled]);

  const decide = useCallback((entry: ReviewEntry, decision: ReviewDecision, note: string) => run(async () => {
    await decideReview(entry.item.id, entry.target, { decision, note: note.trim() });
    settle(DONE[decision]);
  }), [run, settle]);

  const remove = useCallback((entry: ReviewEntry) => run(async () => {
    if (entry.target.kind !== 'version') return;
    await deleteVersion(entry.item.id, entry.target.n);
    settle('Deleted. The file was removed; the author sees who deleted it.');
  }), [run, settle]);

  const unlist = useCallback((entry: ReviewEntry) => run(async () => {
    await unlistItem(entry.item.id);
    setNotice(`${entry.item.name} is unlisted.`);
  }), [run]);

  return { busy, notice, decide, remove, unlist };
};

type ReviewActions = ReturnType<typeof useReviewActions>;

export { useReviewActions };
export type { ReviewActions };
