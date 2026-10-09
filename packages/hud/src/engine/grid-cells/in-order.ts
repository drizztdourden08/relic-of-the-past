/* @layer shared-hud @kind logic */
import type { HudNode } from '../../types/hud-node';

const inOrder = (children: readonly HudNode[]): HudNode[] =>
  children
    .map((node, index) => ({ node, index }))
    .sort((a, b) => (a.node.order ?? 0) - (b.node.order ?? 0) || a.index - b.index)
    .map((entry) => entry.node);

export { inOrder };
