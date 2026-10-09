/* @layer store-site @kind hook */
import { useCallback, useState } from 'react';
import type { ReviewEntry } from '@shared/store/api-types';
import type { ReviewDecision } from '@shared/store/review-types';
import { errorMessage } from '@site-kit/api/api-error';
import { deleteVersion } from '../../../api/publish-endpoints';
import { decideReview, unlistItem } from '../../../api/review-endpoints';
import { DONE } from './useReviewActions.constants';
import type { UseReviewActionsParams } from './useReviewActions.type';

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

export { useReviewActions };
