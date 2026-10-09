/* @layer renderer-hud @kind logic */
import type { SpriteHeartState } from '../../../primitives/HudSpriteHeart';

const spriteStateFor = (fill: number): SpriteHeartState =>
  (fill >= 1 ? 'full' : fill > 0 ? 'half' : 'empty');

export { spriteStateFor };
