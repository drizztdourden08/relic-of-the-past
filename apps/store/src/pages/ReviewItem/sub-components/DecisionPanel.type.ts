/* @layer store-site @kind types */
import type { ReviewEntry } from '@shared/store/api-types';
import type { ReviewActions } from '../../Review/behavior/useReviewActions.type';

type DecisionPanelProps = {
  entry: ReviewEntry;
  actions: ReviewActions;
};

export type { DecisionPanelProps };
