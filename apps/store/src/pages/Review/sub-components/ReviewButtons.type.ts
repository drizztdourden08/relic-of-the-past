/* @layer store-site @kind types */
import type { ReviewEntry } from '@shared/store/api-types';
import type { StoreVersion } from '@shared/store/types';
import type { ReviewActions } from '../behavior/useReviewActions.type';

type ReviewButtonsProps = {
  entry: ReviewEntry;
  version: StoreVersion | null;
  note: string;
  actions: ReviewActions;
};

export type { ReviewButtonsProps };
