/* @layer renderer-components @kind types */
import type { PoseState } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface StatePreviewProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  state: PoseState;
  tick: number;
  scale: number;
}

export type { StatePreviewProps };
