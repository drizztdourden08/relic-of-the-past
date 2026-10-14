/* @layer renderer-hooks @kind logic */
import { pondPlanOf, CAPACITY_POND, POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER, VANILLA_POND_CEILINGS, pondCeilingRungOf, NO_POND_DEMANDS } from '@rotp/randomizer';
import { pondAskModelOf } from '../pond-ask-rows';
import { pondChargesOf, pondPreviewOf, pondWalletNoteOf } from '../pond-preview';
import type { PondDemandView, PondCeilings, PondInstance, PondSetting } from '@rotp/randomizer';
import type { PondRowModel } from '@app/compounds/WishingPondRow';
import { CURVE_OPTIONS, MODE_LABELS, PRICE_STOPS } from './pond-row-model.constants';
import { stateOfSetting } from './state-of-setting';

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
    askModel: pondAskModelOf({
      ask: state.ask, priceStops: stops, priceRange: state.range, hasLadder: setting.mode === 'custom', ceilings,
    }),
    curveOptions: CURVE_OPTIONS,
    maxThrows: Math.min(POND_MAX_THROWS, POND_PRICE_LADDER.length),
    maxItems: Math.min(POND_MAX_ITEMS, Math.max(1, plan.throws.length || POND_MAX_ITEMS)),
    hasPrices: setting.mode === 'custom',
    offersItems: setting.mode !== 'capacity',
    preview: pondPreviewOf(setting, plan, charges, prizeCount),
    walletNote: pondWalletNoteOf(plan, charges, prizeCount),
  };
};

export { pondRowModelOf };
