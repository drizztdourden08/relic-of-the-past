/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';

const removeButton = (layout: OrientationLayout, id: string): OrientationLayout => ({
  ...layout,
  buttons: layout.buttons.filter((button) => button.id !== id),
});

export { removeButton };
