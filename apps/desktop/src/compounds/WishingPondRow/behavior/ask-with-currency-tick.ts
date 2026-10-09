/* @layer renderer-components @kind logic */
import type { PondAskCurrency, PondAskSetting } from '@rotp/randomizer';

const askWithCurrencyTick = (
  ask: PondAskSetting, currency: PondAskCurrency, enabled: boolean,
): PondAskSetting => ({ ...ask, [currency]: { ...ask[currency], enabled } });

export { askWithCurrencyTick };
