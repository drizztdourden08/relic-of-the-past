/* @layer renderer-components @kind logic */
import type { PondAskSetting } from '@rotp/randomizer';

const askWithBottleTick = (ask: PondAskSetting, enabled: boolean): PondAskSetting =>
  ({ ...ask, bottle: { ...ask.bottle, enabled } });

export { askWithBottleTick };
