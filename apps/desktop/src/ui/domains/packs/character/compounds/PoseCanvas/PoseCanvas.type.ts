/* @layer renderer-components @kind types */
import type { PoseState } from '@rotp/game-data';
import type { Facing } from '@rotp/game-data';
import type { PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface PoseCanvasProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  state: PoseState;
  facing: Facing;
  tick: number;
  scale: number;
  className?: string;
}

export type { PoseCanvasProps };
