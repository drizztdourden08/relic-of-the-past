/* @layer renderer-hooks @kind logic */
/**
 * The pond row, derived: a setting (and the seed a gamble is drawn from) to
 * everything the row renders. Pure, so the creation panel and the Run tab show
 * the same thing from the same input, and the preview is the plan the seed
 * will actually use, not a second description of it.
 */
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER } from '@shared/randomizer/ap-world/pond/pond-ladder.data';
import { POND_PRICE_CEILING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { pondCeilingRungOf } from '@shared/randomizer/ap-world/pond/pond-wallet-top';
import { describeRupees } from '@shared/randomizer/ap-world/pond/rupee-gems';
import { CURVE_LABELS } from '@shared/randomizer/ap-world/capacity';
import type { CurveId } from '@shared/randomizer/ap-world/capacity';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondRowModel, PondRowState } from '@domains/app/compounds/WishingPondRow';

const MODE_LABELS: Readonly<Record<PondSetting['mode'], string>> = {
  capacity: 'Capacity upgrades',
  'vanilla-cost': 'Vanilla cost',
  custom: 'Custom',
  gamble: 'Gamble',
};

const PRICE_STOPS: readonly string[] = POND_PRICE_LADDER.map((price) => (price === 0 ? 'free' : String(price)));

const CURVE_OPTIONS = (['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const)
  .map((curve) => ({ value: curve, label: CURVE_LABELS[curve] }));

/** The setting a row state stands for: the inverse of stateOfSetting. */
const settingOfState = (state: PondRowState): PondSetting => {
  const [low, high] = state.range;
  if (state.mode === 'capacity') return { mode: 'capacity' };
  if (state.mode !== 'custom') return { mode: state.mode, items: state.items };
  return {
    mode: 'custom',
    start: POND_PRICE_LADDER[low],
    max: POND_PRICE_LADDER[high],
    throws: state.throws,
    items: state.items,
    shape: state.curve === 'free' ? { curve: 'free', jumps: state.jumps } : { curve: state.curve as CurveId },
  };
};

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
  };
};

/**
 * Everything the row renders for one setting under one seed. `walletTop` is
 * what the wallet family can hold: the range control offers no stop above
 * it, so the top thumb can never ask for a price the wallet cannot pay.
 */
const pondRowModelOf = (setting: PondSetting, seed: string, walletTop = POND_PRICE_CEILING): PondRowModel => {
  const plan = pondPlanOf(setting, seed);
  const state = stateOfSetting(setting);
  const prizeCount = plan.locations.length;
  const dearest = prizeCount === 0 ? 0 : plan.worstPriceOfPrize[prizeCount - 1];
  return {
    label: 'Wishing pond',
    modeLabel: MODE_LABELS[setting.mode],
    state,
    stops: PRICE_STOPS.slice(0, pondCeilingRungOf(walletTop) + 1),
    curveOptions: CURVE_OPTIONS,
    maxThrows: Math.min(POND_MAX_THROWS, POND_PRICE_LADDER.length),
    maxItems: Math.min(POND_MAX_ITEMS, Math.max(1, plan.throws.length || POND_MAX_ITEMS)),
    hasPrices: setting.mode === 'custom',
    offersItems: setting.mode !== 'capacity',
    preview: {
      chips: plan.throws.map((entry) => String(entry.price)),
      jumps: plan.throws.slice(1).map((entry) => (entry.prize >= 0 ? 'prize' : '·')),
      dim: setting.mode === 'capacity',
      note: setting.mode === 'capacity'
        ? 'the native purchase loop'
        : `${prizeCount} pool item${prizeCount === 1 ? '' : 's'} · ${plan.totalPrice} rupees to empty`,
    },
    // The dearest single throw on the way to the last prize: what the wallet must hold.
    walletNote: prizeCount === 0
      ? undefined
      : `wallet must hold ${dearest}, thrown as ${describeRupees(dearest)}`,
  };
};

export { pondRowModelOf, settingOfState, stateOfSetting };
