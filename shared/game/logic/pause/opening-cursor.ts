/* @layer shared-game @kind logic */
/**
 * Where a screen OPENS. That is the cell the cursor lands on when a screen is entered
 * instead of walked into.
 *
 * Every screen opened on its first cell, and on two of the three that is a
 * silently destructive default:
 *
 *  - **Items** opens on cell zero, the first tool in the grid, which is almost
 *    never the one the player has equipped. The first slot press after opening
 *    then lands on whatever happens to live there, usually an unowned
 *    silhouette, and merely refused.
 *  - **Gear** opens on tier zero of the blade ladder, and tier zero is the "no
 *    blade" rung. Switching to the gear screen and pressing confirm, an
 *    entirely ordinary thing to do, took the player's sword off. Tier zero
 *    stays reachable, because dropping to a weaker tier (or to none) is a
 *    choice the ladders exist to offer; it just must not be the rung a
 *    confirm falls on by default.
 *
 * So a screen opens on what is IN FORCE there: the equipped item, the worn
 * tier, the first cell where nothing is. The rule is written per-section rather
 * than per-screen, so all three ladders answer it and not just the one that
 * happens to be the gear screen's first row.
 *
 * The answer lands through `clampCursor` like every other position, so a
 * context that reports a tier or an item id no cell exists for is snapped onto
 * a real cell instead of opening the menu on nothing.
 */
import { GEAR_LADDER_KINDS, NO_ARROW_TYPE, clampGearTier } from './gear-tiers';
import { clampCursor, firstSectionOf } from './screens';
import type { GearLadderKind } from './gear-tiers';
import type { CursorPos } from './screens';
import type { PauseContext, PauseScreen, PauseSection } from './pause-machine';

/** Hud-item ids: 1..20 are the grid's tools, 21..24 the four bottles. */
const FIRST_BOTTLE_HUD_ITEM = 21;
const LAST_HUD_ITEM = 24;

const isGearSection = (section: PauseSection): section is GearLadderKind =>
  (GEAR_LADDER_KINDS as readonly PauseSection[]).includes(section);

/**
 * What a ladder currently has in force. The arrow row answers with the type the
 * launcher register is standing on, and with the rung no ladder has when nothing
 * is held, which `clampGearTier` then snaps onto the first rung, so a save with
 * no launcher opens the row on its first cell instead of on nothing.
 */
const wornOn = (kind: GearLadderKind, ctx: PauseContext): number =>
  kind === 'bow' ? (ctx.gear.bow ?? NO_ARROW_TYPE) : ctx.gear[kind];

/**
 * The item cell the equipped id names. An id outside 1..24 means the core has
 * nothing the grid can point at (a fresh save, or a register the host has not
 * driven yet), and the first cell is then as good an answer as any.
 */
const equippedItemCell = (activeItem: number | undefined): CursorPos => {
  const active = activeItem ?? 0;
  if (!Number.isInteger(active) || active < 1 || active > LAST_HUD_ITEM) {
    return { section: 'items', cursor: 0 };
  }
  return active >= FIRST_BOTTLE_HUD_ITEM
    ? { section: 'bottles', cursor: active - FIRST_BOTTLE_HUD_ITEM }
    : { section: 'items', cursor: active - 1 };
};

/** The cell a screen lands on when it is entered. */
const openingCursor = (screen: PauseScreen, ctx: PauseContext): CursorPos => {
  const section = firstSectionOf(screen);
  const at = screen === 'items'
    ? equippedItemCell(ctx.activeItem)
    : { section, cursor: isGearSection(section) ? clampGearTier(section, wornOn(section, ctx)) : 0 };
  return clampCursor(screen, at, ctx);
};

export { openingCursor };
