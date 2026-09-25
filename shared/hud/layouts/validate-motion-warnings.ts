/* @layer shared-hud @kind logic */
/**
 * THE REFLOW RULE, ENFORCED AS DATA A PANEL CAN RENDER, not just prose in a
 * comment (`plans/hud-data-binding.html`, "Animation"). `width`/`height` may
 * reflow a sibling under a flex row/column or a grid; the validator's job is
 * to SAY when an authored document does this, so phase 7's Animation section
 * can surface it as the warning the plan's own wireframe shows ("width and
 * height can reflow siblings...").
 *
 * A STATIC WALK OF THE VALIDATED (PRE-EXPANSION) TREE - cheap, and correct for
 * every document this model can express, because "is my parent a flow
 * container" never depends on runtime data: a container's `direction`/
 * `layout` is fixed at author time, and a `repeat`/`switch` node is
 * TRANSPARENT for this purpose - neither draws its own box (`expand.ts`'s own
 * rule), so whatever real container holds the `repeat`/`switch` is the parent
 * every one of its expanded instances will actually have, and that is the
 * parent this walk attributes an inner animated leaf to.
 */

import type { HudContainer, HudNode } from '../../types/hud/hud-node';

const REFLOW_PROPERTIES = new Set(['width', 'height']);

/** AN OVERLAY REFLOWS NOBODY: every child sits in one cell, so a child that
 *  grows moves no sibling. That used to be `direction: 'stack'` and is now a
 *  grid whose children all name the same cell (§42) - recognised by shape
 *  and not by a keyword, which is also how a hand-authored overlay in some
 *  other cell gets the same reading. */
const isOverlay = (node: HudContainer): boolean => node.children.length > 0
  && node.children.every((child) => child.place?.column !== undefined
    && child.place.row !== undefined
    && child.place.column === node.children[0].place?.column
    && child.place.row === node.children[0].place?.row);

/** A flex `row`/`column` or a grid flows its children in sequence and can be
 *  pushed by one growing. */
const isFlowContainer = (node: HudNode): boolean => (
  node.kind === 'container'
  && (node.layout === 'grid' ? !isOverlay(node) : node.direction === 'row' || node.direction === 'column')
);

const walk = (node: HudNode, parentId: string | null, parentIsFlow: boolean, warnings: string[]): void => {
  if (parentId !== null && parentIsFlow) {
    (node.animation ?? []).forEach((animation) => {
      if (REFLOW_PROPERTIES.has(animation.property)) {
        warnings.push(
          `${node.id}: animating '${animation.property}' can reflow siblings in flow container '${parentId}' - `
          + "the other six properties (scale, opacity, x, y, rotate, tint) never can",
        );
      }
    });
  }

  if (node.kind === 'container') {
    const isFlow = isFlowContainer(node);
    node.children.forEach((child) => walk(child, node.id, isFlow, warnings));
    return;
  }

  // `repeat`/`switch` vanish at expansion (`expand.ts`) - their nested node(s)
  // inherit THIS node's own parent context, not a level of their own.
  const { element } = node;
  if (element.type === 'repeat') walk(element.child, parentId, parentIsFlow, warnings);
  else if (element.type === 'switch') {
    element.cases.forEach((c) => walk(c.node, parentId, parentIsFlow, warnings));
    if (element.otherwise) walk(element.otherwise, parentId, parentIsFlow, warnings);
  }
};

/** One warning string per animated width/height leaf that sits inside a flow
 *  container, across the whole document - never blocks a load (unlike
 *  `errors`), since a reflowing width is a documented, allowed choice, not a
 *  mistake. */
const collectReflowWarnings = (screen: HudContainer): string[] => {
  const warnings: string[] = [];
  walk(screen, null, false, warnings);
  return warnings;
};

export { collectReflowWarnings, isOverlay };
