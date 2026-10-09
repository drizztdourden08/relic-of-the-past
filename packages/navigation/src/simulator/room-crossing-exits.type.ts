/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, OverworldEntrance } from '@rotp/game-core';

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
