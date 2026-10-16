/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerReadMsulHandler } from '../msu/read-msul-handler';
import { registerMsuOptimizeHandlers } from '../msu/optimize-handlers';

const msuHandlers: HandlerGroup = {
  id: 'msu',
  register: (ctx) => {
    registerReadMsulHandler();
    registerMsuOptimizeHandlers(ctx);
  },
};

export { msuHandlers };
