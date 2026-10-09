/* @layer renderer-stores @kind logic */
import type { SlotIndex } from '@shared/types/controls';
import type { PauseContext, PauseState } from '@shared/game/logic/pause';
import { planAssignment } from '@shared/game/logic/pause';
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
