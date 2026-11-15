/* @layer renderer-components @kind logic */
import { OPTIONS_STEP_ID, RANDOMIZER_STEP_ID } from '@drizztdourden08/brock-randomizer/renderer';
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import { optionsSummary } from './options-summary';
import { randomizerSummary } from './randomizer-summary';

const withStepFacts = (module: ProfileWizardStepDef): ProfileWizardStepDef => {
  if (module.id === RANDOMIZER_STEP_ID) return { ...module, step: { ...module.step, summary: randomizerSummary } };
  if (module.id === OPTIONS_STEP_ID) return { ...module, step: { ...module.step, summary: optionsSummary } };
  return module;
};

export { withStepFacts };
