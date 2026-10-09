/* @layer bridge-wasm @kind types */
import type { ItemId } from '@rotp/game-data';

interface RoomThreatProbe {
  inventory: ItemId[];
  clearable: boolean;
  gating: Array<{ type: string; killable: boolean; weapon?: string; blockedBy?: string }>;
}

export type { RoomThreatProbe };
