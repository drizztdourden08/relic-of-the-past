/* @layer renderer-components @kind logic */
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const connectionSummary = ({ randomizer }: ProfileWizardValues): string | undefined => {
  if (randomizer.mode === 'archipelia') return randomizer.lobbyCheck.kind === 'ok' ? randomizer.lobbyCheck.name : undefined;
  return randomizer.server.host.trim() || undefined;
};

export { connectionSummary };
