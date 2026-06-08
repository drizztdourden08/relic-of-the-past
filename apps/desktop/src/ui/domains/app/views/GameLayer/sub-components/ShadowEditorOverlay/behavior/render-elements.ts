/* @layer renderer-components @kind logic */
import { worldToDisplay } from './coords';
import type { Vp } from './coords';
import type { ScreenData } from './hittest';

/** Draw all heightmap shapes for the screen (fill + stroke, height-tinted). */
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

/** Draw all light sources (radius ring + center dot). */
const drawLights = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, screenData: ScreenData, selectedElementId: string | null): void => {
  const scaleX = width / vp.snesWidth;
  ctx.globalAlpha = 0.8;
  for (const light of screenData.lights) {
    const dp = worldToDisplay(vp, width, height, light.x, light.y);
    const isSelected = light.id === selectedElementId;
    ctx.beginPath();
    ctx.arc(dp.x, dp.y, light.radius * scaleX, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? 'rgba(255, 204, 0, 0.5)' : 'rgba(255, 238, 136, 0.2)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(dp.x, dp.y, isSelected ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#ffcc00' : '#ffee88';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#ff8800' : '#aa8844';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (isSelected) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${light.type} i=${light.intensity.toFixed(1)}`, dp.x, dp.y - 12);
    }
  }
};

/** Draw the freehand polygon currently being drawn. */
const drawFreehandInProgress = (ctx: CanvasRenderingContext2D, vp: Vp, width: number, height: number, freehandPoints: { x: number; y: number }[]): void => {
  if (freehandPoints.length === 0) return;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 0; i < freehandPoints.length; i++) {
    const dp = worldToDisplay(vp, width, height, freehandPoints[i].x, freehandPoints[i].y);
    if (i === 0) ctx.moveTo(dp.x, dp.y);
    else ctx.lineTo(dp.x, dp.y);
  }
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const p of freehandPoints) {
    const dp = worldToDisplay(vp, width, height, p.x, p.y);
    ctx.beginPath();
    ctx.arc(dp.x, dp.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
  }
};

export { drawHeightmaps, drawLights, drawFreehandInProgress };
