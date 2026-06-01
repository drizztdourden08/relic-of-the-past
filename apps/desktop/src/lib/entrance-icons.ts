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
import { getScreenLookup } from '@shared/game/data/screens';

export type EntranceType = 'door' | 'cave' | 'hole' | 'well' | 'dungeon' | 'fairy' | 'shop' | 'house' | 'overworld' | 'respawn' | 'unknown';

export interface IconData { body: string; width?: number; height?: number; }

/** Icon data for each entrance type */
export const ENTRANCE_ICONS: Record<EntranceType, IconData> = {
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
export const STAIR_ICON: IconData = exitDoorIcon;

/** Icon for palace-toggle walk boundaries (secret door, purple) */
export const WALK_BOUNDARY_ICON: IconData = secretDoorIcon;

/** Color for standard entrance icons */
export const ENTRANCE_COLOR = '#ffcc44';

/** Color for walk-boundary (palace toggle) icons */
export const WALK_BOUNDARY_COLOR = '#cc88ff';

/**
 * Classify an entrance by its ID and context.
 * Single source of truth — used by both overlay canvas and React widget.
 */
export function classifyEntranceType(
  entId: number,
  roomId: number,
  roomIndex: number,
  isIndoors: boolean,
  respawnEntIds?: Set<number>,
): EntranceType {
  if (respawnEntIds?.has(entId)) return 'respawn';
  if (entId >= 200 && entId < 1000) return 'hole';
  if (entId >= 1000) {
    const screen = getScreenLookup().byCaveRoom.get(roomIndex);
    if (!screen) return 'overworld';
    if (screen.type === 'dungeon') return 'dungeon';
    if (screen.type === 'interior') {
      const kind = screen.interior.kind;
      if (kind === 'shop') return 'shop';
      if (kind === 'fairy') return 'fairy';
      if (kind === 'house') return 'house';
      if (kind === 'cave') return 'cave';
    }
    return 'door';
  }
  if (isIndoors) return 'overworld';
  const screen = getScreenLookup().byCaveRoom.get(roomId);
  if (!screen) return 'overworld';
  if (screen.type === 'dungeon') return 'dungeon';
  if (screen.type === 'interior') {
    const kind = screen.interior.kind;
    if (kind === 'shop') return 'shop';
    if (kind === 'fairy') return 'fairy';
    if (kind === 'house') return 'house';
    if (kind === 'cave') return 'cave';
  }
  return 'door';
}

/**
 * Get the icon data and color for a given entrance.
 * Handles synthetic IDs (stairs, walk boundaries) automatically.
 */
export function getEntranceIcon(
  entId: number,
  roomId: number,
  roomIndex: number,
  isIndoors: boolean,
  respawnEntIds?: Set<number>,
): { icon: IconData; color: string } {
  if (entId >= 2000 && isIndoors) return { icon: WALK_BOUNDARY_ICON, color: WALK_BOUNDARY_COLOR };
  if (entId >= 1000 && isIndoors) return { icon: STAIR_ICON, color: ENTRANCE_COLOR };
  const type = classifyEntranceType(entId, roomId, roomIndex, isIndoors, respawnEntIds);
  return { icon: ENTRANCE_ICONS[type], color: ENTRANCE_COLOR };
}
