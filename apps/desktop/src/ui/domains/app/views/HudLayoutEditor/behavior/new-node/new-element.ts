/* @layer renderer-components @kind logic */
import { nodeId } from './node-id';
import type { HudElement, HudElementSpec } from '@rotp/hud';

const newElement = (spec: HudElementSpec): HudElement => ({
  kind: 'element',
  id: nodeId(spec.type),
  element: spec,
});

export { newElement };
