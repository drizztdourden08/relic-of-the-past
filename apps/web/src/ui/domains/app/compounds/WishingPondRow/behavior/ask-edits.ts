/* @layer renderer-components @kind logic */
/**
 * The edits the ask block makes to one pond's demand setting. Pure, so the row
 * stays presentational: an edit goes in and the whole ask comes back out, and
 * the view decides what to do with it.
 *
 * The rupee row is not here. Its two ends are the pond's own price ladder, so
 * moving them is an edit to the row state's range, not to the ask.
 *
 * The bottle's two ends go through the same writer as bombs and arrows, since
 * what they count is how many bottles she names and the row is the same shape.
 */
import type {
  PondAskAmountKind, PondAskCurrency, PondAskSetting,
} from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { ShopBottleContent } from '@shared/randomizer/ap-world/shops/shop-price.type';

/** One counted row ticked or unticked. */
const askWithCurrencyTick = (
  ask: PondAskSetting, currency: PondAskCurrency, enabled: boolean,
): PondAskSetting => ({ ...ask, [currency]: { ...ask[currency], enabled } });

/** One counted row's two ends, written back as the amounts its stops stand for. */
const askWithRange = (
  ask: PondAskSetting, kind: PondAskAmountKind, stops: readonly string[], range: readonly [number, number],
): PondAskSetting =>
  ({ ...ask, [kind]: { ...ask[kind], min: Number(stops[range[0]]), max: Number(stops[range[1]]) } });

const askWithBottleTick = (ask: PondAskSetting, enabled: boolean): PondAskSetting =>
  ({ ...ask, bottle: { ...ask.bottle, enabled } });

/** One bottle content ticked or unticked, the rest left as they were. */
const askWithContent = (ask: PondAskSetting, content: ShopBottleContent, checked: boolean): PondAskSetting => ({
  ...ask,
  bottle: {
    ...ask.bottle,
    contents: checked
      ? [...ask.bottle.contents, content]
      : ask.bottle.contents.filter((entry) => entry !== content),
  },
});

const askWithItemTick = (ask: PondAskSetting, enabled: boolean): PondAskSetting =>
  ({ ...ask, item: { enabled } });

export { askWithBottleTick, askWithContent, askWithCurrencyTick, askWithItemTick, askWithRange };
