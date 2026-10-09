/* @layer renderer-components @kind logic */
import type { HudNode } from '@shared/types/hud';

const embeddedOf = (node: HudNode): readonly HudNode[] => {
  if (node.kind !== 'element') return [];
  const { element } = node;
  if (element.type === 'repeat') return [element.child];
  if (element.type === 'switch') return [...element.cases.map((c) => c.node), ...(element.otherwise ? [element.otherwise] : [])];
  return [];
};

export { embeddedOf };
