/* @layer renderer-components @kind logic */
/**
 * Which tab a key press moves to, following the standard tab-strip keys:
 * the arrows step and wrap, Home and End jump to the ends. Any other key
 * answers null and is left to the browser, since a plain tab button already
 * activates on Enter and Space on its own.
 */

const STEP_BY_KEY: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

const tabIndexForKey = (key: string, current: number, count: number): number | null => {
  if (count === 0) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const step = STEP_BY_KEY[key];
  return step === undefined ? null : (current + step + count) % count;
};

export { tabIndexForKey };
