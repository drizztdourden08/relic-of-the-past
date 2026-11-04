/* @layer renderer-components @kind logic */
import { changedCountsOf } from '@app/hooks/randomizer/option-tab-model';
import type { ChangedCounts } from '@app/hooks/randomizer/option-tab-model';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const changedCountsOfValues = ({ randomizer }: ProfileWizardValues): ChangedCounts =>
  changedCountsOf(snapshotOfChoices(randomizer).values);

export { changedCountsOfValues };
