/* @layer shared-game @kind types */
/**
 * One act the game writes down, joined to the token its rules ask for.
 *
 * An act is a thing the player did once that changed the world for good: a wall blown open, a
 * staircase uncovered, a barrier cut down. The dataset's event check is what certifies it, and
 * the token is how a rule asks about it, which is the mechanism the generator already uses for
 * its nine event items.
 */
import type { CheckId, ItemId } from '@shared/game/data/types';
import type { Rule } from '../world.type';

/**
 * What the collected state calls a done act. An act the generator already carried as an event
 * ITEM answers to that item's id, because the fill places it and the sweep collects it. Every
 * other act answers to the check that certifies it, which is the only name it has.
 */
type ActToken = ItemId | CheckId;

interface EventGate {
  /** The dataset event check that certifies the act. */
  checkId: CheckId;
  /**
   * The event item the fill places at this check, for the nine acts that have one. Absent
   * means the act answers to its own check id.
   */
  token?: ItemId;
  /**
   * What performing the act takes NOW, for a player who has not done it yet. Absent means the
   * rules cannot judge it, so a world with no record attached reads the act as available (which
   * is what a fill needs) and a world reading the record answers from the record alone.
   */
  precondition?: Rule;
}

export type { ActToken, EventGate };
