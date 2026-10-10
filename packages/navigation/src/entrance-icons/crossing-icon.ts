/* @layer renderer-lib @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';
import type { IconData } from './entrance-icons.type';
import { ENTRANCE_COLOR, ENTRANCE_ICONS, ORIGIN_ICONS } from './entrance-icons.constants';
import { destinationIconType } from './destination-icon-type';

const targetRoomOf = (crossing: ScreenCrossing): number => {
  const native = crossing.target.native;
  return native?.kind === 'room' ? native.room : 0;
};

const crossingIcon = (crossing: ScreenCrossing): { icon: IconData; color: string } => {
  const fixed = ORIGIN_ICONS[crossing.origin];
  if (fixed) return { ...fixed };
  return { icon: ENTRANCE_ICONS[destinationIconType(targetRoomOf(crossing))], color: ENTRANCE_COLOR };
};

export { crossingIcon };
