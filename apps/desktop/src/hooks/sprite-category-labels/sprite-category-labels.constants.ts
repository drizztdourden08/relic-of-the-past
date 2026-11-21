/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SpriteCategory } from '@rotp/game-data';

const SPRITE_CATEGORY_MESSAGES: Record<SpriteCategory, Message> = {
  hud: msg('compounds:sprite-category.hud'),
  'hud-pause': msg('compounds:sprite-category.hud-pause'),
  'hud-item': msg('compounds:sprite-category.hud-item'),
  fonts: msg('compounds:sprite-category.fonts'),
  receipt: msg('compounds:sprite-category.receipt'),
  drop: msg('compounds:sprite-category.drop'),
  randomizer: msg('compounds:sprite-category.randomizer'),
  title: msg('compounds:sprite-category.title'),
  ground: msg('compounds:sprite-category.ground'),
};

export { SPRITE_CATEGORY_MESSAGES };
