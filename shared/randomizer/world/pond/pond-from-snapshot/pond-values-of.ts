/* @layer shared-game @kind logic */
import { CAPACITY_POND } from '../pond-instances';
import { DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS } from '../pond-profile-defaults';
import { pondKeyOf } from '../pond-option-keys';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from '../pond-ask-keys';
import { pondAskValuesOf } from '../pond-ask-from-snapshot';
import type { OptionValue } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const pondValuesOf = (
  setting: PondSetting, pond: PondInstance = CAPACITY_POND,
): Record<string, OptionValue> => {
  const custom = setting.mode === 'custom' ? setting : undefined;
  const items = setting.mode === 'capacity' ? DEFAULT_POND_ITEMS : setting.items;
  return {
    ...pondAskValuesOf(setting, pond),
    [pondKeyOf(pond, 'mode')]: setting.mode,
    [pondAskMinKeyOf(pond, 'rupees')]: String(custom?.start ?? DEFAULT_POND_CUSTOM.start),
    [pondAskMaxKeyOf(pond, 'rupees')]: String(custom?.max ?? DEFAULT_POND_CUSTOM.max),
    [pondKeyOf(pond, 'throws')]: custom?.throws ?? DEFAULT_POND_CUSTOM.throws,
    [pondKeyOf(pond, 'items')]: items,
    [pondKeyOf(pond, 'curve')]: custom?.shape.curve ?? 'equal',
    [pondKeyOf(pond, 'jumps')]: custom?.shape.curve === 'free' ? custom.shape.jumps.join(',') : '',
  };
};

export { pondValuesOf };
