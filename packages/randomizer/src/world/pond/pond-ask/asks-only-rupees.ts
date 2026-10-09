/* @layer shared-game @kind logic */
import type { PondAskSetting } from '../pond-ask.type';

const asksOnlyRupees = (ask: PondAskSetting): boolean =>
  ask.rupees.enabled && !ask.bombs.enabled && !ask.arrows.enabled && !ask.bottle.enabled && !ask.item.enabled;

export { asksOnlyRupees };
