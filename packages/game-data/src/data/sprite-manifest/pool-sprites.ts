/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SpriteDefinition } from './manifest';

const poolSprite = (art: string, game: string): SpriteDefinition => ({
  file: art,
  label: msg('game-labels:sprite.pool', { game }),
  category: 'randomizer',
  extract: { method: 'art-badge', art, badge: 'archipelago-badge' },
});

const POOL_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  poolSprite('pool-zelda-1', 'The Legend of Zelda'),
  poolSprite('pool-zelda-2', 'Zelda II'),
  poolSprite('pool-links-awakening', "Link's Awakening"),
  poolSprite('pool-ocarina-of-time', 'Ocarina of Time'),
  poolSprite('pool-majoras-mask', "Majora's Mask"),
  poolSprite('pool-oracle-of-ages', 'Oracle of Ages'),
  poolSprite('pool-oracle-of-seasons', 'Oracle of Seasons'),
  poolSprite('pool-minish-cap', 'The Minish Cap'),
  poolSprite('pool-wind-waker', 'The Wind Waker'),
  poolSprite('pool-twilight-princess', 'Twilight Princess'),
  poolSprite('pool-skyward-sword', 'Skyward Sword'),
  poolSprite('pool-a-link-between-worlds', 'A Link Between Worlds'),
  {
    file: 'pool-archipelago',
    label: msg('game-labels:sprite.poolOther'),
    category: 'randomizer',
    extract: { method: 'art', art: 'pool-archipelago' },
  },
];

export { POOL_SPRITE_DEFINITIONS };
