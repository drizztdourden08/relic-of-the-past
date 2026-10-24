/* @layer renderer-components @kind logic */
import { FRAME_PAD } from '../PadOverlay.constants';
import type { LabelSlack, PlacedLabel } from '../PadOverlay.type';

const labelSlack = (labels: readonly PlacedLabel[], widths: ReadonlyMap<string, number>, width: number): LabelSlack => {
  const slack = { left: width, right: width };
  labels.forEach(({ part, side, text }) => {
    const size = widths.get(part.slot.anchor) ?? 0;
    if (side === 'left') slack.left = Math.min(slack.left, text.x - size - FRAME_PAD);
    else slack.right = Math.min(slack.right, width - FRAME_PAD - text.x - size);
  });
  return slack;
};

export { labelSlack };
