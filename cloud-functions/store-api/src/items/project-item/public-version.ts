/* @layer store-api @kind logic */
import type { StoreVersion } from '@rotp/hub-contracts';

const publicVersion = (version: StoreVersion): StoreVersion => ({
  ...version,
  key: '',
  upload: null,
  removed: version.removed && { ...version.removed, by: null },
  review: {
    state: 'approved',
    submittedAt: version.review.submittedAt,
    decidedAt: version.review.decidedAt,
    by: null,
    note: '',
  },
});

export { publicVersion };
