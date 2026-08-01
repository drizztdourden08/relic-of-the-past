/* @layer shared-game @kind logic */
/**
 * Bosses are a position + prerequisite gate — no combat is simulated. A boss
 * is triggerable when its trigger tile is reachable in the flood-fill result
 * and the inventory meets the beatability requirement (from CheckRecord.requirements).
 */
import type { GridPos, ReachState } from '../../navigation/types';
import type { CheckId, ItemId, Requirement } from '../../data';
import { getCheck } from '../../data';
import { evaluateRequirement } from '../../logic';

interface BossSite {
  roomId: number;
  triggerTile: GridPos;
  /** Requirement tree; defaults to the boss check's own CheckRecord.requirements. */
  beatableWith: Requirement;
}

const isReachable = (reach: ReachState[][], tile: GridPos): boolean =>
  (reach[tile.row]?.[tile.col] ?? 0) > 0;

const meetsRequirements = (req: Requirement, inv: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): boolean =>
  evaluateRequirement(req, inv, completed);

const bossTriggerable = (boss: BossSite, reach: ReachState[][], inv: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): boolean =>
  isReachable(reach, boss.triggerTile) && meetsRequirements(boss.beatableWith, inv, completed);

/** Beatability requirement for a boss check, or an always-true fallback. */
const bossRequirement = (bossCheckId: CheckId): Requirement =>
  getCheck(bossCheckId).requirements ?? { allOf: [] };

export { bossTriggerable, isReachable, meetsRequirements, bossRequirement };
export type { BossSite };
