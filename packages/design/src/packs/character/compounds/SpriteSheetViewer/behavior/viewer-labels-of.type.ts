/* @layer renderer-components @kind types */
import type { ViewerLabels } from '../SpriteSheetViewer.type';

type ViewerText = Pick<ViewerLabels, 'viewState' | 'viewContact' | 'viewSheet' | 'play' | 'pause' | 'step' | 'fpsAria' | 'zoomAria'>;

export type { ViewerText };
