/* @layer renderer-components @kind logic */
import type { PondAskSetting } from '@shared/randomizer/world/pond/pond-ask.type';

const askWithItemTick = (ask: PondAskSetting, enabled: boolean): PondAskSetting =>
  ({ ...ask, item: { enabled } });

export { askWithItemTick };
