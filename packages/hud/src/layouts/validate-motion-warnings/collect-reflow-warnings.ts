/* @layer shared-hud @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { isOverlay } from './is-overlay';
import { REFLOW_PROPERTIES } from './validate-motion-warnings.constants';
import type { ReflowWarning } from './reflow-warning.type';
import type { HudContainer, HudNode } from '../../types/hud-node';

const isFlowContainer = (node: HudNode): boolean => (
  node.kind === 'container'
  && (node.layout !== 'grid' || !isOverlay(node))
);

const walk = (node: HudNode, parentId: string | null, parentIsFlow: boolean, warnings: ReflowWarning[]): void => {
  if (parentId !== null && parentIsFlow) {
    (node.animation ?? []).forEach((animation) => {
      if (REFLOW_PROPERTIES.has(animation.property)) {
        warnings.push({
          nodeId: node.id,
          property: animation.property,
          parentId,
          message: msg('hud:warning.reflow', { id: node.id, property: animation.property, parent: parentId }),
        });
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

const collectReflowWarnings = (screen: HudContainer): ReflowWarning[] => {
  const warnings: ReflowWarning[] = [];
  walk(screen, null, false, warnings);
  return warnings;
};

export { collectReflowWarnings };
