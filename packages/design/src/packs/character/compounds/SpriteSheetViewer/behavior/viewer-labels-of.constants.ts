/* @layer renderer-components @kind data */
import type { ViewerLabels } from '../SpriteSheetViewer.type';

const DEFAULT_VIEWER_TEXT: Omit<ViewerLabels, 'fps' | 'zoom'> = {
  viewState: 'One state',
  viewContact: 'All states',
  viewSheet: 'Tile sheet',
  play: 'Play',
  pause: 'Pause',
  step: 'Step',
  fpsAria: 'Frames per second',
  zoomAria: 'Zoom',
};

export { DEFAULT_VIEWER_TEXT };
