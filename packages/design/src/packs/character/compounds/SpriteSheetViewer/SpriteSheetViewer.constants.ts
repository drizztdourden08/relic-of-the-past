/* @layer renderer-components @kind data */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { SheetView, ViewerLabels } from './SpriteSheetViewer.type';

const DEFAULT_VIEWER_LABELS: ViewerLabels = {
  viewState: 'One state',
  viewContact: 'All states',
  viewSheet: 'Tile sheet',
  play: 'Play',
  pause: 'Pause',
  step: 'Step',
  fpsAria: 'Frames per second',
  fps: (fps) => `${fps} fps`,
  zoomAria: 'Zoom',
  zoom: (zoom) => `Zoom ${zoom}x`,
};

const viewOptionsOf = (labels: ViewerLabels): SegmentOption<SheetView>[] => [
  { value: 'state', label: labels.viewState },
  { value: 'contact', label: labels.viewContact },
  { value: 'sheet', label: labels.viewSheet },
];

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const DEFAULT_SCALE = 3;
const BUNNY_ACTION = 0x21;

export { DEFAULT_VIEWER_LABELS, viewOptionsOf, MIN_SCALE, MAX_SCALE, DEFAULT_SCALE, BUNNY_ACTION };
