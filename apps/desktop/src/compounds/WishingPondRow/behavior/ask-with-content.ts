/* @layer renderer-components @kind logic */
import type { PondAskSetting, ShopBottleContent } from '@rotp/randomizer';

const askWithContent = (ask: PondAskSetting, content: ShopBottleContent, checked: boolean): PondAskSetting => ({
  ...ask,
  bottle: {
    ...ask.bottle,
    contents: checked
      ? [...ask.bottle.contents, content]
      : ask.bottle.contents.filter((entry) => entry !== content),
  },
});

export { askWithContent };
