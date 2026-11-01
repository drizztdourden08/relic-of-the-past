/* @layer website-site @kind constants */
const VIEW_ANCHOR = 0.5;
const KEY_STEP = 0.08;
const KEY_STEPS: Record<string, number> = {
  ArrowDown: KEY_STEP,
  ArrowRight: KEY_STEP,
  ArrowUp: -KEY_STEP,
  ArrowLeft: -KEY_STEP,
};
const PROGRESS_VAR = '--rail-progress';
const PAST_ATTR = 'data-past';
const EMPTY_GEOMETRY = { top: 0, span: 1, fractions: [] } as const;

export { EMPTY_GEOMETRY, KEY_STEPS, PAST_ATTR, PROGRESS_VAR, VIEW_ANCHOR };
