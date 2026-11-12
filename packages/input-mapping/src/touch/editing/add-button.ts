/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchEmit, TouchPoint } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { ROUND_EMITS } from './add-button.constants';
import { emitLabel } from './emit-label';
import { uniqueButtonId } from './unique-button-id';

const addButton = (layout: OrientationLayout, emit: TouchEmit, at: TouchPoint): OrientationLayout => {
  const button = {
    id: uniqueButtonId(new Set(layout.buttons.map((b) => b.id)), emit),
    emit,
    label: emitLabel(emit),
    at: clampPoint(at),
    scale: 1,
    shape: ROUND_EMITS.has(emit) ? ('round' as const) : ('pill' as const),
    group: null,
  };
  return { ...layout, buttons: [...layout.buttons, button] };
};

export { addButton };
