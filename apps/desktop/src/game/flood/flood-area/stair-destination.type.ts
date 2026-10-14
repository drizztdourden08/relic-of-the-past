/* @layer bridge-wasm @kind types */
import type { OverworldEntrance } from '@rotp/game-core';

type StairDestinationParams = {
  isIndoors: boolean;
  entranceIdx: number | undefined;
  screenIndex: number;
  entrancesFor: (screenIndex: number) => OverworldEntrance[];
};

export type { StairDestinationParams };
