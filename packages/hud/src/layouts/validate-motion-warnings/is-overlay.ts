/* @layer shared-hud @kind logic */
import type { HudContainer } from '../../types/hud-node';

const isOverlay = (node: HudContainer): boolean => {
  const [head] = node.children;
  if (head === undefined) return false;
  return node.children.every((child) => child.place?.column !== undefined
    && child.place.row !== undefined
    && child.place.column === head.place?.column
    && child.place.row === head.place.row);
};

export { isOverlay };
