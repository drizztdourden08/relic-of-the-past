/* @layer renderer-components @kind logic */
import type { ConnectionInfo } from '@shared/game/navigation';
import type { DrawContext } from './draw.type';
import { EDGE_COLORS } from '../navigation-overlay.constants';

const connectionTile = (edge: string, pos: number, isIntraRoom: boolean): [number, number] | null => {
  if (isIntraRoom) {
    switch (edge) {
      case 'north': return [32, pos];
      case 'south': return [31, pos];
      case 'east': return [pos, 31];
      case 'west': return [pos, 32];
      default: return null;
    }
  }
  switch (edge) {
    case 'north': return [0, pos];
    case 'south': return [63, pos];
    case 'east': return [pos, 63];
    case 'west': return [pos, 0];
    default: return null;
  }
};

const drawConnections = (dc: DrawContext, connections: ConnectionInfo[]): void => {
  const { ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH, TILE_PX, dotRadius, screenWorldX, screenWorldY, getScreenWorldOrigin } = dc;

  ctx.globalAlpha = 0.85;
  for (const conn of connections) {
    ctx.fillStyle = EDGE_COLORS[conn.edge] ?? '#fff';
    const connOrigin = conn.sourceScreen != null
      ? getScreenWorldOrigin(conn.sourceScreen)
      : { x: screenWorldX, y: screenWorldY };
    for (const pos of conn.positions) {
      const tile = connectionTile(conn.edge, pos, !!conn.isIntraRoom);
      if (!tile) continue;
      const [r, c] = tile;

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
