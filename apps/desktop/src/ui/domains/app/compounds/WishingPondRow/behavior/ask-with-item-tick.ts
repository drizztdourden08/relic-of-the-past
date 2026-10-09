/* @layer renderer-components @kind logic */
import type { PondAskSetting } from '@rotp/randomizer';

const askWithItemTick = (ask: PondAskSetting, enabled: boolean): PondAskSetting =>
  ({ ...ask, item: { enabled } });

export { askWithItemTick };
