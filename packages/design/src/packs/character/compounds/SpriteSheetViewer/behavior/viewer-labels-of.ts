/* @layer renderer-components @kind logic */
import { DEFAULT_VIEWER_TEXT } from './viewer-labels-of.constants';
import type { ViewerLabels } from '../SpriteSheetViewer.type';

const defaultFps = (fps: number): string => `${fps} fps`;

const defaultZoom = (zoom: number): string => `Zoom ${zoom}x`;

const viewerLabelsOf = (given?: Partial<ViewerLabels>): ViewerLabels => ({
  ...DEFAULT_VIEWER_TEXT,
  fps: defaultFps,
  zoom: defaultZoom,
  ...given,
});

export { viewerLabelsOf };
