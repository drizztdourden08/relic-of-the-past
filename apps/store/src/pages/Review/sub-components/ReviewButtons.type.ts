/* @layer store-site @kind types */
import type { ReviewEntry, StoreVersion } from '@rotp/hub-contracts';
import type { ReviewActions } from '../behavior/useReviewActions.type';

type ReviewButtonsProps = {
  entry: ReviewEntry;
  version: StoreVersion | null;
  note: string;
  actions: ReviewActions;
};

export type { ReviewButtonsProps };
