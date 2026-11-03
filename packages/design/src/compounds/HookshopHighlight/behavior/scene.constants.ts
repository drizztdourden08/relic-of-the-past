/* @layer renderer-components @kind constants */
import { HOOKSHOP_PARTS } from '../HookshopHighlight.constants';
import { placedPartStyle } from '../../PlacedPart';
import { computeLayout } from './scene-layout';
import { spriteEntries } from './sprite-entries';

const LAYOUT = computeLayout(HOOKSHOP_PARTS);

const STYLES = {
  bot: placedPartStyle(LAYOUT.bot),
  bag: placedPartStyle(LAYOUT.bag),
  stamp: placedPartStyle(LAYOUT.stamp),
};
const BEHIND_BAG = spriteEntries(LAYOUT.behindBag);
const EFFECTS = spriteEntries(LAYOUT.effects);

export { BEHIND_BAG, EFFECTS, LAYOUT, STYLES };
