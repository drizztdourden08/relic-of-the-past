/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '@drizztdourden08/brock-react';
import type { StepperSubStep } from '@drizztdourden08/tessera/primitives';
import { OPTION_TABS } from '../../randomizer-options/option-tabs.constants';
import { changedCountsOfValues } from './changed-counts-of-values';

const optionSubSteps = (values: ProfileWizardValues): readonly StepperSubStep[] => {
  const counts = changedCountsOfValues(values);
  return OPTION_TABS.map(({ id, label }) => ({ id, label, count: counts[id] }));
};

export { optionSubSteps };
