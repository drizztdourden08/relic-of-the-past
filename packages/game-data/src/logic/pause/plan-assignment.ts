/* @layer shared-game @kind logic */
import type { SlotAssignment, SlotIndex } from '../../controls/scheme';
import type { AssignPlan, AssignTarget, PauseContext, PauseState, SlotAssignments } from './pause.type';
import { assignTargetAt } from './assign-target-at';

const sameTarget = (assignment: SlotAssignment | undefined, target: AssignTarget): boolean => {
  if (assignment?.kind !== target.kind) return false;
  if (assignment.kind === 'item' && target.kind === 'item') return assignment.hudItem === target.hudItem;
  return true;
};

const planAssignment = (
  state: PauseState,
  ctx: PauseContext,
  slot: SlotIndex,
  assignments: SlotAssignments,
): AssignPlan => {
  const target = assignTargetAt(state, ctx);
  if (!target) return { outcome: 'ignored' };
  if (target.kind === 'item' && !ctx.owned[target.hudItem - 1]) return { outcome: 'refused' };
  const clear = Object.keys(assignments)
    .map(Number)
    .filter((index) => index !== slot && sameTarget(assignments[index], target));
  return { outcome: 'assign', target, clear };
};

export { planAssignment };
