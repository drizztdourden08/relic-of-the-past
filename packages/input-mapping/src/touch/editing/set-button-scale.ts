/* @layer shared-input @kind logic */
import type { OrientationLayout } from '@rotp/features';
import { clampNumber } from '../geometry/clamp-number';
import { lockedGroupOf } from './locked-group-of';
import { MAX_BUTTON_SCALE, MIN_BUTTON_SCALE } from './set-button-scale.constants';

const setButtonScale = (layout: OrientationLayout, id: string, scale: number): OrientationLayout => {
  const target = layout.buttons.find((button) => button.id === id);
  if (!target) return layout;
  const value = clampNumber(scale, MIN_BUTTON_SCALE, MAX_BUTTON_SCALE);
  const groupId = lockedGroupOf(layout, target);
  return {
    ...layout,
    buttons: layout.buttons.map((button) =>
      button.id === id || (groupId !== null && button.group === groupId) ? { ...button, scale: value } : button,
    ),
  };
};

export { setButtonScale };
