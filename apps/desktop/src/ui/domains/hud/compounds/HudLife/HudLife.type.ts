/* @layer renderer-hud @kind types */
import type { HeartMode } from '../../primitives/HudHeart';

type HeartArt = 'vector' | 'sprite';

interface HudLifeProps {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  armor?: number;
  heartArt?: HeartArt;
  showCaption?: boolean;
  scale: number;
  spritesBase: string;
}

interface LifeCaptionProps {
  scale: number;
  spritesBase: string;
}

export type { HeartArt, HudLifeProps, LifeCaptionProps };
