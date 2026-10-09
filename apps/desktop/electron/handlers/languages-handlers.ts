/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerLanguageHandlers } from '../languages/ipc-handlers';

const languagesHandlers: HandlerGroup = {
  id: 'languages',
  register: () => {
    registerLanguageHandlers();
  },
};

export { languagesHandlers };
