/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerConnectionHandlers } from '../connections/ipc-handlers';

const connectionsHandlers: HandlerGroup = {
  id: 'connections',
  register: () => {
    registerConnectionHandlers();
  },
};

export { connectionsHandlers };
