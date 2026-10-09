/* @layer store-site @kind types */
import type { useReviewActions } from './useReviewActions';

type UseReviewActionsParams = {
  onSettled: () => void;
};

type ReviewActions = ReturnType<typeof useReviewActions>;

export type { UseReviewActionsParams, ReviewActions };
