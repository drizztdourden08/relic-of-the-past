/* @layer renderer-lib @kind logic */
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
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import type { ScreenCrossing } from '@shared/game/navigation';

type EntranceType = 'door' | 'cave' | 'hole' | 'well' | 'dungeon' | 'fairy' | 'shop' | 'house' | 'overworld' | 'respawn' | 'unknown';

interface IconData { body: string; width?: number; height?: number; }

/** Icon data for each entrance type */
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

/** Icon for inter-room stair connections (exit door, gold) */
const STAIR_ICON: IconData = exitDoorIcon;

/** Icon for palace-toggle walk boundaries (secret door, purple) */
const WALK_BOUNDARY_ICON: IconData = secretDoorIcon;

/** Icon for a door that teleports to a header travel slot */
const WARP_ICON: IconData = portalIcon;

/** Color for standard entrance icons */
const ENTRANCE_COLOR = '#ffcc44';

/** Color for walk-boundary (palace toggle) icons */
const WALK_BOUNDARY_COLOR = '#cc88ff';

/** What a destination room looks like, so a door is drawn as what it opens onto. */
const destinationIconType = (roomId: number): EntranceType => {
  const screen = getScreenLookup().byCaveRoom.get(roomId);
  if (!screen) return 'overworld';
  if (screen.kind === 'dungeon') return 'dungeon';
  if (screen.kind === 'interior') {
    const kind = screen.interiorKind;
    if (kind === 'shop') return 'shop';
    if (kind === 'fairy') return 'fairy';
    if (kind === 'house') return 'house';
    if (kind === 'cave') return 'cave';
  }
  return 'door';
};

/** The room a crossing leads into, or 0 when it leads outside or nowhere. */
const targetRoomOf = (crossing: ScreenCrossing): number => {
  const native = crossing.target.native;
  return native?.kind === 'room' ? native.room : 0;
};

/**
 * The glyph for one crossing, chosen from the detector that produced it. A
 * crossing to the surface shows where it comes out; a crossing to another room
 * shows what that room is.
 */
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

export { ENTRANCE_ICONS, STAIR_ICON, WALK_BOUNDARY_ICON, WARP_ICON, ENTRANCE_COLOR, WALK_BOUNDARY_COLOR, destinationIconType, crossingIcon };
export type { EntranceType, IconData };
