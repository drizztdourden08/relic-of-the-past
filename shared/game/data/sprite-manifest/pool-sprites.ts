/* @layer shared-game @kind data */
/**
 * Multiworld pool icons: one picture per game an Archipelago pool may hold,
 * badged with the Archipelago mark so a reward bound for someone else reads as
 * someone else's at a glance.
 *
 * Each game's icon is two of our own drawings composited (`art-badge`): the
 * icon from art/pool/, with art/pool/archipelago-badge.svg stamped in the
 * bottom-right corner. The badge goes on here in code, so the drawings
 * themselves stay unbadged and stay usable on their own. The fallback is the
 * exception and stands alone: it is already the Archipelago mark.
 *
 * A Link to the Past has no icon on purpose. Played from this app it is our own
 * world, and a pool that also holds someone else's copy of it falls back to the
 * Archipelago mark like any other game we hold no drawing for
 * (pool-game-icons.ts).
 */
import type { SpriteDefinition } from './manifest';

const pool = (slug: string, label: string): SpriteDefinition => ({
  file: `pool-${slug}`,
  label,
  category: 'randomizer',
  extract: { method: 'art-badge', art: `pool-${slug}`, badge: 'archipelago-badge' },
});

const POOL_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  pool('zelda-1', 'Pool: The Legend of Zelda'),
  pool('zelda-2', 'Pool: Zelda II'),
  pool('links-awakening', "Pool: Link's Awakening"),
  pool('ocarina-of-time', 'Pool: Ocarina of Time'),
  pool('majoras-mask', "Pool: Majora's Mask"),
  pool('oracle-of-ages', 'Pool: Oracle of Ages'),
  pool('oracle-of-seasons', 'Pool: Oracle of Seasons'),
  pool('minish-cap', 'Pool: The Minish Cap'),
  pool('wind-waker', 'Pool: The Wind Waker'),
  pool('twilight-princess', 'Pool: Twilight Princess'),
  pool('skyward-sword', 'Pool: Skyward Sword'),
  pool('a-link-between-worlds', 'Pool: A Link Between Worlds'),
  // The fallback IS the Archipelago mark, so it carries no badge: stamping the
  // mark onto itself says nothing and only eats eight pixels of it.
  {
    file: 'pool-archipelago',
    label: 'Pool: any other game',
    category: 'randomizer',
    extract: { method: 'art', art: 'pool-archipelago' },
  },
];

export { POOL_SPRITE_DEFINITIONS };
