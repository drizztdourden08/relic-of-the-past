/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '@drizztdourden08/brock-react';
import { changedCountsOf } from '@app/hooks/randomizer/option-tab-model';
import type { ChangedCounts } from '@app/hooks/randomizer/option-tab-model';
import { optionsSnapshotOf } from './options-snapshot-of';

const changedCountsOfValues = (values: ProfileWizardValues): ChangedCounts =>
  changedCountsOf(optionsSnapshotOf(values).values);

export { changedCountsOfValues };
