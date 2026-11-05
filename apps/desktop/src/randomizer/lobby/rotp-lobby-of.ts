/* @layer renderer-app @kind logic */
import type { RotpLobbyForm } from './rotp-lobby.type';
import { ROTP_LOBBY_SLICE, initialRotpLobby } from './rotp-lobby.constants';

const isLobbyForm = (value: unknown): value is RotpLobbyForm =>
  typeof value === 'object' && value !== null && 'lobby' in value && 'lobbyCheck' in value;

const rotpLobbyOf = (values: Readonly<Record<string, unknown>> | undefined): RotpLobbyForm => {
  const slice = values?.[ROTP_LOBBY_SLICE];
  return isLobbyForm(slice) ? slice : initialRotpLobby();
};

export { rotpLobbyOf };
