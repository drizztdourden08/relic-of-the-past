/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import { floodOneOverworld } from './flood-one-overworld';
import { summarizeRun } from './summarize-run';
import type { ScreenFlood } from './flood-screen.type';

const floodOverworldScreen = (screenIndex: number, startPos?: GridPos, items: TileReq[] = ['lift.1']): ScreenFlood | null => {
  const run = floodOneOverworld(screenIndex, items, startPos);
  return run ? summarizeRun(run, items, screenIndex) : null;
};

export { floodOverworldScreen };
