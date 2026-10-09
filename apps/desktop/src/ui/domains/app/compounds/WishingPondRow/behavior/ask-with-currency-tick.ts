/* @layer renderer-components @kind logic */
import type { PondAskCurrency, PondAskSetting } from '@shared/randomizer/world/pond/pond-ask.type';

const askWithCurrencyTick = (
  ask: PondAskSetting, currency: PondAskCurrency, enabled: boolean,
): PondAskSetting => ({ ...ask, [currency]: { ...ask[currency], enabled } });

export { askWithCurrencyTick };
