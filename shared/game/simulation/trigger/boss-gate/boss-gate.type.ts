/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';
import type { Requirement } from '@rotp/game-data';

interface BossSite {
  roomId: number;
  triggerTile: GridPos;
  beatableWith: Requirement;
}

export type { BossSite };
