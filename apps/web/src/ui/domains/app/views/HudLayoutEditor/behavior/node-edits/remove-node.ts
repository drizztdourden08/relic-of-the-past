/* @layer renderer-components @kind logic */
import { mapTree } from './map-tree';
import type { HudLayout } from '@shared/types/hud';

const removeNode = (doc: HudLayout, id: string): HudLayout =>
  mapTree(doc, (node) => (node.id === id ? null : node));

export { removeNode };
