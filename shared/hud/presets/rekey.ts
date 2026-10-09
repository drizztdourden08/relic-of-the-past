/* @layer shared-hud @kind logic */
import { newId } from '@drizztdourden08/brock-core';
import type { HudNode } from '../../types/hud/hud-node';

const rekey = (node: HudNode): HudNode => {
  const id = `${node.id}-${newId().slice(0, 6)}`;
  if (node.kind === 'container') return { ...node, id, children: node.children.map(rekey) };
  const { element } = node;
  if (element.type === 'repeat') return { ...node, id, element: { ...element, child: rekey(element.child) } };
  if (element.type === 'switch') {
    return {
      ...node,
      id,
      element: {
        ...element,
        cases: element.cases.map((c) => ({ ...c, node: rekey(c.node) })),
        ...(element.otherwise ? { otherwise: rekey(element.otherwise) } : {}),
      },
    };
  }
  return { ...node, id };
};

export { rekey };
