/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const randomizerRows = ({ randomizer }: ProfileWizardValues): FactsPanelFact[] => [
  { label: 'Randomizer', value: randomizer.enabled ? 'On' : 'Off' },
  ...(randomizer.enabled
    ? [
      { label: 'Seed', value: randomizer.seed.trim(), mono: true },
      { label: 'Mode', value: RUN_TYPE_LABELS[randomizer.mode] },
    ]
    : []),
];

export { randomizerRows };
