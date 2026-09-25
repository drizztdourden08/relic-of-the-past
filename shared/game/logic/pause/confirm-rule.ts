/* @layer shared-game @kind logic */
/**
 * What a CONFIRM MEANS, decided once for every way of making one.
 *
 * The sibling of `assign-rule`, and it exists for the same reason. A pad press
 * arrives through the input router, a keyboard press through the same router,
 * and a mouse click from the menu's own overlay; all three must reach the same
 * outcome. They did not: confirm reached nothing at all, while a click on a gear
 * tier called the bridge straight from the view and a click on a status row
 * closed the menu through an event only the mouse ever raised. Three inputs,
 * three code paths, one of them empty.
 *
 * So the rule lives here, as a plan the caller performs:
 *
 *  - **The arrow row is the one ladder that never unequips.** Its rungs are the
 *    two projectile TYPES, and the byte behind them also carries whether any
 *    are on hand, so there is no rung that means "none" and confirming the type
 *    already nocked is nothing. A save holding no launcher offers nothing
 *    at all there: the row says which ammunition is loaded, and conjuring the
 *    thing that fires it is not a meaning a confirm on that row may take.
 *  - **A gear tier equips.** At or below the high-water mark it is worn; above
 *    it the press is REFUSED and says so, exactly as an unowned item cell does.
 *    The mark is the same `isGearTierSelectable` the ladder itself is drawn
 *    from, so what looks selectable and what is selectable cannot drift.
 *  - **The tier already worn UNEQUIPS.** Confirming what is already on is the
 *    one press that could only ever be a no-op, so it is the natural home for
 *    taking the piece off, and taking it off is a choice the ladders exist to
 *    offer (R3), not an accident to guard against. It writes tier 0, the same
 *    rung the ladder already draws as "nothing worn", so the two routes to that
 *    state end identically: a 0 written and the ladder's frame on the bare rung.
 *    Both are called an unequip, too (see `gearTargetAt`), because the word
 *    describes the state the press leaves behind, and one outcome under two
 *    names on two rungs of one ladder is exactly the drift this file exists to
 *    stop. A press that would write the tier already on is therefore nothing at
 *    all, whichever rung it was made from.
 *  - **A status row activates.** The two rows are the two ways out of the game,
 *    and confirming one is what chooses it. The reducer turns that into the
 *    `closing` phase; the store performs the exit.
 *  - **Everything else is nothing.** An item cell, a bottle and the passive row
 *    have nothing to activate because items fire from a SLOT, not from the cursor,
 *    so confirm there is a no-op, and the legend drops its CONFIRM glyph instead
 *    of promising a control that does nothing.
 *
 * The legend reads its confirm verb from `confirmVerbAt`, off the SAME target
 * the press itself is planned from, so the bar cannot advertise an action the
 * plan will not perform. A faded tier is the one deliberate exception, and it
 * matches the item grid: the bar offers what the cell is FOR, and a cell the
 * save has never held answers with a refusal the player can read. Silence
 * there, from either the bar or the press, reads as a broken menu.
 */
import {
  ARROW_LADDER, GEAR_LADDER_KINDS, NO_ARROW_TYPE, clampGearTier, isGearTierSelectable,
} from './gear-tiers';
import { clampCursor } from './screens';
import type { GearKind, GearLadderKind } from './gear-tiers';
import type { PauseContext, PauseSection, PauseState } from './pause-machine';

/** What the cursor is pointing at, in the shape a confirm takes. */
type ConfirmTarget =
  | { kind: 'equip'; gear: GearLadderKind; tier: number }
  /** Only the three fields that hold one fact each; the arrow row has no such rung. */
  | { kind: 'unequip'; gear: GearKind }
  | { kind: 'exit'; via: 'continue' | 'save-quit' };

/** What a confirm here DOES, in the one word the legend has room for. */
type ConfirmVerb = ConfirmTarget['kind'];

type ConfirmPlan =
  /** The cursor is on nothing activatable. The press is not an error, just nothing. */
  | { outcome: 'ignored' }
  /** The save has never held that tier. */
  | { outcome: 'refused' }
  /** Write the tier; the caller holds the bridge. */
  | { outcome: 'equip'; gear: GearLadderKind; tier: number }
  /** Leave the menu the chosen way; the reducer moves to `closing` for it. */
  | { outcome: 'exit'; via: 'continue' | 'save-quit' };

/** Every gear ladder names its own section, so one list covers both. */
const GEAR_SECTIONS: readonly PauseSection[] = GEAR_LADDER_KINDS;

/** The bare rung every ladder starts with, and what an unequip writes. */
const BARE_TIER = 0;

