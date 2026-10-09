/* @layer shared-hud @kind logic */
import { isOverlay } from './is-overlay';
import { REFLOW_PROPERTIES } from './validate-motion-warnings.constants';
import type { HudContainer, HudNode } from '../../../types/hud/hud-node';

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

  const { element } = node;
  if (element.type === 'repeat') walk(element.child, parentId, parentIsFlow, warnings);
  else if (element.type === 'switch') {
    element.cases.forEach((c) => walk(c.node, parentId, parentIsFlow, warnings));
    if (element.otherwise) walk(element.otherwise, parentId, parentIsFlow, warnings);
  }
};

const collectReflowWarnings = (screen: HudContainer): string[] => {
  const warnings: string[] = [];
  walk(screen, null, false, warnings);
  return warnings;
};

export { collectReflowWarnings };
