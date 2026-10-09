/* @layer renderer-components @kind types */
import type { PoseState } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { Facing } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
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
