/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import type { ShadowRenderer } from '@rotp/game-core';
import { OVERWORLD_MODULE, overworldScreenIdOf } from '@app/game';
import type { ViewportInfo } from '@app/game';

const overworldShadowScreen = (renderer: ShadowRenderer, vp: ViewportInfo | null): number => {
  if (vp?.locationModule !== OVERWORLD_MODULE) return -1;
  const { viewLeft, viewTop } = viewOrigin(vp);
  renderer.setScreenOrigin(viewLeft, viewTop, vp.snesWidth, vp.snesHeight);
  return overworldScreenIdOf(vp);
};

export { overworldShadowScreen };