/** Cursor row of the second status action, the one that saves before it goes. */
const SAVE_QUIT_CURSOR = 1;

const isGearSection = (section: PauseSection): section is GearLadderKind =>
  GEAR_SECTIONS.includes(section);

/** The high-water mark for a ladder; an absent arrow mark leaves silver unowned. */
const markFor = (gear: GearLadderKind, ctx: PauseContext): number =>
  gear === ARROW_LADDER ? (ctx.ownedMax.bow ?? 0) : ctx.ownedMax[gear];

/**
 * The arrow row, which shares the ladders' shape and none of their tier-0 rule.
 * Nothing held means no target at all, since the row cannot hand out a launcher, and
 * the type already nocked means no target either, because the press that would
 * write it changes nothing. What is left is the other type, which equips.
 */
const arrowTargetAt = (tier: number, ctx: PauseContext): ConfirmTarget | null => {
  const worn = ctx.gear.bow ?? NO_ARROW_TYPE;
  if (worn === NO_ARROW_TYPE || tier === worn) return null;
  return { kind: 'equip', gear: ARROW_LADDER, tier };
};

/**
 * A tier under the cursor, against the tier being worn. It is named by the STATE the
 * press would leave behind, not by the rung it is standing on.
 *
 * That is what makes the two routes to "nothing worn" agree. Confirming the
 * worn tier writes 0, and so does confirming tier 0 itself; if the first were
 * called an unequip and the second an equip, the bar would print two different
 * words for one outcome, on two rungs of the same ladder. So the tier to write
 * is worked out first, and the target is named from THAT: a write of 0 is an
 * unequip from wherever it was asked, and a press that would write the tier
 * already on is nothing at all.
 *
 * The worn tier is clamped first, so a context reporting a tier the ladder does
 * not have cannot make an ordinary rung look like the one already on.
 */
const gearTargetAt = (gear: GearLadderKind, tier: number, ctx: PauseContext): ConfirmTarget | null => {
  if (gear === ARROW_LADDER) return arrowTargetAt(tier, ctx);
  const worn = clampGearTier(gear, ctx.gear[gear]);
  const next = tier === worn ? BARE_TIER : tier;
  if (next === worn) return null;
  return next === BARE_TIER ? { kind: 'unequip', gear } : { kind: 'equip', gear, tier: next };
};

/**
 * What a confirm at the cursor points at, or null where it means nothing. Every
 * position lands through `clampCursor` first, so a cursor left out of range by a
 * shrinking screen confirms the cell it would have been snapped onto instead of
 * a tier no ladder has.
 */
const confirmTargetAt = (state: PauseState, ctx: PauseContext): ConfirmTarget | null => {
  if (state.phase !== 'browsing') return null;
  if (state.screen === 'gear') {
    if (!isGearSection(state.section)) return null;
    const at = clampCursor('gear', { section: state.section, cursor: state.cursor }, ctx);
    return isGearSection(at.section) ? gearTargetAt(at.section, at.cursor, ctx) : null;
  }
  if (state.screen === 'status' && state.section === 'actions') {
    const at = clampCursor('status', { section: 'actions', cursor: state.cursor }, ctx);
    return { kind: 'exit', via: at.cursor === SAVE_QUIT_CURSOR ? 'save-quit' : 'continue' };
  }
  return null;
};

/**
 * Which word the legend puts beside its confirm glyph, or null where the strip
 * should draw no confirm row at all. It replaced a bare `canConfirmAt` boolean:
 * a strip that knows only THAT a confirm does something has to guess at what,
 * and the guess it made was one fixed word for three different outcomes.
 */
const confirmVerbAt = (state: PauseState, ctx: PauseContext): ConfirmVerb | null =>
  confirmTargetAt(state, ctx)?.kind ?? null;

const planConfirm = (state: PauseState, ctx: PauseContext): ConfirmPlan => {
  const target = confirmTargetAt(state, ctx);
  if (!target) return { outcome: 'ignored' };
  if (target.kind === 'exit') return { outcome: 'exit', via: target.via };
  // Taking a piece off is always available: tier 0 is the one rung every save
  // holds, so there is no high-water mark for it to fail.
  if (target.kind === 'unequip') return { outcome: 'equip', gear: target.gear, tier: BARE_TIER };
  return isGearTierSelectable(target.gear, target.tier, markFor(target.gear, ctx))
    ? { outcome: 'equip', gear: target.gear, tier: target.tier }
    : { outcome: 'refused' };
};

export { confirmTargetAt, confirmVerbAt, planConfirm };
export type { ConfirmPlan, ConfirmTarget, ConfirmVerb };
