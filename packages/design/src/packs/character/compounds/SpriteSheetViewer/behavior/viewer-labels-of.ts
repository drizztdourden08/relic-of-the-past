/* @layer renderer-components @kind logic */
import { DEFAULT_VIEWER_LABELS } from '../SpriteSheetViewer.constants';
import type { ViewerLabels } from '../SpriteSheetViewer.type';

const viewerLabelsOf = (given?: Partial<ViewerLabels>): ViewerLabels => ({ ...DEFAULT_VIEWER_LABELS, ...given });

export { viewerLabelsOf };
