/* @layer renderer-components @kind logic */
import type { ViewerLabels } from '../SpriteSheetViewer.type';

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

const viewerLabelsOf = (given?: Partial<ViewerLabels>): ViewerLabels => ({ ...DEFAULT_VIEWER_LABELS, ...given });

export { viewerLabelsOf };
