/* @layer renderer-stores @kind logic */
import type { SlotIndex } from '@rotp/game-data';
import type { PauseContext, PauseState } from '@rotp/game-data';
import { planAssignment } from '@rotp/game-data';
import { useControlSchemeStore } from '../control-scheme-store';

const assignFromCursor = (state: PauseState, slot: SlotIndex, ctx: PauseContext): boolean => {
  const { assignments, clearAssignment, setAssignment } = useControlSchemeStore.getState();
  const plan = planAssignment(state, ctx, slot, assignments);
  if (plan.outcome !== 'assign') return plan.outcome === 'refused';
  plan.clear.forEach((index) => clearAssignment(index));
  setAssignment(slot, plan.target);
  return false;
};

export { assignFromCursor };
