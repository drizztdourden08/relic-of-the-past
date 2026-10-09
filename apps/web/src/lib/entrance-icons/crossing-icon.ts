/* @layer renderer-lib @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';
import type { IconData } from './entrance-icons.type';
import {
  ENTRANCE_COLOR, ENTRANCE_ICONS, STAIR_ICON, WALK_BOUNDARY_COLOR, WALK_BOUNDARY_ICON, WARP_ICON,
} from './entrance-icons.constants';
import { destinationIconType } from './destination-icon-type';

const targetRoomOf = (crossing: ScreenCrossing): number => {
  const native = crossing.target.native;
  return native?.kind === 'room' ? native.room : 0;
};

const crossingIcon = (crossing: ScreenCrossing): { icon: IconData; color: string } => {
  switch (crossing.origin) {
    case 'respawn': return { icon: ENTRANCE_ICONS.respawn, color: ENTRANCE_COLOR };
    case 'fall-hole': return { icon: ENTRANCE_ICONS.hole, color: ENTRANCE_COLOR };
    case 'room-stair': return { icon: STAIR_ICON, color: ENTRANCE_COLOR };
    case 'room-border': return { icon: WALK_BOUNDARY_ICON, color: WALK_BOUNDARY_COLOR };
    case 'warp-slot': return { icon: WARP_ICON, color: ENTRANCE_COLOR };
    case 'room-doorway': return { icon: ENTRANCE_ICONS.door, color: ENTRANCE_COLOR };
    case 'room-door':
    case 'exit-table': return { icon: ENTRANCE_ICONS.overworld, color: ENTRANCE_COLOR };
    default: return { icon: ENTRANCE_ICONS[destinationIconType(targetRoomOf(crossing))], color: ENTRANCE_COLOR };
  }
};

export { crossingIcon };
