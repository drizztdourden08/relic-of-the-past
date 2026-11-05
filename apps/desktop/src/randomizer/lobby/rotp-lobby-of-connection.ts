/* @layer renderer-app @kind logic */
import type { RotpLobbyForm } from './rotp-lobby.type';
import { initialRotpLobby } from './rotp-lobby.constants';

const rotpLobbyOfConnection = (connection: Readonly<Record<string, unknown>> | undefined): RotpLobbyForm => {
  const initial = initialRotpLobby();
  const { lobby, lobbyCheck } = (connection ?? {}) as Partial<RotpLobbyForm>;
  return { lobby: lobby ?? initial.lobby, lobbyCheck: lobbyCheck ?? initial.lobbyCheck };
};

export { rotpLobbyOfConnection };
