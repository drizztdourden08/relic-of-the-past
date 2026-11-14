/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButton, TouchEmit, TouchPoint } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { emitLabel } from './emit-label';
import { formForEmit } from './form-for-emit';
import { uniqueButtonId } from './unique-button-id';

const addButton = (layout: OrientationLayout, emit: TouchEmit, at: TouchPoint): OrientationLayout => {
  const button: TouchButton = {
    id: uniqueButtonId(new Set(layout.buttons.map((b) => b.id)), emit),
    emit,
    label: emitLabel(emit),
    at: clampPoint(at),
    scale: 1,
    ...formForEmit(emit),
    group: null,
  };
  return { ...layout, buttons: [...layout.buttons, button] };
};

export { addButton };
