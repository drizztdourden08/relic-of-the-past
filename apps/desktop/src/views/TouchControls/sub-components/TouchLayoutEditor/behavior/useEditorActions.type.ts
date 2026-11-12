/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { TouchEditorSelection } from '../TouchLayoutEditor.state.type';

interface EditorActionsInput {
  layout: OrientationLayout;
  box: ScreenBox;
  onLayout: (layout: OrientationLayout) => void;
  onSelect: (selection: TouchEditorSelection) => void;
}

export type { EditorActionsInput };
