/* @layer shared-game @kind types */
import type { GridPos } from '../../../navigation/types';
import type { Requirement } from '@rotp/game-data';

interface BossSite {
  roomId: number;
  triggerTile: GridPos;
  beatableWith: Requirement;
}

export type { BossSite };
