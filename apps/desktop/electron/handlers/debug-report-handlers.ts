/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerDebugReportHandlers } from '../diagnostics/debug-report/ipc-handlers';

const debugReportHandlers: HandlerGroup = {
  id: 'debug-report',
  register: (ctx) => {
    registerDebugReportHandlers(ctx);
  },
};

export { debugReportHandlers };
