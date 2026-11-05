/* @layer renderer-app @kind logic */
import type { RotpLobbyForm } from './rotp-lobby.type';
import { initialRotpLobby } from './rotp-lobby.constants';

const CONNECTION_SLICE = 'randomizerConnection';

const rotpLobbyOfConnection = (connection: Readonly<Record<string, unknown>> | undefined): RotpLobbyForm => {
  const initial = initialRotpLobby();
  const { lobby, lobbyCheck } = (connection ?? {}) as Partial<RotpLobbyForm>;
  return { lobby: lobby ?? initial.lobby, lobbyCheck: lobbyCheck ?? initial.lobbyCheck };
};

export { CONNECTION_SLICE, rotpLobbyOfConnection };
