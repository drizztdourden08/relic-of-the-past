/* @layer renderer-components @kind logic */
import { assignCells } from '@rotp/hud';
import type { HudGridContainer } from '@rotp/hud';
import type { Occupant } from './lattice-geometry.type';

const isOverlay = (node: HudGridContainer['children'][number]): boolean =>
  node.kind === 'element' && node.element.type === 'countdown';

const occupantsOf = (container: HudGridContainer, keepId?: string): Occupant[] =>
  [...assignCells(container.children, Math.max(1, container.columns.length))]
    .filter(([node]) => !isOverlay(node) || node.id === keepId)
    .map(([node, cell]) => ({ id: node.id, ...cell }));

export { occupantsOf };
