/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const POOL_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'pool-zelda-1',
    label: { key: 'game-labels:sprite.pool', values: { game: 'The Legend of Zelda' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-zelda-1', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-zelda-2',
    label: { key: 'game-labels:sprite.pool', values: { game: 'Zelda II' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-zelda-2', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-links-awakening',
    label: { key: 'game-labels:sprite.pool', values: { game: "Link's Awakening" } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-links-awakening', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-ocarina-of-time',
    label: { key: 'game-labels:sprite.pool', values: { game: 'Ocarina of Time' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-ocarina-of-time', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-majoras-mask',
    label: { key: 'game-labels:sprite.pool', values: { game: "Majora's Mask" } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-majoras-mask', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-oracle-of-ages',
    label: { key: 'game-labels:sprite.pool', values: { game: 'Oracle of Ages' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-oracle-of-ages', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-oracle-of-seasons',
    label: { key: 'game-labels:sprite.pool', values: { game: 'Oracle of Seasons' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-oracle-of-seasons', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-minish-cap',
    label: { key: 'game-labels:sprite.pool', values: { game: 'The Minish Cap' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-minish-cap', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-wind-waker',
    label: { key: 'game-labels:sprite.pool', values: { game: 'The Wind Waker' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-wind-waker', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-twilight-princess',
    label: { key: 'game-labels:sprite.pool', values: { game: 'Twilight Princess' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-twilight-princess', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-skyward-sword',
    label: { key: 'game-labels:sprite.pool', values: { game: 'Skyward Sword' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-skyward-sword', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-a-link-between-worlds',
    label: { key: 'game-labels:sprite.pool', values: { game: 'A Link Between Worlds' } },
    category: 'randomizer',
    extract: { method: 'art-badge', art: 'pool-a-link-between-worlds', badge: 'archipelago-badge' },
  },
  {
    file: 'pool-archipelago',
    label: { key: 'game-labels:sprite.poolOther' },
    category: 'randomizer',
    extract: { method: 'art', art: 'pool-archipelago' },
  },
];

export { POOL_SPRITE_DEFINITIONS };
