/* @layer renderer-widgets @kind logic */
import { screenOriginFor } from '../../../../game/flood';
import { linkStartTile } from '@rotp/navigation';
import type { StartContext, StartContextArgs } from '../nav-flood.type';

const computeStartContext = (args: StartContextArgs): StartContext => {
  const { vp, primaryScreenIndex, isIndoors } = args;
  if (!vp) return { startPos: undefined };
  const origin = screenOriginFor({ isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: primaryScreenIndex });
  return { startPos: linkStartTile({ linkX: vp.linkX, linkY: vp.linkY, screenWorldX: origin.x, screenWorldY: origin.y }) };
};

export { computeStartContext };
