/* @layer store-site @kind constants */
import type { ReviewScope } from './useReviewPage.type';

const REVIEW_PATH = '/review';

const SCOPES: readonly { id: ReviewScope; label: string }[] = [
  { id: 'versions', label: 'Versions' },
  { id: 'listings', label: 'Listing edits' },
  { id: 'unsubmitted', label: 'Not submitted' },
];

export { REVIEW_PATH, SCOPES };
