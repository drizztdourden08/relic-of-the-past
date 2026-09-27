/* @layer shared-game @kind logic */
/**
 * The screens a player can stand on, derived from the regions the one engine says they can reach.
 *
 * The engine answers in region ids and knows nothing about screens. Every screen points up at
 * the region a player walks it from, so this reads the pointer instead of the two tables that
 * used to bridge the vocabularies. A region that names a dungeon brings that dungeon's whole
 * room list with it, because a dungeon reached is a dungeon whose rooms can be walked, and what
 * each room then asks for is the row's own business.
 *
 * A region carrying no screen contributes nothing, which is what the menu is: the graph's own
 * root, a place in the rules and nowhere in the game.
 */
import { all, find } from '@shared/game/data';
import type { RegionId, ScreenId } from '@shared/game/data/types';

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
