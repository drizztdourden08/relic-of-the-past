/* @layer renderer-lib @kind logic */
import type { AxisDirection } from './raw-input-dispatcher.type';

const axisDirection = (value: number, threshold: number): AxisDirection => {
  if (Math.abs(value) > threshold) return value > 0 ? '+' : '-';
  return null;
};

export { axisDirection };
