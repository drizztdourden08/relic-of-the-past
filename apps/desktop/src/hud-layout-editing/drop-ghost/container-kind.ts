/* @layer renderer-components @kind logic */
import { assignCells, rowCountOf, isOverlay } from '@rotp/hud';
import type { HudGridContainer, HudNode } from '@rotp/hud';

const gridSize = (node: HudGridContainer): string =>
  `grid ${node.columns.length}×${Math.max(1, rowCountOf(assignCells(node.children, Math.max(1, node.columns.length)).values()))}`;

const containerKind = (node: HudNode | null, isScreen: boolean): string => {
  if (isScreen) return 'screen';
  if (!node || node.kind !== 'container') return 'leaf';
  if (node.layout !== 'grid') return node.direction;
  return node.children.length > 1 && isOverlay(node) ? 'overlap' : gridSize(node);
};

export { containerKind };
