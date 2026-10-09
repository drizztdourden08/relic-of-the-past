/* @layer bridge-wasm @kind types */
import type { ConnectionInfo } from '@shared/game/navigation';
import type { SimExit } from '@shared/game/simulation';
import type { ScreenFlood } from './flood-screen';

interface DetectedScreen {
  flood: ScreenFlood;
  exits: SimExit[];
  reached: boolean[][];
}

interface OverworldExitPass {
  fromKey: string;
  bundles: Map<string, ConnectionInfo>;
  group: Set<number>;
}

interface OrderedExit {
  exit: SimExit;
  leavesArea: boolean;
}

export type { DetectedScreen, OverworldExitPass, OrderedExit };
