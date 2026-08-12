/* @layer shared-input @kind logic */
/**
 * Infers which of a stick's direction glyphs to show from a live, normalized
 * axis pair. A family declares only one base icon key per stick, shared by
 * both its X and Y axis in axisIcons (see nintendo.family.ts for the
 * pattern), instead of naming each of the four directions separately; the
 * neutral pose is that same base key. Shared here so the calibration card
 * and anything else that draws a stick agree on the same inference.
 */

/** How far off-center an axis must sit before it counts as deflected rather
 *  than resting; below this on both axes, the neutral glyph shows. */
const STICK_DIRECTION_DEADZONE = 0.4;

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

export { resolveStickDirectionIcon, STICK_DIRECTION_DEADZONE };
