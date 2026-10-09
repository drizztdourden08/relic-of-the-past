/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerSanctuaryHandlers } from '../sanctuary/ipc-handlers';

const sanctuaryHandlers: HandlerGroup = {
  id: 'sanctuary',
  register: () => {
    registerSanctuaryHandlers();
  },
};

export { sanctuaryHandlers };
