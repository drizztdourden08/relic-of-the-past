/* @layer renderer-components @kind logic */
import { viewOrigin } from '@rotp/game-core';
import { TILE_PX } from '../sub-components/TileInspector.constants';
import { screenWorldOrigin } from './screen-world-origin';
import type { HoverGeometry, HoverGeometryInput } from './tile-hover.type';

const hoverGeometry = (input: HoverGeometryInput): HoverGeometry => {
  const { event, vp, result, width, height, isIndoors } = input;
  const rect = event.currentTarget.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  const { viewLeft, viewTop } = viewOrigin(vp);
  const worldX = mx / scaleX + viewLeft;
  const worldY = my / scaleY + viewTop;
  const { x: screenWorldX, y: screenWorldY } = screenWorldOrigin(vp, result, isIndoors);

  return {
    mx, my, scaleX, scaleY, viewLeft, viewTop, screenWorldX, screenWorldY,
    tileCol: Math.floor((worldX - screenWorldX) / TILE_PX),
    tileRow: Math.floor((worldY - screenWorldY) / TILE_PX),
  };
};

export { hoverGeometry };
