/* @layer renderer-hooks @kind logic */
import { POND_PRICE_LADDER } from '@rotp/randomizer';
import { askOfSetting } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import type { PondRowState } from '@domains/app/compounds/WishingPondRow';

const stateOfSetting = (setting: PondSetting): PondRowState => {
  const custom = setting.mode === 'custom' ? setting : undefined;
  return {
    mode: setting.mode,
    range: [
      POND_PRICE_LADDER.indexOf(custom?.start ?? 100),
      POND_PRICE_LADDER.indexOf(custom?.max ?? 300),
    ],
    throws: custom?.throws ?? 7,
    items: setting.mode === 'capacity' ? 2 : setting.items,
    curve: custom?.shape.curve ?? 'equal',
    jumps: custom?.shape.curve === 'free' ? custom.shape.jumps : [],
    ask: askOfSetting(setting),
  };
};

export { stateOfSetting };
