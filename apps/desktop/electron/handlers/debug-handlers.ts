/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerDumpLayersHandler } from '../debug/dump-layers-handler';
import { registerDumpNavHandler } from '../debug/dump-nav-handler';
import { registerSimRunHandler } from '../debug/sim-run-handler';
import { registerSimLogHandlers } from '../debug/sim-log-handler';

const debugHandlers: HandlerGroup = {
  id: 'debug',
  register: () => {
    registerDumpLayersHandler();
    registerDumpNavHandler();
    registerSimRunHandler();
    registerSimLogHandlers();
  },
};

export { debugHandlers };
