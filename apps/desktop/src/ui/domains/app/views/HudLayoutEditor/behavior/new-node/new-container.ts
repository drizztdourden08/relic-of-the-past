/* @layer renderer-components @kind logic */
import { nodeId } from './node-id';
import type { HudFlexContainer } from '@shared/types/hud';

const newContainer = (direction: HudFlexContainer['direction']): HudFlexContainer => ({
  kind: 'container',
  id: nodeId(direction),
  direction,
  children: [],
});

export { newContainer };
