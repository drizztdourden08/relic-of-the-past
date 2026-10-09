/* @layer renderer-components @kind logic */
import { worldToDisplay } from './world-to-display';
import type { ScreenData, Vp } from './overlay.type';

const drawHeightmaps = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, screenData: ScreenData, selectedElementId: string | null): void => {
  const scaleX = width / vp.snesWidth;
  const scaleY = height / vp.snesHeight;
  ctx.globalAlpha = 0.5;
  for (const el of screenData.heightmap) {
    const dp = worldToDisplay(vp, width, height, el.shape.x, el.shape.y);
    const isSelected = el.id === selectedElementId;
    ctx.save();
    ctx.translate(dp.x, dp.y);
    ctx.rotate((el.shape.rotation ?? 0) * Math.PI / 180);
    const hw = (el.shape.width / 2) * scaleX;
    const hh = (el.shape.height / 2) * scaleY;
    const hue = 200 + el.height * 60;
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${0.2 + el.height * 0.3})`;
    ctx.strokeStyle = isSelected ? '#ffcc00' : `hsla(${hue}, 80%, 60%, 0.8)`;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    if (el.shape.type === 'freehand' && el.shape.points) {
      ctx.beginPath();
      for (let i = 0; i < el.shape.points.length; i++) {
        const pp = worldToDisplay(vp, width, height, el.shape.points[i].x, el.shape.points[i].y);
        if (i === 0) ctx.moveTo(pp.x - dp.x, pp.y - dp.y);
        else ctx.lineTo(pp.x - dp.x, pp.y - dp.y);
      }
      ctx.closePath();
    } else {
      const sides = el.shape.sides ?? 4;
      const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + startAngle;
        if (i === 0) ctx.moveTo(Math.cos(angle) * hw, Math.sin(angle) * hh);
        else ctx.lineTo(Math.cos(angle) * hw, Math.sin(angle) * hh);
      }
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    if (isSelected) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`h=${el.height.toFixed(2)}`, 0, -hh - 4);
    }
    ctx.restore();
  }
};

export { drawHeightmaps };
