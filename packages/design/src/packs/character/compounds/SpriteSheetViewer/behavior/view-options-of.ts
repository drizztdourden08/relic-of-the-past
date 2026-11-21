/* @layer renderer-components @kind logic */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { SheetView, ViewerLabels } from '../SpriteSheetViewer.type';

const viewOptionsOf = (labels: ViewerLabels): SegmentOption<SheetView>[] => [
  { value: 'state', label: labels.viewState },
  { value: 'contact', label: labels.viewContact },
  { value: 'sheet', label: labels.viewSheet },
];

export { viewOptionsOf };
