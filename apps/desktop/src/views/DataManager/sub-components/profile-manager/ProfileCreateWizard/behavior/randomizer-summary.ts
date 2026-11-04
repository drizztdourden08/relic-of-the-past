/* @layer renderer-components @kind logic */
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const randomizerSummary = ({ randomizer }: ProfileWizardValues): string =>
  (randomizer.enabled ? `${RUN_TYPE_LABELS[randomizer.mode]}, ${randomizer.seed.trim()}` : 'Off');

export { randomizerSummary };
