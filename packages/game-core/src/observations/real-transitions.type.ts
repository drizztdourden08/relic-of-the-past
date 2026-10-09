/* @layer bridge-wasm @kind types */
import type { ConnectionInfo } from '../pathfinding/types/flood-result.type';

interface TransitionScope {
  isIndoors: boolean;
  roomIndex: number;
  overworldScreenIndex: number;
  floodConnections: readonly ConnectionInfo[];
}

export type { TransitionScope };
