/* @layer renderer-components @kind logic */
import { worldToDisplay } from './world-to-display';
import type { ScreenData, Vp } from './overlay.type';

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

export { drawLights };
