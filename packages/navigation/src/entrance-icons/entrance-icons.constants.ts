/* @layer renderer-lib @kind constants */
import woodenDoor from '@iconify-icons/game-icons/wooden-door';
import caveEntrance from '@iconify-icons/game-icons/cave-entrance';
import dungeonGate from '@iconify-icons/game-icons/dungeon-gate';
import fairyIcon from '@iconify-icons/game-icons/fairy';
import shopIcon from '@iconify-icons/game-icons/shop';
import houseIcon from '@iconify-icons/game-icons/house';
import unknownIcon from '@iconify-icons/game-icons/perspective-dice-six-faces-random';
import exitDoorIcon from '@iconify-icons/game-icons/exit-door';
import secretDoorIcon from '@iconify-icons/game-icons/secret-door';
import respawnIcon from '@iconify-icons/game-icons/player-time';
import forestEntranceIcon from '@iconify-icons/game-icons/hills';
import holeIcon from '@iconify-icons/game-icons/hole';
import wellIcon from '@iconify-icons/game-icons/well';
import portalIcon from '@iconify-icons/game-icons/magic-portal';
import type { CrossingOrigin } from '@rotp/game-core';
import type { EntranceType, IconData } from './entrance-icons.type';

const ENTRANCE_ICONS: Record<EntranceType, IconData> = {
  door: woodenDoor,
  cave: caveEntrance,
  hole: holeIcon,
  well: wellIcon,
  dungeon: dungeonGate,
  fairy: fairyIcon,
  shop: shopIcon,
  house: houseIcon,
  overworld: forestEntranceIcon,
  respawn: respawnIcon,
  unknown: unknownIcon,
};

const STAIR_ICON: IconData = exitDoorIcon;
const WALK_BOUNDARY_ICON: IconData = secretDoorIcon;
const WARP_ICON: IconData = portalIcon;
const ENTRANCE_COLOR = '#ffcc44';
const WALK_BOUNDARY_COLOR = '#cc88ff';

const ORIGIN_ICONS: Partial<Record<CrossingOrigin, { icon: IconData; color: string }>> = {
  'respawn': { icon: ENTRANCE_ICONS.respawn, color: ENTRANCE_COLOR },
  'fall-hole': { icon: ENTRANCE_ICONS.hole, color: ENTRANCE_COLOR },
  'room-stair': { icon: STAIR_ICON, color: ENTRANCE_COLOR },
  'room-border': { icon: WALK_BOUNDARY_ICON, color: WALK_BOUNDARY_COLOR },
  'warp-slot': { icon: WARP_ICON, color: ENTRANCE_COLOR },
  'room-doorway': { icon: ENTRANCE_ICONS.door, color: ENTRANCE_COLOR },
  'room-door': { icon: ENTRANCE_ICONS.overworld, color: ENTRANCE_COLOR },
  'exit-table': { icon: ENTRANCE_ICONS.overworld, color: ENTRANCE_COLOR },
};

export { ORIGIN_ICONS, ENTRANCE_ICONS, ENTRANCE_COLOR };
