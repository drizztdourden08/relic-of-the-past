/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerInputHandlers } from '../input';

const inputHandlers: HandlerGroup = {
  id: 'input-profiles',
  register: () => {
    registerInputHandlers();
  },
};

export { inputHandlers };
