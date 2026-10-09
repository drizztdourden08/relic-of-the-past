/* @layer renderer-hud @kind types */
import type { HeartMode } from '../HudHeart';

type SpriteHeartState = 'full' | 'half' | 'empty';

interface HudSpriteHeartProps {
  state: SpriteHeartState;
  mode: HeartMode;
  scale: number;
  spritesBase: string;
}

export type { HudSpriteHeartProps, SpriteHeartState };
