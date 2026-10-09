/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerScreenEditorHandlers } from '../screen-editor/ipc-handlers';

const screenEditorHandlers: HandlerGroup = {
  id: 'screen-editor',
  devOnly: true,
  register: () => {
    registerScreenEditorHandlers();
  },
};

export { screenEditorHandlers };
