/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { useEditorDrag } from '../../behavior/useEditorDrag';
import type { TouchEditorSelection } from '../../TouchLayoutEditor.state.type';

interface TouchEditorHitAreasProps {
  layout: OrientationLayout;
  box: ScreenBox;
  drag: ReturnType<typeof useEditorDrag>;
  onSelect: (selection: TouchEditorSelection) => void;
}

export type { TouchEditorHitAreasProps };
