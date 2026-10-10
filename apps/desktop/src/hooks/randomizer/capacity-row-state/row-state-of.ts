/* @layer renderer-lib @kind logic */
import { capacityFieldsOf, presetMatching } from '@rotp/randomizer';
import type { CapacityFamily, FamilySetting, PlannedFamilySetting } from '@rotp/randomizer';
import type { CapacityRowState, CurveChoice } from '@app/compounds/CapacityFamilyRow';
import { hiddenPresetsOf } from './hidden-presets-of';
import { customDefaultOf } from './custom-default-of';

const curveChoiceOf = (capacityFamily: CapacityFamily, setting: PlannedFamilySetting, span: number): CurveChoice => {
  const hasCurveRow = capacityFieldsOf(capacityFamily.id).includes('curve');
  if (!hasCurveRow) return 'equal';
  if (setting.shape.curve === 'free') return 'free';
  const preset = presetMatching(setting.shape.curve, setting.count, span);
  if (preset !== undefined && !hiddenPresetsOf(capacityFamily).includes(preset.id)) return `preset:${preset.id}`;
  return setting.shape.curve;
};

const rowStateOf = (capacityFamily: CapacityFamily, setting: FamilySetting): CapacityRowState => {
  const custom = setting.mode === 'custom' ? setting : customDefaultOf(capacityFamily);
  const range: readonly [number, number] = [capacityFamily.indexOf(custom.start), capacityFamily.indexOf(custom.max)];
  return {
    mode: setting.mode,
    range,
    count: custom.count,
    curve: curveChoiceOf(capacityFamily, custom, range[1] - range[0]),
    jumps: custom.shape.curve === 'free' ? custom.shape.jumps : [],
  };
};

export { rowStateOf };
