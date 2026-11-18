/* @layer renderer-components @kind constants */
import type { MessageKey } from '@drizztdourden08/brock-core/i18n';
import type { EditorTool } from '@app/stores/shadow-editor-store';

const TOOL_OPTIONS: { value: EditorTool; key: MessageKey }[] = [
  { value: 'select', key: 'views-shadow-editor:tool.select' },
  { value: 'polygon', key: 'views-shadow-editor:tool.shape' },
  { value: 'freehand', key: 'views-shadow-editor:tool.draw' },
  { value: 'point-light', key: 'views-shadow-editor:tool.light' },
  { value: 'shape-light', key: 'views-shadow-editor:tool.area' },
];

const POLYGON_SIDES = [3, 4, 5, 6, 8];

export { POLYGON_SIDES, TOOL_OPTIONS };
