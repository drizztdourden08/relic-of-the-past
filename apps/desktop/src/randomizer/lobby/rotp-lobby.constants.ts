/* @layer renderer-app @kind constants */
import { EMPTY_LOBBY_DRAFT } from '@app/hooks/randomizer/lobby-setup';
import type { RotpLobbyForm } from './rotp-lobby.type';

const initialRotpLobby = (): RotpLobbyForm => ({ lobby: EMPTY_LOBBY_DRAFT, lobbyCheck: { kind: 'idle' } });

export { initialRotpLobby };
