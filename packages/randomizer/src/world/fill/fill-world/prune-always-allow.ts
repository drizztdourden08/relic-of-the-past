/* @layer shared-game @kind logic */
import { FULL_ACCESS_ALWAYS_ALLOW } from '../../rules/tables/item-rules';
import type { World } from '../../world.type';
import type { AccessibilityMode } from '../../accessibility/accessibility.type';

const pruneAlwaysAllow = (world: World, accessibility: AccessibilityMode): void => {
  if (accessibility !== 'full') return;
  for (const key of [...world.alwaysAllow.keys()]) {
    if (!FULL_ACCESS_ALWAYS_ALLOW.has(key)) world.alwaysAllow.delete(key);
  }
};

export { pruneAlwaysAllow };
