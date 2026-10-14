/* @layer renderer-hud @kind logic */
import type { HudEnterExitTransition, PlacedNode } from '@rotp/hud';

const transitionSpecOf = (placed: PlacedNode | undefined, entering: boolean): HudEnterExitTransition | undefined => {
  if (placed?.node.kind !== 'element') return undefined;
  return entering ? placed.node.transition?.enter : placed.node.transition?.exit;
};

export { transitionSpecOf };
