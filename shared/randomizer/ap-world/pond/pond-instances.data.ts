/* @layer shared-game @kind data */
/**
 * The three fairy ponds, transcribed from the check records
 * (shared/game/data/records/checks) and the vanilla item table
 * (scope-vanilla.data.ts). Each one is configured on its own, so every
 * per-pond surface (option keys, defaults, prize rungs, plans) is keyed by
 * the id here and never by a hardcoded name.
 *
 * `label` is the one name a player ever reads for a pond, and every slot it
 * holds is that name and a number: Waterfall Fairy 1, Waterfall Fairy 2, and
 * on up a custom pond's ladder. A pond has no sides, so no slot is ever a left
 * or a right. The capacity pond is the one that answers in two ladders, bombs
 * and arrows, seven purchases each, so its two native slots are rung 1 of a
 * named ladder instead. The `id` values are code identifiers and stay as they
 * are, which is what keeps option keys and stored snapshots where they were.
 *
 *   capacity  room 277, Sprite_HappinessPond: the bomb and arrow upgrades,
 *              the game's ONLY source of either, which is why both slots
 *              carry a hard lock.
 *   wishing   room 276, Sprite_WishPond3: the boomerang and the red shield.
 *              The boomerang is two discrete pool items, never a ladder, so
 *              nothing can be stranded by taking that slot.
 *   cursed    room 278, Sprite_WishPond3: the golden sword and the silver
 *              bow, the top rung of each of those families.
 *
 * Room numbers are the game's own, the full 16-bit room index, so a lookup
 * crosses through shared/game/data/screens/game-id.ts and never a synthesized
 * id string. The three sit side by side (0x114, 0x115, 0x116). The capacity
 * pond's handler dispatch tests only the LOW byte of its room (21), which is
 * the core's own check and not the room number.
 */
import type { PondId, PondInstance } from './pond-instance.type';

const POND_INSTANCES: readonly PondInstance[] = [
  {
    id: 'capacity',
    room: 277,
    label: 'Hylia Fairy',
    slots: [
      { location: 'Capacity Upgrade Left', ladder: 'Bombs', lock: { kind: 'hard', family: 'explosives' } },
      { location: 'Capacity Upgrade Right', ladder: 'Arrows', lock: { kind: 'hard', family: 'projectiles' } },
    ],
  },
  {
    id: 'wishing',
    room: 276,
    label: 'Waterfall Fairy',
    slots: [
      {
        location: 'Waterfall Fairy - Left',
        lock: { kind: 'none' },
        // She takes the blue one and hands back the red one.
        vanillaGrant: 'Red Boomerang',
      },
      {
        location: 'Waterfall Fairy - Right',
        lock: { kind: 'tier', family: 'shield', tier: 'Red Shield' },
        vanillaGrant: 'Progressive Shield',
      },
    ],
  },
  {
    id: 'cursed',
    room: 278,
    label: 'Pyramid Fairy',
    slots: [
      {
        location: 'Pyramid Fairy - Left',
        lock: { kind: 'tier', family: 'sword', tier: 'Golden Sword' },
        vanillaGrant: 'Progressive Sword',
      },
      {
        location: 'Pyramid Fairy - Right',
        lock: { kind: 'tier', family: 'bow', tier: 'Silver Bow' },
        vanillaGrant: 'Progressive Bow',
      },
    ],
  },
];

/** In the order the panel stacks them. */
const POND_IDS: readonly PondId[] = POND_INSTANCES.map((pond) => pond.id);

const POND_INSTANCE_BY_ID: Readonly<Record<PondId, PondInstance>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pond]),
) as Readonly<Record<PondId, PondInstance>>;

const pondInstanceOf = (id: PondId): PondInstance => POND_INSTANCE_BY_ID[id];

/** The pond whose two slots the capacity families answer to (capacity-pond/). */
const CAPACITY_POND: PondInstance = POND_INSTANCE_BY_ID.capacity;

export { CAPACITY_POND, POND_IDS, POND_INSTANCES, POND_INSTANCE_BY_ID, pondInstanceOf };
