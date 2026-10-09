/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerUpdaterHandlers } from '../updater';

const updaterHandlers: HandlerGroup = {
  id: 'updater',
  register: () => {
    registerUpdaterHandlers();
  },
};

export { updaterHandlers };
