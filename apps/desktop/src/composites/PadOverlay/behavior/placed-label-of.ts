/* @layer renderer-components @kind logic */
import type { PlacedLabel, PlacedPart } from '../PadOverlay.type';
import type { LabelOption } from './placement.type';

const placedLabelOf = (part: PlacedPart, option: LabelOption): PlacedLabel => ({
  part,
  leader: [...option.leader, option.spot.tail],
  anchor: option.spot.anchor,
  nameAt: option.spot.nameAt,
  detailAt: option.spot.detailAt,
});

export { placedLabelOf };
