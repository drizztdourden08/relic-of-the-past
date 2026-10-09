/* @layer renderer-hud @kind types */
import type { Facing } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PoseState } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface PauseHeroPortraitProps {
  sheet: PlayerSheet | null;
  row: ResolvedRow | null;
  state: PoseState | null;
  facing: Facing;
  frame: number;
  zoom?: number;
  scale: number;
}

export type { PauseHeroPortraitProps };
