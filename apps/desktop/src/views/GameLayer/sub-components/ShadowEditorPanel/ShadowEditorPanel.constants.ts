/* @layer renderer-components @kind constants */
import type { EditorTool } from '../../../../stores/shadow-editor-store';

const TOOL_OPTIONS: { value: EditorTool; label: string }[] = [
  { value: 'select', label: '↖ Select' },
  { value: 'polygon', label: '⬡ Shape' },
  { value: 'freehand', label: '✏ Draw' },
  { value: 'point-light', label: '💡 Light' },
  { value: 'shape-light', label: '🔦 Area' },
];

const POLYGON_OPTIONS = [
  { value: '3', label: '△' },
  { value: '4', label: '◻' },
  { value: '5', label: '⬠' },
  { value: '6', label: '⬡' },
  { value: '8', label: '◯' },
];

export { TOOL_OPTIONS, POLYGON_OPTIONS };
