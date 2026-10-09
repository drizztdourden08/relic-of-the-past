/* @layer renderer-other @kind constants */
import type { StorageSummary } from '@shared/platform';

const EMPTY_SUMMARY: StorageSummary = {
  location: { path: '(browser)', osLabel: 'Browser', canReveal: false },
  domains: [],
  totalBytes: 0,
};

export { EMPTY_SUMMARY };
