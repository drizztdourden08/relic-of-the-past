/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerHubHandlers } from '../hub/ipc-handlers';

const hubHandlers: HandlerGroup = {
  id: 'hub',
  register: () => {
    registerHubHandlers();
  },
};

export { hubHandlers };
