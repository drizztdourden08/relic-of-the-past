/* @layer renderer-app @kind logic */
import type { OrientationLayout, TouchOrientation } from '@rotp/features';
import { toPx } from '@rotp/input-mapping';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';
import type { TouchEditorSelection } from '../TouchLayoutEditor.state.type';
import { movementGeometry } from './movement-geometry';

type CardSide = 'left' | 'right' | 'top' | 'bottom';

const selectedCentre = (
  selection: TouchEditorSelection,
  layout: OrientationLayout,
  box: ScreenBox,
): PxPoint | null => {
  if (selection?.kind === 'button') {
    const found = layout.buttons.find((button) => button.id === selection.id);
    return found ? toPx(found.at, box) : null;
  }
  if (selection?.kind === 'movement') {
    const { zone, centre } = movementGeometry(layout, box);
    if (zone) return { x: zone.left + zone.width / 2, y: zone.top + zone.height / 2 };
    return centre;
  }
  return null;
};

/** The half of the screen opposite the selected piece, so the card never covers it. */
const cardSide = (
  selection: TouchEditorSelection,
  layout: OrientationLayout,
  box: ScreenBox,
  orientation: TouchOrientation,
): CardSide => {
  const centre = selectedCentre(selection, layout, box);
  if (orientation === 'landscape') return centre && centre.x >= box.width / 2 ? 'left' : 'right';
  return centre && centre.y >= box.height / 2 ? 'top' : 'bottom';
};

export { cardSide };
export type { CardSide };
