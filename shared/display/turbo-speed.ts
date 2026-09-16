/* @layer shared-game @kind logic */
/**
 * The turbo speed ladder. The upstream desktop build ran 16x while its key was held, which is
 * unplayable: text and menus fly past before they can be read. This ladder climbs from a gentle
 * 1.25x to a 10x ceiling, with the steps widening as they go so the slider feels even.
 */

/** Multipliers the slider can pick, lowest first. */
const TURBO_SPEEDS: readonly number[] = [1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 7.5, 10];

/** What a fresh profile gets: fast enough to matter, slow enough to still read dialog. */
const DEFAULT_TURBO_SPEED = 2;

/** The slider index of a stored multiplier, snapping to the nearest rung for an unknown value. */
const turboSpeedIndex = (speed: number): number => {
  let best = 0;
  for (let i = 1; i < TURBO_SPEEDS.length; i++) {
    if (Math.abs(TURBO_SPEEDS[i] - speed) < Math.abs(TURBO_SPEEDS[best] - speed)) best = i;
  }
  return best;
};

/** The multiplier at a slider index, clamped to the ladder. */
const turboSpeedAt = (index: number): number => {
  const clamped = Math.min(TURBO_SPEEDS.length - 1, Math.max(0, Math.round(index)));
  return TURBO_SPEEDS[clamped];
};

/** The whole-percent value the core takes, snapped to the ladder so an odd stored value never leaks through. */
const turboSpeedPercent = (speed: number): number => Math.round(turboSpeedAt(turboSpeedIndex(speed)) * 100);

/** Display form, e.g. "2x" or "1.25x". */
const formatTurboSpeed = (speed: number): string => `${turboSpeedAt(turboSpeedIndex(speed))}x`;

export { DEFAULT_TURBO_SPEED, TURBO_SPEEDS, formatTurboSpeed, turboSpeedAt, turboSpeedIndex, turboSpeedPercent };
