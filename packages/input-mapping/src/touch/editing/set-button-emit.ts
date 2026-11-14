/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchEmit } from '@rotp/features';
import { emitLabel } from './emit-label';
import { updateButton } from './update-button';

const setButtonEmit = (layout: OrientationLayout, id: string, emit: TouchEmit): OrientationLayout =>
  updateButton(layout, id, { emit, label: emitLabel(emit) });

export { setButtonEmit };
