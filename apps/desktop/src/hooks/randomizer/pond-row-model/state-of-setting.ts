/* @layer renderer-hooks @kind logic */
import { POND_PRICE_LADDER, askOfSetting } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import type { PondRowState } from '@app/compounds/WishingPondRow';
import { DEFAULT_CUSTOM_POND } from './pond-row-model.constants';

const stateOfSetting = (setting: PondSetting): PondRowState => {
  const custom = setting.mode === 'custom' ? setting : DEFAULT_CUSTOM_POND;
  const { shape } = custom;
  return {
    mode: setting.mode,
    range: [POND_PRICE_LADDER.indexOf(custom.start), POND_PRICE_LADDER.indexOf(custom.max)],
    throws: custom.throws,
    items: setting.mode === 'capacity' ? 2 : setting.items,
    curve: shape.curve,
    jumps: shape.curve === 'free' ? shape.jumps : [],
    ask: askOfSetting(setting),
  };
};

export { stateOfSetting };
