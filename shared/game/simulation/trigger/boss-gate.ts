/* @layer shared-game @kind logic */
/**
 * Bosses are a position + prerequisite gate — no combat is simulated. A boss
 * is triggerable when its trigger tile is reachable in the flood-fill result
 * and the inventory meets the beatability requirement (from CHECK_RULES).
 */
import type { GridPos, ReachState } from '../../navigation/types';
import type { Requirement } from '../../types';
import { CHECK_RULES, evaluateRequirement } from '../../logic';

interface BossSite {
  roomId: number;
  triggerTile: GridPos;
  /** Requirement tree; defaults to the CHECK_RULES entry for the boss check. */
  beatableWith: Requirement;
}

const isReachable = (reach: ReachState[][], tile: GridPos): boolean =>
  (reach[tile.row]?.[tile.col] ?? 0) > 0;

const meetsRequirements = (req: Requirement, inv: Set<string>): boolean => evaluateRequirement(req, inv);

const bossTriggerable = (boss: BossSite, reach: ReachState[][], inv: Set<string>): boolean =>
  isReachable(reach, boss.triggerTile) && meetsRequirements(boss.beatableWith, inv);

/** Beatability requirement for a boss check name, or an always-true fallback. */
const bossRequirement = (bossCheckName: string): Requirement =>
  CHECK_RULES[bossCheckName] ?? { and: [] };

export { bossTriggerable, isReachable, meetsRequirements, bossRequirement };
export type { BossSite };
