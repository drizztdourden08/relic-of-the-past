/* @layer renderer-components @kind logic */
import type { OverlayFrame, PlacedLabel, PlacedPart } from '../PadOverlay.type';
import type { LabelOption } from './placement.type';

const placedLabelOf = (part: PlacedPart, option: LabelOption, frame: OverlayFrame): PlacedLabel => ({
  part,
  text: option.spot.text,
  anchor: option.spot.anchor,
  leader: option.leader,
  detailDy: frame.mode === 'stacked' && part.slot.kind !== 'button' ? frame.lineGap : 0,
});

export { placedLabelOf };
