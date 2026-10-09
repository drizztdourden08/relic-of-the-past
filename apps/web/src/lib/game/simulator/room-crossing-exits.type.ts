/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, OverworldEntrance } from '@shared/game/navigation';

interface RoomExitContext {
  roomIndex: number;
  cached: string;
  connections: readonly ConnectionInfo[];
}

interface RoomExitPass extends RoomExitContext {
  owSide: readonly OverworldEntrance[];
  bundles: Map<string, ConnectionInfo>;
}

export type { RoomExitContext, RoomExitPass };
