/* @layer shared-game @kind logic */
import { METER_LEVEL_LABELS } from '../capacity/capacity-ladders.constants';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { OptionChoice } from '../options.type';

const capacityLadderChoices = (capacityFamily: CapacityFamily): OptionChoice[] =>
  capacityFamily.ladder.map((value, index) => ({
    value: String(value),
    sourceValue: value,
    label: capacityFamily.id === 'meter' ? METER_LEVEL_LABELS[index] : String(value),
  }));

export { capacityLadderChoices };
