/* @layer store-site @kind types */
import type { ReviewEntry } from '@rotp/hub-contracts';
import type { ReviewActions } from '../../Review/behavior/useReviewActions.type';

type DecisionPanelProps = {
  entry: ReviewEntry;
  actions: ReviewActions;
};

export type { DecisionPanelProps };
