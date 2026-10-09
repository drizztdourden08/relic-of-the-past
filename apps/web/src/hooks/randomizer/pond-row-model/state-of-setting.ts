/* @layer renderer-hooks @kind logic */
import { POND_PRICE_LADDER } from '@shared/randomizer/world/pond/pond-ladder.data';
import { askOfSetting } from '@shared/randomizer/world/pond/pond-ask-from-snapshot';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
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
