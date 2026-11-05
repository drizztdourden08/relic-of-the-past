/* @layer renderer-app @kind logic */
import type { RotpLobbyForm } from './rotp-lobby.type';
import { initialRotpLobby } from './rotp-lobby.constants';

const CONNECTION_SLICE = 'randomizerConnection';

const rotpLobbyOfConnection = (values: Readonly<Record<string, unknown>>): RotpLobbyForm => {
  const slice = values[CONNECTION_SLICE];
  const initial = initialRotpLobby();
  if (typeof slice !== 'object' || slice === null) return initial;
  const { lobby, lobbyCheck } = slice as Partial<RotpLobbyForm>;
  return { lobby: lobby ?? initial.lobby, lobbyCheck: lobbyCheck ?? initial.lobbyCheck };
};

export { rotpLobbyOfConnection };
