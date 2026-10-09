/* @layer renderer-components @kind logic */
import { nodeId } from './node-id';
import type { HudGridContainer } from '@rotp/hud';

const newGrid = (): HudGridContainer => ({
  kind: 'container',
  id: nodeId('grid'),
  layout: 'grid',
  columns: ['auto', 'auto'],
  rows: ['auto', 'auto'],
  children: [],
});

export { newGrid };
