/* @layer bridge-wasm @kind logic */
import type { VirtualPlayer } from '@shared/game/simulation';
import type { GridPos } from '@shared/game/navigation';
import type { MapState } from '@rotp/game-data';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';
import { screenOriginFor } from '../../flood';
import { interiorScreenId } from '../screen-resolve';

const tileOf = (map: MapState): GridPos => {
  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors: map.isIndoors, linkX: map.linkX, linkY: map.linkY, screenIndex: map.overworldScreenIndex,
  });
  return linkStartTile({ linkX: map.linkX, linkY: map.linkY, screenWorldX, screenWorldY });
};

const virtualFrom = (map: MapState): VirtualPlayer => {
  const screenId = map.isIndoors
    ? interiorScreenId(map.roomIndex, tileOf(map))
    : `ow:${map.overworldScreenIndex}`;

  return { screenId, tile: tileOf(map) };
};

export { virtualFrom };
