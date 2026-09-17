/* @layer renderer-widgets @kind logic */
/**
 * What a click on a heart cell writes. Pure, so the cell math is testable without a DOM.
 * Health and capacity are in the game's units: 8 per heart, 4 per half heart.
 */

const HEART_UNITS = 8;
const HALF_HEART = HEART_UNITS / 2;

type HeartWrite = {
  health?: number;
  capacity?: number;
};

type HeartButton = 0 | 2;

/**
 * Left click: health lands on that heart. The left half of an owned cell lands on the half
 * heart. A cell past the capacity raises the capacity to include it, then fills it.
 * Right click: capacity lands on that heart.
 */
const heartWrite = (cell: number, leftHalf: boolean, button: HeartButton, capacity: number): HeartWrite => {
  const containers = (cell + 1) * HEART_UNITS;
  if (button === 2) return { capacity: containers };
  const owned = containers <= capacity;
  const units = containers - (leftHalf && owned ? HALF_HEART : 0);
  if (units > capacity) return { capacity: containers, health: units };
  return { health: units };
};

/** The tooltip on a cell: its number when owned, what a click gives when it is a ghost. */
const heartCellTitle = (cell: number, capacity: number): string => {
  const owned = Math.floor(capacity / HEART_UNITS);
  return cell < owned ? `Heart ${cell + 1}` : `Click: ${cell + 1} hearts (raises containers)`;
};

export { heartWrite, heartCellTitle, HEART_UNITS };
export type { HeartWrite, HeartButton };
