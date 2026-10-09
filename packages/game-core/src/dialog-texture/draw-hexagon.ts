/* @layer renderer-lib @kind logic */
import { HEX_RADIUS } from './patterns.constants';

const drawHexagon = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (i * Math.PI) / 3;
    const x = HEX_RADIUS * Math.cos(angle);
    const y = HEX_RADIUS * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
};

export { drawHexagon };
