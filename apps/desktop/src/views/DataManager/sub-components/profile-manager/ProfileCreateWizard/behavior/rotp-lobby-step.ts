/* @layer renderer-components @kind logic */
import type { ProfileWizardStepDef } from '@drizztdourden08/brock-react';
import { ROTP_LOBBY_SLICE, ROTP_LOBBY_STEP_ID, initialRotpLobby } from '@app/randomizer/lobby/rotp-lobby.constants';
import { rotpLobbyOf } from '@app/randomizer/lobby/rotp-lobby-of';
import type { RotpLobbyForm } from '@app/randomizer/lobby/rotp-lobby.type';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';
import { ArchipeliaFields } from '../../ArchipeliaFields';
import { lobbyProblem } from './lobby-problem';

const rotpLobbyStep: ProfileWizardStepDef<RotpLobbyForm> = {
  id: ROTP_LOBBY_STEP_ID,
  slice: ROTP_LOBBY_SLICE,
  initial: initialRotpLobby,
  step: {
    label: 'Lobby',
    description: 'Pick the lobby to join.',
    when: (values) => {
      const { enabled, mode } = wizardFactsOf(values);
      return enabled && mode === 'archipelia';
    },
    validate: lobbyProblem,
    summary: (values) => {
      const { lobbyCheck } = rotpLobbyOf(values);
      return lobbyCheck.kind === 'ok' ? lobbyCheck.name : undefined;
    },
  },
  Body: ArchipeliaFields,
};

export { rotpLobbyStep };
