/* @layer renderer-hud @kind types */
import type { Facing } from '@shared/game/data/native-tables/player-pose-atlas';
import type { PoseState } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface PauseHeroPortraitProps {
  /** The sheet in force, either the player's own custom sprite or the stock one. */
  sheet: PlayerSheet | null;
  /** Palette already resolved for the armour and glove tier being worn. */
  row: ResolvedRow | null;
  /** The pose to draw, resolved from the atlas by the caller. */
  state: PoseState | null;
  /** Which way round, as `link_direction_facing >> 1`: 0 up, 1 down, 2 left, 3 right. */
  facing: Facing;
  /** Which frame of that pose. Out of range wraps, as the atlas does. */
  frame: number;
  /** Zoom over the native pose, in whole steps. Defaults to 1, which is the size the game draws. */
  zoom?: number;
  /** Display scale: 1 SNES pixel = `scale` CSS pixels. */
  scale: number;
}

export type { PauseHeroPortraitProps };
