/* @layer renderer-components @kind logic */
import { assignCells, rowCountOf, isOverlay } from '@rotp/hud';
import { typeName } from '../new-node/type-name';
import type { HudGridContainer, HudNode } from '@rotp/hud';
import type { Translate } from '../translate.type';

const gridSize = (node: HudGridContainer, t: Translate): string => {
  const rows = Math.max(1, rowCountOf(assignCells(node.children, Math.max(1, node.columns.length)).values()));
  return t('hud-editing:ghost.grid-size', { columns: node.columns.length, rows });
};

const containerKind = (node: HudNode | null, isScreen: boolean, t: Translate): string => {
  if (isScreen) return t('hud-editing:ghost.screen');
  if (node?.kind !== 'container') return t('hud-editing:ghost.leaf');
  if (node.layout !== 'grid') return typeName(t, node.direction);
  return node.children.length > 1 && isOverlay(node) ? t('hud-editing:ghost.overlap') : gridSize(node, t);
};

export { containerKind };
