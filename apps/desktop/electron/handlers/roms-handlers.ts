/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerRomHandlers } from '../roms';

const romsHandlers: HandlerGroup = {
  id: 'roms',
  register: () => {
    registerRomHandlers();
  },
};

export { romsHandlers };
