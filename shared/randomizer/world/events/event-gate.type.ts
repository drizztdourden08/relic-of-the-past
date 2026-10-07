/* @layer shared-game @kind types */
/**
 * One act the game writes down, joined to the rule that performs it.
 *
 * An act is a thing the player did once that changed the world for good: a wall blown open, a
 * staircase uncovered, a barrier cut down. The dataset's event check is what certifies it, and
 * that check's id is how a rule asks about it.
 */
import type { CheckId } from '@shared/game/data/types';
import type { Rule } from '../world.type';

/** What the collected state calls a done act: the check that certifies it, its only name. */
type ActToken = CheckId;

interface EventGate {
  /** The dataset event check that certifies the act. */
  checkId: CheckId;
  /**
   * What performing the act takes NOW, for a player who has not done it yet. Absent means the
   * rules cannot judge it, so a world with no record attached reads the act as available (which
   * is what a fill needs) and a world reading the record answers from the record alone.
   */
  precondition?: Rule;
}

export type { ActToken, EventGate };
