/* @layer renderer-hooks @kind logic */
/**
 * The pond row, derived: a setting to everything the row renders. Pure, so
 * the creation panel and the Run tab show the same thing from the same input,
 * and the preview is the plan the seed will use, not a second description of
 * it.
 */
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { CAPACITY_POND } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER } from '@shared/randomizer/ap-world/pond/pond-ladder.data';
import { VANILLA_POND_CEILINGS } from '@shared/randomizer/ap-world/pond/pond-ceilings';
import { pondCeilingRungOf } from '@shared/randomizer/ap-world/pond/pond-wallet-top';
import { askOfSetting } from '@shared/randomizer/ap-world/pond/pond-ask-from-snapshot';
import { asksOnlyRupees } from '@shared/randomizer/ap-world/pond/pond-ask.data';
import { NO_POND_DEMANDS } from '@shared/randomizer/ap-world/pond/pond-demand-seed';
import { pondAskModelOf } from './pond-ask-rows';
import { pondChargesOf, pondPreviewOf, pondWalletNoteOf } from './pond-preview';
import { CURVE_LABELS } from '@shared/randomizer/ap-world/capacity';
import type { CurveId } from '@shared/randomizer/ap-world/capacity';
import type { PondDemandView } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondCeilings } from '@shared/randomizer/ap-world/pond/pond-ceilings';
import type { PondInstance } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondRowModel, PondRowState } from '@domains/app/compounds/WishingPondRow';

const MODE_LABELS: Readonly<Record<PondSetting['mode'], string>> = {
  capacity: 'Vanilla grants',
  'vanilla-cost': 'Vanilla cost',
  custom: 'Custom',
};

const PRICE_STOPS: readonly string[] = POND_PRICE_LADDER.map((price) => (price === 0 ? 'free' : String(price)));

const CURVE_OPTIONS = (['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const)
  .map((curve) => ({ value: curve, label: CURVE_LABELS[curve] }));

/**
 * The ask a setting carries, left OUT while it is the rupees-only reading an
 * absent one already means, so an untouched block stores exactly what it
 * stored before the block existed.
 */
const askPart = (state: PondRowState, start: number, max: number) => {
  const ask = { ...state.ask, rupees: { ...state.ask.rupees, min: start, max } };
  return asksOnlyRupees(ask) ? {} : { ask };
};

/** The setting a row state stands for: the inverse of stateOfSetting. */
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

/**
 * Everything the row renders for one pond's setting. `ceilings` is what the
 * wallet, bag and quiver can hold: no range control offers a stop above its
 * own, so no thumb can ask for more than the profile can ever pay. `demands` is what
 * the profile's own seed rolled (pond/pond-demand-seed.ts), so the preview
 * shows the throws as they will really be asked for; none leaves every throw
 * reading as its rupee price.
 */
const pondRowModelOf = (
  setting: PondSetting, ceilings: PondCeilings = VANILLA_POND_CEILINGS, pond: PondInstance = CAPACITY_POND,
  demands: PondDemandView = NO_POND_DEMANDS,
): PondRowModel => {
  const plan = pondPlanOf(setting, pond);
  const state = stateOfSetting(setting);
  const prizeCount = plan.locations.length;
  const charges = pondChargesOf(plan, demands);
  const stops = PRICE_STOPS.slice(0, pondCeilingRungOf(ceilings.rupees) + 1);
  return {
    label: pond.label,
    modeLabel: MODE_LABELS[setting.mode],
    state,
    stops,
    askModel: pondAskModelOf(state.ask, stops, state.range, setting.mode === 'custom', ceilings),
    curveOptions: CURVE_OPTIONS,
    maxThrows: Math.min(POND_MAX_THROWS, POND_PRICE_LADDER.length),
    maxItems: Math.min(POND_MAX_ITEMS, Math.max(1, plan.throws.length || POND_MAX_ITEMS)),
    hasPrices: setting.mode === 'custom',
    offersItems: setting.mode !== 'capacity',
    preview: pondPreviewOf(setting, plan, charges, prizeCount),
    // The dearest single rupee throw on the way to the last prize: what the wallet must hold.
    walletNote: pondWalletNoteOf(plan, charges, prizeCount),
  };
};

export { pondRowModelOf, settingOfState, stateOfSetting };
