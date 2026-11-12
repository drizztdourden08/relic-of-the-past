/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { TouchEditorSelection } from '../TouchLayoutEditor.state.type';

interface EditorActionsInput {
  layout: OrientationLayout;
  onLayout: (layout: OrientationLayout) => void;
  onSelect: (selection: TouchEditorSelection) => void;
}

export type { EditorActionsInput };
