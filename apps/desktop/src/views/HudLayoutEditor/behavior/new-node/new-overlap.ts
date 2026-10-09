/* @layer renderer-components @kind logic */
import { nodeId } from './node-id';
import type { HudGridContainer } from '@rotp/hud';

const newOverlap = (): HudGridContainer => ({
  kind: 'container',
  id: nodeId('overlay'),
  layout: 'grid',
  columns: ['auto'],
  rows: ['auto'],
  justifyItems: 'start',
  alignItems: 'start',
  children: [],
});

export { newOverlap };
