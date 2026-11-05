/* @layer renderer-components @kind logic */
import { slotNameError } from '@drizztdourden08/brock-randomizer/archipelago';
import { rotpLobbyOf } from '@app/randomizer/lobby/rotp-lobby-of';
import { NO_LOBBY_ERROR } from '../../build-randomizer-config/build-randomizer-config.constants';

const lobbyProblem = (values: Readonly<Record<string, unknown>>): string | null => {
  const { lobby, lobbyCheck } = rotpLobbyOf(values);
  return slotNameError(lobby.slotName) ?? (lobbyCheck.kind === 'ok' ? null : NO_LOBBY_ERROR);
};

export { lobbyProblem };
