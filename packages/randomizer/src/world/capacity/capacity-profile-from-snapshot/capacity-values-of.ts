/* @layer shared-game @kind logic */
import { FAMILIES, maxSpanOf } from '../capacity-family';
import { capacityFieldsOf, capacityKeyOf } from '../capacity-option-keys';
import type { CapacityFamily } from '../capacity-family';
import type { CapacityProfile, FamilySetting, PlannedFamilySetting } from '../capacity-profile.type';
import type { CapacityField } from '../capacity-option-keys';
import type { OptionValue } from '../../options.type';

const customFields = (custom: PlannedFamilySetting): Record<CapacityField, OptionValue> => ({
  mode: custom.mode,
  start: String(custom.start),
  max: String(custom.max),
  count: custom.count,
  curve: custom.shape.curve,
  jumps: custom.shape.curve === 'free' ? custom.shape.jumps.join(',') : '',
});

const fieldsOf = (capacityFamily: CapacityFamily, setting: FamilySetting): Record<CapacityField, OptionValue> => {
  if (setting.mode === 'custom') return customFields(setting);
  const { ladder, vanillaRung, defaultCount } = capacityFamily;
  return {
    mode: setting.mode,
    start: String(ladder[vanillaRung]),
    max: String(ladder[ladder.length - 1]),
    count: Math.min(defaultCount, maxSpanOf(capacityFamily)),
    curve: 'equal',
    jumps: '',
  };
};

const capacityValuesOf = (profile: CapacityProfile): Record<string, OptionValue> => {
  const values: Record<string, OptionValue> = {};
  for (const capacityFamily of FAMILIES) {
    const { id } = capacityFamily;
    const fields = fieldsOf(capacityFamily, profile[id]);
    for (const field of capacityFieldsOf(id)) values[capacityKeyOf(id, field)] = fields[field];
  }
  return values;
};

export { capacityValuesOf };
