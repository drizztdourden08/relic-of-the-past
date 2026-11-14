/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButton } from '@rotp/features';

const updateButton = (layout: OrientationLayout, id: string, patch: Partial<TouchButton>): OrientationLayout => ({
  ...layout,
  buttons: layout.buttons.map((button) => (button.id === id ? { ...button, ...patch } : button)),
});

export { updateButton };
