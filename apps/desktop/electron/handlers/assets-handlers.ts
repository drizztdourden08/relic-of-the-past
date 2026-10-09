/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerAssetHandlers } from '../assets/ipc-handlers';

const assetsHandlers: HandlerGroup = {
  id: 'assets',
  register: () => {
    registerAssetHandlers();
  },
};

export { assetsHandlers };
