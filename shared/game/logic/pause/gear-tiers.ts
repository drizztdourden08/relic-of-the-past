/* @layer shared-game @kind logic */
/**
 * The ladders shown on the pause menu's gear screen.
 *
 * Three of them are upgrade ladders: blade 0..4, guard 0..3, armour 0..2. Tier 0
 * is "nothing equipped" for the first two and the starting armour for the third,
 * which is why only the armour ladder has art at tier 0.
 *
 * The fourth is not an upgrade ladder and deliberately does not pretend to be.
 * The launcher register encodes TWO facts in one byte (which projectile, and
 * whether any are on hand), so its rungs are the two PROJECTILE TYPES, plain and
 * silver, and there is no bare rung at all. Writing a 0 there would not mean
 * "nothing nocked"; it would mean "no launcher", i.e. deleting an item from a row
 * that is nominally about which ammunition is loaded, and it would take the
 * carrying half of the byte with it. That is the one fact a re-equip could never restore
 * without either handing out free ammunition or silently emptying the quiver.
 * The other three fields carry one fact each, so their tier 0 is reversible; this
 * one is not, and that asymmetry is the whole reason it has two rungs and not
 * three. Confirming the type already in force is therefore nothing at all, rather
 * than the unequip it means on the other three.
 *
 * Ownership is a HIGH-WATER MARK, passed in, never read here: a tier at or
 * below the highest ever observed for that ladder is selectable, anything above
 * it is a silhouette. That is what makes downgrading (and re-upgrading) safe,
 * because the player can drop to a weaker tier for a challenge run and climb back
 * without the game having to remember a separate "unlocked" set. The arrow row
 * answers the same rule with its own mark, so silver is a silhouette until the
 * save has actually held it.
 *
 * Sprite filenames resolve through the record dataset, so the names live in the
 * data layer. The one literal is the starting armour, which has no record.
 */
import { getItem } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';

/** The three ladders whose field holds one fact, so tier 0 is a real rung. */
type GearKind = 'sword' | 'shield' | 'mail';
/** Every ladder the gear screen draws, in the order the cursor walks them. */
type GearLadderKind = GearKind | 'bow';

interface GearTierCell {
  kind: GearLadderKind;
  tier: number;
  /** Sprite filename, or '' when the tier means "nothing equipped". */
  sprite: string;
  /** True when the tier is at or below the high-water mark, i.e. selectable. */
  owned: boolean;
}

const GEAR_KINDS: readonly GearKind[] = ['sword', 'shield', 'mail'];

/** The arrow row's own name, so no caller has to spell the section twice. */
const ARROW_LADDER = 'bow';

/** Every gear-screen ladder, ladders first and the arrow row last of them. */
const GEAR_LADDER_KINDS: readonly GearLadderKind[] = [...GEAR_KINDS, ARROW_LADDER];

/** Record per tier; null where the tier has no pickup of its own. */
const TIER_RECORDS: Record<GearLadderKind, readonly (string | null)[]> = {
  sword: [null, 'item-074', 'item-002', 'item-003', 'item-004'],
  shield: [null, 'item-005', 'item-006', 'item-007'],
  mail: [null, 'item-035', 'item-036'],
  bow: ['item-012', 'item-060'],
};

/** Art for a tier with no record. Only the starting armour has any. */
const BARE_TIER_SPRITES: Record<GearLadderKind, string> = {
  sword: '',
  shield: '',
  mail: 'hud-green-mail',
  bow: '',
};

/** Register values that mean "carrying nothing", and so pair with the odd rungs. */
const ARROW_TYPE_STEP = 2;
/** The register value meaning no launcher at all, so no type is in force. */
const NO_ARROW_TYPE = -1;

const spriteForTier = (kind: GearLadderKind, tier: number): string => {
  const recordId = TIER_RECORDS[kind][tier];
  if (!recordId) return BARE_TIER_SPRITES[kind];
  return spriteFilename(getItem(recordId).spriteId) ?? BARE_TIER_SPRITES[kind];
};

/** How many tiers a ladder has, including tier 0. */
const gearTierCount = (kind: GearLadderKind): number => TIER_RECORDS[kind].length;

/** Highest tier id on a ladder. */
const maxGearTier = (kind: GearLadderKind): number => gearTierCount(kind) - 1;

/** Clamps an arbitrary tier onto a ladder. */
const clampGearTier = (kind: GearLadderKind, tier: number): number =>
  Math.min(Math.max(Math.trunc(tier) || 0, 0), maxGearTier(kind));

/**
 * The rung the launcher register is standing on: `1`/`2` are the plain pair and
 * `3`/`4` the silver pair, so the type is the step of two and the odd/even half
 * is the ammunition the row must never touch. `0` holds no launcher, and answers
 * with a rung no ladder has, which is what leaves the row inert instead of
 * offering to conjure one.
 */
const arrowTypeOf = (bowValue: number): number => {
  if (!Number.isInteger(bowValue) || bowValue <= 0) return NO_ARROW_TYPE;
  return Math.min(Math.floor((bowValue - 1) / ARROW_TYPE_STEP), maxGearTier(ARROW_LADDER));
};

/**
 * The cells of one ladder. `ownedMax` is the highest tier ever observed for
 * that ladder; tier 0 is always selectable because it is always reachable.
 */
const gearTierCells = (kind: GearLadderKind, ownedMax: number): GearTierCell[] => {
  const highest = clampGearTier(kind, ownedMax);
  return Array.from({ length: gearTierCount(kind) }, (_, tier) => ({
    kind,
    tier,
    sprite: spriteForTier(kind, tier),
    owned: tier <= highest,
  }));
};

/** Whether a tier may be written. This is the rule a confirm has to pass. */
const isGearTierSelectable = (kind: GearLadderKind, tier: number, ownedMax: number): boolean =>
  tier >= 0 && tier <= maxGearTier(kind) && tier <= clampGearTier(kind, ownedMax);

export {
  ARROW_LADDER,
  GEAR_KINDS,
  GEAR_LADDER_KINDS,
  NO_ARROW_TYPE,
  arrowTypeOf,
  clampGearTier,
  gearTierCells,
  gearTierCount,
  isGearTierSelectable,
  maxGearTier,
};
export type { GearKind, GearLadderKind, GearTierCell };
