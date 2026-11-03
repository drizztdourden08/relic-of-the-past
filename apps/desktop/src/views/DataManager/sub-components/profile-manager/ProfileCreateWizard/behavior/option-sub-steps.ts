/* @layer renderer-components @kind logic */
import type { StepperSubStep } from '@drizztdourden08/tessera/primitives';
import { changedCountsOf } from '@app/hooks/randomizer/option-tab-model';
import type { ChangedCounts } from '@app/hooks/randomizer/option-tab-model';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { OPTION_TABS } from '../../randomizer-options/option-tabs.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const changedCountsOfValues = ({ randomizer }: ProfileWizardValues): ChangedCounts =>
  changedCountsOf(snapshotOfChoices(randomizer).values);

const optionSubSteps = (values: ProfileWizardValues): readonly StepperSubStep[] => {
  const counts = changedCountsOfValues(values);
  return OPTION_TABS.map(({ id, label }) => ({ id, label, count: counts[id] }));
};

const changedTotalOf = (values: ProfileWizardValues): number =>
  Object.values(changedCountsOfValues(values)).reduce((sum, count) => sum + count, 0);

export { changedTotalOf, optionSubSteps };
