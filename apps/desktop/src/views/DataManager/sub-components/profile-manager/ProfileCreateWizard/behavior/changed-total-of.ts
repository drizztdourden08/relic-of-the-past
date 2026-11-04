/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { changedCountsOfValues } from './changed-counts-of-values';

const changedTotalOf = (values: ProfileWizardValues): number =>
  Object.values(changedCountsOfValues(values)).reduce((sum, count) => sum + count, 0);

export { changedTotalOf };
