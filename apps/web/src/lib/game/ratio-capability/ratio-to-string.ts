/* @layer bridge-wasm @kind logic */
import { SERVED_HEIGHT } from './ratio-capability.constants';

const ratioToString = (ratio: number): string => {
  const height = SERVED_HEIGHT;
  const width = Math.max(1, Math.round(ratio * height));
  const divide = (a: number, b: number): number => (b === 0 ? a : divide(b, a % b));
  const g = divide(width, height) || 1;
  return `${width / g}:${height / g}`;
};

export { ratioToString };
