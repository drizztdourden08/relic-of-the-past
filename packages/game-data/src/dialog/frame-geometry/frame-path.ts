/* @layer shared-game @kind logic */
import type { DialogCorner } from '../box-style';
import type { FrameBox } from './frame-geometry.type';

const framePath = (box: FrameBox, corner: DialogCorner, size: number): string => {
  const { w, h, inset } = box;
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const c = Math.max(0, Math.min(size, (x1 - x0) / 2, (y1 - y0) / 2));
  if (corner === 'square' || c === 0) return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  if (corner === 'chamfered') {
    return `M${x0 + c} ${y0}H${x1 - c}L${x1} ${y0 + c}V${y1 - c}L${x1 - c} ${y1}H${x0 + c}L${x0} ${y1 - c}V${y0 + c}Z`;
  }
  const arc = (x: number, y: number): string => `A${c} ${c} 0 0 1 ${x} ${y}`;
  return `M${x0 + c} ${y0}H${x1 - c}${arc(x1, y0 + c)}V${y1 - c}${arc(x1 - c, y1)}H${x0 + c}${arc(x0, y1 - c)}V${y0 + c}${arc(x0 + c, y0)}Z`;
};

export { framePath };
