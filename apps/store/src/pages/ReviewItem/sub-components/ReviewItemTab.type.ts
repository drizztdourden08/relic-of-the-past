/* @layer store-site @kind types */
import type { versionOfEntry } from '../../../review/review-row';
import type { useReviewItemPage } from '../behavior/useReviewItemPage';

type ReviewItemPage = ReturnType<typeof useReviewItemPage>;

type ReviewItemTabProps = {
  page: ReviewItemPage;
  entry: NonNullable<ReviewItemPage['entry']>;
  preview: NonNullable<ReviewItemPage['preview']>;
  version: ReturnType<typeof versionOfEntry>;
};

export type { ReviewItemTabProps };
