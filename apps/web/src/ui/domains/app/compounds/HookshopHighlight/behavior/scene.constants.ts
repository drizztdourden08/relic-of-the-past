/* @layer renderer-components @kind constants */
import { HOOKSHOP_PARTS } from '../HookshopHighlight.constants';
import { boxStyle } from './box-style';
import { computeLayout } from './scene-layout';
import { spriteEntries } from './sprite-entries';

const LAYOUT = computeLayout(HOOKSHOP_PARTS);

const STYLES = {
  bot: boxStyle(LAYOUT.bot),
  bag: boxStyle(LAYOUT.bag),
  stamp: boxStyle(LAYOUT.stamp),
};
const BEHIND_BAG = spriteEntries(LAYOUT.behindBag);
const EFFECTS = spriteEntries(LAYOUT.effects);

export { BEHIND_BAG, EFFECTS, LAYOUT, STYLES };
