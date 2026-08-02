/* @layer renderer-widgets @kind logic */
/**
 * A dungeon's geography, joined through ids alone.
 *
 * `DungeonRecord` carries no area/location of its own, so the answer comes from
 * the rooms it lists — every room of a dungeon shares one `areaId`, one
 * `locationId` and one world. That replaces the old name-keyed meta table, whose
 * lookup silently returned nothing the moment a dungeon was renamed.
 */
import { getScreen } from '@shared/game/data';
import { dungeonForPalaceIndex } from '@shared/game/data/record-file-targets';
import type { AreaId, DungeonId, LocationId, ScreenWorld } from '@shared/game/data';

interface DungeonGeography {
  dungeonId: DungeonId;
  /** For display only. */
  randomizerName: string;
  areaId: AreaId;
  locationId: LocationId;
  world: ScreenWorld;
}

const dungeonGeographyFor = (palaceIndex: number): DungeonGeography | null => {
  const dungeon = dungeonForPalaceIndex(palaceIndex);
  const firstRoom = dungeon?.roomScreenIds[0];
  if (!dungeon || !firstRoom) return null;
  const room = getScreen(firstRoom);
  return {
    dungeonId: dungeon.id,
    randomizerName: dungeon.randomizerName,
    areaId: room.areaId,
    locationId: room.locationId,
    world: room.world,
  };
};

export { dungeonGeographyFor };
export type { DungeonGeography };
