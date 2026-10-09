/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerSpriteHandlers } from '../sprites/ipc-handlers';

const spritesHandlers: HandlerGroup = {
  id: 'sprites',
  register: () => {
    registerSpriteHandlers();
  },
};

export { spritesHandlers };
