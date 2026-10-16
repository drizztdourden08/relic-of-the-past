/* @layer renderer-components @kind constants */
import type { EditorTool } from '@app/stores/shadow-editor-store';

const TOOL_OPTIONS: { value: EditorTool; label: string }[] = [
  { value: 'select', label: 'Select' },
  { value: 'polygon', label: 'Shape' },
  { value: 'freehand', label: 'Draw' },
  { value: 'point-light', label: 'Light' },
  { value: 'shape-light', label: 'Area' },
];

const POLYGON_OPTIONS = [
  { value: '3', label: '3', title: '3 sides' },
  { value: '4', label: '4', title: '4 sides' },
  { value: '5', label: '5', title: '5 sides' },
  { value: '6', label: '6', title: '6 sides' },
  { value: '8', label: '8', title: '8 sides' },
];

export { TOOL_OPTIONS, POLYGON_OPTIONS };
