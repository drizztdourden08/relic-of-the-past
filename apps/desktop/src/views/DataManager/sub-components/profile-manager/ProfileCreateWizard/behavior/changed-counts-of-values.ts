/* @layer renderer-components @kind logic */
import { OPTIONS_SLICE } from '@drizztdourden08/brock-randomizer/renderer';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { changedCountsOf } from '@app/hooks/randomizer/option-tab-model';
import type { ChangedCounts } from '@app/hooks/randomizer/option-tab-model';
import { optionValuesOf } from '@app/randomizer/options/option-values-of';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const overridesOf = (values: ProfileWizardValues): unknown => {
  const slice = values[OPTIONS_SLICE];
  return typeof slice === 'object' && slice !== null && 'overrides' in slice ? slice.overrides : {};
};

const changedCountsOfValues = (values: ProfileWizardValues): ChangedCounts =>
  changedCountsOf(buildOptionsSnapshot(optionValuesOf(overridesOf(values))).values);

export { changedCountsOfValues };
