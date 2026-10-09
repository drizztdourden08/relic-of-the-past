/* @layer renderer-hud @kind types */
import type { Facing } from '@rotp/game-data';
import type { PoseState } from '@rotp/game-data';
import type { PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@rotp/packs';

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
