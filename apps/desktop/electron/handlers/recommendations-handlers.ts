/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerRecommendationHandlers } from '../recommendations';

const recommendationsHandlers: HandlerGroup = {
  id: 'recommendations',
  register: () => {
    registerRecommendationHandlers();
  },
};

export { recommendationsHandlers };
