/* @layer renderer-components @kind logic */
import { FRAME_PAD, MIN_SCALE_RATIO, SEARCH_STEPS } from '../PadOverlay.constants';
import type { FitAttempt, FitInput, OverlayLayout } from '../PadOverlay.type';
import { columnsFit } from './columns-fit';
import { frameAt } from './frame-at';
import { labelSlack } from './label-slack';
import { layoutLabels } from './layout-labels';

const attempt = (input: FitInput, scale: number): FitAttempt => {
  const first = frameAt(input, scale, 0);
  const slack = labelSlack(layoutLabels(first.parts, input.sides, first.frame), input.widths, input.metrics.width);
  const { frame, parts } = frameAt(input, scale, (slack.right - slack.left) / 2);
  const layout = { frame, parts, labels: layoutLabels(parts, input.sides, frame) };
  return { layout, fits: slack.left + slack.right >= 0 && columnsFit(frame, input.sides) };
};

const fitLayout = (input: FitInput): OverlayLayout => {
  const { metrics, bounds } = input;
  let high = Math.min((metrics.width - FRAME_PAD * 2) / bounds.w, (metrics.height - FRAME_PAD * 2) / bounds.h);
  let low = high * MIN_SCALE_RATIO;
  let best = attempt(input, low).layout;
  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const middle = (low + high) / 2;
    const result = attempt(input, middle);
    if (result.fits) {
      low = middle;
      best = result.layout;
    } else {
      high = middle;
    }
  }
  return best;
};

export { fitLayout };
