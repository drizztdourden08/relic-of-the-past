/* @layer bridge-wasm @kind types */
import type { ConnectionInfo } from '@shared/game/navigation';

interface TransitionScope {
  isIndoors: boolean;
  roomIndex: number;
  overworldScreenIndex: number;
  floodConnections: readonly ConnectionInfo[];
}

export type { TransitionScope };
