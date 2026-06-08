/* @layer renderer-components @kind logic */
import type { ConnectionInfo } from '@shared/game/navigation';
import type { DrawContext } from './draw-context';
import { EDGE_COLORS } from '../navigation-overlay.type';

const drawConnections = (dc: DrawContext, connections: ConnectionInfo[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, dotRadius, screenWorldX, screenWorldY, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.85;
  for (const conn of connections) {
    ctx.fillStyle = EDGE_COLORS[conn.edge] ?? '#fff';
    const connOrigin = conn.sourceScreen != null
      ? getScreenWorldOrigin(conn.sourceScreen)
      : { x: screenWorldX, y: screenWorldY };
    for (const pos of conn.positions) {
      let r: number, c: number;
      if (conn.isIntraRoom) {
        switch (conn.edge) {
          case 'north': r = 32; c = pos; break;
          case 'south': r = 31; c = pos; break;
          case 'east': r = pos; c = 31; break;
          case 'west': r = pos; c = 32; break;
          default: continue;
        }
      } else {
        switch (conn.edge) {
          case 'north': r = 0; c = pos; break;
          case 'south': r = 63; c = pos; break;
          case 'east': r = pos; c = 63; break;
          case 'west': r = pos; c = 0; break;
          default: continue;
        }
      }

      const worldX = connOrigin.x + c * TILE_PX + TILE_PX / 2;
      const worldY = connOrigin.y + r * TILE_PX + TILE_PX / 2;
      const screenX = worldX - viewLeft;
      const screenY = worldY - viewTop;
      if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
      if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

      const dx = screenX * scaleX;
      const dy = screenY * scaleY;
      ctx.beginPath();
      ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

export { drawConnections };
