/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import type { ShadowRenderer } from '@rotp/game-core';
import type { ViewportInfo } from '../../../game';
import { OVERWORLD_MODULE } from '../GameLayer.constants';
import { overworldScreenIdOf } from './overworld-screen-id';

const overworldShadowScreen = (renderer: ShadowRenderer, vp: ViewportInfo | null): number => {
  if (vp?.locationModule !== OVERWORLD_MODULE) return -1;
  const { viewLeft, viewTop } = viewOrigin(vp);
  renderer.setScreenOrigin(viewLeft, viewTop, vp.snesWidth, vp.snesHeight);
  return overworldScreenIdOf(vp);
};

export { overworldShadowScreen };
