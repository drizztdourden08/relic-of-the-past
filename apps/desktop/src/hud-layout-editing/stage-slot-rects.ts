/* @layer renderer-components @kind logic */
import { scaledRect } from './scaled-rect';
import type { PlacedNode, HudContainer, Rect } from '@rotp/hud';

const stageSlotRects = (
  container: HudContainer, placed: readonly PlacedNode[], displayScale: number,
): Rect[] => {
  const ids = new Set(container.children.map((child) => child.id));
  return placed.filter((node) => ids.has(node.id)).map((node) => scaledRect(node.rect, displayScale));
};

export { stageSlotRects };
