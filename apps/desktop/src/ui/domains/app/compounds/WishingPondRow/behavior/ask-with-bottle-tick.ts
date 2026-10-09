/* @layer renderer-components @kind logic */
import type { PondAskSetting } from '@shared/randomizer/world/pond/pond-ask.type';

const askWithBottleTick = (ask: PondAskSetting, enabled: boolean): PondAskSetting =>
  ({ ...ask, bottle: { ...ask.bottle, enabled } });

export { askWithBottleTick };
