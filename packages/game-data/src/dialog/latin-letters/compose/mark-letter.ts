/* @layer shared-game @kind logic */
import { MAX_SQUASH, MIN_SQUASHED_BODY } from '../latin-letters.constants';
import { maskBox } from '../mask/mask-box';
import { removeTittle } from '../mask/remove-tittle';
import { squashMask } from '../mask/squash-mask';
import { applyOverlay } from './apply-overlay';
import type { MarkStep } from './compose.type';
import { placeMark } from './place-mark';

const applySteps = (mask: Uint8Array, steps: readonly MarkStep[], compact: boolean, strict: boolean): Uint8Array | undefined => {
  let current = mask;
  for (const step of steps) {
    if (step.kind === 'overlay') {
      const marked = applyOverlay(current, step.overlay);
      if (marked === undefined && strict) return undefined;
      current = marked?.mask ?? current;
      continue;
    }
    const rows = compact ? (step.art.compact ?? step.art.rows) : step.art.rows;
    const placed = placeMark(current, rows, step.art.place, strict);
    if (placed === undefined) return undefined;
    current = placed;
  }
  return current;
};

const wantsDotless = (steps: readonly MarkStep[]): boolean =>
  steps.some((step) => (step.kind === 'overlay' ? step.overlay === 'horn' : step.art.place === 'above'));

const squashBudget = (mask: Uint8Array): number => {
  const box = maskBox(mask);
  const height = box === undefined ? 0 : box.bottom - box.top + 1;
  return Math.max(0, Math.min(MAX_SQUASH, height - MIN_SQUASHED_BODY));
};

const markLetter = (base: Uint8Array, steps: readonly MarkStep[], tittle: boolean): Uint8Array => {
  const start = tittle && wantsDotless(steps) ? removeTittle(base) : base;
  const budget = squashBudget(start);
  let squashed = start;
  for (const compact of [false, true]) {
    squashed = start;
    for (let n = 0; n <= budget; n++) {
      const marked = applySteps(squashed, steps, compact, true);
      if (marked !== undefined) return marked;
      if (n < budget) squashed = squashMask(squashed);
    }
  }
  return applySteps(squashed, steps, true, false) ?? start;
};

export { markLetter };
