/* @layer renderer-components @kind types */
import type { PoseState } from '@rotp/game-data';
import type { PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface StatePreviewProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  state: PoseState;
  tick: number;
  scale: number;
}

export type { StatePreviewProps };
