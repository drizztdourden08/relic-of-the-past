/* @layer shared-game @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { itemAt } from '../../checked-access';
import { METER_LEVEL_LABELS } from '../capacity/capacity-ladders.constants';
import { CHOICE_LABELS } from '../options/choice-labels.constants';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { OptionChoice } from '../options.type';

const meterLabelOf = (index: number): Message | string => {
  const level = itemAt(METER_LEVEL_LABELS, index);
  return CHOICE_LABELS[level] ?? level;
};

const capacityLadderChoices = (capacityFamily: CapacityFamily): OptionChoice[] =>
  capacityFamily.ladder.map((value, index) => ({
    value: String(value),
    sourceValue: value,
    label: capacityFamily.id === 'meter' ? meterLabelOf(index) : String(value),
  }));

export { capacityLadderChoices };
