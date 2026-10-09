/* @layer shared-hud @kind logic */
import type { HudContainer } from '../../../types/hud/hud-node';

const isOverlay = (node: HudContainer): boolean => node.children.length > 0
  && node.children.every((child) => child.place?.column !== undefined
    && child.place.row !== undefined
    && child.place.column === node.children[0].place?.column
    && child.place.row === node.children[0].place?.row);

export { isOverlay };
