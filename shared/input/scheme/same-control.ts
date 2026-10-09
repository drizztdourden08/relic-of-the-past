/* @layer shared-input @kind logic */
import type { InputBinding } from '@rotp/game-data';

const sameControl = (a: InputBinding, b: InputBinding): boolean => {
  if (a.type !== b.type) return false;
  if (a.type === 'keyboard' && b.type === 'keyboard') return a.code === b.code;
  if (a.type === 'gamepad-button' && b.type === 'gamepad-button') return a.index === b.index;
  if (a.type === 'gamepad-axis' && b.type === 'gamepad-axis') {
    return a.axisIndex === b.axisIndex && a.direction === b.direction;
  }
  return false;
};

export { sameControl };
