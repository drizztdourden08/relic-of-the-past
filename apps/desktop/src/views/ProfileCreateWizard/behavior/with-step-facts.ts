/* @layer renderer-components @kind logic */
import { OPTIONS_STEP_ID, RANDOMIZER_STEP_ID } from '@drizztdourden08/brock-randomizer/renderer';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import { optionsSummary } from './options-summary';
import { randomizerSummary } from './randomizer-summary';

const withStepFacts = (t: I18n['t']) => (module: ProfileWizardStepDef): ProfileWizardStepDef => {
  if (module.id === RANDOMIZER_STEP_ID) return { ...module, step: { ...module.step, summary: randomizerSummary(t) } };
  if (module.id === OPTIONS_STEP_ID) return { ...module, step: { ...module.step, summary: optionsSummary(t) } };
  return module;
};

export { withStepFacts };
