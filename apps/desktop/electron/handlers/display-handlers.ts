/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerDisplayHandlers } from '../display/ipc-handlers';

const displayHandlers: HandlerGroup = {
  id: 'display',
  register: () => {
    registerDisplayHandlers();
  },
};

export { displayHandlers };
