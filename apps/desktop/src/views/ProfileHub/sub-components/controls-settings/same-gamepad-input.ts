/* @layer renderer-components @kind logic */
import type { InputBinding } from '@rotp/game-data';

const sameGamepadInput = (a: InputBinding, b: InputBinding): boolean => {
  if (a.type === 'gamepad-button' && b.type === 'gamepad-button') return a.index === b.index;
  if (a.type === 'gamepad-axis' && b.type === 'gamepad-axis') {
    return a.axisIndex === b.axisIndex && a.direction === b.direction;
  }
  return false;
};

export { sameGamepadInput };
