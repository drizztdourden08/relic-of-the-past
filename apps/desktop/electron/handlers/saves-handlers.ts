/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerSaveHandlers } from '../saves/ipc-handlers';

const savesHandlers: HandlerGroup = {
  id: 'saves',
  register: () => {
    registerSaveHandlers();
  },
};

export { savesHandlers };
