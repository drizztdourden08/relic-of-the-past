/* @layer renderer-components @kind types */
import type { EditorTool } from '../../../../../stores/shadow-editor-store';

interface ShadowToolOptionsProps {
  activeTool: EditorTool;
  hasSelection: boolean;
}

export type { ShadowToolOptionsProps };
