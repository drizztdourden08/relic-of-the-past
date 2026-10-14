/* @layer renderer-hud @kind logic */
import type { SpriteHeartState } from '../../../primitives/HudSpriteHeart';

const spriteStateFor = (fill: number): SpriteHeartState => {
  if (fill >= 1) return 'full';
  return fill > 0 ? 'half' : 'empty';
};

export { spriteStateFor };
