/* @layer renderer-components @kind logic */
import { nodeId } from './node-id';
import type { HudNode } from '@shared/types/hud';

const placeholderChild = (): HudNode => ({ kind: 'element', id: nodeId('spacer'), element: { type: 'spacer' } });

export { placeholderChild };
