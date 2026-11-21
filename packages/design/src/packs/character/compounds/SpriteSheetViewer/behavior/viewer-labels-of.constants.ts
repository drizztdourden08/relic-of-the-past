/* @layer renderer-components @kind data */
import type { ViewerLabels } from '../SpriteSheetViewer.type';

type ViewerText = Pick<ViewerLabels, 'viewState' | 'viewContact' | 'viewSheet' | 'play' | 'pause' | 'step' | 'fpsAria' | 'zoomAria'>;

const DEFAULT_VIEWER_TEXT: ViewerText = {
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
