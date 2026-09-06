/* @layer shared-game @kind logic */
/**
 * Strategy: four families behind one interface, covering the ladder, the rung a
 * vanilla file stands on, the reference jumps, the item carrying a jump, so
 * the derivation, the pool builder, the logic helpers and the In Pool model
 * never branch on the family. Every ladder opens with rung 0, the empty tier
 * (capacity-ladders.data.ts); the reference pool is six one-tier items and
 * one two-tier item per counted family and the single half-meter item, all
 * climbing from the vanilla rung; the wallet has no vanilla upgrades, hence
 * no reference jumps and no spot.
 */
import { maxUpgradeJumpOf, upgradeItemName } from '@shared/game/data/capacity-upgrade-item';
import { progressiveCapacityItemName } from '@shared/game/data/capacity-progressive-item';
import {
  EXPLOSIVES_TIERS, METER_TIERS, PROJECTILES_TIERS, VANILLA_RUNG, WALLET_LADDER,
} from './capacity-ladders.data';
import type { CapacityFamilyId } from './capacity-profile.type';

interface CapacityFamily {
  id: CapacityFamilyId;
  label: string;
  ladder: readonly number[];
  /** Ladder index a vanilla file stands on (the first native level; the 999 wallet). */
  vanillaRung: number;
  /** Index on the ladder; throws off-ladder. */
  indexOf: (value: number) => number;
  /** The vanilla ladder as pool items; [] for the wallet. */
  referenceJumps: readonly number[];
  /** Pool item name carrying exactly this jump. */
  itemFor: (jump: number) => string;
  /** The one pool item name of a progressive plan: every copy climbs to the next planned rung. */
  progressiveItem: string;
  /** The largest jump an item (and a virtual id) of this family can carry. */
  maxJump: number;
  /** A pond / bat exists to become a check. */
  hasSpot: boolean;
  /** Count written by the catalog baseline and by an off-ladder fallback. */
  defaultCount: number;
}

const family = (
  id: CapacityFamilyId, label: string, ladder: readonly number[], referenceJumps: readonly number[],
  hasSpot: boolean, defaultCount: number,
): CapacityFamily => ({
  id,
  label,
  ladder,
  vanillaRung: VANILLA_RUNG[id],
  referenceJumps,
  hasSpot,
  defaultCount,
  indexOf: (value) => {
    const index = ladder.indexOf(value);
    if (index === -1) throw new Error(`${id}: ${value} is not on the ladder`);
    return index;
  },
  itemFor: (jump) => upgradeItemName(id, jump),
  progressiveItem: progressiveCapacityItemName(id),
  maxJump: maxUpgradeJumpOf(id),
});

const EXPLOSIVES = family('explosives', 'Explosives', EXPLOSIVES_TIERS, [1, 1, 1, 1, 1, 1, 2], true, 7);
const PROJECTILES = family('projectiles', 'Projectiles', PROJECTILES_TIERS, [1, 1, 1, 1, 1, 1, 2], true, 7);
const METER = family('meter', 'Meter', METER_TIERS, [1], true, 2);
const WALLET = family('wallet', 'Wallet', WALLET_LADDER, [], false, 5);

const FAMILIES: readonly CapacityFamily[] = [EXPLOSIVES, PROJECTILES, METER, WALLET];

const FAMILY_BY_ID: Readonly<Record<CapacityFamilyId, CapacityFamily>> = {
  explosives: EXPLOSIVES,
  projectiles: PROJECTILES,
  meter: METER,
  wallet: WALLET,
};

const familyById = (id: CapacityFamilyId): CapacityFamily => FAMILY_BY_ID[id];

/** The whole ladder as steps: the largest span (and count) the family admits. */
const maxSpanOf = (capacityFamily: CapacityFamily): number => capacityFamily.ladder.length - 1;

export { EXPLOSIVES, FAMILIES, METER, PROJECTILES, WALLET, familyById, maxSpanOf };
export type { CapacityFamily };
