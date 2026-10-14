/* @layer renderer-lib @kind logic */
import { ladderClamps, planOf } from '@rotp/randomizer';
import type { CapacityFamily, FamilyPlan, FamilySetting } from '@rotp/randomizer';
import type { LadderPreviewProps } from '@app/compounds/LadderPreview';
import { JUMP_LABEL, PROGRESSIVE_NOTE, VANILLA_NOTE } from './capacity-row-model.constants';
import { itemAt } from '@app/checked-access';
import { stopsOf } from './stops-of';

const noteOf = (setting: FamilySetting, plan: FamilyPlan): string | undefined => {
  const count = plan.items.length;
  if (setting.mode === 'vanilla-in-pool') return `${count} upgrade item${count === 1 ? '' : 's'} to find`;
  return plan.progressive && count > 0 ? PROGRESSIVE_NOTE : undefined;
};

const previewOf = (capacityFamily: CapacityFamily, setting: FamilySetting, plan: FamilyPlan): LadderPreviewProps => {
  const stops = stopsOf(capacityFamily);
  const chipsOf = (ladder: readonly number[]) => ladder.map((value) => itemAt(stops, capacityFamily.indexOf(value)));
  const jumpsOf = (jumps: readonly number[]) => jumps.map(JUMP_LABEL[capacityFamily.id]);
  if (setting.mode === 'vanilla') {
    const native = planOf(capacityFamily, { mode: 'vanilla-in-pool' });
    return { chips: chipsOf(native.ladder), jumps: jumpsOf(native.jumps), dim: true, note: VANILLA_NOTE[capacityFamily.id] };
  }
  const startIndex = setting.mode === 'custom' ? capacityFamily.indexOf(setting.start) : 0;
  const surplus = ladderClamps(capacityFamily.ladder, startIndex, plan.jumps);
  return { chips: chipsOf(plan.ladder), jumps: jumpsOf(plan.jumps), surplus, ordered: plan.progressive, note: noteOf(setting, plan) };
};

export { previewOf };
