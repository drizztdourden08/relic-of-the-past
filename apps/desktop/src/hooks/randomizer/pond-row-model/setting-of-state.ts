/* @layer renderer-hooks @kind logic */
import { POND_PRICE_LADDER } from '@shared/randomizer/world/pond/pond-ladder.data';
import { asksOnlyRupees } from '@shared/randomizer/world/pond/pond-ask.data';
import type { CurveId } from '@shared/randomizer/world/capacity';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';
import type { PondRowState } from '@domains/app/compounds/WishingPondRow';

const askPart = (state: PondRowState, start: number, max: number) => {
  const ask = { ...state.ask, rupees: { ...state.ask.rupees, min: start, max } };
  return asksOnlyRupees(ask) ? {} : { ask };
};

const settingOfState = (state: PondRowState): PondSetting => {
  const [low, high] = state.range;
  if (state.mode === 'capacity') return { mode: 'capacity' };
  const start = POND_PRICE_LADDER[low];
  const max = POND_PRICE_LADDER[high];
  if (state.mode !== 'custom') return { mode: state.mode, items: state.items, ...askPart(state, start, max) };
  return {
    mode: 'custom',
    start,
    max,
    throws: state.throws,
    items: state.items,
    shape: state.curve === 'free' ? { curve: 'free', jumps: state.jumps } : { curve: state.curve as CurveId },
    ...askPart(state, start, max),
  };
};

export { settingOfState };
