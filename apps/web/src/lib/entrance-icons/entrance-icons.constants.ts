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

export { ENTRANCE_ICONS, STAIR_ICON, WALK_BOUNDARY_ICON, WARP_ICON, ENTRANCE_COLOR, WALK_BOUNDARY_COLOR };
