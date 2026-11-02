/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerLobbySocketHandlers } from '../lobby-socket/ipc-handlers';

const lobbySocketHandlers: HandlerGroup = {
  id: 'lobby-socket',
  register: () => {
    registerLobbySocketHandlers();
  },
};

export { lobbySocketHandlers };
