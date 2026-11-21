/* @layer renderer-components @kind logic */
import { OPTIONS_SLICE } from '@drizztdourden08/brock-randomizer/renderer';
import type { ProfileWizardValues } from '@drizztdourden08/brock-react';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import { optionValuesOf } from '@app/randomizer/options/option-values-of';

const overridesOf = (values: ProfileWizardValues): unknown => {
  const slice = values[OPTIONS_SLICE];
  return typeof slice === 'object' && slice !== null && 'overrides' in slice ? slice.overrides : {};
};

const optionsSnapshotOf = (values: ProfileWizardValues): RandomizerOptionsSnapshot =>
  buildOptionsSnapshot(optionValuesOf(overridesOf(values)));

export { optionsSnapshotOf };
