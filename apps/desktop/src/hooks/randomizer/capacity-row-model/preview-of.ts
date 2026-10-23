/* @layer renderer-lib @kind logic */
import { getCapacityUpgradeSprite } from '@rotp/game-data';
import { ladderClamps, planOf } from '@rotp/randomizer';
import type { CapacityFamily, FamilyPlan, FamilySetting } from '@rotp/randomizer';
import type { CapacityPreviewModel } from '@app/compounds/CapacityFamilyRow';
import { JUMP_LABEL, PROGRESSIVE_NOTE, VANILLA_NOTE } from './capacity-row-model.constants';
import { itemAt } from '@app/checked-access';
import { START_LABEL, SURPLUS_LABEL } from './preview-of.constants';
import { stopsOf } from './stops-of';

const noteOf = (setting: FamilySetting, plan: FamilyPlan): string | undefined => {
  const count = plan.items.length;
  if (setting.mode === 'vanilla-in-pool') return `${count} upgrade item${count === 1 ? '' : 's'} to find`;
  return plan.progressive && count > 0 ? PROGRESSIVE_NOTE : undefined;
};

const previewOf = (capacityFamily: CapacityFamily, setting: FamilySetting, plan: FamilyPlan): CapacityPreviewModel => {
  const stops = stopsOf(capacityFamily);
  const sprite = getCapacityUpgradeSprite(capacityFamily.id);
  const stepsOf = (ladder: readonly number[], jumps: readonly number[], active: boolean, surplus: boolean) =>
    ladder.map((value, index) => {
      const jump = index === 0 ? START_LABEL : JUMP_LABEL[capacityFamily.id](itemAt(jumps, index - 1));
      return {
        key: `step-${index}`,
        label: surplus && index === ladder.length - 1 ? `${jump} (${SURPLUS_LABEL})` : jump,
        sprite,
        value: itemAt(stops, capacityFamily.indexOf(value)),
        active,
      };
    });
  if (setting.mode === 'vanilla') {
    const native = planOf(capacityFamily, { mode: 'vanilla-in-pool' });
    return { steps: stepsOf(native.ladder, native.jumps, false, false), note: VANILLA_NOTE[capacityFamily.id] };
  }
  const startIndex = setting.mode === 'custom' ? capacityFamily.indexOf(setting.start) : 0;
  const surplus = ladderClamps(capacityFamily.ladder, startIndex, plan.jumps);
  return { steps: stepsOf(plan.ladder, plan.jumps, true, surplus), note: noteOf(setting, plan) };
};

export { previewOf };
