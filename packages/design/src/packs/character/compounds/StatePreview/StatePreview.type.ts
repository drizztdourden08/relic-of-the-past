/* @layer renderer-components @kind types */
import type { PoseState, PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@rotp/packs';

interface StatePreviewProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  state: PoseState;
  tick: number;
  scale: number;
}

export type { StatePreviewProps };
