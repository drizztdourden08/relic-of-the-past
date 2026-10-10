/* @layer shared-game @kind logic */
import { POND_ASK_BOTTLE_CONTENTS } from '../pond-ask';
import {
  pondAskBottleContentKeyOf, pondAskBottleKeyOf, pondAskItemKeyOf, pondAskKeyOf,
  pondAskMaxKeyOf, pondAskMinKeyOf,
} from '../pond-ask-keys';
import { askOfSetting } from './ask-of-setting';
import type { OptionValue } from '../../options.type';
import type { PondInstance } from '../pond-instance.type';
import type { PondSetting } from '../pond-profile.type';

const pondAskValuesOf = (setting: PondSetting, pond: PondInstance): Record<string, OptionValue> => {
  const ask = askOfSetting(setting);
  const counted = (['bombs', 'arrows'] as const).flatMap((currency): [string, OptionValue][] => [
    [pondAskKeyOf(pond, currency), ask[currency].enabled],
    [pondAskMinKeyOf(pond, currency), String(ask[currency].min)],
    [pondAskMaxKeyOf(pond, currency), String(ask[currency].max)],
  ]);
  return {
    ...Object.fromEntries(counted),
    [pondAskKeyOf(pond, 'rupees')]: ask.rupees.enabled,
    [pondAskBottleKeyOf(pond)]: ask.bottle.enabled,
    [pondAskMinKeyOf(pond, 'bottle')]: String(ask.bottle.min),
    [pondAskMaxKeyOf(pond, 'bottle')]: String(ask.bottle.max),
    ...Object.fromEntries(POND_ASK_BOTTLE_CONTENTS.map(({ content }) =>
      [pondAskBottleContentKeyOf(pond, content), ask.bottle.contents.includes(content)])),
    [pondAskItemKeyOf(pond)]: ask.item.enabled,
  };
};

export { pondAskValuesOf };
