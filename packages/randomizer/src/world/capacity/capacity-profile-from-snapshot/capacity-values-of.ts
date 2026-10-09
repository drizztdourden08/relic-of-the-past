/* @layer shared-game @kind logic */
import { FAMILIES, maxSpanOf } from '../capacity-family';
import { capacityFieldsOf, capacityKeyOf } from '../capacity-option-keys';
import type { CapacityFamilyId, CapacityProfile } from '../capacity-profile.type';
import type { OptionValue } from '../../options.type';

const capacityValuesOf = (profile: CapacityProfile): Record<string, OptionValue> => {
  const values: Record<string, OptionValue> = {};
  for (const capacityFamily of FAMILIES) {
    const { id, ladder, vanillaRung, defaultCount } = capacityFamily;
    const setting = profile[id];
    const custom = setting.mode === 'custom' ? setting : undefined;
    const fields: Record<string, OptionValue> = {
      mode: setting.mode,
      start: String(custom?.start ?? ladder[vanillaRung]),
      max: String(custom?.max ?? ladder[ladder.length - 1]),
      count: custom?.count ?? Math.min(defaultCount, maxSpanOf(capacityFamily)),
      curve: custom?.shape.curve ?? 'equal',
      jumps: custom?.shape.curve === 'free' ? custom.shape.jumps.join(',') : '',
    };
    for (const field of capacityFieldsOf(id as CapacityFamilyId)) values[capacityKeyOf(id, field)] = fields[field];
  }
  return values;
};

export { capacityValuesOf };
