/* @layer renderer-app @kind constants */
import { EMPTY_LOBBY_DRAFT } from '@app/hooks/randomizer/lobby-setup';
import type { RotpLobbyForm } from './rotp-lobby.type';

const ROTP_LOBBY_STEP_ID = 'rotp-lobby';
const ROTP_LOBBY_SLICE = 'rotpLobby';

const initialRotpLobby = (): RotpLobbyForm => ({ lobby: EMPTY_LOBBY_DRAFT, lobbyCheck: { kind: 'idle' } });

export { ROTP_LOBBY_STEP_ID, ROTP_LOBBY_SLICE, initialRotpLobby };
