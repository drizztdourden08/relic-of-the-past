/* @layer renderer-components @kind logic */
import { pointerWorld } from '@app/navigation-overlay/pointer-world';
import { TILE_PX } from '../sub-components/TileInspector.constants';
import { screenWorldOrigin } from './screen-world-origin';
import type { HoverGeometry, HoverGeometryInput } from './tile-hover.type';

const hoverGeometry = (input: HoverGeometryInput): HoverGeometry => {
  const { event, vp, result, width, height, isIndoors } = input;
  const { mx, my, scaleX, scaleY, viewLeft, viewTop, worldX, worldY } = pointerWorld({ event, vp, width, height });
  const { x: screenWorldX, y: screenWorldY } = screenWorldOrigin(vp, result, isIndoors);

  return {
    mx, my, scaleX, scaleY, viewLeft, viewTop, screenWorldX, screenWorldY,
    tileCol: Math.floor((worldX - screenWorldX) / TILE_PX),
    tileRow: Math.floor((worldY - screenWorldY) / TILE_PX),
  };
};

export { hoverGeometry };
