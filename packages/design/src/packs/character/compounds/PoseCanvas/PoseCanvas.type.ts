/* @layer renderer-components @kind types */
import type { PoseState, Facing, PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@rotp/packs';

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
