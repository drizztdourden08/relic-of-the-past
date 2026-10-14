/* @layer renderer-components @kind types */
import type { RectSelection, SelectionRect } from '../behavior/rect-selection.type';

interface RectSelectionViewProps {
  selectionRect: SelectionRect | null;
  rectSel: RectSelection | null;
  copied: boolean;
}

export type { RectSelectionViewProps };
