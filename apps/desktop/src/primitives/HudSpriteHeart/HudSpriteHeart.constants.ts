/* @layer renderer-hud @kind constants */
import type { SpriteHeartState } from './HudSpriteHeart.type';

const SPRITE_HEART_TILE = 8;

const SPRITE_HEART_STATES: readonly SpriteHeartState[] = ['empty', 'half', 'full'];

const SPRITE_FILE: Readonly<Record<SpriteHeartState, string>> = {
  full: 'hud-heart-full',
  half: 'hud-heart-half',
  empty: 'hud-heart-empty',
};

const SPRITE_HEART_SWAP_MS = 200;
const SPRITE_HEART_PULSE = 1.15;

export { SPRITE_FILE, SPRITE_HEART_PULSE, SPRITE_HEART_STATES, SPRITE_HEART_SWAP_MS, SPRITE_HEART_TILE };
