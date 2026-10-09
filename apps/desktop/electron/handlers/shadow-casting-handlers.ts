/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerShadowCastingHandlers } from '../shadow-casting';

const shadowCastingHandlers: HandlerGroup = {
  id: 'shadow-casting',
  register: () => {
    registerShadowCastingHandlers();
  },
};

export { shadowCastingHandlers };
