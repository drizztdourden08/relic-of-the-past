/* @layer store-site @kind hook */
import { useCallback } from 'react';
import type { ReviewEntry, ReviewDecision } from '@rotp/hub-contracts';
import { useNoticeRun } from '@rotp/design';
import { deleteVersion } from '../../../endpoints/publish-endpoints';
import { decideReview, unlistItem } from '../../../endpoints/review-endpoints';
import { DONE } from './useReviewActions.constants';
import type { UseReviewActionsParams } from './useReviewActions.type';

const useReviewActions = (params: UseReviewActionsParams) => {
  const { onSettled } = params;
  const { busy, notice, run } = useNoticeRun();

  const decide = useCallback((entry: ReviewEntry, decision: ReviewDecision, note: string) => run(async () => {
    await decideReview(entry.item.id, entry.target, { decision, note: note.trim() });
    onSettled();
    return DONE[decision];
  }), [run, onSettled]);

  const remove = useCallback((entry: ReviewEntry) => run(async () => {
    if (entry.target.kind !== 'version') return null;
    await deleteVersion(entry.item.id, entry.target.n);
    onSettled();
    return 'Deleted. The file was removed; the author sees who deleted it.';
  }), [run, onSettled]);

  const unlist = useCallback((entry: ReviewEntry) => run(async () => {
    await unlistItem(entry.item.id);
    return `${entry.item.name} is unlisted.`;
  }), [run]);

  return { busy, notice, decide, remove, unlist };
};

export { useReviewActions };
