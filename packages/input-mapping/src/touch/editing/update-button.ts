/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButton } from '@rotp/features';

/** Returns a layout where the button with this id is replaced by the patched copy. */
const updateButton = (layout: OrientationLayout, id: string, patch: Partial<TouchButton>): OrientationLayout => ({
  ...layout,
  buttons: layout.buttons.map((button) => (button.id === id ? { ...button, ...patch } : button)),
});

export { updateButton };
