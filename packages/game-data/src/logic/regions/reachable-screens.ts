/* @layer shared-game @kind logic */
import { all, find } from '../../data';
import type { RegionId, ScreenId } from '../../data/types';

let screensByRegion: Map<RegionId, readonly ScreenId[]> | null = null;
let roomsByDungeon: Map<string, readonly ScreenId[]> | null = null;
let dungeonOfRegion: Map<RegionId, string> | null = null;

const index = (): void => {
  if (screensByRegion !== null) return;
  dungeonOfRegion = new Map(all('region')
    .flatMap((region) => (region.dungeonId === undefined ? [] : [[region.id, region.dungeonId] as const])));
  const screens = new Map<RegionId, ScreenId[]>();
  for (const screen of find('screen', (row) => row.regionId !== undefined)) {
    const regionId = screen.regionId as RegionId;
    screens.set(regionId, [...(screens.get(regionId) ?? []), screen.id]);
  }
  screensByRegion = screens;
  roomsByDungeon = new Map(all('dungeon').map((dungeon) => [dungeon.id, dungeon.roomScreenIds]));
};

const screensOfRegions = (regionIds: Iterable<RegionId>): Set<string> => {
  index();
  const screens = new Set<string>();
  for (const regionId of regionIds) {
    for (const screen of screensByRegion?.get(regionId) ?? []) screens.add(screen);
    const dungeonId = dungeonOfRegion?.get(regionId);
    if (dungeonId === undefined) continue;
    for (const room of roomsByDungeon?.get(dungeonId) ?? []) screens.add(room);
  }
  return screens;
};

export { screensOfRegions };
