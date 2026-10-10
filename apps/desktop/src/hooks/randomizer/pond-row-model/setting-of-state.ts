/* @layer renderer-hooks @kind logic */
import { POND_PRICE_LADDER, asksOnlyRupees } from '@rotp/randomizer';
import type { CurveId, PondSetting } from '@rotp/randomizer';
import { itemAt } from '@app/checked-access';
import type { PondRowState } from '@app/compounds/WishingPondRow';

const askPart = (state: PondRowState, start: number, max: number) => {
  const ask = { ...state.ask, rupees: { ...state.ask.rupees, min: start, max } };
  return asksOnlyRupees(ask) ? {} : { ask };
};

const settingOfState = (state: PondRowState): PondSetting => {
  const [low, high] = state.range;
  if (state.mode === 'capacity') return { mode: 'capacity' };
  const start = itemAt(POND_PRICE_LADDER, low);
  const max = itemAt(POND_PRICE_LADDER, high);
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
