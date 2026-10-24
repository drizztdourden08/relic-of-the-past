/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerLanHandlers } from '../lan/ipc-handlers';

const lanHandlers: HandlerGroup = {
  id: 'lan',
  register: () => {
    registerLanHandlers();
  },
};

export { lanHandlers };
