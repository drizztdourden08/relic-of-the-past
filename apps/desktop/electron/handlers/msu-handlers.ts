/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerMsuHandlers } from '../msu/ipc-handlers';
import { registerMsuEditHandlers } from '../msu/edit-handlers';
import { registerMsuOptimizeHandlers } from '../msu/optimize-handlers';
import { registerMsuResumeHandlers } from '../msu/resume-handlers';

const msuHandlers: HandlerGroup = {
  id: 'msu',
  register: (ctx) => {
    registerMsuHandlers();
    registerMsuEditHandlers();
    registerMsuOptimizeHandlers(ctx);
    registerMsuResumeHandlers();
  },
};

export { msuHandlers };
