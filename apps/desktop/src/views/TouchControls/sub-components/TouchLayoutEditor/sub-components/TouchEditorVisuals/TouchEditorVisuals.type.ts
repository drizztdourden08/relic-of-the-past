/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { TouchEditorSelection } from '../../TouchLayoutEditor.state.type';

interface TouchEditorVisualsProps {
  layout: OrientationLayout;
  box: ScreenBox;
  strength: number;
  selection: TouchEditorSelection;
}

export type { TouchEditorVisualsProps };
