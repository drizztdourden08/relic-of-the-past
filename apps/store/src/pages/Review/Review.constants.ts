/* @layer store-site @kind constants */
import type { ReviewScope } from './behavior/useReviewPage.type';

const COUNT_LABEL = ['entry', 'entries'] as const;

const EMPTY: Record<ReviewScope, string> = {
  versions: 'Nothing is waiting. Well done.',
  listings: 'Nothing is waiting. Well done.',
  unsubmitted: 'Every uploaded version has been sent for review.',
};

const UNSUBMITTED_NOTE = 'Not in the approval queue: the author has not asked for review yet. Dates are upload dates.';

export { COUNT_LABEL, EMPTY, UNSUBMITTED_NOTE };
