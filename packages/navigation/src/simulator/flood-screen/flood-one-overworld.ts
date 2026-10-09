/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import { enrichEntrances } from '../../flood/overworld-entrances';
import { floodOneScreen } from '../../flood/flood-area/flood-one-screen';
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
