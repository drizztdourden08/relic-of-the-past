/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerStoreHandlers } from '../store/ipc-handlers';

const storeHandlers: HandlerGroup = {
  id: 'store',
  register: (ctx) => {
    registerStoreHandlers(ctx);
  },
};

export { storeHandlers };
