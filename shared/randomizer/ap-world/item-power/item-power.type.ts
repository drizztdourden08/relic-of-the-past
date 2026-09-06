/* @layer shared-game @kind types */
/**
 * How helpful the items are — the questions inside the reference project's
 * single four-step Item Functionality choice (Options.py ItemFunctionality:
 * easy / normal / hard / expert), asked one at a time.
 *
 * That choice is a bundle: one step moves eight unrelated things at once, and
 * a player who wants the barrier to stop protecting them has no way to say so
 * without also losing their potions and their fairies. Each step is really a
 * row of independent switches in the reference's own patcher (Rom.py 817-870
 * writes eight separate bytes per step), so this app exposes the switches and
 * lets the bundle be a preset the player can build for themselves.
 *
 * Every default here is the NORMAL step — the unmodified game — so a profile
 * that touches none of these rows plays exactly as it always did.
 */

interface ItemPowerSetting {
  /** Swinging the net at a fairy puts it in an empty bottle. */
  catchFairies: boolean;
  /** The blue barrier makes the player untouchable while it is up. */
  byrnaInvulnerable: boolean;
  /** The cape burns the meter twice as fast as it normally does. */
  capeDoubleMagic: boolean;
  /** Silver arrows keep their extra bite outside the last fight. */
  silverArrowsAnywhere: boolean;
  /** The powder turns an enemy into a fairy rather than into the lesser prize. */
  powderFairy: boolean;
  /**
   * The hammer wakes the two tablets, so the book alone is enough beside it.
   * Reads as ON whenever no beam blade can be found at all — a requirement
   * nothing in the seed could meet is a dead end, not a rule.
   */
  hammerTablets: boolean;
  /**
   * A medallion opens its door with no blade in hand. Reads as ON whenever no
   * blade at all can be found, for the same reason.
   */
  swordlessMedallions: boolean;
  /**
   * A hanging cloth door comes down when it is grabbed and pulled, as well as
   * when it is cut. Reads as ON whenever no blade at all can be found.
   */
  pullableCurtains: boolean;
  /**
   * The hammer lands on the last fight, which otherwise refuses it outright.
   * Reads as ON whenever no blade that throws a beam can be found: the first
   * rung scores nothing there, so a file stuck on it has no other weapon.
   */
  hammerLastFight: boolean;
  /**
   * The tower's seal breaks to a hammer instead of throwing the blow back.
   * Reads as ON on the same condition, for the same reason.
   */
  hammerTowerSeal: boolean;
}

export type { ItemPowerSetting };
