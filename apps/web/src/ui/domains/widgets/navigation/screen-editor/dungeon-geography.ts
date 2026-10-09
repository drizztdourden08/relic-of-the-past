/* @layer renderer-widgets @kind logic */
import { getScreen } from '@shared/game/data';
import { dungeonForPalaceIndex } from '@shared/game/data/record-file-targets';
import type { DungeonGeography } from './screen-editor.type';

const dungeonGeographyFor = (palaceIndex: number): DungeonGeography | null => {
  const dungeon = dungeonForPalaceIndex(palaceIndex);
  const firstRoom = dungeon?.roomScreenIds[0];
  if (!dungeon || !firstRoom) return null;
  const room = getScreen(firstRoom);
  return {
    dungeonId: dungeon.id,
    name: dungeon.name,
    areaId: room.areaId,
    locationId: room.locationId,
    world: room.world,
  };
};

export { dungeonGeographyFor };
export type { DungeonGeography } from './screen-editor.type';
