/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchEmit, TouchPoint } from '@rotp/features';
import { clampPoint } from '../geometry/clamp-point';
import { emitLabel } from './emit-label';

const ROUND_EMITS: ReadonlySet<TouchEmit> = new Set<TouchEmit>(['a', 'b', 'x', 'y']);

/** Adds a free button with an id of the form `<emit>-<n>` that no other button uses. */
const addButton = (layout: OrientationLayout, emit: TouchEmit, at: TouchPoint): OrientationLayout => {
  const used = new Set(layout.buttons.map((button) => button.id));
  let n = 1;
  while (used.has(`${emit}-${n}`)) n += 1;
  const button = {
    id: `${emit}-${n}`,
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
