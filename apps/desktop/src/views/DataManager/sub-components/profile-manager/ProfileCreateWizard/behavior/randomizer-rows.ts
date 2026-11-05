/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const randomizerRows = (values: ProfileWizardValues): FactsPanelFact[] => {
  const { enabled, seed, mode } = wizardFactsOf(values);
  return [
    { label: 'Randomizer', value: enabled ? 'On' : 'Off' },
    ...(enabled
      ? [
        { label: 'Seed', value: seed.trim() || 'Random', mono: true },
        { label: 'Mode', value: RUN_TYPE_LABELS[mode] },
      ]
      : []),
  ];
};

export { randomizerRows };
