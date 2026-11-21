/* @layer renderer-lib @kind logic */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import { getCapacityUpgradeSprite } from '@rotp/game-data';
import { ladderClamps, planOf } from '@rotp/randomizer';
import type { FamilyPlan, FamilySetting } from '@rotp/randomizer';
import type { CapacityPreviewModel } from '@app/compounds/CapacityFamilyRow';
import type { PreviewInput } from './preview-of.type';
import { JUMP_LABEL, PROGRESSIVE_NOTE, VANILLA_NOTE } from './capacity-row-model.constants';
import { itemAt } from '@app/checked-access';
import { START_LABEL, SURPLUS_LABEL } from './preview-of.constants';
import { stopsOf } from './stops-of';

const noteOf = (setting: FamilySetting, plan: FamilyPlan, t: I18n['t'], text: (text: Text) => string): string | undefined => {
  const count = plan.items.length;
  if (setting.mode === 'vanilla-in-pool') return t('randomizer:capacity-row.items-to-find', { count });
  return plan.progressive && count > 0 ? text(PROGRESSIVE_NOTE) : undefined;
};

const previewOf = (input: PreviewInput): CapacityPreviewModel => {
  const { capacityFamily, setting, plan, t, text } = input;
  const stops = stopsOf(capacityFamily);
  const sprite = getCapacityUpgradeSprite(capacityFamily.id);
  const stepsOf = (ladder: readonly number[], jumps: readonly number[], active: boolean, surplus: boolean) =>
    ladder.map((value, index) => {
      const jump = index === 0 ? text(START_LABEL) : JUMP_LABEL[capacityFamily.id](itemAt(jumps, index - 1), t);
      return {
        key: `step-${index}`,
        label: surplus && index === ladder.length - 1 ? t('randomizer:capacity-row.surplus-step', { jump, surplus: text(SURPLUS_LABEL) }) : jump,
        sprite,
        value: itemAt(stops, capacityFamily.indexOf(value)),
        active,
      };
    });
  if (setting.mode === 'vanilla') {
    const native = planOf(capacityFamily, { mode: 'vanilla-in-pool' });
    return { steps: stepsOf(native.ladder, native.jumps, false, false), note: text(VANILLA_NOTE[capacityFamily.id]) };
  }
  const startIndex = setting.mode === 'custom' ? capacityFamily.indexOf(setting.start) : 0;
  const surplus = ladderClamps(capacityFamily.ladder, startIndex, plan.jumps);
  return { steps: stepsOf(plan.ladder, plan.jumps, true, surplus), note: noteOf(setting, plan, t, text) };
};

export { previewOf };
