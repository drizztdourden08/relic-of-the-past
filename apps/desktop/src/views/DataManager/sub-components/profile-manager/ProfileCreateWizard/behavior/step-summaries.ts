/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { RUN_TYPE_LABELS } from '../../profile-detail/build-run-facts.constants';
import { changedTotalOf } from './option-sub-steps';

const romStemOf = (rom: string): string => rom.replace(/\.(sfc|smc)$/i, '');

const profileSummary = ({ name, rom }: ProfileWizardValues): string | undefined =>
  [name.trim(), romStemOf(rom)].filter((part) => part !== '').join(', ') || undefined;

const randomizerSummary = ({ randomizer }: ProfileWizardValues): string =>
  (randomizer.enabled ? `${RUN_TYPE_LABELS[randomizer.mode]}, ${randomizer.seed.trim()}` : 'Off');

const connectionSummary = ({ randomizer }: ProfileWizardValues): string | undefined => {
  if (randomizer.mode === 'archipelia') return randomizer.lobbyCheck.kind === 'ok' ? randomizer.lobbyCheck.name : undefined;
  return randomizer.server.host.trim() || undefined;
};

const optionsSummary = (values: ProfileWizardValues): string => {
  const total = changedTotalOf(values);
  return total === 0 ? 'Defaults' : `${total} changed`;
};

export { connectionSummary, optionsSummary, profileSummary, randomizerSummary, romStemOf };
