/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButtonShape } from '@rotp/features';
import { updateButton } from './update-button';

/** Switches a button between round and pill. */
const setButtonShape = (layout: OrientationLayout, id: string, shape: TouchButtonShape): OrientationLayout =>
  updateButton(layout, id, { shape });

export { setButtonShape };
