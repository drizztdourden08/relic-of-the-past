/* @layer renderer-widgets @kind logic */
import { collectCrossings } from '@app/lib/game/crossings';
import type { ScreenCrossings } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { ScreenResponse } from './propagate';

interface CrossingsArgs {
  isIndoors: boolean;
  responses: readonly ScreenResponse[];
  items: readonly TileReq[];
}

/**
 * One crossing record per flooded screen, off the same flood and the same border
 * bundles the overlay draws — so the panel, the minimap and the overlay cannot
 * describe a screen's ways out differently.
 *
 * A response's `screenIndex` is the room index indoors and the overworld screen
 * index outdoors, which is exactly the pair of fields the scope asks for.
 */
const collectScreenCrossings = ({ isIndoors, responses, items }: CrossingsArgs): ScreenCrossings[] =>
  responses.map((response) => collectCrossings({
    isIndoors,
    roomIndex: response.screenIndex,
    owScreenIndex: response.screenIndex,
    flood: response.result,
    connections: response.connections,
    items,
  }));

export { collectScreenCrossings };
