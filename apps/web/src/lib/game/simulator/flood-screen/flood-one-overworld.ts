/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import { enrichEntrances } from '../../flood/overworld-entrances';
import { floodOneScreen } from '../../flood';
import type { ScreenFloodRun } from './flood-screen.type';

const floodOneOverworld = (
  screenIndex: number,
  items: TileReq[],
  startPos?: GridPos,
  extraSeeds?: GridPos[],
): ScreenFloodRun | null => floodOneScreen(
  { isIndoors: false, roomId: 0, owScreenIndex: screenIndex },
  { items, ...(startPos ? { startPos } : {}), ...(extraSeeds ? { extraSeeds } : {}), entrances: enrichEntrances() },
);

export { floodOneOverworld };
