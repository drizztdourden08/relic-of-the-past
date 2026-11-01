/* @layer website-site @kind logic */
import type { CloudRect, CloudTriangle } from '../CloudStage.type';

const insideOf = (triangle: CloudTriangle, x: number, y: number): boolean => {
  const depth = y - triangle.top;
  return depth >= 0 && depth <= triangle.height && Math.abs(x - triangle.centerX) <= (depth / triangle.height) * triangle.half;
};

const fitsIn = (triangle: CloudTriangle, rect: CloudRect): boolean => {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  return insideOf(triangle, rect.left, rect.top) && insideOf(triangle, right, rect.top) && insideOf(triangle, rect.left, bottom) && insideOf(triangle, right, bottom);
};

export { fitsIn };
