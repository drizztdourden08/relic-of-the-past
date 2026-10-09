/* @layer shared-input @kind logic */
import { STICK_DIRECTION_DEADZONE } from './stick-direction-icon.constants';

const resolveStickDirectionIcon = (basePrefix: string, x: number, y: number): string => {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  if (ax < STICK_DIRECTION_DEADZONE && ay < STICK_DIRECTION_DEADZONE) return basePrefix;
  if (ax > ay) {
    if (ax > STICK_DIRECTION_DEADZONE && ay > STICK_DIRECTION_DEADZONE) return `${basePrefix}-horizontal`;
    return `${basePrefix}-${x > 0 ? 'right' : 'left'}`;
  }
  if (ax > STICK_DIRECTION_DEADZONE && ay > STICK_DIRECTION_DEADZONE) return `${basePrefix}-vertical`;
  return `${basePrefix}-${y > 0 ? 'down' : 'up'}`;
};

export { resolveStickDirectionIcon };
